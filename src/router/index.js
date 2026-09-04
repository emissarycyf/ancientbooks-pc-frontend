import { createRouter, createWebHistory } from 'vue-router'
import AncientChat from '../views/chat/index.vue'

const routes = [
  { path: '/', component: AncientChat }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router