import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MarketView from '../views/MarketView.vue'
import CreateAuctionView from '../views/CreateAuctionView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/market',
      name: 'market',
      component: MarketView
    },
    {
      path: '/create-auction',
      name: 'create-auction',
      component: CreateAuctionView
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView,
      props: true
    },
    {
      path: '/auction/:id',
      redirect: to => {
        // 重定向到 product/:id
        return { path: `/product/${to.params.id}` }
      }
    },
    {
      path: '/auctions',
      name: 'auctions',
      component: () => import('../views/AuctionsView.vue')
    },
    {
      path: '/my-auctions',
      name: 'my-auctions',
      component: () => import('../views/MyAuctionsView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
