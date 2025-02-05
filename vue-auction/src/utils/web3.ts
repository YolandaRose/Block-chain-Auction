import Web3 from 'web3'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import ecommerceStoreABI from '@/contracts/EcommerceStore.json'
import escrowABI from '@/contracts/Escrow.json'

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
  bidder: string;
  amount: string;
}

// 合约返回的商品类型
interface ContractProduct {
  name: string
  category: string
  imageLink: string
  descLink: string
  auctionStartTime: string
  auctionEndTime: string
  startPrice: string
  highestBid: string
  secondHighestBid: string
  totalBids: string
  status: string
  condition: string
  seller: string
  highestBidder: string
}

// 合约返回的商品数组类型
interface ProductArray extends Array<string | number> {
  [index: number]: string | number;
}

// 合约返回的商品信息类型
interface ProductInfo {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  [key: number]: string;
}

// 合约返回的拍卖信息类型
interface AuctionInfo {
  highestBidder: string;
  highestBid: string;
  secondHighestBid: string;
  totalBids: string;
}

// 添加类型定义
interface BidderInfo {
  0: string;  // highestBidder address
  1: string;  // highestBid
  2: string;  // secondHighestBid
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

      // 直接使用 ABI 数组
      this.contract = new this.web3.eth.Contract(
        ecommerceStoreABI.abi,
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

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // 检查是否已经有 Web3 实例
      if (typeof window.ethereum !== 'undefined') {
        console.log('发现 MetaMask')
        this.web3 = new Web3(window.ethereum)
      } else {
        console.log('未发现 MetaMask，使用本地节点')
        const provider = new Web3.providers.HttpProvider('http://localhost:8545')
        this.web3 = new Web3(provider)
      }

      // 获取网络ID
      const networkId = await this.web3.eth.net.getId()
      console.log('当前网络ID:', networkId)

      // 确保合约地址正确
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
      console.log('使用合约地址:', contractAddress)

      // 创建合约实例
      this.contract = new this.web3.eth.Contract(
        ecommerceStoreABI.abi,
        contractAddress
      )

      if (!this.contract) {
        throw new Error('合约初始化失败')
      }

      // 验证合约是否正确初始化
      const productCount = await this.contract.methods.getProductCount().call()
      console.log('当前商品总数:', productCount)

      this.initialized = true
      console.log('Web3 服务初始化成功')
    } catch (error) {
      console.error('Web3 服务初始化失败:', error)
      this.initialized = false
      throw error
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
      
      // 将ETH金额转换为Wei
      const amountInWei = this.web3.utils.toWei(amount, 'ether')
      
      // 获取当前最高价信息
      const currentBidInfo = await this.contract.methods.highestBidderInfo(productId).call() as BidderInfo
      console.log('当前出价信息:', {
        currentHighestBid: this.web3.utils.fromWei(currentBidInfo[1], 'ether'),
        currentSecondHighestBid: this.web3.utils.fromWei(currentBidInfo[2], 'ether'),
        newBid: amount
      })

      // 检查出价是否高于当前最高价
      if (BigInt(amountInWei) <= BigInt(currentBidInfo[1])) {
        throw new Error(`出价必须高于当前最高价 ${this.web3.utils.fromWei(currentBidInfo[1], 'ether')} ETH`)
      }
      
      // 计算出价的 hash
      const bid = await this.contract.methods.keccak(
        amountInWei,
        secret
      ).call()
      
      console.log('出价信息:', {
        productId,
        amount,
        amountInWei,
        secret,
        bid
      })

      // 估算gas费用
      const gas = await this.contract.methods
        .bid(productId, bid)
        .estimateGas({ 
          from: account, 
          value: amountInWei
        })

      // 确保有足够的gas费用
      const gasPrice = await this.web3.eth.getGasPrice()
      const gasCost = BigInt(gas) * BigInt(gasPrice)
      const totalCost = BigInt(amountInWei) + gasCost
      
      // 获取账户余额
      const balance = await this.web3.eth.getBalance(account)
      
      console.log('Debug 金额信息:', {
        amountInWei,
        gasPrice,
        gasCost: gasCost.toString(),
        totalCost: totalCost.toString(),
        balance
      })

      if (BigInt(balance) < totalCost) {
        const totalEth = this.web3.utils.fromWei(totalCost.toString(), 'ether')
        const bidEth = this.web3.utils.fromWei(amountInWei, 'ether')
        const gasEth = this.web3.utils.fromWei(gasCost.toString(), 'ether')
        throw new Error(`余额不足，总共需要 ${totalEth} ETH（出价 ${bidEth} ETH + gas费用 ${gasEth} ETH）`)
      }

      // 发送出价交易
      const result = await this.contract.methods
        .bid(productId, bid)
        .send({ 
          from: account, 
          value: amountInWei,
          gas: (Math.floor(Number(gas) * 1.1)).toString(), // 增加10%的gas限制
          gasPrice: gasPrice.toString()
        })

      // 保存密钥信息到本地存储，用于后续揭示出价
      const bidInfo = {
        productId,
        amount: amountInWei,
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
      // 获取当前最高价信息
      const currentBidInfo = await this.contract.methods.highestBidderInfo(productId).call() as BidderInfo
      console.log('揭示出价前的价格信息:', {
        currentHighestBidder: currentBidInfo[0],
        currentHighestBid: this.web3.utils.fromWei(currentBidInfo[1], 'ether'),
        currentSecondHighestBid: this.web3.utils.fromWei(currentBidInfo[2], 'ether'),
        revealingBid: amount
      })

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
      
      // 获取更新后的最高价信息
      const updatedBidInfo = await this.contract.methods.highestBidderInfo(productId).call() as BidderInfo
      console.log('揭示出价后的价格信息:', {
        newHighestBidder: updatedBidInfo[0],
        newHighestBid: this.web3.utils.fromWei(updatedBidInfo[1], 'ether'),
        newSecondHighestBid: this.web3.utils.fromWei(updatedBidInfo[2], 'ether')
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

  async getSellerByProductId(productId: number): Promise<string> {
    await this.ensureInitialized()

    if (!this.contract) {
      throw new Error('合约未初始化')
    }

      try {
      const sellerAddress = await this.contract.methods.productIdInStore(productId).call() as string
      return sellerAddress
    } catch (error) {
      console.error('获取卖家地址失败:', error)
      throw error
    }
  }

  async getCurrentHighestBid(productId: number): Promise<{highestBidder: string, highestBid: string}> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const bidInfo = await this.contract.methods.highestBidderInfo(productId).call() as BidderInfo
      console.log('当前最高价信息:', bidInfo)

      return {
        highestBidder: bidInfo[0],
        highestBid: this.web3.utils.fromWei(bidInfo[1], 'ether')
      }
    } catch (error) {
      console.error('获取最高价失败:', error)
      throw error
    }
  }

  async getProduct(productId: number): Promise<Product> {
    await this.ensureInitialized()

    if (!this.web3 || !this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      // 获取商品基本信息
      const defaultAddress = '0x0000000000000000000000000000000000000000'
      const emptyProduct: Product = {
        id: productId,
        name: '',
        category: '',
        imageLink: '',
        descLink: '',
        auctionStartTime: 0,
        auctionEndTime: 0,
        startPrice: '0',
        highestBidder: defaultAddress,
        highestBid: '0',
        secondHighestBid: '0',
        totalBids: 0,
        status: 0,
        condition: 0,
        seller: defaultAddress
      }

      // 调用合约方法获取基本信息
      const productData = await this.contract.methods.getProduct(productId).call() as ProductInfo
      const sellerAddress = await this.contract.methods.productIdInStore(productId).call()

      if (!productData || !sellerAddress) {
        console.warn('未找到商品数据')
        return emptyProduct
      }

      // 获取竞拍信息
      const bidInfo = await this.contract.methods.highestBidderInfo(productId).call() as BidderInfo
      const totalBids = await this.contract.methods.totalBids(productId).call()

      console.log('商品信息:', {
        productData,
        sellerAddress,
        bidInfo,
        totalBids
      })

      // 确保地址是字符串类型
      const seller = String(sellerAddress).toLowerCase()
      const highestBidder = bidInfo[0] ? String(bidInfo[0]).toLowerCase() : defaultAddress

      // 转换价格从Wei到ETH，处理可能的无效输入
      const formatWeiToEth = (wei: string | number | null | undefined): string => {
        try {
          if (!wei || wei === '0' || wei === 0) return '0'
          // 确保输入是字符串
          const weiStr = wei.toString()
          return this.web3!.utils.fromWei(weiStr, 'ether')
        } catch (error) {
          console.error('Wei转ETH失败:', error, '输入值:', wei)
          return '0'
        }
      }

      // 处理价格信息
      const startPrice = productData[7] // 直接使用合约返回的起拍价
      const highestBid = formatWeiToEth(bidInfo[1])  // 从bidInfo获取最高价
      const secondHighestBid = formatWeiToEth(bidInfo[2])  // 从bidInfo获取次高价

      console.log('价格信息:', {
        起拍价: startPrice,
        最高价Wei: bidInfo[1],
        最高价ETH: highestBid,
        次高价Wei: bidInfo[2],
        次高价ETH: secondHighestBid
      })

      return {
        ...emptyProduct,
        name: productData[1] || '',
        category: productData[2] || '',
        imageLink: productData[3] || '',
        descLink: productData[4] || '',
        auctionStartTime: Number(productData[5]) || 0,
        auctionEndTime: Number(productData[6]) || 0,
        startPrice: startPrice,  // 使用原始起拍价
        status: Number(productData[8]) || 0,
        condition: Number(productData[9]) || 0,
        seller,
        highestBidder,
        highestBid,
        secondHighestBid,
        totalBids: Number(totalBids) || 0
      }
    } catch (error) {
      console.error('获取商品信息失败:', error)
      throw error
    }
  }

  async getProducts(page: number, pageSize: number) {
    await this.ensureInitialized()
    
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
          console.log('正在获取商品:', i)
          const product = await this.getProduct(i)
          if (product) {
            products.push(product)
          }
        } catch (error) {
          console.error(`获取商品 ${i} 失败:`, error)
          // 不要中断整个循环，继续获取下一个商品
          continue
        }
      }

      console.log('成功获取商品列表:', products)

      return {
        items: products,
        total: Number(total)
      }
    } catch (error: any) {
      console.error('获取商品列表失败:', error)
      // 返回空列表而不是抛出错误
      return {
        items: [],
        total: 0
      }
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

  // 获取Escrow合约实例
  async getEscrowContract(escrowAddress: string): Promise<Contract<typeof escrowABI.abi>> {
    if (!this.web3) {
      throw new Error('Web3未初始化')
    }

    return new this.web3.eth.Contract(
      escrowABI.abi as AbiItem[],
      escrowAddress
    )
  }

  // 获取Escrow合约信息
  async getEscrowInfo(productId: number): Promise<EscrowInfo> {
    await this.ensureInitialized()
    
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      // 获取托管合约地址
      const escrowAddress = await this.contract.methods
        .escrowAddressForProduct(productId)
        .call() as string

      if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('托管合约不存在')
      }

      // 获取托管合约实例
      const escrowContract = await this.getEscrowContract(escrowAddress)
      
      // 获取托管信息
      const info: [string, string, string, boolean, string, string] = await escrowContract.methods.escrowInfo().call()
      
      return {
        buyer: info[0],
        seller: info[1],
        arbiter: info[2],
        fundsDisbursed: info[3],
        releaseCount: Number(info[4]),
        refundCount: Number(info[5])
      }
    } catch (error) {
      console.error('获取托管信息失败:', error)
      throw error
    }
  }

  // 释放资金给卖家
  async releaseAmountToSeller(productId: number): Promise<void> {
    await this.ensureInitialized()
    const account = await this.connectWallet()
    
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    const escrowAddress = await this.contract.methods
      .escrowAddressForProduct(productId)
      .call() as string

    if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('托管合约不存在')
    }

    const escrowContract = await this.getEscrowContract(escrowAddress)
    await escrowContract.methods.releaseAmountToSeller(account).send({ from: account })
  }

  // 退款给买家
  async refundAmountToBuyer(productId: number): Promise<void> {
    await this.ensureInitialized()
    const account = await this.connectWallet()
    
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    const escrowAddress = await this.contract.methods
      .escrowAddressForProduct(productId)
      .call() as string

    if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('托管合约不存在')
    }

    const escrowContract = await this.getEscrowContract(escrowAddress)
    await escrowContract.methods.refundAmountToBuyer(account).send({ from: account })
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

      // 验证时间戳（确保是秒级时间戳）
      const now = Math.floor(Date.now() / 1000)
      if (auctionStartTime < now) {
        throw new Error('开始时间不能早于当前时间')
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