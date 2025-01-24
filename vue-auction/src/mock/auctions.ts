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
  status: 'Open' | 'Sold' | 'Unsold'
  condition: 'New' | 'Used'
}

interface ProductParams {
  page: number
  pageSize: number
  category?: string
  sortBy?: string
  search?: string
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: '限量版数字艺术作品 - 星空梦境',
    category: '艺术品',
    imageLink: '/images/art1.jpg',
    descLink: '这是一幅由知名数字艺术家创作的限量版作品。作品灵感来源于梵高的《星月夜》，通过AI技术重新诠释了这一经典画作。',
    auctionStartTime: Math.floor(Date.now() / 1000),
    auctionEndTime: Math.floor(Date.now() / 1000) + 259200, // 3天后
    startPrice: '0.5',
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBid: '1.5',
    secondHighestBid: '1.2',
    totalBids: 18,
    status: 'Open',
    condition: 'New'
  },
  {
    id: 2,
    name: '稀有游戏角色皮肤 - 黄金守护者',
    category: '游戏道具',
    imageLink: '/images/skin1.jpg',
    descLink: '来自知名区块链游戏的限定皮肤，全服仅此一件。拥有特殊的视觉效果和独特的技能动画。',
    auctionStartTime: Math.floor(Date.now() / 1000),
    auctionEndTime: Math.floor(Date.now() / 1000) + 172800, // 2天后
    startPrice: '1.0',
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBid: '2.8',
    secondHighestBid: '2.5',
    totalBids: 25,
    status: 'Open',
    condition: 'New'
  },
  {
    id: 3,
    name: '元宇宙黄金地段 - 中心广场A11',
    category: '虚拟地产',
    imageLink: '/images/land1.jpg',
    descLink: '位于元宇宙最繁华的中心商业区，周边已有多个知名品牌入驻。该地块可用于建设商业中心、展览馆或社交空间，具有极高的升值潜力。',
    auctionStartTime: Math.floor(Date.now() / 1000),
    auctionEndTime: Math.floor(Date.now() / 1000) + 259200, // 3天后
    startPrice: '3.0',
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBid: '5.5',
    secondHighestBid: '5.0',
    totalBids: 12,
    status: 'Open',
    condition: 'New'
  },
  {
    id: 4,
    name: '传奇NFT系列 - 创世纪卡牌',
    category: '收藏品',
    imageLink: '/images/card1.jpg',
    descLink: '首发限量NFT卡牌，编号NO.7/100。卡牌具有特殊的AR互动功能，可以通过专属App查看动态效果。',
    auctionStartTime: Math.floor(Date.now() / 1000) - 86400, // 已结束
    auctionEndTime: Math.floor(Date.now() / 1000) - 86400, // 已结束
    startPrice: '1.5',
    highestBidder: '0x1111222233334444555566667777888899990000',
    highestBid: '3.2',
    secondHighestBid: '2.8',
    totalBids: 45,
    status: 'Unsold',
    condition: 'New'
  },
  {
    id: 5,
    name: '数字艺术 - 未来城市',
    category: '艺术品',
    imageLink: '/images/future_city.jpg',
    descLink: '描绘2150年未来城市场景的数字艺术作品，采用最新的3D建模技术创作。作品展现了艺术家对未来城市发展的独特想象。',
    auctionStartTime: Math.floor(Date.now() / 1000),
    auctionEndTime: Math.floor(Date.now() / 1000) + 432000, // 5天后
    startPrice: '0.3',
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBid: '0.8',
    secondHighestBid: '0.6',
    totalBids: 8,
    status: 'Open',
    condition: 'New'
  },
  {
    id: 6,
    name: '虚拟演唱会门票 - 2024限定',
    category: '门票',
    imageLink: '/images/ticket1.jpg',
    descLink: '知名虚拟偶像在元宇宙举办的限定演唱会门票，持票者可获得VIP观看位置和独特的互动体验机会。',
    auctionStartTime: Math.floor(Date.now() / 1000),
    auctionEndTime: Math.floor(Date.now() / 1000) + 345600, // 4天后
    startPrice: '0.2',
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBid: '0.6',
    secondHighestBid: '0.4',
    totalBids: 15,
    status: 'Open',
    condition: 'New'
  }
]

export function getProducts(params: ProductParams): { items: Product[], total: number } {
  let filtered = [...mockProducts]

  // 应用过滤条件
  if (params.category) {
    filtered = filtered.filter(product => product.category === params.category)
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.descLink.toLowerCase().includes(searchLower)
    )
  }

  // 应用排序
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => parseFloat(a.highestBid) - parseFloat(b.highestBid))
        break
      case 'priceDesc':
        filtered.sort((a, b) => parseFloat(b.highestBid) - parseFloat(a.highestBid))
        break
      case 'newest':
        filtered.sort((a, b) => b.auctionStartTime - a.auctionStartTime)
        break
      case 'endingSoon':
        filtered.sort((a, b) => a.auctionEndTime - b.auctionEndTime)
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

export function getProduct(id: number): Product | null {
  console.log('Searching for product with id:', id)
  const product = mockProducts.find(p => p.id === Number(id))
  console.log('Found product:', product)
  return product || null
}

export function getLatestProducts(): Product[] {
  return mockProducts
    .filter(product => product.status === 'Open')
    .sort((a, b) => b.auctionStartTime - a.auctionStartTime)
    .slice(0, 6)
}

export function getProductCount(): number {
  return mockProducts.length
}

export function highestBidderInfo(productId: number): [string, string, string] {
  const product = getProduct(productId)
  if (!product) {
    return ['0x0000000000000000000000000000000000000000', '0', '0']
  }
  return [product.highestBidder, product.highestBid, product.secondHighestBid]
}

export function totalBids(productId: number): number {
  const product = getProduct(productId)
  return product ? product.totalBids : 0
} 