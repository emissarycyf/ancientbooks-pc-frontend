import { createRouter, createWebHistory } from 'vue-router'
// 古籍分析对话页（核心页面）
import AncientChat from '../views/chat/index.vue'

// 路由配置：项目初期仅单页，后续可扩展
const routes = [
  { path: '/', component: AncientChat }
]

const router = createRouter({
  // 使用 HTML5 History 模式，需要后端配合处理路由回退
  history: createWebHistory(),
  routes
})

export default router