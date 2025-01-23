import Web3 from 'web3'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import auctionABI from '@/contracts/AuctionContract.json'

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

class Web3Service {
  private web3: Web3 | null = null
  private contract: Contract<AbiItem[]> | null = null
  
  constructor() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum)
      this.initContract()
    }
  }

  private initContract() {
    if (!this.web3 || !CONTRACT_ADDRESS) return
    
    try {
      this.contract = new this.web3.eth.Contract(
        auctionABI.abi as unknown as AbiItem[],
        CONTRACT_ADDRESS
      )
    } catch (error) {
      console.error('合约初始化失败:', error)
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.web3) {
      throw new Error('请安装 MetaMask!')
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      return accounts[0]
    } catch (error) {
      throw new Error('钱包连接失败')
    }
  }

  async createAuction(
    name: string,
    description: string,
    startPrice: string,
    duration: number,
    images: string[],
    category: string
  ): Promise<string> {
    if (!this.contract || !this.web3) {
      throw new Error('合约未初始化')
    }

    const account = await this.connectWallet()
    const startPriceWei = this.web3.utils.toWei(startPrice, 'ether')

    try {
      const result = await this.contract.methods
        .createAuction(name, description, startPriceWei, duration, images[0], category)
        .send({ from: account })
      
      return result.transactionHash
    } catch (error: any) {
      throw new Error(error.message || '创建拍卖失败')
    }
  }

  async placeBid(auctionId: number, bidAmount: string): Promise<string> {
    if (!this.contract || !this.web3) {
      throw new Error('合约未初始化')
    }

    const account = await this.connectWallet()
    const bidAmountWei = this.web3.utils.toWei(bidAmount, 'ether')

    try {
      const result = await this.contract.methods
        .placeBid(auctionId)
        .send({ from: account, value: bidAmountWei })
      
      return result.transactionHash
    } catch (error: any) {
      throw new Error(error.message || '出价失败')
    }
  }

  async getAuction(auctionId: number) {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const auction = await this.contract.methods.auctions(auctionId).call()
      return this.formatAuction(auction)
    } catch (error) {
      throw new Error('获取拍卖信息失败')
    }
  }

  async getAuctions(page: number, pageSize: number) {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const total = await this.contract.methods.getAuctionsCount().call()
      const start = (page - 1) * pageSize
      const end = Math.min(start + pageSize, parseInt(total))
      
      const auctions = []
      for (let i = start; i < end; i++) {
        const auction = await this.contract.methods.auctions(i).call()
        auctions.push(this.formatAuction(auction))
      }

      return {
        items: auctions,
        total: parseInt(total)
      }
    } catch (error) {
      throw new Error('获取拍卖列表失败')
    }
  }

  async getMyCreatedAuctions(account: string) {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const result = await this.contract.methods.getAuctionsByCreator(account).call()
      return Array.isArray(result) ? result.map(this.formatAuction) : []
    } catch (error) {
      throw new Error('获取我创建的拍卖失败')
    }
  }

  async getMyParticipatedAuctions(account: string) {
    if (!this.contract) {
      throw new Error('合约未初始化')
    }

    try {
      const result = await this.contract.methods.getAuctionsByBidder(account).call()
      return Array.isArray(result) ? result.map(this.formatAuction) : []
    } catch (error) {
      throw new Error('获取我参与的拍卖失败')
    }
  }

  private formatAuction(auction: any) {
    if (!this.web3) return auction

    return {
      id: parseInt(auction.id),
      name: auction.name,
      description: auction.description,
      currentPrice: this.web3.utils.fromWei(auction.currentPrice, 'ether'),
      startPrice: this.web3.utils.fromWei(auction.startPrice, 'ether'),
      endTime: parseInt(auction.endTime) * 1000,
      seller: auction.seller,
      winner: auction.winner,
      images: [auction.image],
      status: this.getAuctionStatus(auction),
      bidCount: parseInt(auction.bidCount),
      category: auction.category
    }
  }

  private getAuctionStatus(auction: any): 'pending' | 'active' | 'ended' {
    const now = Math.floor(Date.now() / 1000)
    const endTime = parseInt(auction.endTime)
    
    if (now < parseInt(auction.startTime)) {
      return 'pending'
    } else if (now < endTime) {
      return 'active'
    } else {
      return 'ended'
    }
  }
}

export const web3Service = new Web3Service() 