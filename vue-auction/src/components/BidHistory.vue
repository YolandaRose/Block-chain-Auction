<template>
  <div class="bid-history">
    <h3>竞拍历史</h3>
    <el-timeline v-if="bids.length > 0">
      <el-timeline-item
        v-for="bid in bids"
        :key="bid.timestamp"
        :timestamp="formatTime(bid.timestamp)"
        :type="getBidType(bid)"
      >
        <div class="bid-info">
          <div class="bid-amount">
            出价金额：{{ formatPrice(bid.amount) }} ETH
          </div>
          <div class="bid-address">
            出价者：
            <el-tooltip :content="bid.bidder" placement="top">
              <span class="address">{{ formatAddress(bid.bidder) }}</span>
            </el-tooltip>
          </div>
          <div class="bid-status" v-if="bid.revealed">
            <el-tag size="small" :type="bid.isHighest ? 'success' : 'info'">
              {{ bid.isHighest ? '当前最高' : '已出局' }}
            </el-tag>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else description="暂无竞拍记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Web3 from 'web3'

interface Bid {
  bidder: string
  amount: string
  timestamp: number
  revealed: boolean
  isHighest: boolean
}

const props = defineProps<{
  productId: number
  currentHighestBidder: string
}>()

const bids = ref<Bid[]>([])

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatPrice = (price: string) => {
  return Web3.utils.fromWei(price, 'ether')
}

const formatAddress = (address: string) => {
  if (!address) return '未知'
  return address.slice(0, 6) + '...' + address.slice(-4)
}

const getBidType = (bid: Bid) => {
  if (!bid.revealed) return 'warning'
  return bid.isHighest ? 'success' : 'info'
}

const loadBids = () => {
  // 从本地存储加载竞拍记录
  const storedBids = localStorage.getItem(`bids_${props.productId}`)
  if (storedBids) {
    const parsedBids = JSON.parse(storedBids)
    bids.value = parsedBids.map((bid: any) => ({
      ...bid,
      isHighest: bid.bidder === props.currentHighestBidder
    }))
  }
}

watch(() => props.currentHighestBidder, () => {
  loadBids()
})

onMounted(() => {
  loadBids()
})
</script>

<style scoped>
.bid-history {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.bid-info {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.bid-amount {
  font-weight: bold;
  margin-bottom: 4px;
}

.bid-address {
  font-size: 0.9em;
  color: #606266;
}

.address {
  font-family: monospace;
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
}

.bid-status {
  margin-top: 8px;
}
</style> 