import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/userApi'

/**
 * 用户状态管理（Pinia Store）
 * 职责：存储 token、用户信息、登录态，提供登录/登出方法
 */
export const useUserStore = defineStore('user', () => {
  // ===================== 状态 =====================

  // JWT Token
  const token = ref(localStorage.getItem('token') || '')
  // 用户基本信息
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)

  // ===================== 方法 =====================

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  const login = async (username, password) => {
    const res = await loginApi({ username, password })
    // 后端返回格式：{ code: 200, msg: 'success', data: { token, userId, username, role } }
    if (res.code === 200 && res.data?.token) {
      const { token: newToken, userId, username: name, role } = res.data
      // 持久化 token
      token.value = newToken
      localStorage.setItem('token', newToken)
      // 持久化用户信息
      userInfo.value = { userId, username: name, role }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      return res.data
    }
    throw new Error(res.msg || '登录失败')
  }

  /**
   * 用户登出
   * 调用后端登出接口并清空本地状态
   */
  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      // 无论后端是否成功，前端都清空本地状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  /**
   * 手动设置 token（如 refresh 后更新）
   * @param {string} newToken - 新 Token
   */
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 检查当前是否已登录（可用于路由守卫）
   */
  const checkAuth = () => {
    return !!token.value
  }

  return {
    // 状态
    token,
    userInfo,
    isLoggedIn,
    // 方法
    login,
    logout,
    setToken,
    checkAuth
  }
})
