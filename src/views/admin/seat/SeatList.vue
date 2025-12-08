<template>
  <div class="seat-container">
    <div class="operation-container">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加座位
      </el-button>

      <div class="filter-group">
        <el-select v-model="filterForm.area" placeholder="选择区域" clearable @change="handleFilter">
          <el-option label="A区" value="A" />
          <el-option label="B区" value="B" />
          <el-option label="C区" value="C" />
        </el-select>

        <el-select v-model="filterForm.status" placeholder="选择状态" clearable @change="handleFilter">
          <el-option label="空闲" value="0" />
          <el-option label="已预约" value="1" />
          <el-option label="使用中" value="2" />
          <el-option label="维护中" value="3" />
          <el-option label="不可用" value="4" />
        </el-select>
      </div>
    </div>

    <!-- 座位网格展示 -->
    <div class="seat-grid">
      <div v-for="seat in filteredSeatList" :key="seat.id" class="seat-item">
        <el-card
            :class="['seat-card', getSeatClass(seat.status)]"
            @click="handleSeatClick(seat)"
        >
          <div class="seat-info">
            <div class="seat-name">{{ seat.name }}</div>
            <div class="seat-status">{{ getStatusText(seat.status) }}</div>
            <div class="seat-area">区域: {{ seat.area }}</div>

            <!-- 显示额外信息 -->
            <div v-if="seat.status === '2'" class="seat-user">
              使用者: {{ seat.currentUser || '未知' }}
            </div>
            <div v-if="seat.status === '1'" class="seat-reservation">
              预约人: {{ seat.reservedBy || '未知' }}
            </div>
            <div v-if="seat.status === '3' || seat.status === '4'" class="seat-reason">
              {{ seat.maintenanceReason || '系统维护' }}
            </div>
          </div>

          <!-- 根据状态显示操作按钮 -->
          <div class="seat-actions">
            <el-button
                v-if="seat.status === '0'"
                size="small"
                type="primary"
                @click.stop="handleReserve(seat)"
            >
              预约
            </el-button>

            <el-button
                v-if="seat.status === '1'"
                size="small"
                type="warning"
                @click.stop="handleCancelReservation(seat)"
            >
              取消预约
            </el-button>

            <el-button
                v-if="seat.status === '2'"
                size="small"
                type="info"
                @click.stop="handleEndUse(seat)"
            >
              结束使用
            </el-button>

            <el-button
                v-if="seat.status === '0' || seat.status === '1' || seat.status === '2'"
                size="small"
                type="danger"
                @click.stop="handleSetMaintenance(seat)"
            >
              设为维护
            </el-button>

            <el-button
                v-if="seat.status === '3' || seat.status === '4'"
                size="small"
                type="success"
                @click.stop="handleSetAvailable(seat)"
            >
              恢复可用
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 座位详情/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
    >
      <el-form
          ref="seatFormRef"
          :model="seatForm"
          :rules="seatRules"
          label-width="100px"
      >
        <el-form-item label="座位号" prop="name">
          <el-input v-model="seatForm.name" :disabled="dialogType !== 'add'" />
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-select v-model="seatForm.area" :disabled="isStatusLocked">
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="座位类型" prop="type">
          <el-select v-model="seatForm.type" :disabled="isStatusLocked">
            <el-option label="普通座位" value="1" />
            <el-option label="带插座" value="2" />
            <el-option label="带电脑" value="3" />
            <el-option label="VIP座位" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态" prop="status">
          <el-tag :type="getStatusType(seatForm.status)">
            {{ getStatusText(seatForm.status) }}
          </el-tag>
        </el-form-item>

        <!-- 使用中时显示使用者信息 -->
        <el-form-item v-if="seatForm.status === '2'" label="使用者">
          <el-input v-model="seatForm.currentUser" disabled />
        </el-form-item>

        <!-- 已预约时显示预约信息 -->
        <el-form-item v-if="seatForm.status === '1'" label="预约人">
          <el-input v-model="seatForm.reservedBy" disabled />
        </el-form-item>

        <!-- 维护或不可用时显示原因 -->
        <el-form-item v-if="seatForm.status === '3' || seatForm.status === '4'" label="原因" prop="maintenanceReason">
          <el-input
              v-model="seatForm.maintenanceReason"
              type="textarea"
              :rows="3"
              placeholder="请输入维护或不可用的原因"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="seatForm.remark"
              type="textarea"
              :rows="3"
              :disabled="isStatusLocked"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <!-- 根据状态显示不同的操作按钮 -->
          <div v-if="dialogType === 'edit'" class="quick-actions">
            <el-button
                v-if="seatForm.status === '0'"
                type="primary"
                @click="handleQuickReserve"
            >
              立即预约
            </el-button>

            <el-button
                v-if="seatForm.status === '1'"
                type="warning"
                @click="handleQuickCancelReservation"
            >
              取消预约
            </el-button>

            <el-button
                v-if="seatForm.status === '2'"
                type="info"
                @click="handleQuickEndUse"
            >
              结束使用
            </el-button>

            <el-button
                v-if="['0', '1', '2'].includes(seatForm.status)"
                type="danger"
                @click="handleQuickSetMaintenance"
            >
              设为维护
            </el-button>

            <el-button
                v-if="seatForm.status === '3'"
                type="success"
                @click="handleQuickSetAvailable"
            >
              恢复可用
            </el-button>
          </div>

          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :disabled="isStatusLocked">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预约座位对话框 -->
    <el-dialog
        v-model="reservationDialogVisible"
        title="预约座位"
        width="400px"
    >
      <el-form ref="reservationFormRef" :model="reservationForm" :rules="reservationRules">
        <el-form-item label="座位号">
          <el-input v-model="selectedSeat.name" disabled />
        </el-form-item>
        <el-form-item label="预约人" prop="userName">
          <el-input v-model="reservationForm.userName" placeholder="请输入预约人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="reservationForm.phone" placeholder="请输入预约人手机号" />
        </el-form-item>
        <el-form-item label="预约时间" prop="reservationTime">
          <el-date-picker
              v-model="reservationForm.reservationTime"
              type="datetime"
              placeholder="选择预约时间"
              :disabled-date="disabledDate"
              :shortcuts="shortcuts"
          />
        </el-form-item>
        <el-form-item label="使用时长" prop="duration">
          <el-select v-model="reservationForm.duration">
            <el-option label="1小时" value="1" />
            <el-option label="2小时" value="2" />
            <el-option label="3小时" value="3" />
            <el-option label="4小时" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reservationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReservationSubmit">确定预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const dialogVisible = ref(false)
