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

export const mockAuctions: Auction[] = [
  {
    id: 1,
    name: '限量版数字艺术品',
    description: '由知名数字艺术家创作的限量版NFT作品，独特而珍贵',
    currentPrice: '0.5',
    startPrice: '0.1',
    endTime: Date.now() + 86400000, // 24小时后
    seller: '0x1234...5678',
    images: [
      'https://via.placeholder.com/800x600/409EFF/FFFFFF?text=Digital+Art+1',
      'https://via.placeholder.com/800x600/409EFF/FFFFFF?text=Digital+Art+2'
    ],
    status: 'active',
    bidCount: 5,
    category: '数字艺术'
  },
  {
    id: 2,
    name: '稀有游戏道具',
    description: '游戏中的限定皮肤，具有特殊效果和动画',
    currentPrice: '0.3',
    startPrice: '0.05',
    endTime: Date.now() + 172800000, // 48小时后
    seller: '0x9876...4321',
    images: [
      'https://via.placeholder.com/800x600/67C23A/FFFFFF?text=Game+Item+1',
      'https://via.placeholder.com/800x600/67C23A/FFFFFF?text=Game+Item+2'
    ],
    status: 'active',
    bidCount: 3,
    category: '游戏道具'
  },
  {
    id: 3,
    name: '收藏级虚拟地产',
    description: '元宇宙中心地段的虚拟地产，具有极高的升值潜力',
    currentPrice: '1.2',
    startPrice: '0.8',
    endTime: Date.now() + 259200000, // 72小时后
    seller: '0x5678...9012',
    images: [
      'https://via.placeholder.com/800x600/E6A23C/FFFFFF?text=Virtual+Estate+1',
      'https://via.placeholder.com/800x600/E6A23C/FFFFFF?text=Virtual+Estate+2'
    ],
    status: 'active',
    bidCount: 8,
    category: '虚拟地产'
  }
]

// 模拟获取拍卖列表
export const getAuctions = (params: {
  page: number
  pageSize: number
  status?: string
  minPrice?: number
  maxPrice?: number
  category?: string
}) => {
  let result = [...mockAuctions]
  
  // 筛选状态
  if (params.status) {
    result = result.filter(item => item.status === params.status)
  }
  
  // 筛选价格
  if (params.minPrice !== undefined) {
    result = result.filter(item => parseFloat(item.currentPrice) >= params.minPrice!)
  }
  if (params.maxPrice !== undefined) {
    result = result.filter(item => parseFloat(item.currentPrice) <= params.maxPrice!)
  }
  
  // 筛选分类
  if (params.category) {
    result = result.filter(item => item.category === params.category)
  }
  
  // 分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  
  return {
    total: result.length,
    items: result.slice(start, end)
  }
}

// 模拟获取拍卖详情
export const getAuctionById = (id: number) => {
  return mockAuctions.find(item => item.id === id)
}

// 模拟获取最新拍卖
export const getLatestAuctions = (limit: number = 3) => {
  return mockAuctions.slice(0, limit)
} 