<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="error" class="error">
      <el-result
        icon="error"
        :title="error"
        sub-title="请稍后重试"
      >
        <template #extra>
          <el-button type="primary" @click="loadProduct">重新加载</el-button>
        </template>
      </el-result>
    </div>
    <div v-else-if="product" class="product-content">
      <div class="product-header">
        <h1>{{ product.name }}</h1>
        <el-tag :type="getStatusType(product.status)" size="large">
          {{ getStatusText(product.status) }}
        </el-tag>
      </div>

      <div class="product-grid">
        <!-- 左侧：图片和基本信息 -->
        <div class="left-column">
          <div class="image-section">
            <el-image
              :src="product.imageLink"
              :alt="product.name"
              fit="cover"
              loading="lazy"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon :size="64"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <div class="info-section">
            <h2>基本信息</h2>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="类别">
                <el-tag size="small">{{ product.category }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="商品状态">
                {{ getConditionText(product.condition) }}
              </el-descriptions-item>
              <el-descriptions-item label="卖家">
                <el-tooltip :content="product.seller" placement="top">
                  <span class="address">{{ formatAddress(product.seller) }}</span>
                </el-tooltip>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 右侧：拍卖信息和描述 -->
        <div class="right-column">
          <div class="auction-section">
            <h2>拍卖信息</h2>
            <div class="price-info">
              <div class="price-item">
                <div class="label">起拍价</div>
                <div class="value">{{ formatPrice(product.startPrice) }} ETH</div>
              </div>
              <div class="price-item highlight">
                <div class="label">当前最高价</div>
                <div class="value">{{ formatPrice(product.highestBid) }} ETH</div>
              </div>
            </div>

            <el-divider />

            <div class="auction-details">
              <div class="detail-item">
                <el-icon><Timer /></el-icon>
                <span class="label">开始时间：</span>
                <span>{{ formatTime(product.auctionStartTime) }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Timer /></el-icon>
                <span class="label">结束时间：</span>
                <span>{{ formatTime(product.auctionEndTime) }}</span>
              </div>
              <div class="detail-item">
                <el-icon><User /></el-icon>
                <span class="label">最高出价者：</span>
                <el-tooltip :content="product.highestBidder" placement="top">
                  <span class="address">{{ formatAddress(product.highestBidder) }}</span>
                </el-tooltip>
              </div>
              <div class="detail-item">
                <el-icon><Collection /></el-icon>
                <span class="label">出价次数：</span>
                <span>{{ product.totalBids }} 次</span>
              </div>
            </div>

            <el-divider />

            <div class="action-section" v-if="product.status === 0">
              <el-button type="primary" size="large" @click="placeBid">
                立即出价
              </el-button>
            </div>
          </div>

          <div class="description-section">
            <h2>商品描述</h2>
            <p>{{ product.descLink }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { web3Service } from '@/utils/web3'
import type { Product } from '@/utils/web3'
import Web3 from 'web3'
import { Picture, Timer, User, Collection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref('')

// 获取状态样式
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'success'
    case 1:
      return 'info'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

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

// 出价功能
const placeBid = async () => {
  ElMessage.info('出价功能开发中...')
}

// 加载商品信息
const loadProduct = async (retryCount = 0) => {
  const maxRetries = 3
  try {
    loading.value = true
    error.value = ''
    
    const productId = Number(route.params.id)
    if (isNaN(productId)) {
      throw new Error('无效的商品ID')
    }

    if (!web3Service) {
      throw new Error('Web3服务未初始化')
    }

    const data = await web3Service.getProduct(productId)
    if (!data) {
      throw new Error('商品不存在')
    }

    product.value = {
      ...data,
      name: data.name || '未命名商品',
      category: data.category || '未分类',
      imageLink: data.imageLink || '',
      descLink: data.descLink || '暂无描述',
      startPrice: data.startPrice || '0',
      highestBid: data.highestBid || '0',
      secondHighestBid: data.secondHighestBid || '0',
      totalBids: data.totalBids || 0,
      status: data.status || 0,
      condition: data.condition || 0,
      seller: data.seller || '0x0000000000000000000000000000000000000000'
    }
  } catch (err: any) {
    console.error('加载商品失败:', err)
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return loadProduct(retryCount + 1)
    }
    error.value = err.message || '加载商品失败'
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  padding: 40px;
}

.product-content {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.product-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-section {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: var(--el-fill-color-light);
}

.image-section .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.info-section, .auction-section, .description-section {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
}

h2 {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin: 0 0 20px 0;
}

.price-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.price-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.price-item.highlight {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
}

.price-item .label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.price-item .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.auction-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.detail-item .el-icon {
  color: var(--el-text-color-secondary);
}

.detail-item .label {
  color: var(--el-text-color-secondary);
  min-width: 80px;
}

.address {
  color: var(--el-color-primary);
  cursor: pointer;
}

.action-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.description-section p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .price-info {
    grid-template-columns: 1fr;
  }
}
</style> 
