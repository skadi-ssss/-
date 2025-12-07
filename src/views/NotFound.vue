<!-- src/views/NotFound.vue -->
<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <router-link to="/" class="home-link">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
// 不需要额外的逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}

.error-content {
  max-width: 500px;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  color: #dc3545;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  margin: 1rem 0;
  color: #333;
}

p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.home-link:hover {
  background: #0056b3;
}
</style>