import { createRouter, createWebHistory } from 'vue-router'

var HomeView = () => import('../views/HomeView.vue')
var ChecklistDetailView = () => import('../views/ChecklistDetailView.vue')
var ShoppingListView = () => import('../views/ShoppingListView.vue')
var LowStockView = () => import('../views/LowStockView.vue')

var routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/shopping-list', name: 'shopping-list', component: ShoppingListView },
  { path: '/low-stock', name: 'low-stock', component: LowStockView },
  { path: '/checklist/:id', name: 'checklist-detail', component: ChecklistDetailView, props: true }
]

var router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
