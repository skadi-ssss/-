<template>
  <div class="dashboard-container">
    <!-- 系统状态面板 -->
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <span>系统状态监控</span>
          <div class="status-controls">
            <el-button
                v-if="!isOnline"
                type="success"
                @click="goOnline"
                :loading="onlineLoading"
            >
              <el-icon><Connection /></el-icon>
              上线
            </el-button>
            <el-button
                v-else
                type="warning"
                @click="goOffline"
            >
              <el-icon><CloseBold /></el-icon>
              下线
            </el-button>
          </div>
        </div>
      </template>

      <div class="status-display">
        <div class="status-item">
          <div class="status-icon" :class="isOnline ? 'online' : 'offline'">
            <el-icon :size="24">
              <component :is="isOnline ? 'SuccessFilled' : 'WarningFilled'" />
            </el-icon>
          </div>
          <div class="status-info">
            <div class="status-value">{{ isOnline ? '在线' : '离线' }}</div>
            <div class="status-label">系统状态</div>
          </div>
        </div>

        <div class="status-item">
          <div class="status-icon" style="background-color: #409eff;">
            <el-icon><User /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-value">{{ stats.totalUsers }}</div>
            <div class="status-label">总用户数</div>
          </div>
        </div>

        <div class="status-item">
          <div class="status-icon" style="background-color: #67c23a;">
            <el-icon><Position /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-value">{{ stats.totalSeats }}</div>
            <div class="status-label">总座位数</div>
          </div>
        </div>

        <div class="status-item">
          <div class="status-icon" style="background-color: #e6a23c;">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="status-info">
            <div class="stat-value">{{ stats.todayReservations }}</div>
            <div class="status-label">今日预约</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据图表配置 -->
    <el-card class="chart-config-card">
      <template #header>
        <div class="card-header">
          <span>数据图表配置</span>
          <div class="chart-controls">
            <el-button
                type="primary"
                @click="loadChartData"
                :disabled="!isOnline"
                :loading="chartLoading"
            >
              <el-icon><Refresh /></el-icon>
              请求图表数据
            </el-button>
            <el-button
                type="info"
                @click="resetCharts"
                :disabled="!isOnline"
            >
              <el-icon><RefreshRight /></el-icon>
              重置图表
            </el-button>
          </div>
        </div>
      </template>

      <!-- 图表类型选择 -->
      <div class="chart-type-selector">
        <div class="selector-title">选择图表类型：</div>
        <el-radio-group v-model="chartConfig.selectedTypes" @change="updateCharts">
          <el-radio-button label="line">折线图</el-radio-button>
          <el-radio-button label="bar">柱状图</el-radio-button>
          <el-radio-button label="pie">饼状图</el-radio-button>
          <el-radio-button label="mixed">组合图</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 数据维度选择 -->
      <div class="chart-dimension-selector" v-if="isOnline">
        <div class="selector-title">数据维度：</div>
        <el-select
            v-model="chartConfig.dimension"
            placeholder="选择数据维度"
            @change="updateCharts"
            style="width: 200px;"
        >
          <el-option label="按日统计" value="daily" />
          <el-option label="按周统计" value="weekly" />
          <el-option label="按月统计" value="monthly" />
        </el-select>
      </div>

      <!-- 图表显示区域 -->
      <div class="chart-display-area">
        <template v-if="!isOnline">
          <div class="offline-message">
            <el-empty description="系统当前处于离线状态，请先上线以加载数据图表">
              <el-button type="primary" @click="goOnline">立即上线</el-button>
            </el-empty>
          </div>
        </template>

        <template v-else-if="!hasChartData">
          <div class="no-data-message">
            <el-empty description="请点击上方按钮请求图表数据">
              <el-button type="primary" @click="loadChartData">请求数据</el-button>
            </el-empty>
          </div>
        </template>

        <template v-else>
          <el-row :gutter="20">
            <!-- 主图表区域 -->
            <el-col :span="24">
              <el-card class="main-chart-card">
                <template #header>
                  <span>主要数据图表</span>
                  <el-select
                      v-model="chartConfig.mainChartType"
                      placeholder="选择主图表类型"
                      @change="updateMainChart"
                      size="small"
                      style="width: 120px;"
                  >
                    <el-option label="折线图" value="line" />
                    <el-option label="柱状图" value="bar" />
                    <el-option label="饼状图" value="pie" />
                  </el-select>
                </template>
                <div ref="mainChart" style="height: 400px;"></div>
              </el-card>
            </el-col>

            <!-- 副图表区域（多选时显示） -->
            <template v-if="chartConfig.selectedTypes === 'mixed'">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>预约趋势</span>
                  </template>
                  <div ref="lineChart" style="height: 300px;"></div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>座位使用分布</span>
                  </template>
                  <div ref="pieChart" style="height: 300px;"></div>
                </el-card>
              </el-col>

              <el-col :span="24">
                <el-card>
                  <template #header>
                    <span>各时段使用热度</span>
                  </template>
                  <div ref="barChart" style="height: 350px;"></div>
                </el-card>
              </el-col>
            </template>
          </el-row>
        </template>
      </div>
    </el-card>

    <!-- 实时监控面板 -->
    <el-card class="monitor-card" v-if="isOnline">
      <template #header>
        <div class="card-header">
          <span>实时监控</span>
          <el-tag type="success">实时更新</el-tag>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="monitor-item">
            <div class="monitor-label">当前在线用户</div>
            <div class="monitor-value">{{ realtimeData.onlineUsers }}</div>
            <div class="monitor-trend">
              <el-icon v-if="realtimeData.userTrend === 'up'" color="#67c23a"><Top /></el-icon>
              <el-icon v-else-if="realtimeData.userTrend === 'down'" color="#f56c6c"><Bottom /></el-icon>
              <el-icon v-else><Right /></el-icon>
              <span class="trend-text">较昨日 {{ realtimeData.userChange }}%</span>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="monitor-item">
            <div class="monitor-label">座位使用率</div>
            <div class="monitor-value">{{ realtimeData.seatUtilization }}%</div>
            <div class="monitor-progress">
              <el-progress
                  :percentage="realtimeData.seatUtilization"
                  :color="getProgressColor(realtimeData.seatUtilization)"
                  :stroke-width="8"
              />
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="monitor-item">
            <div class="monitor-label">违规率</div>
            <div class="monitor-value">{{ realtimeData.violationRate }}%</div>
            <div class="monitor-trend">
              <el-icon v-if="realtimeData.violationTrend === 'down'" color="#67c23a"><Bottom /></el-icon>
              <el-icon v-else-if="realtimeData.violationTrend === 'up'" color="#f56c6c"><Top /></el-icon>
              <el-icon v-else><Right /></el-icon>
              <span class="trend-text">较上周 {{ realtimeData.violationChange }}%</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Connection,
  CloseBold,
  SuccessFilled,
  WarningFilled,
  User,
  Position,
  Calendar,
  Refresh,
  RefreshRight,
  Top,
  Bottom,
  Right
} from '@element-plus/icons-vue'

