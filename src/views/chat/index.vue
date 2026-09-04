<template>
  <div class="chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="card-header">
          <span>📜 古籍文献分析 Agent</span>
          <el-tag v-if="conversationId" type="success" size="small">会话中</el-tag>
        </div>
      </template>

      <div class="chat-history" ref="chatHistoryRef">
        <div v-for="(msg, index) in messages" :key="msg.id" :class="['msg-item', msg.role]">
          <div class="msg-avatar">{{ msg.role === 'user' ? '🧑' : '📚' }}</div>
          <div class="msg-content">
            <div v-if="msg.role === 'user'" class="user-text">{{ msg.content }}</div>
            <div v-else class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
          </div>
        </div>
        <div v-if="loading" class="msg-item assistant">
          <div class="msg-avatar">📚</div>
          <div class="msg-content">
            <el-skeleton :rows="3" animated />
          </div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          placeholder="粘贴古籍文本或输入问题，例如：翻译《论语》学而篇第一段"
          @keydown.enter.prevent="handleEnter"
        />
        <el-button
          type="primary"
          :loading="loading"
          @click="sendChat"
          style="margin-top: 12px"
        >
          {{ loading ? '分析中...' : '提交分析' }}
        </el-button>
        <el-button @click="clearChat" style="margin-top: 12px; margin-left: 8px">
          清空对话
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import DOMPurify from 'dompurify'
import { sendStreamChat } from '@/api/AncientChat'

const userInput = ref('')
const messages = ref([])
const conversationId = ref('')
const loading = ref(false)
const chatHistoryRef = ref(null)

// 配置 marked（局部配置，避免全局污染）
const markedOptions = {
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true
}

const renderMarkdown = (text) => {
  const rawHtml = marked.parse(text || '', markedOptions)
  // XSS 防护：净化 HTML
  return DOMPurify.sanitize(rawHtml)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

const handleEnter = (e) => {
  if (!e.shiftKey) {
    sendChat()
  }
}

const sendChat = () => {
  const query = userInput.value.trim()
  if (!query || loading.value) return

  // 添加用户消息，绑定唯一 key
  messages.value.push({ role: 'user', content: query, id: Date.now() })
  userInput.value = ''
  loading.value = true
  scrollToBottom()

  // 创建 AI 消息占位
  const aiMsg = { role: 'assistant', content: '', id: Date.now() + 1 }
  messages.value.push(aiMsg)

  // 使用封装的 API 建立 SSE 连接
  const eventSource = sendStreamChat(query, conversationId.value)

  eventSource.onmessage = (event) => {
    // ✅ 修正：将 data 提取到 try 外部，避免 catch 块作用域错误
    const data = event.data

    if (data === '[DONE]') {
      eventSource.close()
      loading.value = false
      return
    }

    try {
      const json = JSON.parse(data)

      // ✅ 修正：适配 Coze SSE 实际返回格式
      // Coze 格式：{"event":"conversation.message.delta","data":{"content":"..."}}
      if (json.event === 'conversation.message.delta' && json.data?.content) {
        aiMsg.content += json.data.content
        scrollToBottom()
      }

      // ✅ 修正：提取 conversation_id（可能在 conversation.chat.created 或任意事件中）
      if (json.data?.conversation_id) {
        conversationId.value = json.data.conversation_id
      }
    } catch (e) {
      // 非 JSON 数据直接追加显示
      if (data && data !== '[DONE]') {
        aiMsg.content += data
        scrollToBottom()
      }
    }
  }

  eventSource.onerror = (err) => {
    console.error('SSE error', err)
    eventSource.close()
    loading.value = false
    if (!aiMsg.content) {
      aiMsg.content = '❌ 连接异常，请检查后端服务是否正常'
    }
  }
}

const clearChat = () => {
  messages.value = []
  conversationId.value = ''
}
</script>

<style scoped>
.chat-container {
  width: 90%;
  max-width: 1000px;
  margin: 30px auto;
}

.chat-card {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.chat-history {
  flex: 1;
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.msg-item {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.msg-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.msg-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.msg-item.user .msg-content {
  background: #409eff;
  color: #fff;
}

.user-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-body {
  line-height: 1.8;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 16px;
  margin-bottom: 12px;
  color: #303133;
}

.markdown-body :deep(p) {
  margin-bottom: 8px;
}

.markdown-body :deep(code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.markdown-body :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

.input-area {
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}
</style>