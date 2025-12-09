<template>
  <div class="room-detail-container">
    <!-- 返回按钮和标题 -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        ← 返回列表
      </button>
      <h1 class="room-title">{{ room.name }}</h1>
      <div class="room-subtitle">
        <span class="room-location">📍 {{ room.location }}</span>
        <span :class="['room-status', `status-${room.status}`]">
          {{ getStatusText(room.status) }}
        </span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-main">
      <!-- 左侧：自习室信息和座位图 -->
      <div class="left-column">
        <!-- 座位图 -->
        <div class="seat-map-section">
          <div class="section-header">
            <h2>座位选择</h2>
            <div class="legend">
              <div class="legend-item">
                <div class="seat-icon available"></div>
                <span>可用</span>
              </div>
              <div class="legend-item">
                <div class="seat-icon selected"></div>
                <span>已选</span>
              </div>
              <div class="legend-item">
                <div class="seat-icon reserved"></div>
                <span>已预约</span>
              </div>
            </div>
          </div>

          <div class="seat-map">
            <!-- 模拟座位布局 -->
            <div class="room-layout">
              <!-- 入口标识 -->
              <div class="entrance">🚪 入口</div>

              <!-- 座位网格 -->
              <div class="seats-grid">
                <div
                    v-for="seat in seats"
                    :key="seat.id"
                    :class="[
                    'seat-item',
                    `seat-${seat.status}`,
                    { 'seat-selected': selectedSeats.includes(seat.id) }
                  ]"
                    @click="toggleSeatSelection(seat)"
                    :title="`座位 ${seat.number} - ${getSeatStatusText(seat.status)}`"
                >
                  <div class="seat-number">{{ seat.number }}</div>
                  <div class="seat-status-indicator"></div>
                </div>
              </div>

              <!-- 窗户侧 -->
              <div class="window-side">🪟 窗户</div>
            </div>
          </div>

          <div class="selected-seats-info" v-if="selectedSeats.length > 0">
            <h3>已选座位：</h3>
            <div class="selected-seats-list">
              <span
                  v-for="seatId in selectedSeats"
                  :key="seatId"
                  class="selected-seat-tag"
              >
                座位 {{ getSeatNumber(seatId) }}
                <button
                    class="remove-seat-btn"
                    @click.stop="removeSeat(seatId)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- 自习室信息 -->
        <div class="room-info-section">
          <h2>自习室信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">总座位数</div>
              <div class="info-value">{{ room.capacity }} 个</div>
            </div>
            <div class="info-item">
              <div class="info-label">可用座位</div>
              <div class="info-value">{{ room.availableSeats }} 个</div>
            </div>
            <div class="info-item">
              <div class="info-label">开放时间</div>
              <div class="info-value">{{ room.openTime }} - {{ room.closeTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">当前时段</div>
              <div class="info-value">{{ currentTimeSlot }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预约表单 -->
      <div class="right-column">
        <div class="reservation-form">
          <h2>预约信息</h2>

          <!-- 用户信息（已登录时显示） -->
          <div class="user-info" v-if="user">
            <div class="user-info-item">
              <span class="label">预约人：</span>
              <span class="value">{{ user.name }}</span>
            </div>
            <div class="user-info-item">
              <span class="label">学号/工号：</span>
              <span class="value">{{ user.id }}</span>
            </div>
          </div>

          <!-- 预约时间选择 -->
          <div class="form-section">
            <h3>选择预约时间</h3>
            <div class="time-selection">
              <div class="date-picker">
                <label>预约日期：</label>
                <input
                    type="date"
                    v-model="reservationDate"
                    :min="minDate"
                    :max="maxDate"
                    class="date-input"
                />
              </div>

              <div class="time-slots">
                <label>选择时段：</label>
                <div class="slot-grid">
                  <button
                      v-for="slot in timeSlots"
                      :key="slot.id"
                      :class="[
                      'time-slot-btn',
                      { 'selected': selectedTimeSlot === slot.id },
                      { 'disabled': !slot.available }
                    ]"
                      @click="selectTimeSlot(slot)"
                      :disabled="!slot.available"
                  >
                    <div class="slot-time">{{ slot.time }}</div>
                    <div class="slot-availability">{{ slot.seatsAvailable }} 座可用</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 预约时长 -->
          <div class="form-section">
            <h3>预约时长</h3>
            <div class="duration-selection">
              <button
                  v-for="duration in durationOptions"
                  :key="duration.value"
                  :class="[
                  'duration-btn',
                  { 'selected': selectedDuration === duration.value }
                ]"
                  @click="selectedDuration = duration.value"
              >
                {{ duration.label }}
              </button>
            </div>
          </div>

          <!-- 特殊需求 -->
          <div class="form-section">
            <h3>特殊需求（可选）</h3>
            <textarea
                v-model="specialRequirements"
                placeholder="请输入您的特殊需求，如需要电源插座、安静区域等..."
                class="requirements-input"
                rows="3"
            ></textarea>
          </div>

          <!-- 预约规则 -->
          <div class="rules-section">
            <h3>预约规则</h3>
            <ul class="rules-list">
              <li>请准时到达自习室，迟到15分钟以上预约将自动取消</li>
              <li>如需取消预约，请至少提前1小时操作</li>
              <li>请保持自习室整洁，离开时带走个人物品</li>
              <li>禁止在自习室内饮食（饮用水除外）</li>
              <li>请将手机调至静音模式，避免影响他人</li>
            </ul>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button
                class="submit-btn"
                :class="{ 'disabled': !canSubmit }"
                @click="submitReservation"
                :disabled="!canSubmit"
            >
              确认预约
            </button>
            <p class="form-note" v-if="selectedSeats.length > 0">
              您选择了 {{ selectedSeats.length }} 个座位，预约总时长 {{ selectedDuration }} 小时
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 将 roomId 定义为 ref
const roomId = ref(parseInt(route.params.id) || 1)

// 自习室数据
const room = ref({
  id: roomId.value,
  name: '',
  location: '',
  capacity: 0,
  availableSeats: 0,
  status: 'available',
  openTime: '08:00',
  closeTime: '22:00'
})

// 座位数据
const seats = ref([])

// 用户数据（模拟）
const user = ref({
  name: '张三',
  id: '20230001',
  role: 'student'
})

// 选中的座位
const selectedSeats = ref([])

// 预约表单数据
const reservationDate = ref('')
const selectedTimeSlot = ref('')
const selectedDuration = ref(2)
const specialRequirements = ref('')

// 可用时间段
const timeSlots = ref([
  { id: 'morning', time: '08:00-12:00', seatsAvailable: 15, available: true },
  { id: 'afternoon', time: '12:00-16:00', seatsAvailable: 8, available: true },
  { id: 'evening', time: '16:00-20:00', seatsAvailable: 5, available: true },
  { id: 'night', time: '20:00-22:00', seatsAvailable: 0, available: false }
])

// 预约时长选项
const durationOptions = ref([
  { label: '1小时', value: 1 },
  { label: '2小时', value: 2 },
  { label: '3小时', value: 3 },
  { label: '4小时', value: 4 }
])

// 计算属性
const currentTimeSlot = computed(() => {
  const now = new Date()
  const hour = now.getHours()
  if (hour < 12) return '上午'
  if (hour < 16) return '下午'
  return '晚上'
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return nextWeek.toISOString().split('T')[0]
})

const canSubmit = computed(() => {
  return (
      selectedSeats.value.length > 0 &&
      reservationDate.value &&
      selectedTimeSlot.value &&
      selectedDuration.value > 0
  )
})

// 方法
const goBack = () => {
  router.push('/')
}

const getStatusText = (status) => {
  const statusMap = {
    'available': '可预约',
    'limited': '余位紧张',
    'full': '已满'
  }
  return statusMap[status] || '未知状态'
}

const getSeatStatusText = (status) => {
  const statusMap = {
    'available': '可用',
    'reserved': '已预约',
    'maintenance': '维护中'
  }
  return statusMap[status] || '未知'
}

const toggleSeatSelection = (seat) => {
  if (seat.status !== 'available') return

  const index = selectedSeats.value.indexOf(seat.id)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  } else {
    // 限制最多选择2个座位
    if (selectedSeats.value.length < 2) {
      selectedSeats.value.push(seat.id)
    } else {
      alert('最多只能选择2个座位')
    }
  }
}

