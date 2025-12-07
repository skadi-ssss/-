<template>
  <div class="home-page">
    <h1>智慧自习室预约管理系统</h1>
    <p>欢迎使用</p>
    <el-button type="primary" @click="$router.push('/register')">
      注册新账户
    </el-button>
  </div>
</template>

<script setup>

</script>

<style scoped>
.home-page {
  text-align: center;
  padding: 100px 20px;
}

.home-page h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.home-page p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}
</style>