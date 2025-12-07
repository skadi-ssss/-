<template>
  <div class="inspection-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>实地巡查</span>
          <div class="header-actions">
            <el-button type="primary" @click="startInspection">
              <el-icon><VideoPlay /></el-icon>
              开始巡查
            </el-button>
            <el-button type="warning" @click="pauseInspection" :disabled="!isInspecting">
              <el-icon><VideoPause /></el-icon>
              暂停巡查
            </el-button>
            <el-button type="danger" @click="endInspection" :disabled="!isInspecting">
              <el-icon><SwitchButton /></el-icon>
              结束巡查
            </el-button>
          </div>
        </div>
      </template>

      <!-- 巡查状态信息 -->
      <div class="inspection-status" v-if="isInspecting">
        <el-alert
            title="巡查进行中"
            type="success"
            :closable="false"
            show-icon
        >
          <template #description>
            <div class="status-info">
              <span>巡查员: {{ currentInspector }}</span>
              <span>开始时间: {{ inspectionStartTime }}</span>
              <span>已巡查: {{ inspectedCount }} 个座位</span>
              <span>发现违规: {{ violationCount }} 个</span>
            </div>
          </template>
        </el-alert>
      </div>

      <div class="content-wrapper">
        <!-- 左侧：座位地图 -->
        <div class="seat-map-container">
          <div class="map-header">
            <h3>自习室座位分布图</h3>
            <div class="map-legend">
              <div class="legend-item">
                <div class="color-box available"></div>
                <span>空闲</span>
              </div>
              <div class="legend-item">
                <div class="color-box reserved"></div>
                <span>已预约</span>
              </div>
              <div class="legend-item">
                <div class="color-box in-use"></div>
                <span>使用中</span>
              </div>
              <div class="legend-item">
                <div class="color-box violation"></div>
                <span>违规</span>
              </div>
            </div>
          </div>

          <div class="seat-map">
            <div class="area-section" v-for="area in seatAreas" :key="area.name">
              <h4>{{ area.name }}区</h4>
              <div class="seat-grid">
                <div
                    v-for="seat in area.seats"
                    :key="seat.id"
                    :class="['seat-item', getSeatClass(seat), { 'inspected': seat.inspected }]"
                    @click="handleSeatClick(seat)"
                >
                  <div class="seat-number">{{ seat.name }}</div>
                  <div class="seat-status">{{ getSeatStatusText(seat) }}</div>
                  <div class="seat-user" v-if="seat.user">
                    {{ seat.user.username }}
                  </div>
                  <div class="seat-time" v-if="seat.status === '1'">
                    预约: {{ seat.reservationTime }}
                  </div>
                  <div class="violation-indicator" v-if="seat.hasViolation">
                    <el-icon color="#f56c6c"><Warning /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：巡查信息 -->
        <div class="inspection-info-container">
          <el-card class="info-card">
            <template #header>
              <span>巡查信息</span>
            </template>

            <div class="inspection-stats">
              <div class="stat-item">
                <div class="stat-value">{{ totalSeats }}</div>
                <div class="stat-label">总座位数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ inspectedCount }}</div>
                <div class="stat-label">已巡查</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ violationCount }}</div>
                <div class="stat-label">违规发现</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ inspectionProgress }}%</div>
                <div class="stat-label">完成进度</div>
              </div>
            </div>

            <el-progress
                :percentage="inspectionProgress"
                :color="inspectionProgressColor"
                :stroke-width="10"
                style="margin: 20px 0;"
            />

            <div class="inspection-controls">
              <el-button
                  type="primary"
                  :icon="Clock"
                  @click="markCurrentSeatInspected"
                  :disabled="!currentSeat || !isInspecting"
              >
                标记已巡查
              </el-button>
              <el-button
                  type="danger"
                  :icon="Warning"
                  @click="handleReportViolation"
                  :disabled="!currentSeat || !isInspecting"
              >
                报告违规
              </el-button>
            </div>
          </el-card>

          <!-- 当前座位信息 -->
          <el-card class="info-card" v-if="currentSeat">
            <template #header>
              <span>当前座位信息</span>
            </template>

            <div class="seat-detail">
              <div class="detail-item">
                <span class="label">座位号:</span>
                <span class="value">{{ currentSeat.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">区域:</span>
                <span class="value">{{ currentSeat.area }}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态:</span>
                <span class="value">
                  <el-tag :type="getStatusTagType(currentSeat.status)" size="small">
                    {{ getSeatStatusText(currentSeat) }}
                  </el-tag>
                </span>
              </div>
              <div class="detail-item" v-if="currentSeat.user">
                <span class="label">当前用户:</span>
                <span class="value">{{ currentSeat.user.username }} ({{ currentSeat.user.studentId }})</span>
              </div>
              <div class="detail-item" v-if="currentSeat.reservationTime">
                <span class="label">预约时间:</span>
                <span class="value">{{ currentSeat.reservationTime }}</span>
              </div>
              <div class="detail-item" v-if="currentSeat.checkInTime">
                <span class="label">签到时间:</span>
                <span class="value">{{ currentSeat.checkInTime }}</span>
              </div>
              <div class="detail-item" v-if="currentSeat.duration">
                <span class="label">已使用:</span>
                <span class="value">{{ currentSeat.duration }} 分钟</span>
              </div>
            </div>
          </el-card>

          <!-- 最近巡查记录 -->
          <el-card class="info-card">
            <template #header>
              <span>最近巡查记录</span>
            </template>

            <div class="inspection-records">
              <el-timeline>
                <el-timeline-item
                    v-for="record in recentInspections"
                    :key="record.id"
                    :timestamp="record.time"
                    placement="top"
                >
                  <el-card shadow="hover">
                    <div class="record-content">
                      <div class="record-header">
                        <span class="seat-name">{{ record.seatName }}</span>
                        <el-tag
                            :type="record.hasViolation ? 'danger' : 'success'"
                            size="small"
                        >
                          {{ record.hasViolation ? '违规' : '正常' }}
                        </el-tag>
                      </div>
                      <div class="record-desc" v-if="record.description">
                        {{ record.description }}
                      </div>
                      <div class="record-footer">
                        <span class="inspector">巡查员: {{ record.inspector }}</span>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 报告违规对话框 -->
    <el-dialog
        v-model="violationDialogVisible"
        title="报告违规"
        width="600px"
    >
      <el-form
          ref="violationFormRef"
          :model="violationForm"
          :rules="violationRules"
          label-width="100px"
      >
        <el-form-item label="座位信息">
          <div class="form-static">
            {{ currentSeat?.name }} ({{ currentSeat?.area }}区)
          </div>
        </el-form-item>

        <el-form-item label="当前用户" v-if="currentSeat?.user">
          <div class="form-static">
            {{ currentSeat.user.username }} ({{ currentSeat.user.studentId }})
          </div>
        </el-form-item>

        <el-form-item label="违规类型" prop="type">
          <el-select
              v-model="violationForm.type"
              placeholder="请选择违规类型"
              style="width: 100%"
          >
            <el-option label="占座不来" value="1">
              <div class="violation-option">
                <div class="option-title">占座不来</div>
                <div class="option-desc">预约后未在规定时间内签到</div>
              </div>
            </el-option>
            <el-option label="超时未归" value="2">
              <div class="violation-option">
                <div class="option-title">超时未归</div>
                <div class="option-desc">临时离开超过30分钟未归</div>
              </div>
            </el-option>
            <el-option label="大声喧哗" value="3">
              <div class="violation-option">
                <div class="option-title">大声喧哗</div>
                <div class="option-desc">影响他人学习环境</div>
              </div>
            </el-option>
            <el-option label="未按规定就座" value="4">
              <div class="violation-option">
                <div class="option-title">未按规定就座</div>
                <div class="option-desc">未按照预约座位就座</div>
              </div>
            </el-option>
            <el-option label="其他违规" value="5">
              <div class="violation-option">
                <div class="option-title">其他违规</div>
                <div class="option-desc">其他违反自习室规定的行为</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="违规描述" prop="description">
          <el-input
              v-model="violationForm.description"
              type="textarea"
              :rows="3"
              placeholder="请详细描述违规情况"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="现场证据" prop="evidence">
          <el-upload
              class="upload-demo"
              action="#"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              multiple
              :limit="3"
              :on-exceed="handleExceed"
              :file-list="fileList"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                可上传现场照片作为证据，最多3张
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="处理措施">
          <div class="form-static">
            <div class="measure-item">
              <el-checkbox v-model="violationForm.releaseSeat" label="释放座位" />
              <span class="measure-desc">违规后立即释放该座位供其他用户使用</span>
            </div>
            <div class="measure-item">
              <el-checkbox v-model="violationForm.deductPoints" label="扣除信用分" />
              <el-input-number
                  v-model="violationForm.points"
                  :min="1"
                  :max="20"
                  :step="1"
                  size="small"
                  style="margin-left: 10px; width: 100px;"
              />
              <span class="measure-desc">分</span>
            </div>
            <div class="measure-item">
              <el-checkbox v-model="violationForm.addToBlacklist" label="加入黑名单" />
              <span class="measure-desc">该用户将被加入黑名单</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="是否通知用户" prop="notifyUser">
          <el-switch
              v-model="violationForm.notifyUser"
              active-text="是"
              inactive-text="否"
          />
          <div class="form-tip">违规处理结果将通过系统消息通知用户</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="violationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitViolationReport">提交报告</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Warning,
  VideoPlay,
  VideoPause,
  SwitchButton
} from '@element-plus/icons-vue'

const loading = ref(false)
const isInspecting = ref(false)
const violationDialogVisible = ref(false)
const violationFormRef = ref()
const currentSeat = ref(null)
const fileList = ref([])

const inspectionStartTime = ref('')
const currentInspector = ref('管理员A')
const inspectedCount = ref(0)
const violationCount = ref(0)

// 模拟座位数据
const seatAreas = ref([
  {
    name: 'A',
    seats: [
      { id: 1, name: 'A101', area: 'A', status: '0', inspected: false, hasViolation: false },
      { id: 2, name: 'A102', area: 'A', status: '1', inspected: true, hasViolation: false,
        user: { username: '张三', studentId: '2021001' }, reservationTime: '14:00', checkInTime: '14:05', duration: 45 },
      { id: 3, name: 'A103', area: 'A', status: '2', inspected: false, hasViolation: true,
        user: { username: '李四', studentId: '2021002' }, checkInTime: '13:30', duration: 90 },
      { id: 4, name: 'A104', area: 'A', status: '0', inspected: true, hasViolation: false },
      { id: 5, name: 'A105', area: 'A', status: '1', inspected: false, hasViolation: false },
    ]
  },
  {
    name: 'B',
    seats: [
      { id: 6, name: 'B101', area: 'B', status: '0', inspected: false, hasViolation: false },
      { id: 7, name: 'B102', area: 'B', status: '2', inspected: true, hasViolation: false,
        user: { username: '王五', studentId: '2021003' }, checkInTime: '12:00', duration: 150 },
      { id: 8, name: 'B103', area: 'B', status: '3', inspected: false, hasViolation: false },
      { id: 9, name: 'B104', area: 'B', status: '0', inspected: false, hasViolation: false },
      { id: 10, name: 'B105', area: 'B', status: '2', inspected: false, hasViolation: true,
        user: { username: '赵六', studentId: '2021004' }, checkInTime: '15:00', duration: 30 },
    ]
  }
])

// 最近巡查记录
const recentInspections = ref([
  {
    id: 1,
    seatName: 'A102',
    time: '15:30:00',
    hasViolation: false,
    inspector: '管理员A',
    description: '用户正常使用，无违规行为'
  },
  {
    id: 2,
    seatName: 'B103',
    time: '15:25:00',
    hasViolation: true,
    inspector: '管理员A',
    description: '发现占座不来违规，已登记处理'
  },
  {
    id: 3,
    seatName: 'A104',
    time: '15:20:00',
    hasViolation: false,
    inspector: '管理员A',
    description: '座位空闲，状态正常'
  }
])

const violationForm = reactive({
  type: '1',
  description: '',
  releaseSeat: true,
  deductPoints: true,
  points: 5,
  addToBlacklist: false,
  notifyUser: true
})

const violationRules = {
  type: [
    { required: true, message: '请选择违规类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入违规描述', trigger: 'blur' }
  ]
}

// 计算属性
const totalSeats = computed(() => {
  return seatAreas.value.reduce((total, area) => total + area.seats.length, 0)
})

const inspectionProgress = computed(() => {
  return totalSeats.value > 0 ? Math.round((inspectedCount.value / totalSeats.value) * 100) : 0
})

const inspectionProgressColor = computed(() => {
  if (inspectionProgress.value < 30) return '#f56c6c'
  if (inspectionProgress.value < 70) return '#e6a23c'
  return '#67c23a'
})

// 方法
const getSeatClass = (seat) => {
  const statusMap = {
    '0': 'available',
    '1': 'reserved',
    '2': 'in-use',
    '3': 'maintenance'
  }
  const baseClass = statusMap[seat.status] || 'unknown'

  if (seat.hasViolation) {
    return `${baseClass} violation`
  }

  return baseClass
}

const getSeatStatusText = (seat) => {
  const statusMap = {
    '0': '空闲',
    '1': '已预约',
    '2': '使用中',
    '3': '维护中'
  }
  return statusMap[seat.status] || '未知'
}

const getStatusTagType = (status) => {
  const statusMap = {
    '0': 'success',
    '1': 'primary',
    '2': 'info',
    '3': 'warning'
  }
  return statusMap[status] || 'info'
}

const startInspection = () => {
  isInspecting.value = true
  inspectionStartTime.value = new Date().toLocaleTimeString()
  inspectedCount.value = 0
  violationCount.value = 0

  ElMessage.success('巡查开始')
}

const pauseInspection = () => {
  isInspecting.value = false
  ElMessage.warning('巡查已暂停')
}

const endInspection = () => {
  ElMessageBox.confirm('确定要结束本次巡查吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    isInspecting.value = false

    // 生成巡查报告
    const report = {
      startTime: inspectionStartTime.value,
      endTime: new Date().toLocaleTimeString(),
      totalSeats: totalSeats.value,
      inspectedSeats: inspectedCount.value,
      violations: violationCount.value,
      completionRate: inspectionProgress.value
    }

    ElMessageBox.alert(
        `巡查完成！\n\n开始时间: ${report.startTime}\n结束时间: ${report.endTime}\n总座位数: ${report.totalSeats}\n已巡查: ${report.inspectedSeats}\n发现违规: ${report.violations}\n完成率: ${report.completionRate}%`,
        '巡查报告',
        {
          confirmButtonText: '确定',
          type: 'success'
        }
    )
  }).catch(() => {})
}

