<template>
  <div class="analysis-container">
    <!-- 数据统计控制面板 -->
    <el-card class="control-panel">
      <template #header>
        <div class="panel-header">
          <span>数据分析控制面板</span>
          <div class="panel-actions">
            <el-button
                type="primary"
                @click="refreshAllData"
                :loading="loading.all"
            >
              <el-icon><Refresh /></el-icon>
              刷新所有数据
            </el-button>
          </div>
        </div>
      </template>

      <div class="panel-content">
        <div class="data-source-selector">
          <div class="selector-title">数据源选择：</div>
          <el-radio-group v-model="dataSource" @change="handleDataSourceChange">
            <el-radio-button label="realtime">实时数据</el-radio-button>
            <el-radio-button label="historical">历史数据</el-radio-button>
            <el-radio-button label="prediction">预测数据</el-radio-button>
          </el-radio-group>
        </div>

        <div class="time-range-selector">
          <div class="selector-title">时间范围：</div>
          <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled="dataSource === 'realtime'"
              @change="handleTimeRangeChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-trend">
              <el-tag :type="stats.trend.users > 0 ? 'success' : 'danger'" size="small">
                {{ stats.trend.users > 0 ? '+' : '' }}{{ stats.trend.users }}%
              </el-tag>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon><Position /></el-icon>
            </div>
            <div class="stat-trend">
              <el-tag :type="stats.trend.seats > 0 ? 'success' : 'danger'" size="small">
                {{ stats.trend.seats > 0 ? '+' : '' }}{{ stats.trend.seats }}%
              </el-tag>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalSeats }}</div>
            <div class="stat-label">总座位数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-trend">
              <el-tag :type="stats.trend.reservations > 0 ? 'success' : 'danger'" size="small">
                {{ stats.trend.reservations > 0 ? '+' : '' }}{{ stats.trend.reservations }}%
              </el-tag>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayReservations }}</div>
            <div class="stat-label">今日预约</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-trend">
              <el-tag :type="stats.trend.utilization > 0 ? 'success' : 'danger'" size="small">
                {{ stats.trend.utilization > 0 ? '+' : '' }}{{ stats.trend.utilization }}%
              </el-tag>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.utilizationRate }}%</div>
            <div class="stat-label">使用率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表配置区域 -->
    <el-row :gutter="20" class="chart-config-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="chart-config-header">
              <span>图表配置</span>
              <div class="chart-actions">
                <el-button
                    type="primary"
                    size="small"
                    @click="generateCharts"
                    :loading="loading.charts"
                >
                  生成图表
                </el-button>
              </div>
            </div>
          </template>

          <div class="chart-config-content">
            <div class="chart-type-selection">
              <div class="selection-title">选择要生成的图表类型：</div>
              <el-checkbox-group v-model="selectedChartTypes">
                <el-checkbox label="line">折线图</el-checkbox>
                <el-checkbox label="bar">柱状图</el-checkbox>
                <el-checkbox label="pie">饼状图</el-checkbox>
              </el-checkbox-group>
            </div>

            <div class="chart-options">
              <el-form :inline="true" :model="chartOptions">
                <el-form-item label="数据维度">
                  <el-select v-model="chartOptions.dimension" placeholder="选择维度">
                    <el-option label="按日统计" value="daily" />
                    <el-option label="按周统计" value="weekly" />
                    <el-option label="按月统计" value="monthly" />
                  </el-select>
                </el-form-item>

                <el-form-item label="图表主题">
                  <el-select v-model="chartOptions.theme" placeholder="选择主题">
                    <el-option label="默认主题" value="default" />
                    <el-option label="深色主题" value="dark" />
                    <el-option label="简约主题" value="simple" />
                  </el-select>
                </el-form-item>

                <el-form-item label="显示网格">
                  <el-switch v-model="chartOptions.showGrid" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表显示区域 -->
    <div class="charts-display-area">
      <div v-if="!hasCharts" class="no-charts-message">
        <el-empty description="请选择图表类型并点击生成图表按钮">
          <el-button type="primary" @click="generateCharts">生成图表</el-button>
        </el-empty>
      </div>

      <el-row :gutter="20" class="charts-row" v-else>
        <!-- 折线图 -->
        <el-col :span="12" v-if="selectedChartTypes.includes('line')">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>预约趋势分析</span>
                <el-button
                    type="text"
                    @click="exportChart('line')"
                    size="small"
                >
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </template>
            <div ref="lineChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>

        <!-- 饼状图 -->
        <el-col :span="12" v-if="selectedChartTypes.includes('pie')">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>使用情况分布</span>
                <el-button
                    type="text"
                    @click="exportChart('pie')"
                    size="small"
                >
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </template>
            <div ref="pieChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>

        <!-- 柱状图 -->
        <el-col :span="24" v-if="selectedChartTypes.includes('bar')">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>各时段使用热度</span>
                <el-button
                    type="text"
                    @click="exportChart('bar')"
                    size="small"
                >
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </template>
            <div ref="barChartRef" style="height: 350px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { chartDataService } from '@/services/chartData'
import {
  Refresh,
  User,
  Position,
  Calendar,
  Clock,
  Download
} from '@element-plus/icons-vue'

// 数据源
const dataSource = ref('realtime')
const timeRange = ref([])

// 加载状态
const loading = reactive({
  all: false,
  stats: false,
  charts: false
})

// 统计数据
const stats = reactive({
  totalUsers: 1568,
  totalSeats: 120,
  todayReservations: 89,
  utilizationRate: 74.2,
  trend: {
    users: 12.5,
    seats: 5.3,
    reservations: -3.2,
    utilization: 8.7
  }
})

