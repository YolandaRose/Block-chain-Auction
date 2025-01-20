<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Connection, Promotion, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage } from 'element-plus'

interface Auction {
  id: number
  name: string
  currentPrice: string
  endTime: number
  image: string
}

const router = useRouter()
const store = useAuctionStore()
const loading = ref(false)
const latestAuctions = ref<Auction[]>([])

const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(async () => {
  try {
    loading.value = true
    await store.fetchLatestAuctions()
    latestAuctions.value = store.auctions
  } catch (error: any) {
    ElMessage.error(error.message || '加载拍卖列表失败')
  } finally {
    loading.value = false
  }
})

const features = [
  {
    icon: 'Lock',
    color: '#409EFF',
    title: '安全可靠',
    description: '基于智能合约，交易过程透明公开，无法篡改'
  },
  {
    icon: 'Connection',
    color: '#67C23A',
    title: '去中心化',
    description: '无需中心化平台，直接通过区块链网络进行拍卖'
  },
  {
    icon: 'Promotion',
    color: '#E6A23C',
    title: '便捷高效',
    description: '支持多种拍卖方式，自动化合约执行'
  }
]
</script>

<template>
  <div class="home">
    <div class="banner-wrapper">
      <div class="banner">
        <h1>探索区块链拍卖的新世界</h1>
        <p>基于以太坊智能合约的去中心化拍卖平台，安全、透明、高效</p>
        <div class="banner-buttons">
          <el-button type="primary" size="large" @click="router.push('/auctions')">
            浏览拍卖
          </el-button>
          <el-button size="large" @click="router.push('/create')">
            发起拍卖
          </el-button>
        </div>
      </div>
    </div>

    <div class="features">
      <div v-for="(feature, index) in features" 
           :key="index" 
           class="feature-card"
           :style="{ animationDelay: `${index * 0.2}s` }">
        <el-icon :size="40" :color="feature.color"><component :is="feature.icon" /></el-icon>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>

    <div class="latest-auctions">
      <div class="section-header">
        <h2>最新拍卖</h2>
        <el-button text @click="router.push('/auctions')">
          查看全部 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <el-row v-loading="loading" :gutter="30">
        <el-col v-for="auction in latestAuctions" 
                :key="auction.id" 
                :span="8"
                :xs="24" 
                :sm="12" 
                :md="8">
          <el-card class="auction-card" shadow="hover">
            <img :src="auction.image" class="auction-image" />
            <div class="auction-info">
              <h3>{{ auction.name }}</h3>
              <div class="price-info">
                <span>当前价格</span>
                <span class="price">{{ auction.currentPrice }} ETH</span>
              </div>
              <div class="time-info">
                <span>结束时间</span>
                <span>{{ formatTime(auction.endTime) }}</span>
              </div>
              <el-button type="primary" @click="router.push(`/auction/${auction.id}`)" class="detail-button">
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-top: 60px; /* 为固定导航栏留出空间 */
}

/* 新增包装器样式 */
.banner-wrapper {
  width: 100%;
  background: linear-gradient(135deg, #409EFF 0%, #36cfc9 100%);
  padding: 80px 20px;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
}

.banner-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="rgba(255,255,255,0.1)" x="0" y="0" width="100" height="100"/></svg>') repeat;
  opacity: 0.1;
}

/* 修改 banner 样式 */
.banner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.banner h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.banner p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.banner-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.features,
.latest-auctions {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.features {
  margin-bottom: 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.feature-card {
  background: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  animation: fadeInUp 0.6s ease both;
  animation-play-state: paused;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card.visible {
  animation-play-state: running;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card .el-icon {
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 15px;
  font-size: 1.25rem;
}

.feature-card p {
  color: #606266;
  line-height: 1.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 1.75rem;
  color: #303133;
  margin: 0;
}

.auction-card {
  margin-bottom: 30px;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.auction-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.auction-info {
  padding: 20px;
}

.auction-info h3 {
  font-size: 1.1rem;
  color: #303133;
  margin: 0 0 15px;
  font-weight: 500;
  line-height: 1.4;
}

.price-info, .time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #606266;
  font-size: 0.95rem;
}

.price {
  color: #409EFF;
  font-size: 1.2rem;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-button {
  width: 100%;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .banner {
    padding: 60px 20px;
  }

  .banner h1 {
    font-size: 2rem;
  }

  .banner p {
    font-size: 1rem;
  }

  .auction-card {
    margin-bottom: 20px;
  }

  .feature-card {
    padding: 30px 20px;
  }
}

html {
  scroll-behavior: smooth;
}

.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.banner-buttons .el-button {
  padding: 12px 24px;
  font-weight: 500;
}

.banner-buttons .el-button--primary {
  background: rgba(255, 255, 255, 0.2);
  border-color: transparent;
}

.banner-buttons .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.banner-buttons .el-button--default {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.6);
  color: white;
}

.banner-buttons .el-button--default:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
