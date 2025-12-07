// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'  // 导入 createPinia
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 1. 先创建 pinia 实例
const pinia = createPinia()

// 2. 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 3. 按正确顺序使用插件：先 pinia，后 router
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')