import Web3 from 'web3'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import ecommerceStoreABI from '@/contracts/EcommerceStore.json'

declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (eventName: string, handler: (...args: any[]) => void) => void
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''

export interface Product {
  id: number
  name: string
  category: string
  imageLink: string
  descLink: string
  auctionStartTime: number
  auctionEndTime: number
  startPrice: string
  highestBidder: string
  highestBid: string
  secondHighestBid: string
  totalBids: number
  status: number // 0: Open, 1: Sold, 2: Unsold
  condition: number // 0: New, 1: Used
  seller: string
}

interface EscrowInfo {
  buyer: string;
  seller: string;
  arbiter: string;
  fundsDisbursed: boolean;
  releaseCount: number;
  refundCount: number;
}

interface StoreProduct {
  seller: string;
  [key: string]: any;
}

interface BidInfo {
  0: string;
  1: string;
  2: string;
  [key: number]: string;
}

class Web3Service {
  private web3: Web3 | null = null
  private contract: Contract<AbiItem[]> | null = null
  private account: string = ''
  private initialized: boolean = false
  
  constructor() {
    this.init().catch(error => {
      console.error('Web3Service 初始化失败:', error)
    })
  }

  private async init() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask未安装')
      }
        this.web3 = new Web3(window.ethereum)
      await this.initContract()
      this.initialized = true
    } catch (error) {
      console.error('初始化失败:', error)
      throw error
    }
  }

  private async initContract() {
    try {
      if (!this.web3) {
        throw new Error('Web3 未初始化')
      }

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error('合约地址未配置')
      }
      
      console.log('初始化合约，使用地址:', contractAddress)
      
      if (!Array.isArray(ecommerceStoreABI.abi)) {
        throw new Error('合约 ABI 格式错误')
      }

      // 检查 ABI 中是否包含必要的方法
      const hasProductIdInStore = ecommerceStoreABI.abi.some(
        item => item.type === 'function' && item.name === 'productIdInStore'
      )
      
      if (!hasProductIdInStore) {
        console.error('ABI 中未找到 productIdInStore 方法')
        throw new Error('ABI 中缺少必要的方法')
      }

      this.contract = new this.web3.eth.Contract(
        ecommerceStoreABI.abi as AbiItem[],
        contractAddress
      )
      
      if (!this.contract.methods) {
        throw new Error('合约方法初始化失败')
      }
      
      console.log('合约初始化成功')
      
      // 测试调用一个简单的方法来验证合约是否正常工作
      try {
        const productCount = await this.contract.methods.getProductCount().call()
        console.log('当前商品数量:', productCount)
      } catch (error) {
        console.error('测试调用合约方法失败:', error)
      }
    } catch (error) {
      console.error('初始化合约失败:', error)
      throw new Error('初始化合约失败: ' + (error as Error).message)
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.init()
    }
  }

  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask')
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      this.account = accounts[0]
      return this.account
    } catch (error) {
      throw new Error('钱包连接失败')
    }
  }

  async placeBid(productId: number, amount: string): Promise<string> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }

    const account = await this.connectWallet()
    
    try {
      // 生成随机密钥
      const secret = Web3.utils.randomHex(32)
      
      // 计算出价的 hash
      const bid = await this.contract.methods.keccak(
        amount,
        secret
      ).call()
      
      console.log('出价信息:', {
        productId,
        amount,
        secret,
        bid
      })

      // 发送出价交易
      const gas = await this.contract.methods
        .bid(productId, bid)
        .estimateGas({ 
          from: account, 
          value: this.web3.utils.toWei(amount, 'ether')
        })

      const result = await this.contract.methods
        .bid(productId, bid)
        .send({ 
          from: account, 
          value: this.web3.utils.toWei(amount, 'ether'),
          gas: Math.floor(Number(gas) * 1.5).toString()
        })

      // 保存密钥信息到本地存储，用于后续揭示出价
      const bidInfo = {
        productId,
        amount,
        secret,
        revealed: false,
        timestamp: Date.now()
      }
      const bids = JSON.parse(localStorage.getItem(`bids_${productId}`) || '[]')
      bids.push(bidInfo)
      localStorage.setItem(`bids_${productId}`, JSON.stringify(bids))
      
      return result.transactionHash
    } catch (error: any) {
      console.error('出价失败:', error)
      throw new Error(error.message || '出价失败')
    }
  }

  async revealBid(productId: number, amount: string, secret: string): Promise<string> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }

    const account = await this.connectWallet()
    
    try {
      console.log('揭示出价参数:', {
        productId,
        amount,
        secret
      })

      // 估算gas
      const gas = await this.contract.methods
        .revealBid(productId, amount, secret)
        .estimateGas({ from: account })

      const result = await this.contract.methods
        .revealBid(productId, amount, secret)
        .send({ 
          from: account,
          gas: Math.floor(Number(gas) * 1.5).toString()
        })
      
      // 更新本地存储中的揭示状态
      const bids = JSON.parse(localStorage.getItem(`bids_${productId}`) || '[]')
      const updatedBids = bids.map((bid: any) => {
        if (bid.amount === amount && bid.secret === secret) {
          bid.revealed = true
          bid.revealedAt = Date.now()
        }
        return bid
      })
      localStorage.setItem(`bids_${productId}`, JSON.stringify(updatedBids))
      
      return result.transactionHash
    } catch (error: any) {
      console.error('揭示出价失败:', error)
      throw new Error(error.message || '揭示出价失败')
    }
  }

  async getProduct(productId: number): Promise<Product> {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      console.log('正在获取商品信息，ID:', productId)
      
      // 获取商品基本信息
      const result = await this.contract.methods.getProduct(productId).call()
      console.log('商品原始数据:', result)

      // 检查返回的数据
      if (!result) {
        throw new Error('获取商品信息失败：返回数据为空')
      }

      // 确保结果是一个对象
      if (typeof result !== 'object') {
        throw new Error('获取商品信息失败：返回数据格式错误')
      }

      // 获取卖家地址
      let seller = ''
      try {
        seller = await this.contract.methods.productIdInStore(productId).call()
        console.log('从 productIdInStore 映射获取到卖家地址:', seller)
      } catch (error) {
        console.error('获取卖家地址失败:', error)
      }

      // 获取最高出价信息
      const bidInfo = await this.contract.methods.highestBidderInfo(productId).call()
      console.log('出价信息:', bidInfo)

      if (!bidInfo || typeof bidInfo !== 'object') {
        throw new Error('获取出价信息失败：返回数据格式错误')
      }

      const totalBids = await this.contract.methods.totalBids(productId).call()

      const product: Product = {
        id: productId,
        name: String(result[1] || ''),
        category: String(result[2] || ''),
        imageLink: String(result[3] || ''),
        descLink: String(result[4] || ''),
        auctionStartTime: Number(result[5] || 0),
        auctionEndTime: Number(result[6] || 0),
        startPrice: String(result[7] || '0'),
        highestBidder: String(bidInfo[0] || ''),
        highestBid: String(bidInfo[1] || '0'),
        secondHighestBid: String(bidInfo[2] || '0'),
        totalBids: Number(totalBids || 0),
        status: Number(result[8] || 0),
        condition: Number(result[9] || 0),
        seller: seller
      }

      console.log('处理后的商品数据:', product)
      return product
    } catch (error) {
      console.error('获取商品信息失败:', error)
      throw new Error('获取商品信息失败: ' + (error as Error).message)
    }
  }

  async getProducts(page: number, pageSize: number) {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const total = await this.contract.methods.getProductCount().call()
      console.log('商品总数:', total)

      const start = (page - 1) * pageSize
      const end = Math.min(start + pageSize, Number(total))
      console.log('获取商品列表范围:', { start, end, total })
      
      const products = []
      for (let i = start + 1; i <= end; i++) {
        try {
          const product = await this.getProduct(i)
          products.push(product)
        } catch (error) {
          console.error(`获取商品 ${i} 失败:`, error)
          continue
        }
      }

      return {
        items: products,
        total: Number(total)
      }
    } catch (error: any) {
      console.error('获取商品列表失败:', error)
      throw error
    }
  }

  async finalizeAuction(productId: number): Promise<string> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }

    const account = await this.connectWallet()
    
    try {
      console.log('结束拍卖参数:', {
        productId,
        account
      })

      // 估算gas
      const gas = await this.contract.methods
        .finalizeAuction(productId)
        .estimateGas({ from: account })

      const result = await this.contract.methods
        .finalizeAuction(productId)
        .send({ 
          from: account,
          gas: Math.floor(Number(gas) * 1.5).toString()
        })
      
      return result.transactionHash
    } catch (error: any) {
      console.error('结束拍卖失败:', error)
      throw new Error(error.message || '结束拍卖失败')
    }
  }

  private getProductStatus(status: number): 'Open' | 'Sold' | 'Unsold' {
    switch (status) {
      case 0:
        return 'Open'
      case 1:
        return 'Sold'
      case 2:
        return 'Unsold'
      default:
        return 'Open'
    }
  }

  private getProductCondition(condition: number): 'New' | 'Used' {
    return condition === 0 ? 'New' : 'Used'
  }

  // 查询托管合约信息
  async getEscrowInfo(productId: number): Promise<EscrowInfo> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const escrowAddress = await this.contract.methods.escrowAddressForProduct(productId).call();
      if (!escrowAddress) {
        throw new Error('托管合约不存在');
      }

      const result = await this.contract.methods.escrowInfo(productId).call() as [string, string, string, boolean, string, string];

      return {
        buyer: result[0],
        seller: result[1],
        arbiter: result[2], 
        fundsDisbursed: result[3],
        releaseCount: parseInt(result[4]),
        refundCount: parseInt(result[5])
      };
    } catch (error) {
      console.error('获取托管信息失败:', error);
      throw new Error('获取托管信息失败: ' + error);
    }
  }

  // 释放资金给卖家
  async releaseAmountToSeller(productId: number): Promise<any> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Contract not initialized or account not connected');
      }

      const escrowAddress = await this.contract.methods.escrowAddressForProduct(productId).call();
      if (!escrowAddress) {
        throw new Error('托管合约不存在');
      }

      const gas = await this.contract.methods.releaseAmountToSeller(this.account).estimateGas({
        from: this.account
      });

      const result = await this.contract.methods.releaseAmountToSeller(this.account).send({
        from: this.account,
        gas: (Math.floor(Number(gas) * 1.5)).toString()
      });

      return result;
    } catch (error) {
      console.error('释放资金失败:', error);
      throw new Error('释放资金失败: ' + error);
    }
  }

  // 退还资金给买家
  async refundAmountToBuyer(productId: number): Promise<any> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Contract not initialized or account not connected');
      }

      const escrowAddress = await this.contract.methods.escrowAddressForProduct(productId).call();
      if (!escrowAddress) {
        throw new Error('托管合约不存在');
      }

      const gas = await this.contract.methods.refundAmountToBuyer(this.account).estimateGas({
        from: this.account
      });

      const result = await this.contract.methods.refundAmountToBuyer(this.account).send({
        from: this.account,
        gas: (Math.floor(Number(gas) * 1.5)).toString()
      });

      return result;
    } catch (error) {
      console.error('退还资金失败:', error);
      throw new Error('退还资金失败: ' + error);
    }
  }

  async addProductToStore(
    name: string,
    category: string,
    imageLink: string,
    descLink: string,
    auctionStartTime: number,
    auctionEndTime: number,
    startPrice: string,
    productCondition: number
  ): Promise<string> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }
    if (!this.account) {
      await this.connectWallet()
    }

    try {
      // 参数验证
      if (!name || !category) {
        throw new Error('名称和分类不能为空')
      }

      if (auctionEndTime <= auctionStartTime) {
        throw new Error('结束时间必须大于开始时间')
      }

      if (!startPrice || isNaN(Number(startPrice)) || Number(startPrice) <= 0) {
        throw new Error('起拍价必须大于0')
      }

      if (productCondition !== 0 && productCondition !== 1) {
        throw new Error('商品状况必须是 0(全新) 或 1(二手)')
      }

      // 如果描述为空，使用默认值
      const finalDescLink = descLink || '无'

      console.log('调用合约 addProductToStore 方法，参数:', {
        name,
        category,
        imageLink,
        descLink: finalDescLink,
        auctionStartTime,
        auctionEndTime,
        startPrice,
        productCondition
      })

      // 确保合约已经连接
      if (!this.contract.methods) {
        await this.initContract()
      }

      // 获取合约方法
      const method = this.contract.methods.addProductToStore(
        name,
        category,
        imageLink || '', // 确保不为 undefined
        finalDescLink,
        auctionStartTime.toString(), // 转换为字符串
        auctionEndTime.toString(), // 转换为字符串
        startPrice.toString(), // 直接传递字符串，让合约处理转换
        productCondition
      )

      if (!method) {
        throw new Error('合约方法不存在')
      }

      // 估算gas
      const gas = await method.estimateGas({ from: this.account })

      // 发送交易
      const gasPrice = await this.web3.eth.getGasPrice()
      const result = await method.send({
        from: this.account,
        gas: Math.floor(Number(gas) * 1.5).toString(),
        gasPrice: gasPrice.toString()
      })

      // 检查事件日志
      const events = result.events
      if (events && events.NewProduct) {
        console.log('成功触发 NewProduct 事件:', events.NewProduct.returnValues)
      } else {
        console.warn('未找到 NewProduct 事件，完整事件日志:', events)
      }

      return result.transactionHash
    } catch (error) {
      console.error('创建商品失败:', error)
      throw new Error('创建商品失败: ' + (error as Error).message)
    }
  }
}

export const web3Service = new Web3Service() 