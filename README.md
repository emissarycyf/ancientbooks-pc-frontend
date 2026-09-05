# 古籍文献分析 Agent 前端

> 基于 Vue 3 + Vite + Element Plus + Pinia 的单页应用（SPA），提供古籍文献流式分析和 Markdown 渲染能力。

## 特别说明

### 前后端分离仓库

本项目采用前后端分离架构，**前端**和**后端**分别托管于独立仓库，开发时需同时启动两个服务：

| 仓库 | 路径 | 启动命令 |
|------|------|---------|
| **前端** | `ancientbooks-pc-frontend/` | `npm run dev` |
| **后端** | `ancientbooks-pc-backend/` | `mvn spring-boot:run` |

**关联地址：**

- 后端 README：`../ancientbooks-pc-backend/README.md`
- 后端 API 文档：详见后端 README「接口说明」章节

> ⚠️ 前端依赖后端接口，**启动前端前必须先确认后端服务已正常运行**（MySQL + Redis + SpringBoot 均需就绪）。

---

### 更新进度 2026.9.6

- **前端**：完成古籍分析对话页（`views/chat/index.vue`）核心功能，支持 SSE 流式分析、思考过程独立展示、深度解读 Markdown 渲染
- **后端**：完成 SpringBoot 3 + WebFlux + Coze 扣子对接，SSE 流式推送 `reasoning_content` 和 `answer` 内容
- **认证**：JWT Token 登录 / 登出 / 路由守卫自动鉴权
- **文档**：新增 README、前端开发指导文档、代码注释规范
- **已知问题**：
  - `EventSource` 无法携带自定义请求头，Token 通过 URL query 参数传递（后端需同步适配）
  - GET 请求 `content` 超过 8KB 会静默失败，超长古籍需改 POST 或前端截断
  - 思考框内容与正文相同时自动隐藏，如后端返回差异化 `reasoning_content` 将正常展示



### 流程配置说明

项目相关流程与配置已调试完毕，可完整本地运行；若运行异常，请核对环境配置或更换对应方案。

### 前端项目进度

**v1.0** — 2026.9.6

| 模块 | 状态 | 说明 |
|------|------|------|
| **项目搭建** | ✅ 完成 | Vue 3 + Vite + Element Plus + Pinia 基础架构 |
| **用户认证** | ✅ 完成 | 登录 / 登出 / 路由守卫 / Token 自动注入 |
| **SSE 流式分析** | ✅ 完成 | EventSource 对接 / Coze SSE 格式解析 / 思考过程分离展示 / Markdown 渲染 |
| **输入框自适应** | ✅ 完成 | 有结果时 rows=3，无结果时 rows=6 |
| **思考过程展示** | ✅ 完成 | 独立框体 / 字体缩小 / max-height 25vh / 独立滚动 |
| **防重复提交** | ✅ 完成 | loading 状态 + try/catch/finally 统一管理 |
| **文档建设** | ✅ 完成 | README / 前端开发规范 / 接口文档 |
| **废弃代码清理** | ✅ 完成 | `AncientChat.js` 已确认无依赖，可随时移除 |

**已知限制：**

| 限制项 | 原因 | 规避方案 |
|--------|------|---------|
| `EventSource` 无法携带自定义请求头 | 浏览器原生 API 限制 | Token 通过 URL query 参数传递（后端需同步适配） |
| GET 请求 URL 长度上限约 8KB | 浏览器 / 服务器通用限制 | 超长内容需改 POST 或前端截断提示 |
| 思考框内容与正文相同时自动隐藏 | 避免重复展示 | 后端返回差异化 `reasoning_content` 后将正常展示 |


### AI 辅助生成声明

本项目部分代码和文档由 **AI 辅助生成**，开发过程中已人工审查与测试。使用请注意：

- AI 生成的代码可能包含逻辑错误、安全隐患或性能问题，请务必在集成前进行充分测试
- 涉及鉴权、数据库操作、安全校验的代码需重点审查
- 建议将 AI 输出视为「初稿」，根据实际业务场景做针对性修改和优化
- 如发现 AI 生成的问题代码，请及时修正并同步更新相关文档

---

### 开源与协议

本项目为内部学习与演示用途，未经授权请勿用于生产环境。



---

## 技术栈

