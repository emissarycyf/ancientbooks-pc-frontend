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
        <!-- 示例提示，点击可复制到输入框 -->
        <div class="example-hint">
          <el-tag size="small" type="info" effect="plain" @click="fillExample('讲解《道德经》第一篇')" style="cursor: pointer;">
            示例：讲解《道德经》第一篇
          </el-tag>
        </div>

        <el-input
          v-model="userInput"
          type="textarea"
          :rows="6"
          placeholder="粘贴古籍文本或输入问题，点击上方示例可快速填充"
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
// 响应式 API：ref 用于基础类型响应式，nextTick 用于 DOM 更新后执行回调
import { ref, nextTick } from 'vue'
// marked：Markdown 解析器
import { marked } from 'marked'
// highlight.js：代码块语法高亮
import hljs from 'highlight.js'
// highlight.js 默认主题（GitHub 风格）
import 'highlight.js/styles/github.css'
// DOMPurify：XSS 防护，净化 HTML
import DOMPurify from 'dompurify'
// 封装的 SSE 流式对话接口
import { sendStreamChat } from '@/api/AncientChat'

// 用户输入框内容
const userInput = ref('')
// 对话消息列表：{ role: 'user' | 'assistant', content: string, id: number }
const messages = ref([])
// 当前会话 ID，后端返回后用于多轮对话
const conversationId = ref('')
// 请求中加载状态，控制按钮 loading 和骨架屏显示
const loading = ref(false)
// 聊天历史区域 DOM 引用，用于滚动到底部
const chatHistoryRef = ref(null)

// 配置 marked（局部配置，避免全局污染）
const markedOptions = {
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
}

const renderMarkdown = (text) => {
  const rawHtml = marked.parse(text || '', markedOptions)
  // XSS 防护：净化 HTML
  return DOMPurify.sanitize(rawHtml)
}

// 滚动聊天历史区域到底部（流式更新时调用）
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// 回车发送：Enter 提交，Shift+Enter 换行
const handleEnter = (e) => {
  if (!e.shiftKey) {
    sendChat()
  }
}

// 点击示例标签，将示例文本填入输入框
const fillExample = (text) => {
  userInput.value = text
}

const sendChat = async () => {
  // 防重复请求：loading 为 true 时直接拦截
  if (loading.value) return

  const query = userInput.value.trim()
  if (!query) return

  // 标记 AI 消息是否已收到内容（用于错误时差异化提示）
  let aiMsgStarted = false

  // 添加用户消息，绑定唯一 key
  messages.value.push({ role: 'user', content: query, id: Date.now() })
  userInput.value = ''
  loading.value = true
  scrollToBottom()

  // 创建 AI 消息占位
  const aiMsg = { role: 'assistant', content: '', id: Date.now() + 1 }
  messages.value.push(aiMsg)

  try {
    // 建立 SSE 连接
    const eventSource = sendStreamChat(query, conversationId.value)

    eventSource.onmessage = (event) => {
      const data = event.data

      if (data === '[DONE]') {
        eventSource.close()
        aiMsgStarted = true
        return
      }

      try {
        const json = JSON.parse(data)

        // Coze 格式：{"event":"conversation.message.delta","data":{"content":"..."}}
        if (json.event === 'conversation.message.delta' && json.data?.content) {
          aiMsg.content += json.data.content
          aiMsgStarted = true
          scrollToBottom()
        }

        // 提取 conversation_id，用于多轮对话
        if (json.data?.conversation_id) {
          conversationId.value = json.data.conversation_id
        }
      } catch {
        // 非 JSON 数据直接追加显示
        if (data && data !== '[DONE]') {
          aiMsg.content += data
          aiMsgStarted = true
          scrollToBottom()
        }
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error', err)
      eventSource.close()
      // 连接异常且尚未收到任何内容时，给出明确提示
      if (!aiMsgStarted) {
        aiMsg.content = '❌ 连接异常，请检查后端服务是否正常'
      }
    }
  } catch (error) {
    // SSE 建立阶段抛出的同步异常
    console.error('发送失败', error)
    if (!aiMsgStarted) {
      aiMsg.content = '❌ 发送失败，请重试'
    }
  } finally {
    // 无论成功或失败，统一在此重置 loading，避免状态残留
    loading.value = false
  }
}

// 清空当前对话：重置消息列表和会话 ID
const clearChat = () => {
  messages.value = []
  conversationId.value = ''
}
</script>

<style scoped>
.chat-container {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 0 60px;
  box-sizing: border-box;
}

.chat-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  box-sizing: border-box;
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
  min-height: 300px;
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

.example-hint {
  margin-bottom: 8px;
}
</style>