<template>
  <div class="dashboard-container">
    <!-- 原有的统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <!-- ... 原有的统计卡片代码 ... -->
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1568</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon><Position /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">120</div>
              <div class="stat-label">总座位数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">89</div>
              <div class="stat-label">今日预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">74.2%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加座位状态流程图 -->
    <SeatStatusFlow />

    <!-- 原有的图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- ... 原有的图表代码 ... -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>预约趋势</span>
          </template>
          <div style="height: 300px;">图表区域</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>座位使用情况</span>
          </template>
          <div style="height: 300px;">图表区域</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import SeatStatusFlow from '@/components/SeatStatusFlow.vue'
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.chart-row {
  margin-bottom: 20px;
}
</style>