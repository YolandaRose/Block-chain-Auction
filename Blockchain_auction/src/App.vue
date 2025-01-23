<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkMode }">
    <header class="header">
      <div class="header-wrapper container">
        <Logo class="brand-logo" @click="$router.push('/')" />
        <nav class="nav-menu">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            @select="handleSelect"
          >
            <el-menu-item index="/auctions">拍卖市场</el-menu-item>
            <el-menu-item index="/create-auction">创建拍卖</el-menu-item>
            <el-menu-item index="/my-auctions">我的拍卖</el-menu-item>
            <el-menu-item index="/about">关于我们</el-menu-item>
          </el-menu>
        </nav>
        <div class="header-actions">
          <el-button
            circle
            class="theme-toggle"
            @click="toggleTheme"
          >
            <el-icon><Moon v-if="!isDarkMode" /><Sunny v-else /></el-icon>
          </el-button>
          <el-button
            type="primary"
            v-if="!isConnected"
            @click="connectWallet"
          >
            连接钱包
          </el-button>
          <el-dropdown v-else trigger="click">
            <el-button type="primary">
              {{ shortAddress }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="disconnectWallet">断开连接</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="footer-wrapper container">
        <span class="copyright">© 2024 区块链拍卖系统 - 基于以太坊智能合约</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuctionStore } from '@/stores/auction'
import { ElMessage } from 'element-plus'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'

const store = useAuctionStore()
const account = computed(() => store.account)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const router = useRouter()

const shortAddress = computed(() => {
  if (!account.value) return ''
  return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
})