| 技术 | 版本 / 说明 |
|------|------------|
| **Vue 3.4+** | 渐进式前端框架（Composition API + `<script setup>`） |
| **Vite 5+** | 下一代前端构建工具 |
| **Element Plus** | UI 组件库 |
| **Pinia** | 状态管理 |
| **Vue Router 4** | 前端路由 |
| **Axios** | HTTP 请求库 |
| **marked** | Markdown 解析器 |
| **highlight.js** | 代码语法高亮 |
| **DOMPurify** | XSS 防护 |
| **EventSource** | 原生 SSE 流式通信 |

---

## 项目结构

```
ancientbooks-pc-frontend/
├── .vscode/                          # VS Code 编辑器配置
│   └── extensions.json               # 推荐插件
├── .trae/                            # Trae IDE 配置
│   └── skill/vue3-standard/          # Vue3 开发规范与文档
├── public/                           # 静态资源（不经过构建）
├── src/
│   ├── api/                          # 接口请求函数，按业务模块分类
│   │   ├── agentApi.js               # 古籍分析接口（SSE 流式分析 + 会话 ID）
│   │   ├── AncientChat.js            # ⚠️ 已废弃，功能迁移至 agentApi.js
│   │   └── userApi.js                # 用户认证接口（登录 / 登出 / 刷新 Token）
│   ├── router/                       # 路由配置
│   │   └── index.js                  # 路由表 + 路由守卫
│   ├── stores/                       # Pinia 状态管理
│   │   └── userStore.js              # 用户状态（token、用户信息、登录态）
│   ├── utils/                        # 工具函数
│   │   └── request.js                # Axios 封装（拦截器、Token 注入、401 处理）
│   ├── views/                        # 页面级组件
│   │   ├── chat/
│   │   │   └── index.vue             # 古籍分析对话页（核心页面）
│   │   └── user/
│   │       └── Login.vue             # 登录页
│   ├── components/                   # 公共组件（预留）
│   ├── assets/                       # 静态资源（预留）
│   ├── composables/                  # 组合式函数（预留）
│   ├── constants/                    # 常量定义（预留）
│   ├── App.vue                       # 根组件
│   ├── main.js                       # 入口文件
│   └── style.css                     # 全局样式
├── .env.development                  # 开发环境变量
├── .env.production                   # 生产环境变量（预留）
├── vite.config.js                    # Vite 配置（@ 别名）
├── package.json                      # 项目依赖
├── index.html                        # HTML 入口
├── README.md                         # 本文档
└── frontend-dev-guide.md             # 前端开发指导文档
```

---

## 快速开始

### 1. 环境要求