const removeSeat = (seatId) => {
  const index = selectedSeats.value.indexOf(seatId)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  }
}

const getSeatNumber = (seatId) => {
  const seat = seats.value.find(s => s.id === seatId)
  return seat ? seat.number : ''
}

const selectTimeSlot = (slot) => {
  if (slot.available) {
    selectedTimeSlot.value = slot.id
  }
}

const submitReservation = async () => {
  if (!canSubmit.value) return

  try {
    // 模拟API调用
    const reservationData = {
      roomId: room.value.id,
      seatIds: selectedSeats.value,
      date: reservationDate.value,
      timeSlot: selectedTimeSlot.value,
      duration: selectedDuration.value,
      requirements: specialRequirements.value,
      userId: user.value.id
    }

    console.log('提交预约数据:', reservationData)

    // 模拟成功提交
    alert('预约成功！请准时到达自习室。')

    // 跳转到我的预约页面
    router.push({ name: 'StudentReservation' })

  } catch (error) {
    console.error('预约失败:', error)
    alert('预约失败，请重试')
  }
}

// 初始化数据
const initializeData = () => {
  // 根据roomId.value获取自习室数据
  const mockRooms = {
    1: { name: '静思轩', location: '图书馆三楼 A区', capacity: 60, availableSeats: 25, status: 'available' },
    2: { name: '博学阁', location: '教学楼二楼 201室', capacity: 40, availableSeats: 5, status: 'limited' },
    3: { name: '致远堂', location: '学生活动中心一楼', capacity: 80, availableSeats: 0, status: 'full' },
    4: { name: '明德厅', location: '图书馆一楼 B区', capacity: 50, availableSeats: 32, status: 'available' },
    5: { name: '思源室', location: '工程楼三楼 305室', capacity: 30, availableSeats: 12, status: 'available' },
    6: { name: '文渊阁', location: '人文楼四楼 410室', capacity: 45, availableSeats: 3, status: 'limited' }
  }

  // 使用 roomId.value 而不是 roomId
  room.value = {
    ...room.value,
    id: roomId.value,
    ...(mockRooms[roomId.value] || mockRooms[1])
  }

  // 生成座位数据（模拟生成，后续需要接入接口）
  const seatCount = room.value.capacity
  seats.value = Array.from({ length: seatCount }, (_, i) => ({
    id: i + 1,
    number: `A${String(i + 1).padStart(2, '0')}`,
    status: Math.random() > 0.3 ? 'available' :
        Math.random() > 0.7 ? 'maintenance' : 'reserved',
    row: Math.floor(i / 10) + 1,
    column: (i % 10) + 1
  }))

  // 设置默认预约日期为明天
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  reservationDate.value = tomorrow.toISOString().split('T')[0]
}

