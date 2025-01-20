<template>
  <div class="auctions-container">
    <h1>拍卖列表</h1>
    <el-empty description="暂无拍卖商品" v-if="!store.auctions.length && !loading"></el-empty>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>筛选条件</span>
              <el-button text @click="handleReset">重置</el-button>
            </div>
          </template>
          
          <el-form :model="filterForm" @submit.prevent="handleFilter">
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="选择状态">
                <el-option label="全部" value="" />
                <el-option label="进行中" value="active" />
                <el-option label="已结束" value="ended" />
                <el-option label="未开始" value="pending" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="价格区间">
              <el-input-number 
                v-model="filterForm.minPrice" 
                :min="0"
                placeholder="最低价"
                :precision="3"
              />
              <span class="separator">-</span>
              <el-input-number 
                v-model="filterForm.maxPrice" 
                :min="0"
                placeholder="最高价"
                :precision="3"
              />
            </el-form-item>

            <el-form-item label="分类">
              <el-select v-model="filterForm.category" placeholder="选择分类">
                <el-option label="全部" value="" />
                <el-option label="数字艺术" value="数字艺术" />
                <el-option label="游戏道具" value="游戏道具" />
                <el-option label="虚拟地产" value="虚拟地产" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleFilter" :loading="loading">
                应用筛选
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-row v-loading="loading" :gutter="20">
          <el-col 
            v-for="auction in store.auctions" 
            :key="auction.id" 
            :xs="24"
            :sm="12"
            :md="8"
          >
            <el-card class="auction-card" :body-style="{ padding: '0px' }">
              <img :src="auction.images[0]" class="image" />
              <div class="auction-info">
                <h3>{{ auction.name }}</h3>
                <p class="description">{{ auction.description }}</p>
                <div class="price">
                  <span>当前价格:</span>
                  <span class="amount">{{ auction.currentPrice }} ETH</span>
                </div>
                <div class="time">
                  <span>结束时间:</span>
                  <span>{{ formatTime(auction.endTime) }}</span>
                </div>
                <div class="status">
                  <el-tag :type="getStatusType(auction.status)">
                    {{ getStatusText(auction.status) }}
                  </el-tag>
                  <span class="bid-count">{{ auction.bidCount }}次出价</span>
                </div>
                <el-button 
                  type="primary" 
                  @click="router.push(`/auction/${auction.id}`)"
                >
                  查看详情
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[12, 24, 36]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useAuctionStore } from '@/stores/auction'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Auction } from '@/mock/auctions'

interface FilterForm {
  status: string
  minPrice: number | null
  maxPrice: number | null
  category: string
}

const router = useRouter()
const store = useAuctionStore()
const currentPage = ref(1)
const pageSize = ref(12)
const loading = computed(() => store.loading)
const total = computed(() => store.total)

const filterForm = ref<FilterForm>({
  status: '',
  minPrice: null,
  maxPrice: null,
  category: ''
})

const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'ended': return 'info'
    case 'pending': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中'
    case 'ended': return '已结束'
    case 'pending': return '未开始'
    default: return '未知'
  }
}

const loadAuctions = async () => {
  try {
    await store.fetchAuctions({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm.value
    })
  } catch (error: any) {
    ElMessage.error(error.message || '加载拍卖列表失败')
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadAuctions()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadAuctions()
}

const handleFilter = () => {
  currentPage.value = 1
  loadAuctions()
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    minPrice: null,
    maxPrice: null,
    category: ''
  }
  handleFilter()
}

onMounted(() => {
  loadAuctions()
})
</script>

<style scoped>
.auctions-container {
  max-width: 1200px;
  margin: 80px auto 20px;
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-card {
  position: sticky;
  top: 80px;
}

.separator {
  margin: 0 10px;
  color: #909399;
}

.auction-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.auction-info {
  padding: 15px;
}

.auction-info h3 {
  margin: 0 0 10px;
  font-size: 1.1rem;
  font-weight: 500;
}

.description {
  color: #606266;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price, .time {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
}

.amount {
  color: #409EFF;
  font-weight: bold;
}

.status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.bid-count {
  color: #909399;
  font-size: 0.9rem;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-card {
    position: static;
    margin-bottom: 20px;
  }
}
</style> 