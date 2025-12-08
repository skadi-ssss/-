<template>
  <div class="reservation-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约信息管理</span>
          <div class="header-actions">
            <el-date-picker
                v-model="dateValue"
                type="date"
                placeholder="选择日期"
                @change="handleDateChange"
            />
            <el-select
                v-model="statusFilter"
                placeholder="预约状态"
                clearable
                style="width: 120px; margin-left: 10px;"
                @change="handleFilter"
            >
              <el-option label="已预约" value="reserved" />
              <el-option label="进行中" value="in_use" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="reservationList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="seatName" label="座位号" width="120" />
        <el-table-column prop="reserveDate" label="预约日期" width="120" />
        <el-table-column prop="timeSlot" label="时间段" width="180">
          <template #default="{ row }">
            {{ row.startTime }} - {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预约时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 'reserved'"
                size="small"
                type="primary"
                @click="handleCheckIn(row)"
            >
              手动签到
            </el-button>
            <el-button
                v-if="row.status === 'in_use'"
                size="small"
                type="warning"
                @click="handleCheckOut(row)"
            >
              手动签退
            </el-button>
            <el-button
                v-if="row.status === 'reserved'"
                size="small"
                type="danger"
                @click="handleCancel(row)"
            >
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="listQuery.page"
            v-model:page-size="listQuery.limit"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getList"
            @current-change="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSeatStore } from '@/store/seat'

const seatStore = useSeatStore()
const loading = ref(false)
const dateValue = ref('')
const statusFilter = ref('')
const total = ref(0)

const listQuery = reactive({
  page: 1,
  limit: 10,
  date: '',
  status: ''
})

const reservationList = ref([
  {
    id: 1,
    username: '张三',
    seatName: 'A101',
    reserveDate: '2024-01-01',
    startTime: '10:00',
    endTime: '12:00',
    status: 'reserved',
    createTime: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    username: '李四',
    seatName: 'B202',
    reserveDate: '2024-01-01',
    startTime: '14:00',
    endTime: '16:00',
    status: 'in_use',
    createTime: '2024-01-01 13:30:00'
  },
  {
    id: 3,
    username: '王五',
    seatName: 'C303',
    reserveDate: '2024-01-01',
    startTime: '18:00',
    endTime: '20:00',
    status: 'completed',
    createTime: '2024-01-01 17:45:00'
  },
  {
    id: 4,
    username: '赵六',
    seatName: 'D404',
    reserveDate: '2024-01-02',
    startTime: '09:00',
    endTime: '11:00',
    status: 'cancelled',
    createTime: '2024-01-01 20:00:00'
  },
  {
    id: 5,
    username: '钱七',
    seatName: 'E505',
    reserveDate: '2024-01-02',
    startTime: '15:00',
    endTime: '17:00',
    status: 'reserved',
    createTime: '2024-01-02 10:00:00'
  }
])

const getStatusType = (status) => {
  const map = {
    'reserved': 'primary',
    'in_use': 'warning',
    'completed': 'success',
    'cancelled': 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'reserved': '已预约',
    'in_use': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || '未知'
}

const filteredList = computed(() => {
  let list = reservationList.value

  if (dateValue.value) {
    const dateStr = new Date(dateValue.value).toISOString().split('T')[0]
    list = list.filter(item => item.reserveDate === dateStr)
  }

  if (statusFilter.value) {
    list = list.filter(item => item.status === statusFilter.value)
  }

  return list
})

// 添加 getList 函数定义
const getList = () => {
  loading.value = true
  setTimeout(() => {
    total.value = filteredList.value.length
    loading.value = false
  }, 500)
}

// 添加座位状态判断方法
const checkSeatStatus = (seatId) => {
  const seat = seatStore.seatList.find(s => s.id === seatId)
  if (!seat) {
    return { success: false, message: '座位不存在' }
  }

  // 判断是否正在被使用
  if (seat.status === seatStore.STATUS.IN_USE) {
    return {
      success: false,
      message: '该座位正在被使用',
      currentStatus: 'in_use',
      action: '等待用户结束使用'
    }
  }

  // 判断是否还能正常使用
  if (seat.status === seatStore.STATUS.UNAVAILABLE) {
    return {
      success: false,
      message: '该座位不可用',
      currentStatus: 'unavailable',
      action: '需要修复后才能使用'
    }
  }

  // 判断是否已经被预约
  if (seat.status === seatStore.STATUS.RESERVED) {
    return {
      success: false,
      message: '该座位已被预约',
      currentStatus: 'reserved',
      action: '可以等待或选择其他座位'
    }
  }

  // 判断是否处于维护状态
  if (seat.status === seatStore.STATUS.MAINTENANCE) {
    return {
      success: false,
      message: '该座位正在维护中',
      currentStatus: 'maintenance',
      action: '维护完成后才能使用'
    }
  }

  // 如果是空闲状态
  if (seat.status === seatStore.STATUS.AVAILABLE) {
    return {
      success: true,
      message: '可以预约',
      currentStatus: 'available',
      action: '可以立即预约'
    }
  }

  return {
    success: false,
    message: '未知状态',
    currentStatus: 'unknown',
    action: '请联系管理员'
  }
}

// 修改预约处理逻辑
const handleReserveSeat = async (row) => {
  const seatId = row.seatId || row.id

  const statusCheck = checkSeatStatus(seatId)

  if (!statusCheck.success) {
    ElMessage.warning(`${statusCheck.message} (${statusCheck.action})`)
    return
  }

  // 如果座位可以预约，调用store的方法
  const result = await seatStore.reserveSeat(seatId, {
    userName: row.username,
    reservationTime: new Date(row.reserveDate + ' ' + row.startTime),
    duration: '2'
  })
  if (result.success) {
    ElMessage.success(result.message)
    getList() // 刷新列表
  } else {
    ElMessage.error(result.message)
  }
}

// 修改签到逻辑
const handleCheckIn = async (row) => {
  const seatId = row.seatId || row.id

  // 先检查座位状态
  const statusCheck = checkSeatStatus(seatId)

  if (statusCheck.currentStatus !== 'reserved') {
    ElMessage.warning(`座位状态为${statusCheck.currentStatus}，无法签到`)
    return
  }

  ElMessageBox.confirm('确定手动签到吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    const result = await seatStore.startUsingSeat(seatId, { userName: row.username })
    if (result.success) {
      ElMessage.success(result.message)
      row.status = 'in_use'
      getList()
    } else {
      ElMessage.error(result.message)
    }
  }).catch(() => {})
}

// 修改签退逻辑
const handleCheckOut = async (row) => {
  const seatId = row.seatId || row.id

  // 先检查座位状态
  const statusCheck = checkSeatStatus(seatId)

  if (statusCheck.currentStatus !== 'in_use') {
    ElMessage.warning(`座位状态为${statusCheck.currentStatus}，无法签退`)
    return
  }

  ElMessageBox.confirm('确定手动签退吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    const result = await seatStore.endUsingSeat(seatId)
    if (result.success) {
      ElMessage.success(result.message)
      row.status = 'completed'
      getList()
    } else {
      ElMessage.error(result.message)
    }
  }).catch(() => {})
}

// 其他方法保持不变
const handleDateChange = () => {
  listQuery.date = dateValue.value ? new Date(dateValue.value).toISOString().split('T')[0] : ''
  listQuery.page = 1
  getList()
}

const handleFilter = () => {
  listQuery.status = statusFilter.value
  listQuery.page = 1
  getList()
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定取消该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'cancelled'
    ElMessage.success('取消成功')
    getList()
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.reservation-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>