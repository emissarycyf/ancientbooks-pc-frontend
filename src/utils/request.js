import axios from 'axios'

// 创建 axios 实例，统一配置 baseURL 和超时
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000
})

// 响应拦截器：统一提取 res.data，简化业务层调用
service.interceptors.response.use(
  res => res.data,
  err => {
    // 响应错误统一打印，业务层负责向用户展示提示
    console.error('请求错误', err)
    return Promise.reject(err)
  }
)

export default service