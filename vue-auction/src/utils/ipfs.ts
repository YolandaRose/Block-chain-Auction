import { create } from 'ipfs-http-client'

class IPFSService {
  private ipfs
  private gateway = 'http://localhost:9001/ipfs/'

  constructor() {
    // 连接到本地IPFS节点
    this.ipfs = create({
      host: 'localhost',
      port: 5002,
      protocol: 'http'
    })
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // 读取文件内容
      const buffer = await file.arrayBuffer()
      
      // 上传到IPFS
      const result = await this.ipfs.add(buffer)
      
      // 返回文件的CID (Content Identifier)
      return result.path
    } catch (error: any) {
      console.error('IPFS上传失败:', error)
      throw new Error(error.message || 'IPFS上传失败')
    }
  }

  getIPFSUrl(cid: string): string {
    // 返回可访问的IPFS URL
    return `${this.gateway}${cid}`
  }
}

// 创建单例实例
export const ipfsService = new IPFSService() 