const handleSeatClick = (seat) => {
  currentSeat.value = seat
}

const markCurrentSeatInspected = () => {
  if (!currentSeat.value) return

  if (!currentSeat.value.inspected) {
    currentSeat.value.inspected = true
    inspectedCount.value++

    // 检查是否违规
    if (shouldMarkAsViolation(currentSeat.value)) {
      currentSeat.value.hasViolation = true
      violationCount.value++
      ElMessage.warning('发现疑似违规行为')
    } else {
      ElMessage.success('座位已标记为已巡查')
    }
  }
}

const shouldMarkAsViolation = (seat) => {
  // 判断是否违规的逻辑
  if (seat.status === '1') {
    // 已预约但检查发现没人（假设预约超过30分钟未签到算违规）
    const reservationTime = new Date(`2024-01-15 ${seat.reservationTime}`)
    const now = new Date()
    const diffMinutes = (now - reservationTime) / (1000 * 60)

    return diffMinutes > 30
  }

  return false
}

const handleReportViolation = () => {
  if (!currentSeat.value) return

  violationDialogVisible.value = true

  // 根据座位状态预填违规信息
  if (currentSeat.value.status === '1') {
    violationForm.type = '1' // 占座不来
    violationForm.description = `座位${currentSeat.value.name}已预约但用户未在规定时间内到场`
  } else if (currentSeat.value.status === '2' && !currentSeat.value.user) {
    violationForm.type = '4' // 未按规定就座
    violationForm.description = `座位${currentSeat.value.name}有使用者但无预约记录`
  }
}

