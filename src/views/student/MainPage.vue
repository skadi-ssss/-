<template>
  <div class="study-room-container">
    <!-- 页面标题和搜索栏 -->
    <header class="page-header">
      <h1>自习室预约</h1>
      <p class="page-subtitle">选择您想要预约的自习室</p>

      <div class="search-filter-section">
        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索自习室名称或位置..."
              class="search-input"
          />
        </div>

        <div class="filter-options">
          <div class="filter-group">
            <label class="filter-label">状态筛选:</label>
            <div class="filter-buttons">
              <button
                  v-for="status in statusFilters"
                  :key="status.id"
                  :class="['status-filter-btn', { active: activeStatusFilter === status.id }]"
                  @click="setStatusFilter(status.id)"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">排序方式:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="name">名称</option>
              <option value="capacity">容量</option>
              <option value="available">可用座位</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <!-- 自习室列表 -->
    <main class="main-content">
      <div v-if="filteredStudyRooms.length === 0" class="no-results">
        <i class="no-results-icon">📚</i>
        <p>未找到匹配的自习室</p>
        <button @click="resetFilters" class="reset-btn">重置筛选条件</button>
      </div>

      <div v-else class="study-room-grid">
        <div
            v-for="room in filteredStudyRooms"
            :key="room.id"
            class="study-room-card"
            @click="goToRoomDetail(room.id)"
        >
          <div class="card-header">
            <div class="room-name-section">
              <h3 class="room-name">{{ room.name }}</h3>
              <span :class="['room-status', `status-${room.status}`]">
                {{ getStatusText(room.status) }}
              </span>
            </div>
            <div class="room-location">
              <i class="location-icon">📍</i>
              <span>{{ room.location }}</span>
            </div>
          </div>

          <div class="card-content">
            <div class="room-capacity">
              <div class="capacity-info">
                <i class="capacity-icon">🪑</i>
                <div class="capacity-text">
                  <span class="capacity-label">总容量</span>
                  <span class="capacity-value">{{ room.capacity }} 座位</span>
                </div>
              </div>
              <div class="availability-info">
                <i class="availability-icon">✅</i>
                <div class="availability-text">
                  <span class="availability-label">可用座位</span>
                  <span class="availability-value">{{ room.availableSeats }} 个</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="room-hours">
              <i class="hours-icon">🕐</i>
              <span>{{ room.openTime }} - {{ room.closeTime }}</span>
            </div>
            <button class="reserve-btn">预约座位</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 页面底部信息 -->
    <footer class="page-footer">
      <p>共 {{ filteredStudyRooms.length }} 个自习室可用</p>
      <p class="footer-note">点击任意自习室卡片查看详情并预约座位</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索和筛选状态
const searchQuery = ref('')
const activeStatusFilter = ref('all')
const sortBy = ref('name')

// 状态筛选选项
const statusFilters = [
  { id: 'all', label: '全部' },
  { id: 'available', label: '可预约' },
  { id: 'limited', label: '余位紧张' },
  { id: 'full', label: '已满' }
]

// 模拟自习室数据
const studyRooms = ref([
  {
    id: 1,
    name: '静思轩',
    location: '图书馆三楼 A区',
    capacity: 60,
    availableSeats: 25,
    status: 'available', // available, limited, full
    openTime: '08:00',
    closeTime: '22:00'
  },
  {
    id: 2,
    name: '博学阁',
    location: '教学楼二楼 201室',
    capacity: 40,
    availableSeats: 5,
    status: 'limited',
    openTime: '07:30',
    closeTime: '21:30'
  },
  {
    id: 3,
    name: '致远堂',
    location: '学生活动中心一楼',
    capacity: 80,
    availableSeats: 0,
    status: 'full',
    openTime: '08:30',
    closeTime: '23:00'
  },
  {
    id: 4,
    name: '明德厅',
    location: '图书馆一楼 B区',
    capacity: 50,
    availableSeats: 32,
    status: 'available',
    openTime: '08:00',
    closeTime: '22:30'
  },
  {
    id: 5,
    name: '思源室',
    location: '工程楼三楼 305室',
    capacity: 30,
    availableSeats: 12,
    status: 'available',
    openTime: '09:00',
    closeTime: '20:00'
  },
  {
    id: 6,
    name: '文渊阁',
    location: '人文楼四楼 410室',
    capacity: 45,
    availableSeats: 3,
    status: 'limited',
    openTime: '08:00',
    closeTime: '21:00'
  }
])

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'available': '可预约',
    'limited': '余位紧张',
    'full': '已满'
  }
  return statusMap[status] || '未知状态'
}

// 设置状态筛选
const setStatusFilter = (status) => {
  activeStatusFilter.value = status
}

// 重置所有筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  activeStatusFilter.value = 'all'
  sortBy.value = 'name'
}

// 过滤和排序自习室
const filteredStudyRooms = computed(() => {
  let rooms = [...studyRooms.value]

  // 根据搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    rooms = rooms.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.location.toLowerCase().includes(query)
    )
  }

  // 根据状态过滤
  if (activeStatusFilter.value !== 'all') {
    rooms = rooms.filter(room => room.status === activeStatusFilter.value)
  }

  // 排序
  rooms.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy.value === 'capacity') {
      return b.capacity - a.capacity
    } else if (sortBy.value === 'available') {
      return b.availableSeats - a.availableSeats
    }
    return 0
  })

  return rooms
})

// 跳转到自习室详情页面
const goToRoomDetail = (roomId) => {
  // 在实际应用中，这里应该使用路由跳转
  router.push(`/study-room/${roomId}`)
}

// 模拟数据加载
onMounted(() => {
  console.log('自习室列表页面加载完成')
})
</script>

<style scoped>
/* 基础样式 */
.study-room-container {
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 25px;
}

/* 搜索和筛选区域 */
.search-filter-section {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-filter-btn {
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.status-filter-btn:hover {
  background-color: #e8f4fc;
  border-color: #3498db;
}

.status-filter-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.sort-select {
  padding: 8px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #3498db;
}

/* 自习室网格 */
.study-room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* 自习室卡片 */
.study-room-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.study-room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 20px 20px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.room-name-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.room-name {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.room-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
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

.room-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.location-icon {
  font-size: 0.9rem;
}

/* 卡片内容 */
.card-content {
  padding: 20px;
  flex-grow: 1;
}

.room-capacity {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.capacity-info, .availability-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.capacity-icon, .availability-icon {
  font-size: 1.4rem;
}

.capacity-text, .availability-text {
  display: flex;
  flex-direction: column;
}

.capacity-label, .availability-label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.capacity-value, .availability-value {
  font-weight: 600;
  color: #2c3e50;
}

/* 卡片底部 */
.card-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-hours {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.hours-icon {
  font-size: 0.9rem;
}

.reserve-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reserve-btn:hover {
  background-color: #2980b9;
}

/* 无结果状态 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  display: block;
}

.no-results p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.reset-btn {
  padding: 10px 24px;
  background-color: #f1f5f9;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #e8f4fc;
  border-color: #3498db;
  color: #3498db;
}

/* 页面底部 */
.page-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.footer-note {
  font-size: 0.9rem;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .study-room-grid {
    grid-template-columns: 1fr;
  }

  .filter-options {
    flex-direction: column;
    gap: 15px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .study-room-container {
    padding: 15px;
  }

  .card-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .reserve-btn {
    width: 100%;
  }
}
</style>