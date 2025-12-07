<!-- views/student/Layout.vue -->
<template>
  <div class="student-layout">
    <!-- 学生端导航栏 -->
    <header class="student-header">
      <div class="header-content">
        <router-link to="/student/main" class="logo">
          <h1>智慧自习室 - 学生端</h1>
        </router-link>

        <nav class="student-nav">
          <router-link to="/student/main" class="nav-link">首页</router-link>
          <router-link to="/student/rooms" class="nav-link">自习室</router-link>
          <router-link to="/student/reservation" class="nav-link">我的预约</router-link>
          <router-link to="/student/profile" class="nav-link">个人中心</router-link>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </nav>
      </div>
    </header>

    <main class="student-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.student-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.student-header {
  background: #2c3e50;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  font-size: 20px;
  margin: 0;
  color: white;
  text-decoration: none;
}

.student-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.student-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>