const reservationDialogVisible = ref(false)
const dialogType = ref('add')
const seatFormRef = ref()
const reservationFormRef = ref()
const selectedSeat = ref({})
const filterForm = reactive({
  area: '',
  status: ''
})

// 座位状态映射
const STATUS = {
  AVAILABLE: '0',      // 空闲
  RESERVED: '1',       // 已预约
  IN_USE: '2',         // 使用中
  MAINTENANCE: '3',    // 维护中
  UNAVAILABLE: '4'     // 不可用
}

// 座位数据
const seatList = ref([
  { id: 1, name: 'A101', area: 'A', type: '1', status: STATUS.AVAILABLE, remark: '', currentUser: '', reservedBy: '', maintenanceReason: '' },
  { id: 2, name: 'A102', area: 'A', type: '2', status: STATUS.RESERVED, reservedBy: '张三', remark: '带插座' },
  { id: 3, name: 'A103', area: 'A', type: '1', status: STATUS.IN_USE, currentUser: '李四', remark: '' },
  { id: 4, name: 'B101', area: 'B', type: '3', status: STATUS.MAINTENANCE, maintenanceReason: '电脑维修中' },
  { id: 5, name: 'B102', area: 'B', type: '4', status: STATUS.UNAVAILABLE, maintenanceReason: '插座故障' },
  { id: 6, name: 'C101', area: 'C', type: '1', status: STATUS.AVAILABLE, remark: '' }
])

// 座位表单
const seatForm = reactive({
  id: null,
  name: '',
  area: '',
  type: '1',
  status: STATUS.AVAILABLE,
  remark: '',
  currentUser: '',
  reservedBy: '',
  maintenanceReason: ''
})

// 预约表单
const reservationForm = reactive({
  userName: '',
  phone: '',
  reservationTime: new Date(),
  duration: '2'
})

