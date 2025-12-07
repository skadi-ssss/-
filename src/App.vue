<template>
  <router-view />
</template>

<script setup>
import {onMounted} from 'vue'
import {useAuthStore} from '@/store/auth'

const authStore = useAuthStore()

// 初始化时检查登录状态
onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>