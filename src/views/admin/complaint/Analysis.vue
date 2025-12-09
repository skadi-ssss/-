<template>
  <div class="complaint-analysis-container">
    <el-card>
      <template #header>
        <h2>投诉统计分析</h2>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stat-cards">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">78</div>
              <div class="stat-label">总投诉量</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">85%</div>
              <div class="stat-label">解决率</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">12小时</div>
              <div class="stat-label">平均响应</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">3</div>
              <div class="stat-label">待处理</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 投诉类型分布 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <h3>投诉类型分布</h3>
        </template>
        <div style="height: 300px; display: flex; align-items: center; justify-content: center;">
          <div>投诉类型分布图表区域</div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
// 简化的投诉分析页面
</script>

<style scoped>
.complaint-analysis-container {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}
</style>