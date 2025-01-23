import { defineStore } from 'pinia'
import type { Auction } from '@/types'
import { web3Service } from '@/utils/web3'

interface State {
  account: string | null
  auctions: Auction[]
  currentAuction: Auction | null
  loading: boolean
  error: string | null
  total: number
}

interface AuctionParams {
  page: number
  pageSize: number
  category?: string
  sortBy?: string
  search?: string
}

export const useAuctionStore = defineStore('auction', {
  state: (): State => ({
    account: null,
    auctions: [],
    currentAuction: null,
    loading: false,
    error: null,
    total: 0
  }),

  actions: {
    async connectWallet(): Promise<string> {
      try {
        const account = await web3Service.connectWallet()
        this.account = account
        return account
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    disconnectWallet() {
      this.account = null
      this.auctions = []
      this.total = 0
      this.currentAuction = null
    },

    async createAuction(params: {
      name: string
      description: string
      startPrice: string
      duration: number
      images: string[]
      category: string
    }): Promise<string> {
      try {
        this.loading = true
        const txHash = await web3Service.createAuction(
          params.name,
          params.description,
          params.startPrice,
          params.duration,
          params.images,
          params.category
        )
        return txHash
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async placeBid(auctionId: number, bidAmount: string): Promise<string> {
      try {
        this.loading = true
        const txHash = await web3Service.placeBid(auctionId, bidAmount)
        await this.fetchAuctionById(auctionId)
        return txHash
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAuctions(params: AuctionParams): Promise<void> {
      try {
        this.loading = true
        const { items, total } = await web3Service.getAuctions(params.page, params.pageSize)
        
        // 应用过滤和排序
        let filtered = [...items]
        
        if (params.category) {
          filtered = filtered.filter(auction => auction.category === params.category)
        }

        if (params.search) {
          const searchLower = params.search.toLowerCase()
          filtered = filtered.filter(auction => 
            auction.name.toLowerCase().includes(searchLower) ||
            auction.description.toLowerCase().includes(searchLower)
          )
        }

        if (params.sortBy) {
          switch (params.sortBy) {
            case 'priceAsc':
              filtered.sort((a, b) => parseFloat(a.currentPrice) - parseFloat(b.currentPrice))
              break
            case 'priceDesc':
              filtered.sort((a, b) => parseFloat(b.currentPrice) - parseFloat(a.currentPrice))
              break
            case 'newest':
              filtered.sort((a, b) => b.endTime - a.endTime)
              break
            case 'endingSoon':
              filtered.sort((a, b) => a.endTime - b.endTime)
              break
          }
        }

        this.auctions = filtered
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
        const auction = await web3Service.getAuction(id)
        if (!auction) {
          throw new Error('拍卖不存在')
        }
        this.currentAuction = auction
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
        const { items } = await web3Service.getAuctions(1, 6)
        this.auctions = items
          .filter(auction => auction.status === 'active')
          .sort((a, b) => b.endTime - a.endTime)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyCreatedAuctions(): Promise<void> {
      if (!this.account) throw new Error('请先连接钱包')
      
      try {
        this.loading = true
        this.auctions = await web3Service.getMyCreatedAuctions(this.account)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyParticipatedAuctions(): Promise<void> {
      if (!this.account) throw new Error('请先连接钱包')
      
      try {
        this.loading = true
        this.auctions = await web3Service.getMyParticipatedAuctions(this.account)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 