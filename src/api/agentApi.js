import request from '@/utils/request'

/**
 * 流式古籍分析（⭐ 推荐）
 * GET /api/agent/analyze/stream
 * 使用 EventSource 接收 SSE 流式响应
 *
 * @param {Object} params - { content: string, userId: string }
 * @returns {EventSource}
 *
 * @example
 * const eventSource = analyzeStream({ content: '讲解《道德经》第一篇', userId: 'admin' })
 * eventSource.onmessage = (event) => { ... }
 * eventSource.onerror = () => { ... }
 */
export const analyzeStream = (params) => {
  const { content, userId = '' } = params
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = `${baseUrl}/agent/analyze/stream?content=${encodeURIComponent(content)}&userId=${encodeURIComponent(userId)}`
  return new EventSource(url)
}

/**
 * 获取用户会话 ID
 * GET /api/agent/conversation/{userId}
 *
 * @param {string} userId - 用户 ID
 * @returns {Promise} { code: 200, data: string }
 *
 * @example
 * const res = await getConversationId('user123')
 * // res.data => "abc123def456ghi789xyz"
 */
export const getConversationId = (userId) => {
  return request.get(`/agent/conversation/${userId}`)
}
