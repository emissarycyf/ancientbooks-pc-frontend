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

// SSE 流式对话接口
export const sendStreamChat = (query, conversationId = '') => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = `${baseUrl}/agent/stream/chat?query=${encodeURIComponent(query)}&conversationId=${encodeURIComponent(conversationId)}`
  return new EventSource(url)
}

export default service