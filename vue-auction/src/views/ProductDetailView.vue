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
                <el-tooltip 
                  :content="product.seller" 
                  placement="top"
                  effect="dark"
                >
                  <el-tag size="small" type="info">
                    {{ formatAddress(product.seller) }}
                  </el-tag>
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
                <div class="value">{{ formatBidAmount(product.startPrice) }} ETH</div>
              </div>
              <div class="price-item highlight">
                <div class="label">当前最高价</div>
                <div class="value">{{ formatBidAmount(product.highestBid) }} ETH</div>
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
              <div class="detail-item countdown" v-if="product.status === 0">
                <el-icon><Timer /></el-icon>
                <span class="label">倒计时：</span>
                <span :class="countdownClass">
                  {{ countdown }}
                </span>
              </div>
              <div class="detail-item">
                <el-icon><User /></el-icon>
                <span class="label">最高出价者：</span>
                <el-tooltip 
                  :content="product.highestBidder" 
                  placement="top"
                  effect="dark"
                >
                  <el-tag size="small" :type="product.highestBidder === '0x0000000000000000000000000000000000000000' ? 'info' : 'success'">
                    {{ formatAddress(product.highestBidder) }}
                  </el-tag>
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
              <el-button 
                type="primary" 
                size="large" 
                @click="showBidDialog"
                :disabled="isAuctionEnded || !canBid || bidding"
              >
                {{ getBidButtonText() }}
              </el-button>
            </div>

            <!-- 添加揭示出价按钮 -->
            <div class="action-section" v-if="isAuctionEnded && hasUnrevealedBids">
              <el-button 
                type="warning" 
                size="large" 
                @click="showRevealDialog"
              >
                揭示出价
              </el-button>
            </div>

            <!-- 托管状态显示 -->
            <div class="escrow-section" v-if="product.status === 1">
              <h3>托管状态</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="托管状态">
                  {{ escrowInfo.fundsDisbursed ? '已完成' : '进行中' }}
                </el-descriptions-item>
                <el-descriptions-item label="同意释放">
                  {{ escrowInfo.releaseCount }}/2
                </el-descriptions-item>
                <el-descriptions-item label="同意退款">
                  {{ escrowInfo.refundCount }}/2
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="escrow-actions" v-if="!escrowInfo.fundsDisbursed">
                <el-button type="success" @click="handleEscrowAction('release')">
                  同意释放资金
                </el-button>
                <el-button type="warning" @click="handleEscrowAction('refund')">
                  申请退款
                </el-button>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h2>商品描述</h2>
            <p>{{ product.descLink }}</p>
          </div>

          <!-- 添加竞拍历史组件 -->
          <BidHistory
            v-if="product"
            :product-id="product.id"
            :current-highest-bidder="product.highestBidder"
          />
        </div>
      </div>
    </div>

    <!-- 添加竞拍对话框 -->
    <el-dialog
      v-model="bidDialogVisible"
      title="参与竞拍"
      width="30%"
    >
      <el-form :model="bidForm" label-width="100px">
        <el-form-item label="当前最高价">
          <div>{{ formatPrice(product?.highestBid || '0') }} ETH</div>
        </el-form-item>
        <el-form-item label="出价金额">
          <el-input-number
            v-model="bidForm.amount"
            :min="getMinBidAmount()"
            :precision="4"
            :step="0.0001"
            :controls="true"
            controls-position="right"
          />
          <span class="unit">ETH</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bidDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBid" :loading="bidding">
            确认出价
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加揭示出价对话框 -->
    <el-dialog
      v-model="revealDialogVisible"
      title="揭示出价"
      width="30%"
    >
      <div v-if="unrevealedBids.length > 0">
        <div v-for="bid in unrevealedBids" :key="bid.timestamp" class="bid-item">
          <div class="bid-info">
            <span>出价金额：{{ formatBidAmount(bid.amount) }} ETH</span>
            <span>出价时间：{{ new Date(bid.timestamp).toLocaleString() }}</span>
          </div>
          <el-button 
            type="primary" 
            size="small" 
            @click="revealBid(bid)"
            :loading="revealing === bid.timestamp"
            :disabled="!canRevealBid(bid)"
          >
            揭示
          </el-button>
        </div>
      </div>
      <div v-else class="no-bids">
        没有未揭示的出价
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { web3Service } from '@/utils/web3'
import type { Product } from '@/utils/web3'
import Web3 from 'web3'
import { Picture, Timer, User, Collection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BidHistory from '@/components/BidHistory.vue'

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref('')

// 竞拍相关状态
const bidDialogVisible = ref(false)
const bidding = ref(false)
const bidForm = ref({
  amount: 0
})

// 揭示出价相关状态
const revealDialogVisible = ref(false)
const revealing = ref<number | null>(null)
const unrevealedBids = computed(() => {
  if (!product.value) return []
  const bids = JSON.parse(localStorage.getItem(`bids_${product.value.id}`) || '[]')
  return bids.filter((bid: any) => !bid.revealed)
})
const hasUnrevealedBids = computed(() => unrevealedBids.value.length > 0)

// 托管相关状态
const escrowInfo = ref({
  fundsDisbursed: false,
  releaseCount: 0,
  refundCount: 0
})

// 添加倒计时状态
const countdown = ref('')
const countdownTimer = ref<number | null>(null)

// 添加重复出价检查
const canBid = ref(true)

// 检查是否即将结束（24小时内）
const isEndingSoon = (endTime: number): boolean => {
  const now = Math.floor(Date.now() / 1000)
  const timeLeft = endTime - now
  return timeLeft > 0 && timeLeft <= 24 * 3600 // 24小时内
}

// 计算倒计时样式
const countdownClass = computed(() => {
  if (!product.value?.auctionEndTime) return {}
  return {
    'ending-soon': isEndingSoon(product.value.auctionEndTime)
  }
})

// 获取状态样式
const getStatusType = (status: number) => {
  switch (status) {
    case 0: // 拍卖中
      return 'success'
    case 1: // 已售出
      return 'warning'
    case 2: // 流拍
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化状态文本
const getStatusText = (status: number) => {
  const now = Math.floor(Date.now() / 1000)
  
  switch (status) {
    case 0:
      return product.value && now > product.value.auctionEndTime ? '已结束' : '拍卖中'
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
const formatPrice = (price: string | number) => {
  try {
    // 如果输入是数字，直接转换为字符串
    if (typeof price === 'number') {
      return price.toFixed(4)
    }
    // 如果输入是字符串，尝试转换为数字
    const numPrice = Number(price)
    if (!isNaN(numPrice)) {
      return numPrice.toFixed(4)
    }
    // 如果是Wei格式的字符串，尝试转换为ETH
    const ethValue = Web3.utils.fromWei(price.toString(), 'ether')
    return Number(ethValue).toFixed(4)
  } catch (err) {
    console.error('价格格式化失败:', price, err)
    return '0.0000'
  }
}

// 格式化地址
const formatAddress = (address: string) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') return '无'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// 检查是否可以出价
const checkCanBid = async () => {
  if (!product.value) {
    canBid.value = false
    return false
  }
  
  try {
    const account = await web3Service.connectWallet()
    if (!account) {
      canBid.value = false
      return false
    }

    // 检查是否已经出价过
    const hasBidded = await web3Service.hasBidded(product.value.id, account)
    canBid.value = !hasBidded
    
    return !hasBidded
  } catch (error) {
    console.error('检查出价状态失败:', error)
    canBid.value = false
    return false
  }
}

// 修改 showBidDialog 函数
const showBidDialog = async () => {
  const canMakeBid = await checkCanBid()
  if (!canMakeBid) {
    ElMessage.warning('您已经对此商品出价过了，不能重复出价')
    return
  }
  
  bidForm.value.amount = getMinBidAmount()
  bidDialogVisible.value = true
}

// 获取最小出价金额
const getMinBidAmount = () => {
  if (!product.value) return 0
  
  // 获取起拍价和当前最高价（都是Wei格式）
  const startPrice = Number(Web3.utils.fromWei(product.value.startPrice, 'ether'))
  const currentBid = Number(Web3.utils.fromWei(product.value.highestBid, 'ether'))
  
  // 如果没有人出价，返回起拍价
  if (currentBid === 0) {
    return startPrice
  }
  
  // 如果已有出价，返回当前最高价加0.0001 ETH，但不能低于起拍价
  return Math.max(startPrice, currentBid + 0.0001)
}

// 提交出价
const submitBid = async () => {
  try {
    bidding.value = true
    
    if (!product.value) {
      throw new Error('商品信息不存在')
    }

    // 验证出价金额
    if (!bidForm.value.amount || bidForm.value.amount <= 0) {
      throw new Error('请输入有效的出价金额')
    }

    const startPrice = Number(Web3.utils.fromWei(product.value.startPrice, 'ether'))

    // 检查是否低于起拍价
    if (bidForm.value.amount < startPrice) {
      throw new Error(`出价不能低于起拍价 ${startPrice} ETH`)
    }

    // 生成随机密钥
    const secret = Web3.utils.randomHex(32)
    // 将出价金额转换为Wei
    const amountInWei = Web3.utils.toWei(bidForm.value.amount.toString(), 'ether')
    
    // 生成密封的出价
    const sealedBid = await web3Service.generateSealedBid(
      amountInWei,
      secret
    )

    // 调用合约的bid方法
    const bidResult = await web3Service.bid(
      Number(product.value.id),
      sealedBid,
      amountInWei
    )

    // 保存出价信息到本地存储，以便后续揭示
    const bidInfo = {
      productId: product.value.id,
      amount: amountInWei,
      secret: secret,
      timestamp: Date.now(),
      revealed: false
    }
    
    const productBids = JSON.parse(localStorage.getItem(`bids_${product.value.id}`) || '[]')
    productBids.push(bidInfo)
    localStorage.setItem(`bids_${product.value.id}`, JSON.stringify(productBids))

    ElMessage.success('出价成功！请等待拍卖结束后揭示出价。')
    bidDialogVisible.value = false  // 关闭对话框
    bidForm.value.amount = 0  // 重置表单
    canBid.value = false  // 设置不能再次出价
    await loadProduct()  // 重新加载商品信息
  } catch (err: any) {
    console.error('出价失败:', err)
    ElMessage.error(err.message || '出价失败，请重试')
  } finally {
    bidding.value = false
  }
}

// 添加揭示出价方法
const revealBid = async (bidInfo: any) => {
  try {
    if (!product.value) {
      throw new Error('商品信息不存在')
    }

    // 检查是否是当前用户的出价
    const account = await web3Service.connectWallet()
    if (!account) {
      throw new Error('请先连接钱包')
    }

    // 检查拍卖是否已结束
    const now = Math.floor(Date.now() / 1000)
    if (now <= product.value.auctionEndTime) {
      throw new Error('拍卖尚未结束，无法揭示出价')
    }

    revealing.value = bidInfo.timestamp

    console.log('开始揭示出价，参数:', {
      productId: product.value.id,
      amount: bidInfo.amount,
      secret: bidInfo.secret
    })

    await web3Service.revealBid(
      product.value.id,
      bidInfo.amount.toString(),  // 确保是字符串
      bidInfo.secret
    )
    
    // 更新本地存储中的揭示状态
    const productBids = JSON.parse(localStorage.getItem(`bids_${product.value.id}`) || '[]')
    const updatedBids = productBids.map((bid: any) => {
      if (bid.timestamp === bidInfo.timestamp) {
        bid.revealed = true
      }
      return bid
    })
    localStorage.setItem(`bids_${product.value.id}`, JSON.stringify(updatedBids))
    
    ElMessage.success('揭示出价成功！')
    await loadProduct()

    // 如果没有未揭示的出价了，关闭对话框
    if (unrevealedBids.value.length === 0) {
      revealDialogVisible.value = false
    }
  } catch (err: any) {
    console.error('揭示出价失败:', err)
    ElMessage.error(err.message || '揭示出价失败，请重试')
  } finally {
    revealing.value = null
  }
}

// 处理托管操作
const handleEscrowAction = async (action: 'release' | 'refund') => {
  try {
    if (!product.value || !web3Service) return
    
    const actionText = action === 'release' ? '释放资金' : '申请退款'
    await ElMessageBox.confirm(
      `确定要${actionText}吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    if (action === 'release') {
      await web3Service.releaseAmountToSeller(product.value.id)
    } else {
      await web3Service.refundAmountToBuyer(product.value.id)
    }
    
    ElMessage.success(`${actionText}操作已提交`)
    await loadEscrowInfo()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '操作失败')
    }
  }
}

// 加载托管信息
const loadEscrowInfo = async () => {
  if (!product.value || !web3Service || product.value.status !== 1) return
  
  try {
    const info = await web3Service.getEscrowInfo(product.value.id)
    escrowInfo.value = info
  } catch (err) {
    console.error('加载托管信息失败:', err)
  }
}

// 检查拍卖是否已结束
const isAuctionEnded = computed(() => {
  if (!product.value) return false
  const now = Math.floor(Date.now() / 1000)
  return now > product.value.auctionEndTime || product.value.status !== 0
})

// 更新倒计时显示
const updateCountdown = async () => {
  if (!product.value) return
  
  const now = Math.floor(Date.now() / 1000)
  const endTime = product.value.auctionEndTime
  const timeLeft = endTime - now

  if (timeLeft <= 0) {
    countdown.value = '拍卖已结束'
    stopCountdown()
    return
  }

  const days = Math.floor(timeLeft / (24 * 60 * 60))
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
  const seconds = timeLeft % 60

  countdown.value = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`
}

// 启动倒计时
const startCountdown = () => {
  updateCountdown()
  countdownTimer.value = window.setInterval(updateCountdown, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 在组件挂载时启动倒计时，卸载时清除
onMounted(() => {
  loadProduct()
  startCountdown()
  checkCanBid()
})

onUnmounted(() => {
  stopCountdown()
})

// 在 script setup 部分添加新的方法
const showRevealDialog = () => {
  revealDialogVisible.value = true
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

    // 确保所有地址都是有效的以太坊地址
    const defaultAddress = '0x0000000000000000000000000000000000000000'
    
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
      seller: data.seller || defaultAddress,
      highestBidder: data.highestBidder || defaultAddress
    }

    // 如果是已售出状态，加载托管信息
    if (product.value.status === 1) {
      await loadEscrowInfo()
    }

    console.log('商品信息:', {
      ...product.value,
      sellerFormatted: formatAddress(product.value.seller),
      highestBidderFormatted: formatAddress(product.value.highestBidder),
      isEnded: isAuctionEnded.value
    })
  } catch (err: any) {
    console.error('加载商品信息失败:', err)
    error.value = err.message || '加载失败'
    
    // 如果是网络错误，尝试重试
    if (retryCount < maxRetries && err.message.includes('network')) {
      setTimeout(() => loadProduct(retryCount + 1), 1000 * (retryCount + 1))
    }
  } finally {
    loading.value = false
  }
}

// 在 script setup 部分添加
const canRevealBid = (bid: any) => {
  if (!product.value) return false
  
  // 检查是否是当前用户的出价
  const account = web3Service.getCurrentAccount().toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  
  // 检查拍卖是否已结束
  if (now <= product.value.auctionEndTime) {
    return false
  }
  
  return true
}

// 在 script setup 部分添加
const formatBidAmount = (amount: string) => {
  try {
    if (!amount) return '0.0000'
    return Web3.utils.fromWei(amount, 'ether')
  } catch (err) {
    console.error('格式化出价金额失败:', err)
    return '0.0000'
  }
}

// 添加 getBidButtonText 方法
const getBidButtonText = () => {
  if (isAuctionEnded.value) {
    return '拍卖已结束'
  }
  if (bidding.value) {
    return '出价中...'
  }
  if (!canBid.value) {
    return '您已出价'
  }
  return '立即出价'
}
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
  gap: 16px;
  margin-top: 20px;
}

.description-section p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.escrow-section {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.escrow-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.unit {
  margin-left: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.countdown {
  font-weight: bold;
}

.ending-soon {
  color: var(--el-color-danger);
  animation: blink 1s infinite;
}

@keyframes blink {
  50% {
    opacity: 0.5;
  }
}
</style> 