const seatRules = {
  name: [
    { required: true, message: '请输入座位号', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ]
}

const reservationRules = {
  userName: [
    { required: true, message: '请输入预约人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  reservationTime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请选择使用时长', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加座位' : '座位详情'
})

const isStatusLocked = computed(() => {
  // 如果座位正在被使用或已预约，或者处于不可用状态，则锁定编辑
  return [STATUS.IN_USE, STATUS.RESERVED, STATUS.UNAVAILABLE].includes(seatForm.status)
})

const filteredSeatList = computed(() => {
  let list = seatList.value

  if (filterForm.area) {
    list = list.filter(seat => seat.area === filterForm.area)
  }

  if (filterForm.status) {
    list = list.filter(seat => seat.status === filterForm.status)
  }

  return list
})

// 辅助方法
const getStatusText = (status) => {
  const map = {
    [STATUS.AVAILABLE]: '空闲',
    [STATUS.RESERVED]: '已预约',
    [STATUS.IN_USE]: '使用中',
    [STATUS.MAINTENANCE]: '维护中',
    [STATUS.UNAVAILABLE]: '不可用'
  }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = {
    [STATUS.AVAILABLE]: 'success',
    [STATUS.RESERVED]: 'warning',
    [STATUS.IN_USE]: 'primary',
    [STATUS.MAINTENANCE]: 'info',
    [STATUS.UNAVAILABLE]: 'danger'
  }
  return map[status] || 'info'
}

const getSeatClass = (status) => {
  const map = {
    [STATUS.AVAILABLE]: 'seat-available',
    [STATUS.RESERVED]: 'seat-reserved',
    [STATUS.IN_USE]: 'seat-in-use',
    [STATUS.MAINTENANCE]: 'seat-maintenance',
    [STATUS.UNAVAILABLE]: 'seat-unavailable'
  }
  return map[status] || ''
}

// 时间选择器快捷选项
const shortcuts = [
  {
    text: '现在',
    value: new Date()
  },
  {
    text: '1小时后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000)
      return date
    }
  },
  {
    text: '明天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 24 * 1000)
      date.setHours(9, 0, 0, 0)
      return date
    }
  }
]

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 3600 * 1000
}

// 主方法
const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(seatForm).forEach(key => {
    seatForm[key] = ''
  })
  seatForm.status = STATUS.AVAILABLE
  seatForm.type = '1'
  dialogVisible.value = true

  nextTick(() => {
    seatFormRef.value?.clearValidate()
  })
}

const handleSeatClick = (seat) => {
  dialogType.value = 'edit'
  Object.assign(seatForm, seat)
  dialogVisible.value = true
}

const handleFilter = () => {
  // 过滤座位列表
  console.log('过滤条件:', filterForm)
}

const handleReserve = (seat) => {
  if (seat.status === STATUS.IN_USE) {
    ElMessage.warning('该座位正在被使用，无法预约')
    return
  }

  if (seat.status === STATUS.UNAVAILABLE) {
    ElMessage.warning('该座位不可用，无法预约')
    return
  }

  if (seat.status === STATUS.MAINTENANCE) {
    ElMessage.warning('该座位正在维护中，无法预约')
    return
  }

  if (seat.status === STATUS.RESERVED) {
    ElMessage.warning('该座位已被预约，无法再次预约')
    return
  }

  // 如果座位是空闲的，可以进行预约
  selectedSeat.value = { ...seat }
  reservationForm.userName = ''
  reservationForm.phone = ''
  reservationForm.reservationTime = new Date()
  reservationForm.duration = '2'
  reservationDialogVisible.value = true

  nextTick(() => {
    reservationFormRef.value?.clearValidate()
  })
}

const handleCancelReservation = (seat) => {
  if (seat.status !== STATUS.RESERVED) {
    ElMessage.warning('该座位没有被预约')
    return
  }

  ElMessageBox.confirm('确定取消该座位的预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = seatList.value.findIndex(item => item.id === seat.id)
    if (index !== -1) {
      seatList.value[index] = {
        ...seatList.value[index],
        status: STATUS.AVAILABLE,
        reservedBy: '',
        remark: seatList.value[index].remark
      }
      ElMessage.success('取消预约成功')
    }
  }).catch(() => {})
}

const handleEndUse = (seat) => {
  if (seat.status !== STATUS.IN_USE) {
    ElMessage.warning('该座位不在使用中')
    return
  }

  ElMessageBox.confirm('确定结束该座位的使用吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const index = seatList.value.findIndex(item => item.id === seat.id)
    if (index !== -1) {
      seatList.value[index] = {
        ...seatList.value[index],
        status: STATUS.AVAILABLE,
        currentUser: '',
        remark: seatList.value[index].remark
      }
      ElMessage.success('结束使用成功')
    }
  }).catch(() => {})
}