- **Node.js 18+** — 下载 [https://nodejs.org/](https://nodejs.org/)
- **npm 或 pnpm** — 随 Node.js 一起安装

### 2. 安装依赖

```powershell
# 在项目根目录执行
npm install

# 或使用 pnpm（推荐，速度更快）
pnpm install
```

### 3. 配置环境变量

**文件：`.env.development`**

```env
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

> ⚠️ 所有环境变量必须以 `VITE_` 开头才能在代码中通过 `import.meta.env` 访问。

### 4. 启动后端服务

前端依赖后端接口，**启动前端前请确保后端已启动**：

```powershell
# 后端项目位于同级目录
cd ../ancientbooks-pc-backend
mvn spring-boot:run
```

后端启动成功后访问 `http://localhost:8080/api/auth/login` 验证。

### 5. 启动前端开发服务器

```powershell
# 在项目根目录执行
npm run dev
```

**前端地址：** `http://localhost:5173`

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 📜 **古籍分析** | 输入古籍内容或问题，SSE 流式返回深度解读 |
| 🧠 **思考过程** | 独立展示 `reasoning_content`，字体缩小、高度受限、区域滚动 |
| 📝 **Markdown 渲染** | 支持 GFM + 代码高亮 + XSS 防护 |
| 🔑 **用户登录** | JWT Token 认证，路由守卫拦截未登录用户 |
| ⚡ **流式响应** | 基于 EventSource 的 SSE 流式通信，实时逐字输出 |
| 🚫 **防重复提交** | loading 状态 + try / catch / finally 统一管理 |
| 📱 **输入框自适应** | 有结果时 textarea rows=3，无结果时 rows=6 |

---

## 开发指南

### 启动命令

```powershell
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 路由说明

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | `views/chat/index.vue` | 古籍分析对话页（首页，需登录） |
| `/login` | `views/user/Login.vue` | 登录页 |

> 未登录用户访问首页会自动跳转到 `/login`。

---

## 前后端对接

### 核心接口

#### 1. 用户登录

```
POST /api/auth/login
Content-Type: application/json
```

**请求体：**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

#### 2. 流式古籍分析（SSE）⭐ 核心接口

```
GET /api/agent/analyze/stream?content={古籍内容}&userId={用户ID}
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `content` | ✅ | 古籍内容或分析问题 |
| `userId` | ✅ | 用户 ID（登录后自动获取） |

**SSE 流式响应字段：**

| 字段 | 说明 |
|------|------|
| `type: "answer"` | 主回答内容，`content` 字段为实际文本 |
| `reasoning_content` | 思考 / 推理过程，独立展示在上方框 |
| `type: "follow_up"` | 推荐追问 |
| `conversation_id` | 会话 ID，用于多轮对话 |
| `[DONE]` | 流结束标记 |

#### 3. 获取用户会话 ID

```
GET /api/agent/conversation/{userId}
```

**响应：**

```json
{
  "code": 200,
  "msg": "success",
  "data": "abc123def456ghi789xyz"
}
```

### Token 认证流程

```
登录（POST /api/auth/login）
    ↓
后端返回 { code: 200, data: { token, userId, username, role } }
    ↓
userStore.login() 存储 token → localStorage
    ↓
后续请求：request.js 拦截器自动注入 Authorization: Bearer {token}
    ↓
响应拦截器：401 → 清除 localStorage → 跳转 /login
```

### SSE 对接流程

```
前端：EventSource GET /api/agent/analyze/stream?content=xxx&userId=xxx
                            ↓
后端：text/event-stream，逐条推送 Coze 工作流格式事件
                            ↓
前端 onmessage：
  data === '[DONE]'              → 关闭连接
  JSON.parse(data)
    └── type === 'answer'        → json.content 追加到「深度解读」卡片
    └── reasoning_content 存在   → 追加到「思考过程」框
    └── type === 'follow_up'     → json.content 追加到推荐追问列表
```

**SSE 规范要点：**
- `content`、`userId` 必须使用 `encodeURIComponent` 编码
- `onmessage` 内禁止复杂同步计算
- 连接异常时必须关闭 EventSource 并提示用户
- 思考框内容与正文相同时自动隐藏（`reasoning.trim() === analysis.trim()`）

---

## 统一响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": { /* 实际业务数据 */ }
}
```

| code | 含义 | 处理方式 |
|------|------|---------|
| 200 | 成功 | 取 `data` |
| 400 | 参数校验失败 | 显示 `msg` |
| 401 | 未授权 | 拦截器自动跳转登录 |
| 429 | 请求过于频繁 | 提示用户稍后重试 |
| 500 | 系统错误 | 提示"系统繁忙，请稍后再试" |

---

## 注意事项

- ⚠️ **启动前端前必须先启动后端**（MySQL + Redis + SpringBoot 均需运行）
- ⚠️ **EventSource 无法自定义请求头**，Token 通过 URL query 参数传递
- ⚠️ **GET 请求 URL 长度上限约 8KB**，超长古籍内容需改 POST 或前端截断
- ⚠️ `pat_token` 等敏感信息**绝对不能**硬编码在前端代码中
- ⚠️ 本地开发使用 `http://localhost:5173`，生产环境需配置 Nginx 反向代理
- ⚠️ 所有环境变量必须以 `VITE_` 开头，否则 `import.meta.env` 无法读取
- ⚠️ Coze Agent 发布前本地无法收到有效响应，需在后端 `application.yml` 正确配置 `coze.pat-token` 和 `coze.bot-id`

---

## 常见问题

| 问题 | 排查方向 |
|------|---------|
| **接口报 404** | 后端是否启动、接口路径是否正确 |
| **接口报 401** | localStorage 是否有 token、后端路由守卫是否放行 |
| **跨域报错** | 后端 `CorsConfig.java` 是否配置前端地址 `http://localhost:5173` |
| **页面白屏** | 控制台报错 → 检查组件 import 路径 → 检查 `@` 别名配置 |
| **SSE 无响应** | 后端 EventSource 是否正常推送、参数是否 `encodeURIComponent` |
| **Loading 永久残留** | `finally` 中是否关闭 loading |
| **登录后跳回登录页** | 后端 401 返回、Token 格式是否正确 |

---

## 开发规范

> 本规范适用于 `ancientbooks-pc-frontend` 项目的可持续协作开发。新成员上手或 AI 辅助开发时请严格遵循。

