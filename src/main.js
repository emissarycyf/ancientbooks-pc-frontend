import { createApp } from 'vue'
import App from './App.vue'
// Element Plus UI 组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
// Pinia 状态管理
import { createPinia } from 'pinia'

const app = createApp(App)
// 注册 Element Plus 全局组件
app.use(ElementPlus)
// 注册路由
app.use(router)
// 注册 Pinia 状态管理
app.use(createPinia())
// 挂载应用到 #app
app.mount('#app')