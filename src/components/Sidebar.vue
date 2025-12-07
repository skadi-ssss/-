<template>
  <el-scrollbar class="sidebar-scrollbar">
    <div class="logo-container">
      <h2>自习室管理</h2>
    </div>

    <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
    >
      <!-- 仪表盘 -->
      <el-menu-item index="/admin">
        <el-icon><DataBoard /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>

      <!-- 用户信息管理 -->
      <el-sub-menu index="1">
        <template #title>
          <el-icon><User /></el-icon>
          <span>用户信息管理</span>
        </template>
        <el-menu-item index="/admin/user/list">
          <el-icon><UserFilled /></el-icon>
          <span>用户列表</span>
        </el-menu-item>
        <el-menu-item index="/admin/user/feedback">
          <el-icon><ChatDotRound /></el-icon>
          <span>反馈信息</span>
        </el-menu-item>
        <el-menu-item index="/admin/user/reservation">
          <el-icon><Calendar /></el-icon>
          <span>预约信息</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 座位管理 -->
      <el-menu-item index="/admin/seat/list">
        <el-icon><Position /></el-icon>
        <span>座位管理</span>
      </el-menu-item>

      <!-- 数据分析 -->
      <el-menu-item index="/admin/analysis">
        <el-icon><TrendCharts /></el-icon>
        <span>数据分析</span>
      </el-menu-item>

      <!-- 日志记录查询 -->
      <el-sub-menu index="4">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>日志记录查询</span>
        </template>
        <el-menu-item index="/admin/log/user">
          <el-icon><User /></el-icon>
          <span>用户日志</span>
        </el-menu-item>
        <el-menu-item index="/admin/log/seat">
          <el-icon><Location /></el-icon>
          <span>座位日志</span>
        </el-menu-item>
        <el-menu-item index="/admin/log/admin">
          <el-icon><Setting /></el-icon>
          <span>管理操作日志</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>

<style scoped>
.sidebar-scrollbar {
  height: 100%;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
}

.logo-container h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.el-menu {
  border-right: none;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}
</style>