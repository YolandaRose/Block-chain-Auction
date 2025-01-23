import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auctions',
    name: 'auctions',
    component: () => import('../views/AuctionsView.vue')
  },
  {
    path: '/auction/:id',
    name: 'auction-detail',
    component: () => import('../views/AuctionDetailView.vue'),
    props: true
  },
  {
    path: '/create-auction',
    name: 'create-auction',
    component: () => import('../views/CreateAuctionView.vue')
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
