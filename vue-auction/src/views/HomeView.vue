<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Connection, Promotion, ArrowRight, Picture } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage } from 'element-plus'

interface Auction {
  id: number
  name: string
  currentPrice: string
  endTime: number
  image: string
  status: string
  description: string
}

const router = useRouter()
const store = useAuctionStore()
const loading = ref(false)
const latestAuctions = ref<Auction[]>([])
const totalAuctions = ref('1,234')
const totalUsers = ref('5,678')
const totalVolume = ref('9,012')

const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    ended: '已结束',
    pending: '即将开始'
  }
  return statusMap[status] || status
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
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">区块链拍卖的未来</h1>
        <p class="hero-description">
          在以太坊智能合约驱动的去中心化平台上，安全透明地参与全球艺术品和数字资产的拍卖交易
        </p>
        <div class="hero-actions">
          <el-button 
            type="primary" 
            size="large" 
            class="action-button"
            @click="$router.push('/auctions')"
          >
            开始探索
          </el-button>
          <el-button 
            size="large" 
            class="action-button secondary"
            @click="$router.push('/create-auction')"
          >
            创建拍卖
          </el-button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalAuctions }}</div>
          <div class="stat-label">拍卖总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalVolume }} ETH</div>
          <div class="stat-label">交易总额</div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">为什么选择我们</h2>
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40"><Lock /></el-icon>
            <h3>安全可靠</h3>
            <p>基于以太坊智能合约，所有交易都在链上进行，安全透明，无法篡改</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40"><Connection /></el-icon>
            <h3>去中心化</h3>
            <p>完全去中心化的运作模式，没有中间商，直接通过智能合约执行交易</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40"><Promotion /></el-icon>
            <h3>便捷高效</h3>
            <p>智能合约自动执行，无需人工干预，大大提高交易效率</p>
          </div>
        </div>
      </div>
    </section>

    <section class="latest-auctions">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新拍卖</h2>
          <el-button 
            type="primary" 
            text 
            class="view-all"
            @click="$router.push('/auctions')"
          >
            查看全部
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-row :gutter="24">
          <el-col 
            v-for="auction in latestAuctions" 
            :key="auction.id" 
            :xs="24" 
            :sm="12" 
            :md="8"
            class="auction-col"
          >
            <el-card 
              class="auction-card" 
              :body-style="{ padding: '0px' }"
              @click="$router.push(`/auction/${auction.id}`)"
            >
              <el-image
                :src="auction.image"
                class="auction-image"
                fit="cover"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon :size="24"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="auction-info">
                <h3 class="auction-title">{{ auction.name }}</h3>
                <p class="auction-description">{{ auction.description }}</p>
                <div class="auction-meta">
                  <span class="auction-price">{{ auction.currentPrice }} ETH</span>
                  <span :class="['auction-status', `status-${auction.status}`]">
                    {{ getStatusText(auction.status) }}
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  background-color: var(--bg-color);
  color: var(--text-regular);
}

.hero-section {
  background: linear-gradient(135deg, #1a237e 0%, #673ab7 50%, #e91e63 100%);
  padding: 120px 0 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before,
.hero-section::after {
  content: '';
  position: absolute;
  width: 1000px;
  height: 1000px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}

.hero-section::before {
  top: -500px;
  left: -200px;
}

.hero-section::after {
  bottom: -500px;
  right: -200px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
  line-height: 1.2;
  background: linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.action-button {
  padding: 12px 32px;
  font-size: 1.1rem;
  border-radius: 8px;
  font-weight: 500;
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 60px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features-section {
  padding: 100px 0;
  background: var(--bg-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 2.5rem;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px;
  background: var(--bg-color-overlay);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: 24px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.feature-card p {
  color: var(--text-regular);
  line-height: 1.6;
}

.latest-auctions {
  padding: 100px 0;
  background: var(--bg-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.view-all {
  font-size: 1.1rem;
}

.auction-col {
  margin-bottom: 24px;
}

.auction-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-color-overlay);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow);
}

.auction-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  color: var(--text-secondary);
}

.auction-info {
  padding: 20px;
}

.auction-title {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 500;
}

.auction-description {
  color: var(--text-regular);
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.auction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auction-price {
  font-size: 1.1rem;
  color: var(--primary-color);
  font-weight: 500;
}

.auction-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #fff;
}

.status-active {
  background: var(--success-color);
}

.status-ended {
  background: var(--text-secondary);
}

.status-pending {
  background: var(--warning-color);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.2rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 40px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