const handleSetMaintenance = (seat) => {
  if (seat.status === STATUS.IN_USE) {
    ElMessageBox.confirm('该座位正在使用中，确定设为维护状态吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const index = seatList.value.findIndex(item => item.id === seat.id)
      if (index !== -1) {
        seatList.value[index] = {
          ...seatList.value[index],
          status: STATUS.MAINTENANCE,
          maintenanceReason: '手动设为维护',
          currentUser: '',
          reservedBy: ''
        }
        ElMessage.success('已设为维护状态')
      }
    }).catch(() => {})
    return
  }

  ElMessageBox.prompt('请输入维护原因', '设为维护状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入维护原因'
  }).then(({ value }) => {
    const index = seatList.value.findIndex(item => item.id === seat.id)
    if (index !== -1) {
      seatList.value[index] = {
        ...seatList.value[index],
        status: STATUS.MAINTENANCE,
        maintenanceReason: value || '手动设为维护',
        reservedBy: ''
      }
      ElMessage.success('已设为维护状态')
    }
  }).catch(() => {})
}

const handleSetAvailable = (seat) => {
  ElMessageBox.confirm('确定将该座位恢复为可用状态吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const index = seatList.value.findIndex(item => item.id === seat.id)
    if (index !== -1) {
      seatList.value[index] = {
        ...seatList.value[index],
        status: STATUS.AVAILABLE,
        maintenanceReason: '',
        remark: seatList.value[index].remark
      }
      ElMessage.success('已恢复为可用状态')
    }
  }).catch(() => {})
}

// 快速操作方法
const handleQuickReserve = () => {
  handleReserve(seatForm)
  dialogVisible.value = false
}

const handleQuickCancelReservation = () => {
  handleCancelReservation(seatForm)
  dialogVisible.value = false
}

const handleQuickEndUse = () => {
  handleEndUse(seatForm)
  dialogVisible.value = false
}

const handleQuickSetMaintenance = () => {
  handleSetMaintenance(seatForm)
  dialogVisible.value = false
}

const handleQuickSetAvailable = () => {
  handleSetAvailable(seatForm)
  dialogVisible.value = false
}

const handleSubmit = async () => {
  try {
    await seatFormRef.value.validate()

    if (dialogType.value === 'add') {
      const newSeat = {
        ...seatForm,
        id: seatList.value.length + 1
      }
      seatList.value.push(newSeat)
      ElMessage.success('添加成功')
    } else {
      const index = seatList.value.findIndex(item => item.id === seatForm.id)
      if (index !== -1) {
        seatList.value[index] = { ...seatForm }
      }
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleReservationSubmit = async () => {
  try {
    await reservationFormRef.value.validate()

    const index = seatList.value.findIndex(item => item.id === selectedSeat.value.id)
    if (index !== -1) {
      seatList.value[index] = {
        ...seatList.value[index],
        status: STATUS.RESERVED,
        reservedBy: reservationForm.userName,
        remark: `预约时间: ${dayjs(reservationForm.reservationTime).format('YYYY-MM-DD HH:mm')}, 时长: ${reservationForm.duration}小时`
      }

      ElMessage.success('预约成功')
      reservationDialogVisible.value = false
    }
  } catch (error) {
    console.error('预约表单验证失败:', error)
  }
}

onMounted(() => {
  // 初始化座位数据
  console.log('座位管理系统初始化完成')
})
</script>

<style scoped>
.seat-container {
  padding: 20px;
}

.operation-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.seat-item {
  cursor: pointer;
}

.seat-card {
  transition: all 0.3s;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.seat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.seat-info {
  flex: 1;
}

.seat-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.seat-status {
  font-size: 16px;
  margin-bottom: 8px;
  text-align: center;
}

.seat-area {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  text-align: center;
}

.seat-user,
.seat-reservation,
.seat-reason {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: center;
}

.seat-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  margin-top: 10px;
}

/* 不同状态的颜色 */
.seat-available {
  border-top: 4px solid #67c23a;
  border-left: 4px solid #67c23a;
}

.seat-reserved {
  border-top: 4px solid #e6a23c;
  border-left: 4px solid #e6a23c;
}

.seat-in-use {
  border-top: 4px solid #409eff;
  border-left: 4px solid #409eff;
}

.seat-maintenance {
  border-top: 4px solid #909399;
  border-left: 4px solid #909399;
}

.seat-unavailable {
  border-top: 4px solid #f56c6c;
  border-left: 4px solid #f56c6c;
  opacity: 0.7;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>