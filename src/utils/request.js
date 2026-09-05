import axios from 'axios'

// 创建 axios 实例，统一配置 baseURL 和超时时间
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000
})

// 请求拦截器：自动注入 Authorization Token（登录/注册等公开接口除外）
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一提取 data，处理 401 未登录跳转
service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401 未授权：清除本地 token 并跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    // 其他错误统一打印，业务层负责向用户展示提示
    console.error('请求错误', error)
    return Promise.reject(error)
  }
)

export default service