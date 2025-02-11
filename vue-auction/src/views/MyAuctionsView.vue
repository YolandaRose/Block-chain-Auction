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
              <div class="auction-status">
                <el-tag :type="getStatusTag(auction).type" size="small">
                  {{ getStatusTag(auction).text }}
                </el-tag>
              </div>
              <el-image
                :src="auction.imageLink"
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
                <p class="auction-description">{{ auction.descLink }}</p>
                <div class="auction-meta">
                  <span class="auction-price">{{ formatPrice(auction.startPrice) }} ETH</span>
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
              <div class="auction-status">
                <el-tag :type="getStatusTag(auction).type" size="small">
                  {{ getStatusTag(auction).text }}
                </el-tag>
              </div>
              <el-image
                :src="auction.imageLink"
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
                <p class="auction-description">{{ auction.descLink }}</p>
                <div class="auction-meta">
                  <span class="auction-price">{{ formatPrice(auction.highestBid) }} ETH</span>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的藏品" name="collections">
          <el-empty v-if="!hasCollections" description="暂无藏品">
            <el-button type="primary" @click="$router.push('/auctions')">
              浏览拍卖
            </el-button>
          </el-empty>
          <div v-else class="auction-list">
            <el-card
              v-for="auction in collections"
              :key="auction.id"
              class="auction-card"
              :body-style="{ padding: '0px' }"
              @click="goToDetail(auction.id)"
            >
              <div class="auction-status">
                <el-tag type="success" size="small">已拥有</el-tag>
              </div>
              <el-image
                :src="auction.imageLink"
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
                <p class="auction-description">{{ auction.descLink }}</p>
                <div class="auction-meta">
                  <span class="auction-price">成交价: {{ formatPrice(auction.secondHighestBid) }} ETH</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { web3Service } from '@/utils/web3'
import { ElMessage } from 'element-plus'
import type { Product } from '@/utils/web3'
import Web3 from 'web3'

const router = useRouter()
const activeTab = ref('created')

const createdAuctions = ref<Product[]>([])
const participatedAuctions = ref<Product[]>([])
const collections = ref<Product[]>([])
const loading = ref(false)

const hasCreatedAuctions = computed(() => createdAuctions.value.length > 0)
const hasParticipatedAuctions = computed(() => participatedAuctions.value.length > 0)
const hasCollections = computed(() => collections.value.length > 0)

const getStatusTag = (auction: any) => {
  const now = Math.floor(Date.now() / 1000)
  
  if (auction.status === 1) {
    return { type: 'warning', text: '已售出' }
  } else if (auction.status === 2) {
    return { type: 'danger', text: '流拍' }
  } else if (now > auction.auctionEndTime) {
    return { type: 'danger', text: '已结束' }
  } else {
    return { type: 'success', text: '进行中' }
  }
}

const goToDetail = (id: number) => {
  router.push(`/auction/${id}`)
}

const loadAuctions = async (retryCount = 0) => {
  loading.value = true
  try {
    // 先连接钱包获取账户
    const account = await web3Service.connectWallet()
    console.log('当前用户地址:', account)

    if (!account) {
      throw new Error('未连接钱包')
    }

    const currentUserAddress = account.toLowerCase()

    // 获取所有拍卖
    const { items: allProducts } = await web3Service.getProducts(1, 100)
    console.log('获取到所有拍卖:', allProducts)
    
    if (!Array.isArray(allProducts)) {
      throw new Error('获取拍卖列表失败：返回数据格式错误')
    }
    
    // 过滤出用户创建的拍卖
    const createdProducts = []
    for (const product of allProducts) {
      try {
        const seller = await web3Service.getSellerByProductId(product.id)
        if (seller.toLowerCase() === currentUserAddress) {
          createdProducts.push(product)
        }
      } catch (error) {
        console.error(`获取商品 ${product.id} 的卖家地址失败:`, error)
      }
    }
    createdAuctions.value = createdProducts
    
    // 过滤出用户参与的拍卖（检查本地存储的出价记录和最高出价者）
    const participatedIds = new Set()
    allProducts.forEach(product => {
      // 检查本地存储的出价记录
      const bids = JSON.parse(localStorage.getItem(`bids_${product.id}`) || '[]')
      if (bids.length > 0) {
        participatedIds.add(product.id)
      }
      // 检查是否是最高出价者
      const highestBidder = String(product.highestBidder || '').toLowerCase()
      if (highestBidder === currentUserAddress) {
        participatedIds.add(product.id)
      }
    })
    
    participatedAuctions.value = allProducts.filter(product => 
      participatedIds.has(product.id)
    )

    // 过滤出用户的藏品（已结束的拍卖且用户是最高出价者）
    collections.value = allProducts.filter(product => 
      product.status === 1 && // 已售出
      product.highestBidder.toLowerCase() === currentUserAddress // 用户是最高出价者
    )

    if (createdAuctions.value.length === 0 && 
        participatedAuctions.value.length === 0 && 
        collections.value.length === 0 && 
        retryCount < 2) {
      console.log(`未找到任何拍卖，第${retryCount + 1}次重试...`)
      setTimeout(() => loadAuctions(retryCount + 1), 5000)
    } else if (retryCount >= 2) {
      console.log('达到最大重试次数')
    }
  } catch (error) {
    console.error('加载拍卖列表失败:', error)
    ElMessage.error('加载拍卖列表失败: ' + (error as Error).message)
    // 如果还没达到最大重试次数，则重试
    if (retryCount < 2) {
      console.log(`加载失败，第${retryCount + 1}次重试...`)
      setTimeout(() => loadAuctions(retryCount + 1), 5000)
    } else {
      console.log('达到最大重试次数')
    }
  } finally {
    loading.value = false
  }
}

// 添加格式化价格的方法
const formatPrice = (price: string | number) => {
  try {
    const ethValue = Web3.utils.fromWei(price.toString(), 'ether')
    return Number(ethValue).toFixed(4)
  } catch (err) {
    console.error('价格格式化失败:', price, err)
    return '0.0000'
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  loadAuctions()
})
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
  position: relative;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.auction-status {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
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