---

### 1. 目录结构规范

```
src/
├── api/          # 接口请求函数（按业务模块分类）
├── router/       # 路由配置
├── stores/       # Pinia Store（每个 Store 单独一个文件）
├── utils/        # 通用工具函数
├── views/        # 页面组件（按路由分文件夹，每个页面一个 .vue 文件）
├── components/   # 公共组件（复用度高的局部组件，按需拆入 views 下同模块文件夹）
├── assets/       # 静态资源（图片、字体等，需通过 import 引入）
├── composables/  # 组合式函数（跨组件复用的响应式逻辑）
├── constants/    # 常量定义（统一管理枚举、固定值，禁止硬编码）
```

**新增接口文件：** `src/api/{业务模块名}Api.js`
**新增 Store：** `src/stores/{业务名}Store.js`
**新增页面：** `src/views/{模块}/{PageName}.vue`，同时必须在 `router/index.js` 注册路由。

---

### 2. 代码风格规范

#### 2.1 编码约定

| 规范 | 要求 |
|------|------|
| **框架语法** | Vue 3 Composition API + `<script setup>`，禁止 Options API |
| **文件命名** | 组件大驼峰（`ChatResult.vue`），脚本/工具小驼峰（`agentApi.js`） |
| **变量 / 方法** | 小驼峰，见名知意（`userInput`、`handleSubmit`） |
| **常量** | 大写下划线（`MAX_CONTENT_LENGTH`） |
| **CSS 类名** | 小写连字符（`reasoning-box`、`chat-card`） |
| **字符串引号** | 统一单引号 `'`（JSON 和模板字符串除外） |

#### 2.2 import 顺序

```javascript
// 1. Vue 内置
import { ref, onUnmounted } from 'vue'

// 2. 第三方库
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

// 3. Element Plus（按需引入，优先使用自动按需引入配置）
import { ElMessage } from 'element-plus'

// 4. 项目内部（路径别名 @）
import { analyzeStream } from '@/api/agentApi'
import { useUserStore } from '@/stores/userStore'
```

#### 2.3 注释规范

- 每个 `script setup` 顶部的 import 块必须用注释分类（如上所示）
- 每个 `ref` / `reactive` 声明后必须加单行注释说明用途
- 每个函数 / 方法必须有注释（`// 描述` 或 JSDoc 格式），复杂逻辑必须写 **为什么** 而非 **是什么**
- 禁止无意义注释（如 `// 赋值`、`// 循环`）

```javascript
// ✅ 正确
const loading = ref(false)  // 提交按钮加载状态
// 当 reasoning 和 analysis 内容相同时隐藏思考框，避免重复展示
if (json.reasoning_content && json.reasoning_content !== analysis) { ... }

// ❌ 错误
const loading = ref(false)  // 加载状态
// 判断
if (json.reasoning_content) { ... }
```

#### 2.4 响应式数据规范

- **页面级状态**（loading、表单、结果数据）：直接使用 `ref` / `reactive`，禁止额外封装
- **跨页面共享状态**（用户信息、Token）：必须使用 Pinia Store
- **跨组件复用逻辑**（如 SSE 连接管理、节流函数）：封装为 `composables/{name}.js`

---

### 3. API 对接规范

#### 3.1 请求封装

- 所有 HTTP 请求通过 `src/utils/request.js`（Axios 实例）发出
- 禁止在页面内 `import axios from 'axios'` 直接请求
- 业务接口统一放在 `src/api/` 下，按业务分文件，禁止散落在 `.vue` 文件中

#### 3.2 GET / POST 选择

| 场景 | 方式 | 说明 |
|------|------|------|
| 查询、列表、详情 | `GET` + `params` | 参数拼在 URL query |
| 新增、编辑、删除 | `POST / PUT / DELETE` + `data` | 参数放在请求体 |
| 超长文本（>4KB） | `POST` | 避免 GET URL 超长（浏览器上限约 8KB） |

#### 3.3 统一响应

后端统一返回格式 `{ code, msg, data }`，`request.js` 响应拦截器已自动提取 `data`，业务层直接使用。

#### 3.4 错误处理

```javascript
try {
  const res = await someApi(params)
  // 成功逻辑
} catch (error) {
  console.error('[业务标识] 失败原因', error)
  ElMessage.error(error.message || '操作失败，请重试')
}
```

