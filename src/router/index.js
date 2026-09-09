import { createRouter, createWebHistory } from 'vue-router'

var HomeView = () => import('../views/HomeView.vue')
var ChecklistDetailView = () => import('../views/ChecklistDetailView.vue')
var ShoppingListView = () => import('../views/ShoppingListView.vue')

var routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/shopping-list', name: 'shopping-list', component: ShoppingListView },
  { path: '/checklist/:id', name: 'checklist-detail', component: ChecklistDetailView, props: true }
]

var router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
