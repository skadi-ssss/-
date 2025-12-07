// src/store/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 按需导出各个 store
export * from './auth'