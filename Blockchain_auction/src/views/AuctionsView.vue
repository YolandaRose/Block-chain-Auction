<template>
  <div class="auctions-container">
    <div class="search-section">
      <div class="search-wrapper">
        <el-input
          v-model="searchQuery"
          placeholder="搜索拍卖品..."
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="category" placeholder="选择分类" class="category-select" clearable>
          <el-option label="全部" value="" />
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
        <el-select v-model="sortBy" placeholder="排序方式" class="sort-select">
          <el-option label="最新发布" value="newest" />
          <el-option label="即将结束" value="ending" />
          <el-option label="价格最低" value="price_asc" />
          <el-option label="价格最高" value="price_desc" />
        </el-select>
      </div>
    </div>

    <div class="auctions-grid" v-loading="loading">
      <el-row :gutter="20">
        <el-col v-for="auction in filteredAuctions" 
                :key="auction.id" 
                :xs="24" 
                :sm="12" 
                :md="8" 
                :lg="6"
                class="auction-col">
          <el-card class="auction-card" shadow="hover" @click="goToDetail(auction.id)">
            <div class="auction-image">
              <el-image :src="auction.image" fit="cover">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="auction-status" :class="auction.status">
                {{ getStatusText(auction.status) }}
              </div>
            </div>
            <div class="auction-info">
              <h3 class="auction-title">{{ auction.name }}</h3>
              <div class="price-info">
                <span class="label">当前价格</span>
                <span class="price">{{ auction.currentPrice }} ETH</span>
              </div>
              <div class="time-info">
                <span class="label">结束时间</span>
                <span class="time" :class="{ 'ending-soon': isEndingSoon(auction.endTime) }">
                  {{ formatTime(auction.endTime) }}
                </span>
              </div>
              <div class="bid-info">
                <span class="label">出价次数</span>
                <span class="bids">{{ auction.bidCount }}次</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Picture } from '@element-plus/icons-vue'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

interface Auction {
  id: number
  name: string
  description: string
  currentPrice: string
  startPrice: string
  endTime: number
  seller: string
  images: string[]
  status: 'ended' | 'active' | 'pending'
  bidCount: number
  category: string
}

interface AuctionParams {
  page: number
  pageSize: number
  category?: string
  sortBy?: string
  search?: string
}

const router = useRouter()
const store = useAuctionStore()
const loading = ref(false)
const searchQuery = ref('')
const category = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)

const categories = ['艺术品', '收藏品', '数字资产', '虚拟物品', '其他']

// 获取拍卖列表
const fetchAuctions = async () => {
  try {
    loading.value = true
    await store.fetchAuctions({
      page: currentPage.value,
      pageSize: pageSize.value,
      category: category.value || undefined,
      sortBy: sortBy.value,
      search: searchQuery.value || undefined
    } as AuctionParams)
    // 更新总数
    totalItems.value = store.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载拍卖列表失败')
  } finally {
    loading.value = false
  }
}

// 计算属性
const filteredAuctions = computed(() => {
  return (store.auctions as Auction[]).map(auction => ({
    ...auction,
    image: auction.images[0] || '' // 使用第一张图片作为主图
  }))
})

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

// 方法
const handleSearch = () => {
  currentPage.value = 1
  fetchAuctions()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchAuctions()
}

const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

const isEndingSoon = (endTime: number): boolean => {
  const now = dayjs()
  const end = dayjs(endTime)
  return end.diff(now, 'hour') <= 24
}

const getStatusText = (status: string): string => {
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

// 监听筛选条件变化
watch([category, sortBy], () => {
  currentPage.value = 1
  fetchAuctions()
})

onMounted(() => {
  fetchAuctions()
})
</script>

<style scoped>
.auctions-container {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-color);
  transition: all 0.3s ease;
}

.search-section {
  background: linear-gradient(135deg, #1a237e 0%, #673ab7 50%, #e91e63 100%);
  padding: 30px 0;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.search-section::before,
.search-section::after {
  content: '';
  position: absolute;
  width: 1000px;
  height: 1000px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}

.search-section::before {
  top: -800px;
  left: -200px;
}

.search-section::after {
  bottom: -800px;
  right: -200px;
}

.search-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.15);
}

.search-input :deep(.el-input__inner) {
  color: #fff;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.category-select,
.sort-select {
  width: 140px;
}

.category-select :deep(.el-input__wrapper),
.sort-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.category-select :deep(.el-input__wrapper:hover),
.sort-select :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.15);
}

.category-select :deep(.el-input__inner),
.sort-select :deep(.el-input__inner) {
  color: #fff;
}

.auctions-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.auction-col {
  margin-bottom: 20px;
}

.auction-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-color-overlay);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow);
}

.auction-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.auction-image .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  color: var(--text-secondary);
  font-size: 24px;
}

.auction-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.auction-status.active {
  background-color: var(--success-color);
}

.auction-status.ended {
  background-color: var(--text-secondary);
}

.auction-status.pending {
  background-color: var(--warning-color);
}

.auction-info {
  padding: 16px;
}

.auction-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price-info,
.time-info,
.bid-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: var(--text-secondary);
}

.price {
  color: var(--primary-color);
  font-weight: 600;
}

.time.ending-soon {
  color: var(--danger-color);
}

.bids {
  color: var(--success-color);
}

.pagination-wrapper {
  text-align: center;
  margin-top: 40px;
  padding-bottom: 40px;
}

@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .category-select,
  .sort-select {
    width: 100%;
  }

  .auction-image {
    height: 160px;
  }
}
</style> 