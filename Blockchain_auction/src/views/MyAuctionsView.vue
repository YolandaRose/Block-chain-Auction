<template>
  <div class="my-auctions-container">
    <div class="my-auctions-content">
      <h2 class="page-title">我的拍卖</h2>
      
      <el-tabs v-model="activeTab" class="tabs-section">
        <el-tab-pane label="我发布的" name="created">
          <el-empty v-if="!hasCreatedAuctions" description="暂无发布的拍卖">
            <el-button type="primary" @click="$router.push('/create-auction')">
              创建拍卖
            </el-button>
          </el-empty>
          <div v-else class="auction-list">
            <el-card
              v-for="auction in createdAuctions"
              :key="auction.id"
              class="auction-card"
              :body-style="{ padding: '0px' }"
              @click="goToDetail(auction.id)"
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
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我参与的" name="participated">
          <el-empty v-if="!hasParticipatedAuctions" description="暂无参与的拍卖">
            <el-button type="primary" @click="$router.push('/auctions')">
              浏览拍卖
            </el-button>
          </el-empty>
          <div v-else class="auction-list">
            <el-card
              v-for="auction in participatedAuctions"
              :key="auction.id"
              class="auction-card"
              :body-style="{ padding: '0px' }"
              @click="goToDetail(auction.id)"
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
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'

interface Auction {
  id: number
  name: string
  description: string
  currentPrice: string
  startPrice: string
  endTime: number
  seller: string
  images: string[]
  image?: string
  status: 'ended' | 'active' | 'pending'
  bidCount: number
  category: string
}

const router = useRouter()
const activeTab = ref('created')

// 模拟数据
const createdAuctions = ref<Auction[]>([])
const participatedAuctions = ref<Auction[]>([])

const hasCreatedAuctions = computed(() => createdAuctions.value.length > 0)
const hasParticipatedAuctions = computed(() => participatedAuctions.value.length > 0)

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    ended: '已结束',
    pending: '即将开始'
  }
  return statusMap[status] || status
}

const goToDetail = (id: number) => {
  router.push(`/auction/${id}`)
}
</script>

<style scoped>
.my-auctions-container {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-color);
  padding: 40px 0;
  transition: all 0.3s ease;
}

.my-auctions-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background: var(--bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.page-title {
  font-size: 32px;
  color: var(--text-primary);
  margin-bottom: 40px;
  text-align: center;
}

.tabs-section {
  margin-bottom: 30px;
}

:deep(.el-tabs__item) {
  color: var(--text-regular);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

.auction-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.auction-card {
  background: var(--bg-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.auction-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  color: var(--text-secondary);
}

.auction-info {
  padding: 16px;
}

.auction-title {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 500;
}

.auction-description {
  color: var(--text-regular);
  font-size: 14px;
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
  color: var(--text-secondary);
  font-size: 14px;
}

.auction-price {
  color: var(--primary-color);
  font-weight: 500;
}

.auction-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  background-color: var(--success-color);
  color: #fff;
}

.status-ended {
  background-color: var(--text-secondary);
  color: #fff;
}

.status-pending {
  background-color: var(--warning-color);
  color: #fff;
}

@media (max-width: 768px) {
  .my-auctions-container {
    padding: 20px 0;
  }

  .my-auctions-content {
    padding: 20px;
    margin: 0 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .auction-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style> 