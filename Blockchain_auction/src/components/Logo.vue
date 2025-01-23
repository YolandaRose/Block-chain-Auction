<template>
  <div class="logo-container">
    <div class="logo">
      <div class="logo-icon">
        <div class="chain">
          <span class="block block-1"></span>
          <span class="block block-2"></span>
          <span class="block block-3"></span>
        </div>
        <div class="gavel">
          <span class="handle"></span>
          <span class="head"></span>
        </div>
      </div>
      <div class="logo-text">
        <span class="text-primary">链上</span>
        <span class="text-secondary">拍卖</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logo component logic here if needed
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  position: relative;
  width: 40px;
  height: 40px;
}

.chain {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 2px;
}

.block {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #673ab7 100%);
  border-radius: 2px;
  animation: float 3s ease-in-out infinite;
}

.block-1 {
  animation-delay: 0s;
}

.block-2 {
  animation-delay: 0.2s;
}

.block-3 {
  animation-delay: 0.4s;
}

.gavel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.handle {
  position: absolute;
  width: 20px;
  height: 4px;
  background: linear-gradient(135deg, #673ab7 0%, #e91e63 100%);
  border-radius: 2px;
}

.head {
  position: absolute;
  top: -6px;
  left: -8px;
  width: 12px;
  height: 8px;
  background: linear-gradient(135deg, #1a237e 0%, #673ab7 100%);
  border-radius: 2px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #673ab7 50%, #e91e63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: var(--primary-color);
}

.text-secondary {
  color: #673ab7;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    font-size: 1.2rem;
  }
}
</style> 