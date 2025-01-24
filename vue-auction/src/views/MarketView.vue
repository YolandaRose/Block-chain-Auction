<template>
  <div class="market-view">
    <div class="filters">
      <!-- 过滤和搜索组件 -->
    </div>
    
    <div class="product-grid">
      <div 
        class="product-card" 
        v-for="product in auctions" 
        :key="product.id"
        @click="goToDetail(product.id)"
        style="cursor: pointer;"
      >
        <div class="product-image">
          <img :src="product.imageLink" :alt="product.name">
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="category">{{ product.category }}</p>
          <p class="price">起拍价: {{ formatPrice(product.startPrice) }} ETH</p>
          <p class="time">结束时间: {{ formatTime(product.auctionEndTime) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuctionStore } from '@/stores/auction'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Web3 from 'web3'

const router = useRouter()
const store = useAuctionStore()
const { auctions, loading, error } = storeToRefs(store)

const goToDetail = (productId: number) => {
  console.log('点击商品，ID:', productId)
  try {
    router.push({
      name: 'product-detail',
      params: { id: productId.toString() }
    })
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}

const formatPrice = (price: string) => {
  try {
    return Web3.utils.fromWei(price, 'ether')
  } catch {
    return '0'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

onMounted(async () => {
  await store.fetchAuctions({
    page: 1,
    pageSize: 10
  })
})
</script>

<style scoped>
.market-view {
  padding: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.category {
  color: #666;
  font-size: 0.9em;
}

.price {
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
}

.time {
  color: #666;
  font-size: 0.9em;
}
</style> 