- `catch` 内必须 `console.error` 带上业务标识，便于排查
- 禁止 `catch` 为空（`catch {}`），禁止 `console.log` 代替 `console.error`

---

### 4. SSE 流式对接规范

- **唯一入口**：`src/api/agentApi.js` 中的 `analyzeStream()`
- **URL 参数**：`content`、`userId` 必须使用 `encodeURIComponent` 编码
- **EventSource 生命周期**：组件卸载时必须 `onUnmounted` 关闭连接
- **onmessage 规则**：
  - 禁止复杂同步计算，只做轻量 JSON 解析和字符串追加
  - `reasoning_content` 与 `analysis` 内容相同时必须隐藏思考框
- **连接异常**：`onerror` 必须 `eventSource.close()` + `ElMessage.error()` 提示
- **流结束**：`data === '[DONE]'` 时必须 `eventSource.close()`

---

### 5. 状态管理（Pinia）规范

| 场景 | 规范 |
|------|------|
| 定义 Store | 使用 Composition API 写法（`defineStore('name', () => { ... })`） |
| 状态声明 | 用 `ref` 定义响应式状态，禁止混用 `ref` 和 `reactive` |
| 计算属性 | 用 `computed` |
| 方法 | 普通函数，参数注释清晰 |
| 持久化 | Token / 用户信息通过 `localStorage` 持久化，禁止 `sessionStorage` |

**示例：**

```javascript
// src/stores/userStore.js
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(() => {
    try { return JSON.parse(localStorage.getItem('userInfo') || 'null') }
    catch { return null }
  })

  const login = async (username, password) => {
    const res = await loginApi({ username, password })
    if (res.code === 200 && res.data?.token) {
      const { token: t, userId, username: name, role } = res.data
      token.value = t
      userInfo.value = { userId, username: name, role }
      localStorage.setItem('token', t)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      return res.data
    }
    throw new Error(res.msg || '登录失败')
  }

  return { token, userInfo, login }
})
```

---

### 6. 样式编写规范

- **作用域**：所有组件样式必须用 `<style scoped>`，禁止全局污染
- **穿透**：需要覆盖 Element Plus 内部样式时用 `:deep()`，禁止裸写全局类名
- **单位**：布局间距用 `px`，字体大小用 `px` 或 `em`，禁止 `rem`（本项目无多端适配需求）
- **颜色**：优先使用 Element Plus 内置色板（`#409eff`、`#f0f0f0` 等），禁止随意引入新颜色
- **思考框样式**：必须满足「字体缩小、高度受限、区域独立滚动」三要素，禁止改大 `max-height`

---

### 7. 组件通信规范

| 场景 | 方式 |
|------|------|
| 父 → 子 | `defineProps()` |
| 子 → 父 | `defineEmits()` |
| 深层嵌套 | `provide / inject`（谨慎使用） |
| 跨组件状态 | Pinia Store |
| 禁止 | `$parent`、`$refs` 直接操作兄弟 / 父组件 |

---

### 8. Git 提交规范

提交信息格式：

```
<type>(<scope>): <subject>
```

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变功能） |
| `style` | 样式调整（不影响功能） |
| `docs` | 文档更新 |
| `chore` | 构建、工具、依赖等杂项 |

**示例：**

```
feat(chat): 新增思考过程独立展示区域
fix(api): 修复 EventSource 带 Token 导致 401 问题
refactor(store): 迁移 userStore 为 Composition API 写法
docs: 完善 README 开发规范章节
```

---

### 9. 废弃与迁移规范

- 废弃接口 / 组件在文件头部加 `/** @deprecated 已迁移至 xxx */` 注释
- 废弃文件保留一个版本周期后再删除，禁止直接删除仍在使用的文件
- 目录结构变更必须在 README 和 `frontend-dev-guide.md` 同步更新

---

### 10. 安全规范

| 场景 | 要求 |
|------|------|
| **用户输入** | 所有渲染到页面的用户输入必须经过 `DOMPurify.sanitize()` |
| **API Key / Token** | 禁止硬编码，通过 `localStorage` 或环境变量注入 |
| **URL 参数** | 所有拼入 URL 的用户输入必须 `encodeURIComponent` |
| **XSS** | `v-html` 只用于经过 `DOMPurify` 处理的 Markdown 渲染 |
| **敏感信息** | 禁止 `console.log` 打印 Token、密码等敏感字段，仅允许 `console.error` |

---