const submitViolationReport = async () => {
  try {
    await violationFormRef.value.validate()

    // 模拟提交违规报告
    ElMessageBox.confirm('确定要提交违规报告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      loading.value = true

      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 更新座位状态
      if (currentSeat.value) {
        currentSeat.value.hasViolation = true
        violationCount.value++

        if (violationForm.releaseSeat) {
          currentSeat.value.status = '0' // 释放座位
          currentSeat.value.user = null
          currentSeat.value.checkInTime = null
          currentSeat.value.duration = null
        }
      }

      // 添加巡查记录
      recentInspections.value.unshift({
        id: recentInspections.value.length + 1,
        seatName: currentSeat.value?.name || '未知',
        time: new Date().toLocaleTimeString(),
        hasViolation: true,
        inspector: currentInspector.value,
        description: violationForm.description
      })

      ElMessage.success('违规报告提交成功')
      violationDialogVisible.value = false

      // 重置表单
      violationFormRef.value?.resetFields()
      fileList.value = []
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePreview = (file) => {
  console.log('预览文件:', file)
}

const handleRemove = (file) => {
  console.log('移除文件:', file)
}

const beforeRemove = () => {
  return ElMessageBox.confirm('确定要移除该文件吗？', '提示', {
    type: 'warning'
  })
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传3个文件')
}

onMounted(() => {
  // 初始化已巡查数量
  inspectedCount.value = seatAreas.value.flatMap(area => area.seats).filter(seat => seat.inspected).length
  violationCount.value = seatAreas.value.flatMap(area => area.seats).filter(seat => seat.hasViolation).length
})
</script>

<style scoped>
.inspection-container {
  padding: 20px;
}

.main-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.inspection-status {
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.status-info span {
  padding: 4px 8px;
  background-color: #f0f9ff;
  border-radius: 4px;
  font-size: 14px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.seat-map-container {
  flex: 3;
  min-width: 0;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.map-header h3 {
  margin: 0;
  color: #333;
}

.map-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
}

.color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.color-box.available {
  background-color: #67c23a;
}

.color-box.reserved {
  background-color: #409eff;
}

.color-box.in-use {
  background-color: #e6a23c;
}

.color-box.violation {
  background-color: #f56c6c;
}

.area-section {
  margin-bottom: 30px;
}

.area-section h4 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-weight: 600;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.seat-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  background-color: #fff;
}

.seat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.seat-item.available {
  border-left: 4px solid #67c23a;
}

.seat-item.reserved {
  border-left: 4px solid #409eff;
}

.seat-item.in-use {
  border-left: 4px solid #e6a23c;
}

.seat-item.maintenance {
  border-left: 4px solid #909399;
}

.seat-item.violation {
  border-left: 4px solid #f56c6c;
  animation: pulse 2s infinite;
}

.seat-item.inspected {
  opacity: 0.7;
}

.seat-item.inspected::after {
  content: '✓';
  position: absolute;
  top: 5px;
  right: 5px;
  color: #67c23a;
  font-weight: bold;
}

.seat-number {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
}

.seat-status {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.seat-user {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.seat-time {
  font-size: 12px;
  color: #999;
}

.violation-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.inspection-info-container {
  flex: 1;
  min-width: 300px;
}

.info-card {
  margin-bottom: 20px;
}

.inspection-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.inspection-controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.seat-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #666;
  font-size: 14px;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.inspection-records {
  max-height: 300px;
  overflow-y: auto;
}

.record-content {
  padding: 10px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.seat-name {
  font-weight: bold;
  color: #333;
}

.record-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.record-footer {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.violation-option {
  padding: 5px 0;
}

.option-title {
  font-weight: bold;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 12px;
  color: #666;
}

.form-static {
  padding: 8px 0;
  color: #333;
}

.measure-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.measure-desc {
  margin-left: 10px;
  font-size: 12px;
  color: #666;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}
</style>