watch(isDarkMode, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light')
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

const disconnectWallet = () => {
  store.disconnectWallet()
  ElMessage.success('钱包断开连接')
}

const activeMenu = ref('/auctions')
const handleSelect = (index: string) => {
  router.push(index)
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

const isConnected = computed(() => !!account.value)
</script>

<style>
:root {
  --primary-color: #409EFF;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #e4e7ed;
  --bg-color: #f5f7fa;
  --bg-color-overlay: #fff;
  --primary-color-rgb: 64, 158, 255;
  --success-color-rgb: 103, 194, 58;
}

:root[data-theme='dark'] {
  --primary-color: #7760ff;
  --success-color: #85ce61;
  --warning-color: #ffba37;
  --danger-color: #ff7875;
  --text-primary: #ffffff;
  --text-regular: #e0e0e0;
  --text-secondary: #909399;
  --border-color: #363636;
  --bg-color: #1a1a1a;
  --bg-color-overlay: #242424;
  --primary-color-rgb: 119, 96, 255;
  --success-color-rgb: 133, 206, 97;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-regular);
  transition: all 0.3s ease;
}

.header {
  background-color: var(--bg-color-overlay);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  transition: all 0.3s ease;
}

.header-wrapper {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  flex-shrink: 0;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.nav-menu {
  display: flex;
  align-items: center;
  margin: 0 20px;
  flex: 1;
  justify-content: center;
  gap: 20px;
}

.nav-item {
  padding: 8px 16px;
  color: var(--text-regular);
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item.router-link-active {
  color: var(--primary-color);
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.wallet-info {
  min-width: 150px;
  text-align: right;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.account-info {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--success-color);
  opacity: 0.1;
  border-radius: 4px;
  color: var(--success-color);
  font-family: monospace;
  font-size: 0.9rem;
  white-space: nowrap;
}

.welcome-section {
  padding: 60px 0 100px;
  text-align: center;
  background: var(--bg-color);
  margin-top: 64px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.welcome-section::before,
.welcome-section::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(var(--primary-color-rgb), 0.1), 
    rgba(var(--success-color-rgb), 0.1)
  );
  z-index: 0;
  transition: all 0.3s ease;
}

.welcome-section::before {
  top: -150px;
  left: -150px;
  transform: rotate(-45deg);
}

.welcome-section::after {
  bottom: -150px;
  right: -150px;
  transform: rotate(45deg);
}

.welcome-text {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  background: linear-gradient(45deg, var(--primary-color), var(--success-color));
  -webkit-background-clip: text;
  color: transparent;
  position: relative;
  z-index: 1;
}

.welcome-desc {
  font-size: 1.2rem;
  color: var(--text-regular);
  max-width: 800px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  margin-top: 64px;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background-color: var(--bg-color);
  padding: 0 0 60px;
  transition: all 0.3s ease;
}

.main-content > * {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.app-footer {
  background-color: var(--bg-color-overlay);
  border-top: 1px solid var(--border-color);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding: 0;
  height: 60px;
  transition: all 0.3s ease;
}

.footer-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.copyright {
  color: var(--text-secondary);
}

.theme-switch {
  margin-right: 16px;
}

/* Element Plus 深色主题覆盖 */
.dark-theme {
  --el-color-primary: var(--primary-color);
  --el-color-success: var(--success-color);
  --el-color-warning: var(--warning-color);
  --el-color-danger: var(--danger-color);
  --el-bg-color: var(--bg-color);
  --el-bg-color-overlay: var(--bg-color-overlay);
  --el-text-color-primary: var(--text-primary);
  --el-text-color-regular: var(--text-regular);
  --el-text-color-secondary: var(--text-secondary);
  --el-border-color: var(--border-color);
  --el-border-color-light: var(--border-color);
  --el-border-color-lighter: var(--border-color);
  --el-border-color-extra-light: var(--border-color);
  --el-fill-color-blank: var(--bg-color-overlay);
  --el-fill-color: var(--bg-color);
  --el-fill-color-light: var(--bg-color);
  --el-fill-color-lighter: var(--bg-color);
  --el-mask-color: rgba(0, 0, 0, 0.8);
  --el-box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  --el-box-shadow-light: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dark-theme .el-card {
  --el-card-bg-color: var(--bg-color-overlay);
  border-color: var(--border-color);
  color: var(--text-regular);
}

.dark-theme .el-card:hover {
  box-shadow: var(--el-box-shadow);
}

.dark-theme .el-select-dropdown {
  background-color: var(--bg-color-overlay);
  border-color: var(--border-color);
}

.dark-theme .el-select-dropdown__item {
  color: var(--text-regular);
}

.dark-theme .el-select-dropdown__item.hover,
.dark-theme .el-select-dropdown__item:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.dark-theme .el-empty {
  --el-empty-fill-color-0: var(--bg-color);
  --el-empty-fill-color-1: var(--bg-color-overlay);
  --el-empty-fill-color-2: var(--border-color);
  --el-empty-fill-color-3: var(--primary-color);
  --el-empty-fill-color-4: var(--text-secondary);
}

.dark-theme .el-empty__description {
  color: var(--text-secondary);
}

.dark-theme .el-table {
  --el-table-bg-color: var(--bg-color-overlay);
  --el-table-tr-bg-color: var(--bg-color-overlay);
  --el-table-header-bg-color: var(--bg-color);
  --el-table-border-color: var(--border-color);
  --el-table-text-color: var(--text-regular);
  --el-table-header-text-color: var(--text-primary);
}

.dark-theme .el-pagination {
  --el-pagination-button-bg-color: var(--bg-color-overlay);
  --el-pagination-hover-color: var(--primary-color);
  --el-text-color-regular: var(--text-regular);
}

.dark-theme .el-input {
  --el-input-bg-color: var(--bg-color);
  --el-input-border-color: var(--border-color);
  --el-input-hover-border-color: var(--primary-color);
  --el-input-text-color: var(--text-regular);
  --el-input-placeholder-color: var(--text-secondary);
}

.dark-theme .el-select {
  --el-select-border-color-hover: var(--primary-color);
  --el-select-input-focus-border-color: var(--primary-color);
  --el-select-option-hover-bg: var(--bg-color);
}

.dark-theme .el-button--default {
  --el-button-bg-color: var(--bg-color-overlay);
  --el-button-border-color: var(--border-color);
  --el-button-hover-bg-color: var(--primary-color);
  --el-button-hover-border-color: var(--primary-color);
  --el-button-active-bg-color: var(--primary-color);
  --el-button-active-border-color: var(--primary-color);
  color: var(--text-regular);
}

.dark-theme .el-button--default:hover {
  color: #fff;
}

.dark-theme .el-button--primary {
  --el-button-bg-color: var(--primary-color);
  --el-button-border-color: var(--primary-color);
  --el-button-hover-bg-color: var(--primary-color);
  --el-button-hover-border-color: var(--primary-color);
  opacity: 0.9;
}

.dark-theme .el-button--primary:hover {
  opacity: 1;
}

.dark-theme .el-dialog {
  --el-dialog-bg-color: var(--bg-color-overlay);
  --el-dialog-border-color: var(--border-color);
  --el-dialog-box-shadow: var(--el-box-shadow);
}

.dark-theme .el-dialog__title {
  color: var(--text-primary);
}

.dark-theme .el-dialog__body {
  color: var(--text-regular);
}

.dark-theme .el-message-box {
  --el-messagebox-bg-color: var(--bg-color-overlay);
  --el-messagebox-border-color: var(--border-color);
  --el-messagebox-title-color: var(--text-primary);
  --el-messagebox-content-color: var(--text-regular);
}

.dark-theme .el-loading-mask {
  background-color: rgba(0, 0, 0, 0.8);
}

@media (max-width: 768px) {
  .header {
    height: 56px;
  }
  
  .logo h1 {
    font-size: 1.25rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .main-content {
    margin-top: 56px;
  }

  .main-content > * {
    padding: 20px 16px;
  }

  .footer-wrapper {
    padding: 0 16px;
  }
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}

.dark-theme .el-menu {
  --el-menu-bg-color: var(--bg-color-overlay);
  --el-menu-text-color: var(--text-regular);
  --el-menu-hover-text-color: var(--primary-color);
  --el-menu-active-color: var(--primary-color);
  --el-menu-hover-bg-color: var(--bg-color);
  border-bottom: none;
}

.dark-theme .el-menu-item {
  background-color: transparent;
  border-bottom: 2px solid transparent;
}

.dark-theme .el-menu-item:hover {
  background-color: var(--bg-color);
}

.dark-theme .el-menu-item.is-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
</style>

