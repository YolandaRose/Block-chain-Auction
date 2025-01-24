<template>
  <nav class="nav-bar">
    <router-link 
      to="/" 
      class="logo" 
      exact-active-class="active"
    >
      <img src="@/assets/logo.png" alt="链上拍卖">
      <span>链上拍卖</span>
    </router-link>
    
    <div class="nav-links">
      <router-link 
        to="/auctions" 
        active-class="active"
        exact-active-class="active"
      >拍卖市场</router-link>
      <router-link 
        to="/create-auction"
        active-class="active"
        exact-active-class="active"
      >创建拍卖</router-link>
      <router-link 
        to="/my-auctions"
        active-class="active"
        exact-active-class="active"
      >我的拍卖</router-link>
      <router-link 
        to="/about"
        active-class="active"
        exact-active-class="active"
      >关于我们</router-link>
    </div>
  </nav>
</template>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-links a:hover {
  color: #4a90e2;
  background-color: rgba(74, 144, 226, 0.1);
}

.nav-links a.active {
  color: #4a90e2;
  background-color: rgba(74, 144, 226, 0.1);
  font-weight: bold;
}
</style> 