<template>
  <div class="chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="card-header">
          <span>📜 古籍文献分析 Agent</span>
        </div>
      </template>

      <!-- 分析结果展示 -->
      <div v-if="analysisResult" class="analysis-result">
        <!-- 思考过程（reasoning_content），与正文不同时才单独展示 -->
        <div v-if="analysisResult.reasoning && analysisResult.reasoning.trim() !== analysisResult.analysis?.trim()" class="reasoning-box">
          <div class="reasoning-header">
            <span class="reasoning-icon">🧠</span>
            <span class="reasoning-label">思考过程</span>
          </div>
          <div class="reasoning-content markdown-body" v-html="renderMarkdown(analysisResult.reasoning)"></div>
        </div>

        <!-- 深度解读（answer content） -->
        <el-card class="result-card">
          <template #header>📚 深度解读</template>
          <div class="markdown-body" v-html="renderMarkdown(analysisResult.analysis || '暂无')"></div>
        </el-card>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 示例提示，点击可复制到输入框 -->
        <div class="example-hint">
          <el-tag size="small" type="info" effect="plain" @click="userInput = '讲解《道德经》第一篇'" style="cursor: pointer;">
            示例：讲解《道德经》第一篇
          </el-tag>
        </div>

        <el-input
          v-model="userInput"
          type="textarea"
          :rows="analysisResult?.analysis ? 3 : 6"
          placeholder="输入古籍名称或内容，如：讲解《道德经》第一篇"
          @keydown.enter.prevent="handleEnter"
        />
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
          style="margin-top: 12px"
        >
          {{ loading ? '分析中...' : '提交分析' }}
        </el-button>
        <el-button @click="clearResult" style="margin-top: 12px; margin-left: 8px">
          清空结果
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 响应式 API
import { ref } from 'vue'
// Markdown 解析
import { marked } from 'marked'
// 代码块语法高亮
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
// XSS 防护
import DOMPurify from 'dompurify'
// 古籍流式分析接口（SSE）
import { analyzeStream } from '@/api/agentApi'
// Element Plus 消息提示
import { ElMessage } from 'element-plus'
// 用户状态管理
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
// 用户输入内容
const userInput = ref('')
// 加载状态
const loading = ref(false)
// 分析结果（流式实时更新）
const analysisResult = ref(null)

// marked 配置
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

// Markdown 渲染并净化 XSS
const renderMarkdown = (text) => {
  const rawHtml = marked.parse(text || '', markedOptions)
  return DOMPurify.sanitize(rawHtml)
}

// 回车提交：Enter 提交，Shift+Enter 换行
const handleEnter = (e) => {
  if (!e.shiftKey) {
    handleSubmit()
  }
}

// 提交分析（流式 SSE）
const handleSubmit = async () => {
  if (loading.value) return

  const text = userInput.value.trim()
  if (!text) {
    ElMessage.warning('请输入古籍内容或问题')
    return
  }

  loading.value = true
  userInput.value = ''
  // 重置分析结果，准备接收流式数据
  analysisResult.value = { reasoning: '', analysis: '' }

  // 建立 SSE 流式连接
  let eventSource = null

  try {
    eventSource = analyzeStream({
      content: text,
      userId: userStore.userInfo?.userId || 'admin'
    })

    // 监听 SSE 消息（Coze 工作流格式）
    eventSource.onmessage = (event) => {
      // 流结束标记
      if (event.data === '[DONE]') {
        eventSource.close()
        return
      }

      // 解析 Coze SSE 数据
      try {
        const json = JSON.parse(event.data)

        // 主回答内容（type: "answer"），追加到下方深度解读
        if (json.type === 'answer' && json.content) {
          analysisResult.value.analysis += json.content
        }

        // 推理过程（reasoning_content），追加到上方思考框
        if (json.reasoning_content) {
          analysisResult.value.reasoning += json.reasoning_content
        }
      } catch {
        // 非 JSON 格式（保底处理）
        if (event.data && event.data !== '[DONE]') {
          analysisResult.value.analysis += event.data
        }
      }
    }

    // 监听连接错误
    eventSource.onerror = () => {
      eventSource.close()
      ElMessage.error('连接异常，请检查网络或刷新页面')
    }
  } catch (error) {
    console.error('分析失败', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    loading.value = false
  }
}

// 清空结果
const clearResult = () => {
  analysisResult.value = null
  userInput.value = ''
}
</script>

<style scoped>
.chat-container {
  padding: 20px;
}
.chat-card {
  max-width: 900px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.analysis-result {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px;
}
.result-card {
  margin-bottom: 16px;
}
.markdown-body {
  line-height: 1.8;
  color: #333;
}
.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}
.markdown-body :deep(code) {
  font-family: 'Courier New', monospace;
}
.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 12px;
  color: #666;
  margin: 8px 0;
}
/* 思考过程框 */
.reasoning-box {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  margin-bottom: 16px;
  overflow: hidden;
}
.reasoning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #f0f0f0;
  font-weight: 500;
  font-size: 0.85em;
}
.reasoning-icon {
  font-size: 1.1em;
}
.reasoning-label {
  color: #666;
}
.reasoning-content {
  font-size: 0.85em;
  max-height: 16vh;
  overflow-y: auto;
  padding: 8px 12px;
  line-height: 1.6;
  color: #555;
}
.reasoning-content :deep(pre) {
  font-size: 0.9em;
}
.reasoning-content :deep(code) {
  font-size: 0.9em;
}
.input-area {
  margin-top: 16px;
}
.example-hint {
  margin-bottom: 8px;
}
</style>