// 监听route.params.id变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    roomId.value = parseInt(newId)
    initializeData()
  }
})

// 生命周期钩子
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.room-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部样式 */
.detail-header {
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4a5568;
  transition: all 0.2s;
  margin-bottom: 15px;
}

.back-btn:hover {
  background-color: #e8f4fc;
  border-color: #3498db;
  color: #3498db;
}

.room-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.room-subtitle {
  display: flex;
  align-items: center;
  gap: 20px;
}

.room-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.room-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-available {
  background-color: #e8f6ef;
  color: #27ae60;
}

.status-limited {
  background-color: #fef9e7;
  color: #f39c12;
}

.status-full {
  background-color: #fdedec;
  color: #e74c3c;
}

/* 主要内容区域 */
.detail-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 1024px) {
  .detail-main {
    grid-template-columns: 1fr;
  }
}

/* 左侧列样式 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 座位图区域 */
.seat-map-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
}

.seat-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.seat-icon.available {
  background-color: #e8f6ef;
  border-color: #27ae60;
}

.seat-icon.selected {
  background-color: #3498db;
  border-color: #2980b9;
}

.seat-icon.reserved {
  background-color: #fdedec;
  border-color: #e74c3c;
}

/* 座位图 */
.seat-map {
  margin: 20px 0;
}

