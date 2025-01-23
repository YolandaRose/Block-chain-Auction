export interface Auction {
  id: number
  name: string
  description: string
  currentPrice: string
  startPrice: string
  endTime: number
  seller: string
  images: string[]
  status: 'pending' | 'active' | 'ended'
  bidCount: number
  category: string
}

interface AuctionParams {
  page: number
  pageSize: number
  category?: string
  sortBy?: string
  search?: string
}

const mockAuctions: Auction[] = [
  {
    id: 1,
    name: '数字艺术品 #001',
    description: '独特的数字艺术作品，采用AI生成艺术技术创作',
    currentPrice: '0.5',
    startPrice: '0.1',
    endTime: Date.now() + 86400000, // 24小时后
    seller: '0x1234...5678',
    images: ['/images/art1.jpg'],
    status: 'active',
    bidCount: 5,
    category: '艺术品'
  },
  {
    id: 2,
    name: '稀有收藏卡片',
    description: '限量发行的数字收藏卡片，具有独特编号',
    currentPrice: '0.8',
    startPrice: '0.3',
    endTime: Date.now() + 172800000, // 48小时后
    seller: '0x9876...4321',
    images: ['/images/card1.jpg'],
    status: 'active',
    bidCount: 3,
    category: '收藏品'
  },
  // 可以添加更多模拟数据...
]

export function getAuctions(params: AuctionParams): { items: Auction[], total: number } {
  let filtered = [...mockAuctions]

  // 应用过滤条件
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

  // 应用排序
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

  // 分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const items = filtered.slice(start, end)

  return {
    items,
    total: filtered.length
  }
}

export function getAuctionById(id: number): Auction | null {
  const auction = mockAuctions.find(a => a.id === id)
  return auction || null
}

export function getLatestAuctions(): Auction[] {
  return mockAuctions
    .filter(auction => auction.status === 'active')
    .sort((a, b) => b.endTime - a.endTime)
    .slice(0, 6)
} 