import { defineStore } from 'pinia'
import type { Product } from '@/utils/web3'
import { web3Service } from '@/utils/web3'
import { getProducts as getMockProducts, getProduct as getMockProduct } from '@/mock/auctions'

interface State {
  account: string | null
  auctions: Product[]
  currentAuction: Product | null
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
      category: string
      imageLink: string
      descLink: string
      auctionStartTime: number
      auctionEndTime: number
      startPrice: string
      condition: number
    }): Promise<string> {
      try {
        console.log('Store收到的参数:', params)
        console.log('参数类型检查:', {
          name: typeof params.name,
          category: typeof params.category,
          imageLink: typeof params.imageLink,
          descLink: typeof params.descLink,
          auctionStartTime: typeof params.auctionStartTime,
          auctionEndTime: typeof params.auctionEndTime,
          startPrice: typeof params.startPrice,
          condition: typeof params.condition
        })

        // 参数验证
        const validations = [
          { value: params.name, field: '拍卖名称' },
          { value: params.category, field: '商品分类' },
          { value: params.descLink, field: '拍卖描述' }
        ]

        for (const { value, field } of validations) {
          if (!value || value.trim() === '') {
            console.error(`${field}验证失败:`, { value })
            throw new Error(`${field}不能为空`)
          }
          console.log(`${field}验证通过:`, { value })
        }

        if (isNaN(Number(params.startPrice)) || Number(params.startPrice) <= 0) {
          console.error('价格验证失败:', { startPrice: params.startPrice })
          throw new Error('起始价格必须大于0')
        }
        
        this.loading = true
        console.log('准备调用web3Service.addProductToStore，参数:', {
          name: params.name.trim(),
          category: params.category.trim(),
          imageLink: params.imageLink || '',
          descLink: params.descLink.trim(),
          auctionStartTime: params.auctionStartTime,
          auctionEndTime: params.auctionEndTime,
          startPrice: params.startPrice,
          condition: params.condition
        })

        const txHash = await web3Service.addProductToStore(
          params.name.trim(),
          params.category.trim(),
          params.imageLink || '',
          params.descLink.trim(),
          params.auctionStartTime,
          params.auctionEndTime,
          params.startPrice,
          params.condition
        )
        console.log('创建拍卖成功，交易哈希:', txHash)
        return txHash
      } catch (error: any) {
        console.error('Store中创建拍卖失败:', error)
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
      this.loading = true
      this.error = ''

      try {
        if (!web3Service) {
          throw new Error('Web3 服务未初始化')
        }

        // 获取商品列表
        const result = await web3Service.getProducts(params.page, params.pageSize)
        console.log('获取到原始数据:', result)

        if (!result || !Array.isArray(result.items)) {
          throw new Error('获取拍卖列表失败')
        }

        // 过滤和排序
        let filteredItems = [...result.items]

        // 按分类过滤
        if (params.category) {
          filteredItems = filteredItems.filter(item => 
            item.category.toLowerCase() === params.category?.toLowerCase()
          )
        }

        // 按搜索关键词过滤
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower) ||
            item.descLink.toLowerCase().includes(searchLower)
          )
        }

        // 排序
        if (params.sortBy) {
          switch (params.sortBy) {
            case 'newest':
              filteredItems.sort((a, b) => b.auctionStartTime - a.auctionStartTime)
              break
            case 'ending':
              filteredItems.sort((a, b) => a.auctionEndTime - b.auctionEndTime)
              break
            case 'price_asc':
              filteredItems.sort((a, b) => Number(a.startPrice) - Number(b.startPrice))
              break
            case 'price_desc':
              filteredItems.sort((a, b) => Number(b.startPrice) - Number(a.startPrice))
              break
          }
        }

        // 更新状态
        this.auctions = filteredItems
        this.total = result.total

        console.log('获取拍卖列表成功:', {
          items: this.auctions,
          total: this.total
        })
      } catch (error: any) {
        console.error('获取拍卖列表失败:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAuctionById(id: number): Promise<void> {
      try {
        this.loading = true
        // 使用模拟数据
        const auction = getMockProduct(id)
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
        // 使用模拟数据
        const { items } = getMockProducts({ page: 1, pageSize: 6, sortBy: 'newest' })
        this.auctions = items
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
        // 使用模拟数据，过滤出当前账户创建的拍卖
        const { items } = getMockProducts({ page: 1, pageSize: 100 })
        // 由于模拟数据中没有seller字段,这里暂时返回所有商品
        this.auctions = items
      } catch (error: any) {
        this.error = error.message || '获取我的拍卖列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyParticipatedAuctions(): Promise<void> {
      if (!this.account) throw new Error('请先连接钱包')
      
      try {
        this.loading = true
        // 使用模拟数据，这里简单返回所有拍卖
        const { items } = getMockProducts({ page: 1, pageSize: 100 })
        this.auctions = items
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 