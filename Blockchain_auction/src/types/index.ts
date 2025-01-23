export interface Auction {
  id: number
  name: string
  description: string
  currentPrice: string
  startPrice: string
  endTime: number
  seller: string
  winner: string
  images: string[]
  status: string
  bidCount: number
  category: string
}

export interface AuctionParams {
  page?: number
  pageSize?: number
  category?: string
  sortBy?: string
  search?: string
} 