// 系统状态
const isOnline = ref(false)
const onlineLoading = ref(false)
const chartLoading = ref(false)
const hasChartData = ref(false)

// 图表实例
let mainChartInstance = null
let lineChartInstance = null
let pieChartInstance = null
let barChartInstance = null

// DOM 引用
const mainChart = ref(null)
const lineChart = ref(null)
const pieChart = ref(null)
const barChart = ref(null)

// 统计数据
const stats = reactive({
  totalUsers: 1568,
  totalSeats: 120,
  todayReservations: 89,
  utilizationRate: 74.2
})

// 实时数据
const realtimeData = reactive({
  onlineUsers: 45,
  userTrend: 'up',
  userChange: '+12.5',
  seatUtilization: 74,
  violationRate: 3.2,
  violationTrend: 'down',
  violationChange: '-1.8'
})

// 图表配置
const chartConfig = reactive({
  selectedTypes: 'line',
  dimension: 'daily',
  mainChartType: 'line'
})

// 计算属性
const chartTypes = computed(() => {
  if (chartConfig.selectedTypes === 'mixed') {
    return ['line', 'pie', 'bar']
  }
  return [chartConfig.selectedTypes]
})

// 方法
const goOnline = () => {
  onlineLoading.value = true

  // 模拟上线过程
  setTimeout(() => {
    isOnline.value = true
    onlineLoading.value = false

    // 自动加载实时数据
    loadRealtimeData()

    ElMessage.success('系统已上线，开始接收实时数据')

    // 自动请求图表数据
    setTimeout(() => {
      loadChartData()
    }, 1000)
  }, 1500)
}

