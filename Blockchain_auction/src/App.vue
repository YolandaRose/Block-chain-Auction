<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-wrapper container">
        <div class="logo">
          <h1>区块链拍卖系统</h1>
        </div>
        <div class="wallet-info">
          <el-button type="primary" @click="connectWallet" v-if="!account">
            连接钱包
          </el-button>
          <span v-else class="account-info">
            {{ shortAddress }}
          </span>
        </div>
      </div>
    </header>

    <main class="main-content container">
      <router-view></router-view>
    </main>

    <footer class="app-footer">
      <div class="footer-wrapper container">
        <span class="copyright">© 2024 区块链拍卖系统 - 基于以太坊智能合约</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage } from 'element-plus'

const store = useAuctionStore()
const account = computed(() => store.account)
const shortAddress = computed(() => {
  if (!account.value) return ''
  return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
})

const connectWallet = async () => {
  try {
    await store.connectWallet()
    ElMessage.success('钱包连接成功')
  } catch (error: any) {
    ElMessage.error(error.message || '钱包连接失败')
    console.error('钱包连接失败：', error)
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-wrapper {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  flex-shrink: 0;
}

.logo h1 {
  color: #409EFF;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

.wallet-info {
  min-width: 150px;
  text-align: right;
  flex-shrink: 0;
}

.account-info {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: nowrap;
}

.main-content {
  flex: 1;
  margin-top: 84px;
  padding-bottom: 80px;
  min-height: calc(100vh - 144px);
  position: relative;
  width: 100%;
}

.app-footer {
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  transform: translateX(0);
}

.footer-wrapper {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 24px;
}

.copyright {
  color: #909399;
  font-size: 14px;
  text-align: center;
  width: 100%;
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header-wrapper {
    height: 56px;
  }
  
  .logo h1 {
    font-size: 1.25rem;
  }
  
  .main-content {
    margin-top: 76px;
  }
}
</style>

<style>
/* 全局样式重置 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
  min-height: 100vh;
  position: relative;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
