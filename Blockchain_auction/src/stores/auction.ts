import { defineStore } from 'pinia'
import { getAuctions, getAuctionById, getLatestAuctions, type Auction } from '@/mock/auctions'

interface State {
  account: string
  auctions: Auction[]
  currentAuction: Auction | null
  loading: boolean
  error: string | null
  total: number
}

interface AuctionParams {
  page: number
  pageSize: number
  status?: string
  minPrice?: number
  maxPrice?: number
  category?: string
}

export const useAuctionStore = defineStore('auction', {
  state: (): State => ({
    account: '',
    auctions: [],
    currentAuction: null,
    loading: false,
    error: null,
    total: 0
  }),

  actions: {
    async connectWallet(): Promise<string> {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          })
          
          this.account = accounts[0]
          return accounts[0]
        } else {
          throw new Error('请安装 MetaMask!')
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    async fetchAuctions(params: AuctionParams): Promise<void> {
      try {
        this.loading = true
        const { items, total } = getAuctions(params)
        this.auctions = items
        this.total = total
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAuctionById(id: number): Promise<void> {
      try {
        this.loading = true
        this.currentAuction = getAuctionById(id)
        if (!this.currentAuction) {
          throw new Error('拍卖不存在')
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLatestAuctions(): Promise<void> {
      try {
        this.loading = true
        this.auctions = getLatestAuctions()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 