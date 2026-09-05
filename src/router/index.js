import { createRouter, createWebHistory } from 'vue-router'
// 古籍分析对话页（核心页面）
import AncientChat from '../views/chat/index.vue'
// 登录页
import Login from '../views/user/Login.vue'

// 路由配置
const routes = [
  { path: '/', component: AncientChat },
  { path: '/login', component: Login }
]

const router = createRouter({
  // 使用 HTML5 History 模式，需要后端配合处理路由回退
  history: createWebHistory(),
  routes
})

// ===================== 路由守卫 =====================

/**
 * 全局前置守卫：未登录用户访问首页时跳转登录页
 * 登录页和白名单路径放行
 */
router.beforeEach((to, _from, next) => {
  // 登录页放行
  if (to.path === '/login') {
    return next()
  }
  // 已登录用户放行
  if (localStorage.getItem('token')) {
    return next()
  }
  // 未登录，跳转登录页
  next({ path: '/login' })
})

export default router