.room-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.entrance, .window-side {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  color: #7f8c8d;
  font-weight: 600;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  min-height: 400px;
}

.seat-item {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 2px solid transparent;
}

.seat-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.seat-available {
  background-color: #e8f6ef;
  border-color: #27ae60;
}

.seat-reserved {
  background-color: #fdedec;
  border-color: #e74c3c;
  cursor: not-allowed;
}

.seat-maintenance {
  background-color: #fef9e7;
  border-color: #f39c12;
  cursor: not-allowed;
}

.seat-selected {
  background-color: #3498db !important;
  border-color: #2980b9 !important;
  color: white;
}

.seat-number {
  font-size: 0.8rem;
  font-weight: 600;
}

.seat-status-indicator {
  position: absolute;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.seat-available .seat-status-indicator {
  background-color: #27ae60;
}

.seat-reserved .seat-status-indicator {
  background-color: #e74c3c;
}

.seat-maintenance .seat-status-indicator {
  background-color: #f39c12;
}

.seat-selected .seat-status-indicator {
  background-color: white;
}

/* 已选座位信息 */
.selected-seats-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f7ff;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.selected-seats-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.selected-seats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-seat-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: white;
  border-radius: 20px;
  font-weight: 600;
  color: #3498db;
  border: 1px solid #3498db;
}

.remove-seat-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background-color: #f1f5f9;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
}

.remove-seat-btn:hover {
  background-color: #e74c3c;
  color: white;
}

/* 自习室信息 */
.room-info-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.room-info-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

/* 右侧预约表单 */
.right-column {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.reservation-form {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
}

.reservation-form h2 {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  text-align: center;
}

/* 用户信息 */
.user-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.user-info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-info-item:last-child {
  margin-bottom: 0;
}

.user-info-item .label {
  color: #7f8c8d;
}

.user-info-item .value {
  font-weight: 600;
  color: #2c3e50;
}

/* 表单区域 */
.form-section {
  margin-bottom: 25px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

/* 时间选择 */
.time-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-input {
  padding: 10px 14px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.time-slots label {
  display: block;
  margin-bottom: 10px;
  color: #4a5568;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.time-slot-btn {
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.time-slot-btn:hover:not(.disabled) {
  border-color: #3498db;
  background-color: #f0f7ff;
}

.time-slot-btn.selected {
  background-color: #3498db;
  border-color: #2980b9;
  color: white;
}

.time-slot-btn.disabled {
  background-color: #f5f5f5;
  border-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.slot-time {
  font-weight: 600;
  margin-bottom: 4px;
}

.slot-availability {
  font-size: 0.8rem;
}

/* 时长选择 */
.duration-selection {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.duration-btn {
  flex: 1;
  min-width: 80px;
  padding: 10px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-btn:hover {
  border-color: #3498db;
  background-color: #f0f7ff;
}

.duration-btn.selected {
  background-color: #3498db;
  border-color: #2980b9;
  color: white;
}

/* 特殊需求 */
.requirements-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
}

.requirements-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* 规则 */
.rules-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.rules-section h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 0.9rem;
}

.rules-list li {
  margin-bottom: 5px;
}

.rules-list li:last-child {
  margin-bottom: 0;
}

/* 表单操作 */
.form-actions {
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(.disabled) {
  background-color: #2980b9;
}

.submit-btn.disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.form-note {
  margin: 10px 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-detail-container {
    padding: 15px;
  }

  .room-title {
    font-size: 1.8rem;
  }

  .room-subtitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .seats-grid {
    grid-template-columns: repeat(5, 1fr);
    padding: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .slot-grid {
    grid-template-columns: 1fr;
  }

  .duration-selection {
    flex-direction: column;
  }
}
</style>