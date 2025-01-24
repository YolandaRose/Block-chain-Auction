import { create } from 'ipfs-http-client'

class IPFSService {
  private ipfs

  constructor() {
    // 连接到本地 IPFS 节点
    this.ipfs = create({
      host: 'localhost',
      port: 5002,
      protocol: 'http',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  async uploadImage(file: File): Promise<string> {
    if (!this.ipfs) {
      throw new Error('IPFS 客户端未初始化')
    }

    try {
      console.log('开始上传文件到 IPFS:', file.name)
      
      // 将文件转换为 Buffer
      const buffer = await file.arrayBuffer()
      
      // 上传到 IPFS
      const result = await this.ipfs.add({
        path: file.name,
        content: new Uint8Array(buffer)
      })
      
      console.log('IPFS 上传成功:', result)
      return result.cid.toString()
    } catch (error) {
      console.error('IPFS 上传错误:', error)
      if (error instanceof Error) {
        throw new Error(`上传图片到 IPFS 失败: ${error.message}`)
      } else {
        throw new Error('上传图片到 IPFS 失败，请确保 IPFS 节点正在运行且端口 5002 可访问')
      }
    }
  }

  async uploadImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file))
    return Promise.all(uploadPromises)
  }

  getIPFSUrl(hash: string): string {
    // 使用网关端口 9001 访问文件
    return `http://localhost:9001/ipfs/${hash}`
  }
}

export const ipfsService = new IPFSService() 