<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="product" class="product-info">
      <h1>{{ product.name }}</h1>
      
      <div class="info-section">
        <h2>基本信息</h2>
        <p><strong>类别：</strong>{{ product.category }}</p>
        <p><strong>商品状态：</strong>{{ getConditionText(product.condition) }}</p>
        <p><strong>拍卖状态：</strong>{{ getStatusText(product.status) }}</p>
      </div>

      <div v-if="product.imageLink" class="image-section">
        <img :src="product.imageLink" :alt="product.name">
      </div>

      <div class="description-section">
        <h2>商品描述</h2>
        <p>{{ product.descLink }}</p>
      </div>

      <div class="auction-section">
        <h2>拍卖信息</h2>
        <p><strong>起拍价：</strong>{{ formatPrice(product.startPrice) }} ETH</p>
        <p><strong>当前最高价：</strong>{{ formatPrice(product.highestBid) }} ETH</p>
        <p><strong>最高出价者：</strong>{{ formatAddress(product.highestBidder) }}</p>
        <p><strong>出价次数：</strong>{{ product.totalBids }}</p>
        <p><strong>开始时间：</strong>{{ formatTime(product.auctionStartTime) }}</p>
        <p><strong>结束时间：</strong>{{ formatTime(product.auctionEndTime) }}</p>
      </div>

      <div class="seller-section">
        <h2>卖家信息</h2>
        <p><strong>卖家地址：</strong>{{ formatAddress(product.seller) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { web3Service } from '@/utils/web3'
import type { Product } from '@/utils/web3'
import Web3 from 'web3'

defineComponent({
  name: 'ProductDetailView'
})

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref('')

// 格式化状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '拍卖中'
    case 1:
      return '已售出'
    case 2:
      return '流拍'
    default:
      return '未知'
  }
}

// 格式化商品状况
const getConditionText = (condition: number) => {
  return condition === 0 ? '全新' : '二手'
}

// 格式化价格
const formatPrice = (price: string) => {
  try {
    return Web3.utils.fromWei(price, 'ether')
  } catch {
    console.error('价格格式化失败:', price)
    return '0'
  }
}

// 格式化地址
const formatAddress = (address: string) => {
  if (!address) return '无'
  return address.slice(0, 6) + '...' + address.slice(-4)
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// 加载商品信息
const loadProduct = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const productId = Number(route.params.id)
    console.log('路由参数:', route.params)
    
    if (isNaN(productId)) {
      throw new Error('无效的商品ID')
    }

    console.log('正在加载商品ID:', productId)
    const data = await web3Service.getProduct(productId)
    
    if (!data) {
      throw new Error('商品不存在')
    }

    console.log('获取到商品数据:', data)
    product.value = data
  } catch (err: any) {
    console.error('加载商品失败:', err)
    error.value = err.message || '加载商品失败'
    product.value = null
  } finally {
    loading.value = false
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  console.log('组件已挂载，开始加载数据')
  loadProduct()
})
</script>

<style scoped>
.product-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: red;
}

.info-section, .description-section, .auction-section, .seller-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.image-section {
  margin: 20px 0;
  text-align: center;
}

.image-section img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 20px;
}

h2 {
  font-size: 1.5em;
  color: #666;
  margin-bottom: 15px;
}

p {
  margin: 10px 0;
  line-height: 1.6;
}

strong {
  color: #555;
}
</style> 
