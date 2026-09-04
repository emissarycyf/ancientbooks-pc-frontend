import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000
})

service.interceptors.response.use(
  res => res.data,
  err => {
    console.error('请求错误', err)
    return Promise.reject(err)
  }
)

export default service