interface ContractProduct {
  id: string;
  name: string;
  category: string;
  imageLink: string;
  descLink: string;
  auctionStartTime: string;
  auctionEndTime: string;
  startPrice: string;
  status: string;
  condition: string;
  highestBidder: string;
  highestBid: string;
  secondHighestBid: string;
  totalBids: string;
  seller: string;
}

export class Web3Service {
  private contract: any;

  constructor(contract: any) {
    this.contract = contract;
  }

  public async getProduct(productId: number): Promise<ContractProduct> {
    try {
      // 获取基本产品信息
      const result = await this.contract.methods.getProduct(productId).call();
      console.log('产品基本信息:', result);

      // 获取竞拍信息
      const bidInfo = await this.contract.methods.highestBidderInfo(productId).call();
      console.log('竞拍信息:', bidInfo);

      // 获取总出价次数
      const totalBidsCount = await this.contract.methods.totalBids(productId).call();
      console.log('总出价次数:', totalBidsCount);

      // 获取卖家地址
      const sellerAddress = await this.contract.methods.productIdInStore(productId).call();
      console.log('卖家地址:', sellerAddress);

      // 构建产品对象
      const product: ContractProduct = {
        id: result[0].toString(),
        name: result[1],
        category: result[2],
        imageLink: result[3],
        descLink: result[4],
        auctionStartTime: result[5].toString(),
        auctionEndTime: result[6].toString(),
        startPrice: result[7].toString(),
        status: result[8].toString(),
        condition: result[9].toString(),
        highestBidder: bidInfo[0],
        highestBid: bidInfo[1].toString(),
        secondHighestBid: bidInfo[2].toString(),
        totalBids: totalBidsCount.toString(),
        seller: sellerAddress.toLowerCase()
      };

      return product;
    } catch (error) {
      console.error('获取产品信息时出错:', error);
      throw error;
    }
  }
} 
