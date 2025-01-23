<template>
  <div class="about-container">
    <div class="about-content">
      <h2 class="page-title">关于我们</h2>
      
      <section class="section">
        <h3>项目介绍</h3>
        <p>区块链拍卖系统是一个基于以太坊智能合约的去中心化拍卖平台。我们致力于为用户提供一个透明、安全、高效的拍卖交易环境。通过区块链技术，我们确保每一次交易都是公开可验证的，完全去中心化的。</p>
      </section>

      <section class="section">
        <h3>核心特点</h3>
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40" color="#409EFF"><Lock /></el-icon>
            <h4>安全可靠</h4>
            <p>基于以太坊智能合约，所有交易都在链上进行，安全透明，无法篡改。</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40" color="#67C23A"><Connection /></el-icon>
            <h4>去中心化</h4>
            <p>完全去中心化的运作模式，没有中间商，直接通过智能合约执行交易。</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon" :size="40" color="#E6A23C"><Promotion /></el-icon>
            <h4>便捷高效</h4>
            <p>智能合约自动执行，无需人工干预，大大提高交易效率。</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h3>技术架构</h3>
        <div class="tech-stack">
          <div class="tech-item">
            <h4>智能合约</h4>
            <ul>
              <li>Solidity 智能合约开发</li>
              <li>OpenZeppelin 合约标准</li>
              <li>Hardhat 开发环境</li>
            </ul>
          </div>
          <div class="tech-item">
            <h4>前端技术</h4>
            <ul>
              <li>Vue 3 + TypeScript</li>
              <li>Element Plus UI</li>
              <li>Web3.js</li>
            </ul>
          </div>
          <div class="tech-item">
            <h4>存储方案</h4>
            <ul>
              <li>IPFS 分布式存储</li>
              <li>以太坊区块链</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section">
        <h3>使用指南</h3>
        <div class="guide-steps">
          <div class="step">
            <div class="step-number">1</div>
            <h4>连接钱包</h4>
            <p>使用 MetaMask 钱包连接到以太坊网络</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h4>浏览拍卖</h4>
            <p>查看正在进行的拍卖，选择感兴趣的商品</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h4>参与竞拍</h4>
            <p>出价参与竞拍，智能合约自动处理交易</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h4>完成交易</h4>
            <p>拍卖结束后自动确定归属，完成交易</p>
          </div>
        </div>
      </section>

      <section class="section contact-section">
        <h3>联系我们</h3>
        <div class="contact-info">
          <p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
          <div class="contact-methods">
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <span>邮箱：support@blockchain-auction.com</span>
            </div>
            <div class="contact-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>GitHub：github.com/blockchain-auction</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Connection, Promotion, Message, ChatDotRound } from '@element-plus/icons-vue'
</script>

<style scoped>
.about-container {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-color);
  padding: 40px 0;
  transition: all 0.3s ease;
}

.about-content {
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

.section {
  margin-bottom: 60px;
}

.section h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 24px;
  position: relative;
  padding-left: 16px;
}

.section h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 30px;
}

.feature-card {
  padding: 24px;
  background: var(--bg-color);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  margin-bottom: 16px;
}

.feature-card h4 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-card p {
  color: var(--text-regular);
  line-height: 1.6;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.tech-item {
  padding: 24px;
  background: var(--bg-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tech-item h4 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.tech-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-item li {
  color: var(--text-regular);
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.tech-item li::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: 0;
}

.guide-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 30px;
}

.step {
  text-align: center;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -12px;
  width: 24px;
  height: 2px;
  background: var(--border-color);
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 16px;
}

.step h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.step p {
  color: var(--text-regular);
  font-size: 14px;
}

.contact-section {
  margin-bottom: 0;
}

.contact-info {
  text-align: center;
}

.contact-info p {
  color: var(--text-regular);
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 24px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-regular);
}

.contact-item .el-icon {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .about-container {
    padding: 20px 0;
  }

  .about-content {
    padding: 20px;
    margin: 0 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .section {
    margin-bottom: 40px;
  }

  .section h3 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .features-grid,
  .tech-stack,
  .guide-steps {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .step:not(:last-child)::after {
    display: none;
  }

  .contact-methods {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