const goOffline = () => {
  ElMessageBox.confirm('确定要将系统下线吗？这将停止所有数据更新。', '确认下线', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    isOnline.value = false
    hasChartData.value = false

    // 销毁图表实例
    destroyCharts()

    ElMessage.warning('系统已下线')
  }).catch(() => {})
}

const loadRealtimeData = () => {
  // 模拟实时数据更新
  const timer = setInterval(() => {
    if (!isOnline.value) {
      clearInterval(timer)
      return
    }

    // 随机更新实时数据
    realtimeData.onlineUsers = Math.max(20, Math.min(80,
        realtimeData.onlineUsers + Math.floor(Math.random() * 5) - 2
    ))

    realtimeData.seatUtilization = Math.max(60, Math.min(90,
        realtimeData.seatUtilization + Math.floor(Math.random() * 3) - 1
    ))

  }, 3000)

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
}

const loadChartData = () => {
  if (!isOnline.value) {
    ElMessage.warning('请先上线系统')
    return
  }

  chartLoading.value = true

  // 模拟数据请求
  setTimeout(() => {
    hasChartData.value = true

    // 初始化图表
    initCharts()

    chartLoading.value = false
    ElMessage.success('图表数据加载成功')
  }, 2000)
}

const resetCharts = () => {
  ElMessageBox.confirm('确定要重置所有图表吗？', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    destroyCharts()
    hasChartData.value = false
    chartConfig.selectedTypes = 'line'
    chartConfig.dimension = 'daily'
    chartConfig.mainChartType = 'line'

    ElMessage.info('图表已重置')
  }).catch(() => {})
}

const initCharts = () => {
  if (!hasChartData.value) return

  // 根据选择初始化图表
  if (chartConfig.selectedTypes === 'mixed') {
    initLineChart()
    initPieChart()
    initBarChart()
  } else {
    initMainChart()
  }
}

const initMainChart = () => {
  if (!mainChart.value) return

  mainChartInstance = echarts.init(mainChart.value)

  const option = generateChartOption(
      chartConfig.mainChartType,
      chartConfig.dimension
  )

  mainChartInstance.setOption(option)
}

const initLineChart = () => {
  if (!lineChart.value) return

  lineChartInstance = echarts.init(lineChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['预约数量', '实际使用']
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '预约数量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '实际使用',
        type: 'line',
        smooth: true,
        data: [110, 125, 95, 130, 85, 220, 200],
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }

  lineChartInstance.setOption(option)
}

const initPieChart = () => {
  if (!pieChart.value) return

  pieChartInstance = echarts.init(pieChart.value)

  const option = {
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
        },
        itemStyle: {
          color: function(params) {
            const colorList = ['#67c23a', '#409eff', '#e6a23c', '#909399']
            return colorList[params.dataIndex]
          }
        }
      }
    ]
  }

  pieChartInstance.setOption(option)
}