// 图表配置
const selectedChartTypes = ref(['line', 'bar', 'pie'])
const chartOptions = reactive({
  dimension: 'daily',
  theme: 'default',
  showGrid: true
})

// 图表实例和引用
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
let lineChartInstance = null
let pieChartInstance = null
let barChartInstance = null

// 计算属性
const hasCharts = ref(false)

// 方法
const handleDataSourceChange = (value) => {
  ElMessage.info(`已切换为${getDataSourceName(value)}`)
  refreshAllData()
}

const handleTimeRangeChange = () => {
  if (timeRange.value && timeRange.value.length === 2) {
    refreshAllData()
  }
}

const getDataSourceName = (value) => {
  const nameMap = {
    realtime: '实时数据',
    historical: '历史数据',
    prediction: '预测数据'
  }
  return nameMap[value] || value
}

const refreshAllData = async () => {
  loading.all = true

  try {
    // 并发获取所有数据
    await Promise.all([
      loadStatsData(),
      loadChartsData()
    ])

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('数据刷新失败:', error)
  } finally {
    loading.all = false
  }
}

const loadStatsData = async () => {
  loading.stats = true

  try {
    const data = await chartDataService.getStats()

    Object.assign(stats, {
      totalUsers: data.totalUsers,
      totalSeats: data.totalSeats,
      todayReservations: data.todayReservations,
      utilizationRate: data.utilizationRate
    })
  } finally {
    loading.stats = false
  }
}

const loadChartsData = async () => {
  // 加载图表数据
  if (selectedChartTypes.value.length > 0) {
    await generateCharts()
  }
}

const generateCharts = async () => {
  if (selectedChartTypes.value.length === 0) {
    ElMessage.warning('请至少选择一个图表类型')
    return
  }

  loading.charts = true
  hasCharts.value = true

  try {
    // 销毁现有图表
    destroyCharts()

    // 等待DOM更新
    await nextTick()

    // 生成选中的图表
    if (selectedChartTypes.value.includes('line')) {
      await initLineChart()
    }

    if (selectedChartTypes.value.includes('pie')) {
      await initPieChart()
    }

    if (selectedChartTypes.value.includes('bar')) {
      await initBarChart()
    }

    ElMessage.success('图表生成成功')
  } catch (error) {
    ElMessage.error('图表生成失败')
    console.error('图表生成失败:', error)
  } finally {
    loading.charts = false
  }
}

const initLineChart = async () => {
  if (!lineChartRef.value) return

  // 获取数据
  const data = await chartDataService.getLineData(chartOptions.dimension)

  // 初始化图表
  lineChartInstance = echarts.init(lineChartRef.value)

  const option = {
    title: {
      text: data.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: data.series.map(s => s.name),
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
      show: chartOptions.showGrid
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: data.series.map((item, index) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
      itemStyle: {
        color: index === 0 ? '#409eff' : '#67c23a'
      },
      areaStyle: index === 0 ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      } : undefined
    }))
  }

  lineChartInstance.setOption(option)
}

const initPieChart = async () => {
  if (!pieChartRef.value) return

  // 获取数据
  const data = await chartDataService.getPieData(chartOptions.dimension)

  // 初始化图表
  pieChartInstance = echarts.init(pieChartRef.value)

  const option = {
    title: {
      text: data.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 30
    },
    series: [
      {
        name: data.title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.series
      }
    ]
  }

  pieChartInstance.setOption(option)
}

const initBarChart = async () => {
  if (!barChartRef.value) return

  // 获取数据
  const data = await chartDataService.getBarData(chartOptions.dimension)

  // 初始化图表
  barChartInstance = echarts.init(barChartRef.value)

  const option = {
    title: {
      text: data.title,
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
      top: '15%',
      containLabel: true,
      show: chartOptions.showGrid
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: data.series[0].name
    },
    series: [
      {
        name: data.series[0].name,
        type: 'bar',
        barWidth: '60%',
        data: data.series[0].data,
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

const exportChart = (type) => {
  let chartInstance = null
  let fileName = ''

  switch (type) {
    case 'line':
      chartInstance = lineChartInstance
      fileName = '预约趋势分析图.png'
      break
    case 'pie':
      chartInstance = pieChartInstance
      fileName = '使用情况分布图.png'
      break
    case 'bar':
      chartInstance = barChartInstance
      fileName = '各时段使用热度图.png'
      break
  }

  if (chartInstance) {
    const imgUrl = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })

    const link = document.createElement('a')
    link.href = imgUrl
    link.download = fileName
    link.click()

    ElMessage.success('图表导出成功')
  }
}

const destroyCharts = () => {
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

// 处理窗口大小变化
const handleResize = () => {
  if (lineChartInstance) lineChartInstance.resize()
  if (pieChartInstance) pieChartInstance.resize()
  if (barChartInstance) barChartInstance.resize()
}

// 初始化
onMounted(() => {
  window.addEventListener('resize', handleResize)

  // 初始化时加载数据
  refreshAllData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  destroyCharts()
})
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.control-panel {
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-content {
  padding: 15px 0;
}

.data-source-selector,
.time-range-selector {
  margin-bottom: 15px;
}

.selector-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 20px;
  color: white;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-config-row {
  margin-bottom: 20px;
}

.chart-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-config-content {
  padding: 10px 0;
}

.chart-type-selection {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.selection-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.chart-options {
  padding: 10px 0;
}

.charts-display-area {
  margin-top: 20px;
}

.no-charts-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-cards .el-col {
    margin-bottom: 15px;
  }

  .chart-config-content .el-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-config-content .el-form-item {
    margin-bottom: 10px;
  }
}
</style>