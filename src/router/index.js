import { createRouter, createWebHistory } from 'vue-router'

var HomeView = () => import('../views/HomeView.vue')
var ChecklistDetailView = () => import('../views/ChecklistDetailView.vue')
var ShoppingListView = () => import('../views/ShoppingListView.vue')
var LowStockView = () => import('../views/LowStockView.vue')
var OccasionsView = () => import('../views/OccasionsView.vue')
var OccasionShoppingView = () => import('../views/OccasionShoppingView.vue')
var GuideView = () => import('../views/GuideView.vue')

var routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/shopping-list', name: 'shopping-list', component: ShoppingListView },
  { path: '/low-stock', name: 'low-stock', component: LowStockView },
  { path: '/guide', name: 'guide', component: GuideView },
  { path: '/occasions', name: 'occasions', component: OccasionsView },
  { path: '/occasions/shopping', name: 'occasion-shopping', component: OccasionShoppingView },
  { path: '/checklist/:id', name: 'checklist-detail', component: ChecklistDetailView, props: true }
]

var router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
