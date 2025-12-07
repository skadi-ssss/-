<template>
  <div class="layout-container">
    <el-container class="layout">
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <Sidebar />
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header height="64px">
          <Header />
        </el-header>

        <!-- 面包屑 -->
        <div class="breadcrumb-container">
          <Breadcrumb />
        </div>

        <!-- 页面内容 -->
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout {
  height: 100%;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}

.breadcrumb-container {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

/* 页面切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>