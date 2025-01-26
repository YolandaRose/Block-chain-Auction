<template>
  <div class="market-view">
    <div class="filters">
      <!-- 过滤和搜索组件 -->
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="4" animated />
    </div>
    
    <div v-else-if="error" class="error">
      <el-empty :description="error">
        <el-button type="primary" @click="retryLoad">重试</el-button>
      </el-empty>
    </div>
    
    <div v-else-if="!auctions.length" class="empty">
      <el-empty description="暂无拍卖商品">
        <el-button type="primary" @click="$router.push('/create-auction')">
          创建拍卖
        </el-button>
      </el-empty>
    </div>
    
    <div v-else class="product-grid">
      <div 
        class="product-card" 
        v-for="product in auctions" 
        :key="product.id"
        @click="goToDetail(product.id)"
      >
        <div class="product-image">
          <el-image 
            :src="product.imageLink" 
            :alt="product.name"
            fit="cover"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon :size="24"><Picture /></el-icon>
              </div>
            </template>
          </el-image>
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
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useAuctionStore()
const { auctions, loading, error } = storeToRefs(store)

const goToDetail = (productId: number) => {
  console.log('点击商品，ID:', productId)
  try {
    router.push(`/product/${productId}`)
  } catch (error) {
    console.error('路由跳转失败:', error)
    ElMessage.error('页面跳转失败')
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

const retryLoad = async () => {
  try {
    await store.fetchAuctions({
      page: 1,
      pageSize: 10
    })
  } catch (error) {
    console.error('重新加载失败:', error)
    ElMessage.error('重新加载失败')
  }
}

onMounted(async () => {
  await retryLoad()
})
</script>

<style scoped>
.market-view {
  padding: 20px;
}

.loading, .error, .empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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
  cursor: pointer;
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

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
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
