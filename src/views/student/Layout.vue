<template>
  <div class="student-layout">
    <!-- 学生端导航栏 -->
    <header class="student-header">
      <div class="header-content">
        <router-link to="/student" class="logo">
          <h1>智慧自习室 - 学生端</h1>
        </router-link>

        <nav class="student-nav">
          <router-link to="/student" class="nav-link">自习室</router-link>
          <router-link to="/student/reservation" class="nav-link">我的预约</router-link>
          <router-link to="/student/complaint" class="nav-link">投诉与建议</router-link>
          <router-link to="/student/user-feedback" class="nav-link">问题反馈</router-link>
          <router-link to="/student/profile" class="nav-link">个人中心</router-link>
          <router-link to="/student/about" class="nav-link">关于我们</router-link>

          <!-- 用户信息显示 -->
          <div class="user-info" v-if="authStore.user">
            <el-dropdown>
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                <span>{{ authStore.user.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToSettings">
                    <el-icon><Setting /></el-icon>设置
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 未读投诉通知 -->
          <el-badge
              :value="unreadCount"
              :max="99"
              :hidden="unreadCount === 0"
              class="badge-notification"
          >
            <router-link to="/student/complaint" class="nav-link notification-link">
              <el-icon><Bell /></el-icon>
            </router-link>
          </el-badge>

          <!-- 直接退出按钮（可选） -->
          <!-- <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button> -->
        </nav>
      </div>
    </header>

    <main class="student-main">
      <router-view />
    </main>

    <!-- 底部信息栏 -->
    <footer class="student-footer">
      <div class="footer-content">
        <div class="footer-info">
          <p>智慧自习室系统 © 2024 版权所有</p>
          <p>服务时间：8:00-22:00 | 客服电话：400-xxx-xxxx</p>
        </div>
        <div class="footer-links">
          <router-link to="/student/about">关于我们</router-link>
          <span class="divider">|</span>
          <router-link to="/student/terms">服务条款</router-link>
          <span class="divider">|</span>
          <router-link to="/student/privacy">隐私政策</router-link>
          <span class="divider">|</span>
          <a href="mailto:support@studyroom.com">联系我们</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const unreadCount = ref(0)

// 检查未读投诉
const checkUnreadComplaints = () => {
  // 这里应该从 API 获取未读投诉数量
  // 模拟数据
  unreadCount.value = Math.floor(Math.random() * 3) // 0-2条未读
}

// 前往个人中心
const goToProfile = () => {
  router.push('/student/profile')
}

// 前往设置页面（需要创建）
const goToSettings = () => {
  ElMessage.info('设置功能开发中')
}

// 处理退出登录
const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 检查用户是否已登录，未登录则跳转到登录页
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  checkUnreadComplaints()

  // 定时检查未读通知（每分钟一次）
  const interval = setInterval(checkUnreadComplaints, 60000)

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.student-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.student-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
}

.logo h1 {
  font-size: 22px;
  margin: 0;
  color: white;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.student-nav {
  display: flex;
  align-items: center;
  gap: 25px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: white;
  border-radius: 2px;
}

.user-info {
  margin-left: 10px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.15);
}

.badge-notification {
  cursor: pointer;
}

.notification-link {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-link .el-icon {
  font-size: 18px;
}

/* 底部样式 */
.student-footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #bdc3c7;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-links a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #3498db;
}

.divider {
  color: #7f8c8d;
  font-size: 12px;
}

.student-main {
  flex: 1;
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  background: #f8f9fa;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .student-nav {
    gap: 15px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }

  .logo h1 {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .student-nav {
    gap: 10px;
  }

  .nav-link span:not(.el-icon) {
    display: none;
  }

  .nav-link {
    padding: 8px;
  }

  .user-dropdown span:not(.el-icon) {
    display: none;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .student-main {
    padding: 20px 15px;
  }
}
</style>