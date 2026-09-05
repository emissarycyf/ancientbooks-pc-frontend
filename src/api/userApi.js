import request from '@/utils/request'

/**
 * 用户登录
 * POST /api/auth/login
 */
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 * POST /api/auth/logout
 * 需要携带 Token
 */
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 刷新 Token
 * POST /api/auth/refresh
 * 需要携带 Token
 */
export const refreshToken = () => {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}
