<template>
  <div class="analysis-container">
    <!-- 统计数据卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
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
              <div class="stat-value">{{ stats.totalSeats }}</div>
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
              <div class="stat-value">{{ stats.todayReservations }}</div>
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
              <div class="stat-value">{{ stats.utilizationRate }}%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>预约趋势</span>
            <el-select
                v-model="chartType"
                size="small"
                style="width: 120px;"
            >
              <el-option label="近7天" value="7" />
              <el-option label="近30天" value="30" />
            </el-select>
          </template>
          <div ref="lineChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>座位使用情况</span>
          </template>
          <div ref="pieChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>各时段使用热度</span>
          </template>
          <div ref="barChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
const chartType = ref('7')

let lineChartInstance = null
let pieChartInstance = null
let barChartInstance = null

const stats = reactive({
  totalUsers: 1568,
  totalSeats: 120,
  todayReservations: 89,
  utilizationRate: 74.2
})

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (lineChartInstance) {
    lineChartInstance.dispose()
  }
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
  if (barChartInstance) {
    barChartInstance.dispose()
  }
})

const handleResize = () => {
  if (lineChartInstance) lineChartInstance.resize()
  if (pieChartInstance) pieChartInstance.resize()
  if (barChartInstance) barChartInstance.resize()
}

const initCharts = () => {
  // 折线图 - 预约趋势
  lineChartInstance = echarts.init(lineChartRef.value)
  const lineOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['预约数量', '使用时长']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '预约数量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '使用时长',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310]
      }
    ]
  }
  lineChartInstance.setOption(lineOption)

  // 饼图 - 座位使用情况
  pieChartInstance = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '座位状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '空闲' },
          { value: 45, name: '已预约' },
          { value: 20, name: '使用中' },
          { value: 10, name: '维护中' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChartInstance.setOption(pieOption)

  // 柱状图 - 各时段使用热度
  barChartInstance = echarts.init(barChartRef.value)
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    yAxis: {
      type: 'value',
      name: '使用人数'
    },
    series: [
      {
        name: '使用人数',
        type: 'bar',
        data: [40, 65, 85, 95, 120, 140, 110, 75],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  barChartInstance.setOption(barOption)
}
</script>

<style scoped>
.analysis-container {
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

:deep(.el-card__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>