const initBarChart = () => {
  if (!barChart.value) return

  barChartInstance = echarts.init(barChart.value)

  const option = {
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

  barChartInstance.setOption(option)
}

const generateChartOption = (type, dimension) => {
  let xAxisData, seriesData, title

  // 根据维度生成不同的数据
  switch (dimension) {
    case 'weekly':
      xAxisData = ['第1周', '第2周', '第3周', '第4周', '第5周']
      seriesData = [320, 332, 301, 334, 390]
      title = '周数据统计'
      break
    case 'monthly':
      xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月']
      seriesData = [820, 932, 901, 934, 1290, 1330]
      title = '月数据统计'
      break
    default: // daily
      xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      seriesData = [120, 200, 150, 80, 70, 110, 130]
      title = '日数据统计'
  }

  switch (type) {
    case 'bar':
      return {
        title: {
          text: title,
          left: 'center'
        },
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
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数据',
          type: 'bar',
          data: seriesData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      }

    case 'pie':
      return {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: '数据分布',
          type: 'pie',
          radius: '50%',
          data: xAxisData.map((name, index) => ({
            name,
            value: seriesData[index]
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

    default: // line
      return {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
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
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数据',
          type: 'line',
          smooth: true,
          data: seriesData,
          itemStyle: {
            color: '#409eff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.6)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }]
      }
  }
}

const updateCharts = () => {
  if (!hasChartData.value) {
    ElMessage.info('请先请求图表数据')
    return
  }

  destroyCharts()

  // 给echarts时间重新初始化
  setTimeout(() => {
    initCharts()

    ElMessage.success(`已切换为${getChartTypeName(chartConfig.selectedTypes)}`)
  }, 100)
}

const updateMainChart = () => {
  if (mainChartInstance) {
    const option = generateChartOption(
        chartConfig.mainChartType,
        chartConfig.dimension
    )
    mainChartInstance.setOption(option)
  }
}

const destroyCharts = () => {
  if (mainChartInstance) {
    mainChartInstance.dispose()
    mainChartInstance = null
  }
  if (lineChartInstance) {
    lineChartInstance.dispose()
    lineChartInstance = null
  }
  if (pieChartInstance) {
    pieChartInstance.dispose()
    pieChartInstance = null
  }
  if (barChartInstance) {
    barChartInstance.dispose()
    barChartInstance = null
  }
}

const getChartTypeName = (type) => {
  const typeMap = {
    'line': '折线图',
    'bar': '柱状图',
    'pie': '饼状图',
    'mixed': '组合图表'
  }
  return typeMap[type] || type
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 处理窗口大小变化
const handleResize = () => {
  if (mainChartInstance) mainChartInstance.resize()
  if (lineChartInstance) lineChartInstance.resize()
  if (pieChartInstance) pieChartInstance.resize()
  if (barChartInstance) barChartInstance.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  destroyCharts()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.status-card,
.chart-config-card,
.monitor-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-controls,
.chart-controls {
  display: flex;
  gap: 10px;
}

.status-display {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.status-icon.online {
  background-color: #67c23a;
  color: white;
}

.status-icon.offline {
  background-color: #e6a23c;
  color: white;
}

.status-icon .el-icon {
  font-size: 24px;
}

.status-info {
  flex: 1;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
  color: #909399;
}

.chart-type-selector,
.chart-dimension-selector {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.selector-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.chart-display-area {
  margin-top: 20px;
}

.offline-message,
.no-data-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}

.main-chart-card {
  margin-bottom: 20px;
}

.monitor-item {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.monitor-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.monitor-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.monitor-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.trend-text {
  font-size: 12px;
  color: #666;
}

.monitor-progress {
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-display {
    flex-direction: column;
    align-items: center;
  }

  .status-item {
    width: 100%;
    max-width: 300px;
  }

  .chart-type-selector .el-radio-group {
    flex-wrap: wrap;
  }
}
</style>