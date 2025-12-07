<template>
  <div class="seat-container">
    <div class="operation-container">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加座位
      </el-button>

      <div class="filter-group">
        <el-select v-model="filterForm.area" placeholder="选择区域" clearable>
          <el-option label="A区" value="A" />
          <el-option label="B区" value="B" />
          <el-option label="C区" value="C" />
        </el-select>

        <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="空闲" value="0" />
          <el-option label="已预约" value="1" />
          <el-option label="使用中" value="2" />
          <el-option label="维护中" value="3" />
          <el-option label="不可用" value="4" />
        </el-select>

        <el-button type="primary" @click="handleBatchReserve" :disabled="selectedSeats.length === 0">
          <el-icon><Calendar /></el-icon>
          批量预约 ({{ selectedSeats.length }})
        </el-button>
      </div>
    </div>

    <!-- 批量操作提示 -->
    <div v-if="selectedSeats.length > 0" class="batch-tip">
      <el-alert
          :title="`已选择 ${selectedSeats.length} 个座位`"
          type="info"
          :closable="false"
          show-icon
      >
        <template #action>
          <el-button type="primary" size="small" @click="handleBatchReserve">
            批量预约
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchLock">
            批量锁定
          </el-button>
          <el-button type="info" size="small" @click="handleBatchRelease">
            批量释放
          </el-button>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </template>
      </el-alert>
    </div>

    <!-- 智能状态提示 -->
    <div class="status-guide">
      <div class="guide-item">
        <div class="color-box" style="background-color: #67c23a;"></div>
        <span>空闲可预约</span>
      </div>
      <div class="guide-item">
        <div class="color-box" style="background-color: #e6a23c;"></div>
        <span>已预约（锁定）</span>
      </div>
      <div class="guide-item">
        <div class="color-box" style="background-color: #409eff;"></div>
        <span>使用中（不可用）</span>
      </div>
      <div class="guide-item">
        <div class="color-box" style="background-color: #909399;"></div>
        <span>维护中（不可用）</span>
      </div>
      <div class="guide-item">
        <div class="color-box" style="background-color: #f56c6c;"></div>
        <span>不可用（已锁定）</span>
      </div>
    </div>

    <!-- 座位网格展示 -->
    <div class="seat-grid">
      <div v-for="seat in filteredSeats" :key="seat.id" class="seat-item">
        <el-card
            :class="['seat-card', getSeatClass(seat), { 'selected': isSeatSelected(seat) }]"
            @click="handleSeatSelection(seat)"
        >
          <!-- 选择复选框 -->
          <div class="selection-checkbox" @click.stop>
            <el-checkbox
                v-model="selectedSeatIds[seat.id]"
                @change="handleCheckboxChange(seat)"
            />
          </div>

          <!-- 座位编号 -->
          <div class="seat-header">
            <div class="seat-name">{{ seat.name }}</div>
            <div class="seat-type">
              <el-tag v-if="seat.type === '2'" size="small" type="warning">带插座</el-tag>
              <el-tag v-if="seat.type === '3'" size="small" type="success">带电脑</el-tag>
              <el-tag v-if="seat.type === '4'" size="small" type="danger">VIP</el-tag>
            </div>
          </div>

          <!-- 座位状态 -->
          <div class="seat-status">
            <div class="status-text">{{ getSeatStatusText(seat) }}</div>
            <div class="status-tag">
              <el-tag :type="getStatusTagType(seat)" size="small">
                {{ getSeatStatusText(seat) }}
              </el-tag>
            </div>
          </div>

          <!-- 座位信息 -->
          <div class="seat-info">
            <div class="info-item" v-if="seat.area">
              <el-icon><Location /></el-icon>
              <span>区域: {{ seat.area }}</span>
            </div>
            <div class="info-item" v-if="seat.reservedBy">
              <el-icon><User /></el-icon>
              <span>预约人: {{ seat.reservedBy }}</span>
            </div>
            <div class="info-item" v-if="seat.reservationTime">
              <el-icon><Clock /></el-icon>
              <span>时间: {{ seat.reservationTime }}</span>
            </div>
            <div class="info-item" v-if="seat.usedBy">
              <el-icon><UserFilled /></el-icon>
              <span>使用人: {{ seat.usedBy }}</span>
            </div>
            <div class="info-item" v-if="seat.startTime">
              <el-icon><Timer /></el-icon>
              <span>开始: {{ seat.startTime }}</span>
            </div>
            <div class="info-item" v-if="seat.reason">
              <el-icon><Warning /></el-icon>
              <span>原因: {{ seat.reason }}</span>
            </div>
          </div>

          <!-- 座位操作按钮 -->
          <div class="seat-actions">
            <el-button-group size="small">
              <!-- 智能判断按钮 -->
              <template v-if="seat.status === '0'">
                <!-- 空闲状态：可以预约 -->
                <el-button
                    type="primary"
                    @click.stop="handleReserve(seat)"
                >
                  <el-icon><Calendar /></el-icon>
                  预约
                </el-button>
              </template>

              <template v-else-if="seat.status === '1'">
                <!-- 已预约状态：可以取消预约或开始使用 -->
                <el-button
                    type="warning"
                    @click.stop="handleCancelReservation(seat)"
                >
                  <el-icon><Close /></el-icon>
                  取消预约
                </el-button>
                <el-button
                    type="success"
                    @click.stop="handleStartUse(seat)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始使用
                </el-button>
              </template>

              <template v-else-if="seat.status === '2'">
                <!-- 使用中状态：可以结束使用 -->
                <el-button
                    type="danger"
                    @click.stop="handleEndUse(seat)"
                >
                  <el-icon><SwitchButton /></el-icon>
                  结束使用
                </el-button>
              </template>

              <template v-else-if="seat.status === '3'">
                <!-- 维护中状态：可以恢复使用 -->
                <el-button
                    type="success"
                    @click.stop="handleRepairComplete(seat)"
                >
                  <el-icon><Check /></el-icon>
                  恢复使用
                </el-button>
              </template>

              <template v-else-if="seat.status === '4'">
                <!-- 不可用状态：可以解锁 -->
                <el-button
                    type="warning"
                    @click.stop="handleUnlock(seat)"
                >
                  <el-icon><Unlock /></el-icon>
                  解锁
                </el-button>
              </template>

              <!-- 通用操作：设为不可用/维护 -->
              <el-button
                  v-if="seat.status !== '3' && seat.status !== '4'"
                  type="warning"
                  @click.stop="handleSetUnavailable(seat)"
              >
                <el-icon><Lock /></el-icon>
                设为不可用
              </el-button>

              <el-button
                  type="info"
                  @click.stop="handleViewDetail(seat)"
              >
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </el-button-group>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 预约对话框 -->
    <el-dialog
        v-model="reserveDialogVisible"
        :title="`预约座位 ${currentSeat?.name}`"
        width="400px"
    >
      <el-form
          ref="reserveFormRef"
          :model="reserveForm"
          :rules="reserveRules"
          label-width="80px"
      >
        <el-form-item label="选择用户" prop="userId">
          <el-select
              v-model="reserveForm.userId"
              placeholder="请选择用户"
              filterable
              style="width: 100%"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.username} (${user.studentId})`"
                :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预约时间" prop="duration">
          <el-select v-model="reserveForm.duration" style="width: 100%">
            <el-option label="30分钟" :value="30" />
            <el-option label="1小时" :value="60" />
            <el-option label="2小时" :value="120" />
            <el-option label="3小时" :value="180" />
            <el-option label="半天" :value="240" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="reserveForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入预约备注"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reserveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReserveSubmit">确定预约</el-button>
      </template>
    </el-dialog>

    <!-- 批量预约对话框 -->
    <el-dialog
        v-model="batchReserveDialogVisible"
        title="批量预约座位"
        width="500px"
    >
      <el-alert
          title="批量预约说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
      >
        <template #description>
          将为选中的 {{ selectedSeats.length }} 个座位进行批量预约操作
        </template>
      </el-alert>

      <el-form
          ref="batchReserveFormRef"
          :model="batchReserveForm"
          :rules="reserveRules"
          label-width="80px"
      >
        <el-form-item label="选择用户" prop="userId">
          <el-select
              v-model="batchReserveForm.userId"
              placeholder="请选择用户"
              filterable
              style="width: 100%"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.username} (${user.studentId})`"
                :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预约时间" prop="duration">
          <el-select v-model="batchReserveForm.duration" style="width: 100%">
            <el-option label="30分钟" :value="30" />
            <el-option label="1小时" :value="60" />
            <el-option label="2小时" :value="120" />
            <el-option label="3小时" :value="180" />
            <el-option label="半天" :value="240" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="batchReserveForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入预约备注"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <!-- 选中座位列表 -->
        <el-form-item label="选中座位">
          <div class="selected-seats-list">
            <el-tag
                v-for="seat in selectedSeats"
                :key="seat.id"
                :type="getSeatStatus(seat) === '0' ? 'success' : 'danger'"
                style="margin: 0 5px 5px 0;"
                closable
                @close="handleRemoveFromBatch(seat)"
            >
              {{ seat.name }} ({{ getSeatStatusText(seat) }})
            </el-tag>
          </div>
          <div class="form-tip">
            注：只有空闲状态的座位才能成功预约
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchReserveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchReserveSubmit">确定批量预约</el-button>
      </template>
    </el-dialog>

    <!-- 座位详情/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="400px"
    >
      <el-form
          ref="seatFormRef"
          :model="seatFormData"
          :rules="seatRules"
          label-width="80px"
      >
        <el-form-item label="座位号" prop="name">
          <el-input v-model="seatFormData.name" />
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-select v-model="seatFormData.area">
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="座位类型" prop="type">
          <el-select v-model="seatFormData.type">
            <el-option label="普通座位" value="1" />
            <el-option label="带插座" value="2" />
            <el-option label="带电脑" value="3" />
            <el-option label="VIP座位" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="seatFormData.status">
            <el-radio label="0">空闲</el-radio>
            <el-radio label="1">已预约</el-radio>
            <el-radio label="2">使用中</el-radio>
            <el-radio label="3">维护中</el-radio>
            <el-radio label="4">不可用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="seatFormData.remark"
              type="textarea"
              :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button
              v-if="dialogType === 'edit' && seatFormData.status === '1'"
              type="warning"
              @click="handleRelease"
          >
            手动释放
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
const reserveDialogVisible = ref(false)
const batchReserveDialogVisible = ref(false)
const dialogType = ref('add')
const seatFormRef = ref()
const reserveFormRef = ref()
const batchReserveFormRef = ref()
const currentSeat = ref(null)
const selectedSeats = ref([])
const selectedSeatIds = ref({})

const filterForm = reactive({
  area: '',
  status: ''
})

// 模拟数据 - 扩展座位状态
const seatList = ref([
  {
    id: 1,
    name: 'A101',
    area: 'A',
    type: '1',
    status: '0',
    reservedBy: null,
    usedBy: null,
    reservationTime: null,
    startTime: null,
    endTime: null,
    reason: null,
    remark: '普通座位'
  },
  {
    id: 2,
    name: 'A102',
    area: 'A',
    type: '2',
    status: '1',
    reservedBy: '张三',
    usedBy: null,
    reservationTime: '14:00',
    startTime: null,
    endTime: null,
    reason: null,
    remark: '带插座，已预约'
  },
  {
    id: 3,
    name: 'A103',
    area: 'A',
    type: '1',
    status: '2',
    reservedBy: '李四',
    usedBy: '李四',
    reservationTime: '13:30',
    startTime: '13:45',
    endTime: null,
    reason: null,
    remark: '使用中'
  },
  {
    id: 4,
    name: 'B101',
    area: 'B',
    type: '3',
    status: '3',
    reservedBy: null,
    usedBy: null,
    reservationTime: null,
    startTime: null,
    endTime: null,
    reason: '电脑维修中',
    remark: '电脑维修中，预计明天恢复'
  },
  {
    id: 5,
    name: 'B102',
    area: 'B',
    type: '4',
    status: '0',
    reservedBy: null,
    usedBy: null,
    reservationTime: null,
    startTime: null,
    endTime: null,
    reason: null,
    remark: 'VIP座位'
  },
  {
    id: 6,
    name: 'B103',
    area: 'B',
    type: '1',
    status: '4',
    reservedBy: null,
    usedBy: null,
    reservationTime: null,
    startTime: null,
    endTime: null,
    reason: '椅子损坏',
    remark: '椅子损坏，需更换'
  },
  {
    id: 7,
    name: 'C101',
    area: 'C',
    type: '1',
    status: '0',
    reservedBy: null,
    usedBy: null,
    reservationTime: null,
    startTime: null,
    endTime: null,
    reason: null,
    remark: '靠窗座位'
  },
  {
    id: 8,
    name: 'C102',
    area: 'C',
    type: '1',
    status: '1',
    reservedBy: '王五',
    usedBy: null,
    reservationTime: '15:30',
    startTime: null,
    endTime: null,
    reason: null,
    remark: '已预约'
  }
])

const userList = ref([
  { id: 1, username: '张三', studentId: '2021001', creditScore: 85 },
  { id: 2, username: '李四', studentId: '2021002', creditScore: 90 },
  { id: 3, username: '王五', studentId: '2021003', creditScore: 70 },
  { id: 4, username: '赵六', studentId: '2021004', creditScore: 95 },
  { id: 5, username: '孙七', studentId: '2021005', creditScore: 80 }
])

const seatFormData = reactive({
  id: null,
  name: '',
  area: '',
  type: '1',
  status: '0',
  remark: ''
})

const reserveForm = reactive({
  userId: '',
  duration: 60,
  remark: ''
})

const batchReserveForm = reactive({
  userId: '',
  duration: 60,
  remark: ''
})

const seatRules = {
  name: [
    { required: true, message: '请输入座位号', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ]
}

const reserveRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请选择预约时长', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加座位' : '编辑座位'
})

const filteredSeats = computed(() => {
  let filtered = seatList.value

  if (filterForm.area) {
    filtered = filtered.filter(seat => seat.area === filterForm.area)
  }

  if (filterForm.status) {
    filtered = filtered.filter(seat => seat.status === filterForm.status)
  }

  return filtered
})

// 判断座位是否被选中
const isSeatSelected = (seat) => {
  return selectedSeatIds.value[seat.id] || false
}

// 智能状态判断函数
const getSeatStatus = (seat) => {
  return seat.status
}

const getSeatStatusText = (seat) => {
  const map = {
    '0': '空闲',
    '1': '已预约',
    '2': '使用中',
    '3': '维护中',
    '4': '不可用'
  }
  return map[seat.status] || '未知'
}

const getStatusTagType = (seat) => {
  const map = {
    '0': 'success',
    '1': 'warning',
    '2': 'primary',
    '3': 'info',
    '4': 'danger'
  }
  return map[seat.status] || 'info'
}

const getSeatClass = (seat) => {
  const map = {
    '0': 'seat-available',
    '1': 'seat-reserved',
    '2': 'seat-in-use',
    '3': 'seat-maintenance',
    '4': 'seat-unavailable'
  }
  return map[seat.status] || ''
}

// 智能判断是否可预约
const canReserve = (seat) => {
  // 智能判断逻辑：
  // 1. 首先判断是否有人正在使用（状态为2）
  if (seat.status === '2') {
    return { canReserve: false, reason: '座位正在使用中，不可预约' }
  }

  // 2. 判断是否还能正常使用（状态为3或4）
  if (seat.status === '3' || seat.status === '4') {
    return { canReserve: false, reason: '座位不可用，请选择其他座位' }
  }

  // 3. 判断是否已经被预约（状态为1）
  if (seat.status === '1') {
    return { canReserve: false, reason: '座位已被预约，请选择其他座位' }
  }

  // 4. 如果是空闲状态（状态为0），可以预约
  if (seat.status === '0') {
    return { canReserve: true, reason: '可以预约' }
  }

  return { canReserve: false, reason: '未知状态' }
}

onMounted(() => {
  // 初始化座位数据
})

// 座位选择处理
const handleSeatSelection = (seat) => {
  const canReserveResult = canReserve(seat)

  if (selectedSeatIds.value[seat.id]) {
    // 如果已选中，则取消选择
    delete selectedSeatIds.value[seat.id]
    selectedSeats.value = selectedSeats.value.filter(s => s.id !== seat.id)
  } else {
    // 如果未选中，先检查是否可以预约
    if (canReserveResult.canReserve || seat.status === '1' || seat.status === '2') {
      selectedSeatIds.value[seat.id] = true
      selectedSeats.value.push(seat)
    } else {
      ElMessage.warning(`无法选择座位 ${seat.name}: ${canReserveResult.reason}`)
    }
  }
}

const handleCheckboxChange = (seat) => {
  if (selectedSeatIds.value[seat.id]) {
    selectedSeats.value.push(seat)
  } else {
    selectedSeats.value = selectedSeats.value.filter(s => s.id !== seat.id)
    delete selectedSeatIds.value[seat.id]
  }
}

// 清空选择
const clearSelection = () => {
  selectedSeats.value = []
  selectedSeatIds.value = {}
}

// 移除批量预约中的某个座位
const handleRemoveFromBatch = (seat) => {
  delete selectedSeatIds.value[seat.id]
  selectedSeats.value = selectedSeats.value.filter(s => s.id !== seat.id)
}

// 添加座位
const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(seatFormData).forEach(key => {
    seatFormData[key] = ''
  })
  seatFormData.status = '0'
  seatFormData.type = '1'
  dialogVisible.value = true
}

// 查看座位详情
const handleViewDetail = (seat) => {
  dialogType.value = 'edit'
  Object.assign(seatFormData, seat)
  dialogVisible.value = true
}

// 预约座位
const handleReserve = (seat) => {
  const result = canReserve(seat)

  if (!result.canReserve) {
    ElMessage.warning(`无法预约座位 ${seat.name}: ${result.reason}`)
    return
  }

  currentSeat.value = seat
  reserveForm.userId = ''
  reserveForm.duration = 60
  reserveForm.remark = ''
  reserveDialogVisible.value = true
}

// 提交预约
const handleReserveSubmit = async () => {
  try {
    await reserveFormRef.value.validate()

    const user = userList.value.find(u => u.id === reserveForm.userId)
    if (!user) {
      ElMessage.error('用户不存在')
      return
    }

    // 更新座位状态
    const seatIndex = seatList.value.findIndex(s => s.id === currentSeat.value.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '1', // 设置为已预约
        reservedBy: user.username,
        reservationTime: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        usedBy: null,
        startTime: null,
        endTime: null
      }
    }

    ElMessage.success(`座位 ${currentSeat.value.name} 已成功预约给 ${user.username}`)
    reserveDialogVisible.value = false

    // 如果这个座位在选中列表中，移除它
    if (selectedSeatIds.value[currentSeat.value.id]) {
      handleRemoveFromBatch(currentSeat.value)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 批量预约
const handleBatchReserve = () => {
  // 检查是否至少选中一个座位
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请先选择要预约的座位')
    return
  }

  // 检查选中的座位中是否有不可预约的
  const unavailableSeats = selectedSeats.value.filter(seat => !canReserve(seat).canReserve)

  if (unavailableSeats.length > 0) {
    ElMessageBox.confirm(
        `选中的 ${selectedSeats.value.length} 个座位中，有 ${unavailableSeats.length} 个座位不可预约。是否继续预约可预约的座位？`,
        '提示',
        {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      // 移除不可预约的座位
      unavailableSeats.forEach(seat => {
        handleRemoveFromBatch(seat)
      })

      // 打开批量预约对话框
      batchReserveForm.userId = ''
      batchReserveForm.duration = 60
      batchReserveForm.remark = ''
      batchReserveDialogVisible.value = true
    }).catch(() => {
      // 用户取消
    })
  } else {
    batchReserveForm.userId = ''
    batchReserveForm.duration = 60
    batchReserveForm.remark = ''
    batchReserveDialogVisible.value = true
  }
}

// 提交批量预约
const handleBatchReserveSubmit = async () => {
  try {
    await batchReserveFormRef.value.validate()

    const user = userList.value.find(u => u.id === batchReserveForm.userId)
    if (!user) {
      ElMessage.error('用户不存在')
      return
    }

    // 只预约空闲状态的座位
    const availableSeats = selectedSeats.value.filter(seat => seat.status === '0')

    if (availableSeats.length === 0) {
      ElMessage.warning('选中的座位中没有空闲状态的座位')
      return
    }

    // 批量更新座位状态
    availableSeats.forEach(seat => {
      const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
      if (seatIndex !== -1) {
        seatList.value[seatIndex] = {
          ...seatList.value[seatIndex],
          status: '1', // 设置为已预约
          reservedBy: user.username,
          reservationTime: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
          usedBy: null,
          startTime: null,
          endTime: null
        }
      }
    })

    ElMessage.success(`成功为 ${availableSeats.length} 个座位预约给 ${user.username}`)
    batchReserveDialogVisible.value = false
    clearSelection()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消预约
const handleCancelReservation = (seat) => {
  ElMessageBox.confirm(`确定要取消座位 ${seat.name} 的预约吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '0', // 恢复为空闲
        reservedBy: null,
        reservationTime: null,
        usedBy: null,
        startTime: null,
        endTime: null
      }
    }
    ElMessage.success('预约已取消')
  }).catch(() => {})
}

// 开始使用
const handleStartUse = (seat) => {
  ElMessageBox.confirm(`确定开始使用座位 ${seat.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      const currentTime = `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '2', // 设置为使用中
        usedBy: seat.reservedBy || '管理员',
        startTime: currentTime,
        endTime: null
      }
    }
    ElMessage.success('座位开始使用')
  }).catch(() => {})
}

// 结束使用
const handleEndUse = (seat) => {
  ElMessageBox.confirm(`确定结束使用座位 ${seat.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '0', // 恢复为空闲
        reservedBy: null,
        reservationTime: null,
        usedBy: null,
        startTime: null,
        endTime: null,
        reason: null
      }
    }
    ElMessage.success('座位使用结束')
  }).catch(() => {})
}

// 设为不可用
const handleSetUnavailable = (seat) => {
  ElMessageBox.prompt('请输入设为不可用的原因', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：设备损坏、需要清洁等'
  }).then(({ value }) => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '4', // 设为不可用
        reservedBy: null,
        reservationTime: null,
        usedBy: null,
        startTime: null,
        endTime: null,
        reason: value || '管理员手动设为不可用'
      }
    }
    ElMessage.success('座位已设为不可用')
  }).catch(() => {})
}

// 解锁座位（从不可用状态恢复）
const handleUnlock = (seat) => {
  ElMessageBox.confirm(`确定要解锁座位 ${seat.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '0', // 恢复为空闲
        reason: null
      }
    }
    ElMessage.success('座位已解锁')
  }).catch(() => {})
}

// 维修完成
const handleRepairComplete = (seat) => {
  ElMessageBox.confirm(`确定座位 ${seat.name} 维修完成吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
    if (seatIndex !== -1) {
      seatList.value[seatIndex] = {
        ...seatList.value[seatIndex],
        status: '0', // 恢复为空闲
        reason: null
      }
    }
    ElMessage.success('座位维修完成，已恢复可用')
  }).catch(() => {})
}

// 批量锁定
const handleBatchLock = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请先选择要锁定的座位')
    return
  }

  ElMessageBox.prompt('请输入锁定原因', '批量锁定', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：集体维护、活动占用等'
  }).then(({ value }) => {
    selectedSeats.value.forEach(seat => {
      const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
      if (seatIndex !== -1) {
        seatList.value[seatIndex] = {
          ...seatList.value[seatIndex],
          status: '4', // 设为不可用
          reservedBy: null,
          reservationTime: null,
          usedBy: null,
          startTime: null,
          endTime: null,
          reason: value || '批量锁定'
        }
      }
    })

    ElMessage.success(`成功锁定 ${selectedSeats.value.length} 个座位`)
    clearSelection()
  }).catch(() => {})
}

// 批量释放
const handleBatchRelease = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请先选择要释放的座位')
    return
  }

  ElMessageBox.confirm(`确定要释放选中的 ${selectedSeats.value.length} 个座位吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedSeats.value.forEach(seat => {
      const seatIndex = seatList.value.findIndex(s => s.id === seat.id)
      if (seatIndex !== -1) {
        // 如果座位是已预约或使用中，释放它
        if (seat.status === '1' || seat.status === '2') {
          seatList.value[seatIndex] = {
            ...seatList.value[seatIndex],
            status: '0', // 恢复为空闲
            reservedBy: null,
            reservationTime: null,
            usedBy: null,
            startTime: null,
            endTime: null,
            reason: null
          }
        }
      }
    })

    ElMessage.success(`成功释放 ${selectedSeats.value.length} 个座位`)
    clearSelection()
  }).catch(() => {})
}

const handleRelease = () => {
  ElMessageBox.confirm('确定手动释放该座位吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    seatFormData.status = '0'
    seatFormData.reservedBy = ''
    ElMessage.success('释放成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await seatFormRef.value.validate()

    if (dialogType.value === 'add') {
      seatList.value.push({
        ...seatFormData,
        id: seatList.value.length + 1,
        reservedBy: null,
        usedBy: null,
        reservationTime: null,
        startTime: null,
        endTime: null,
        reason: null
      })
      ElMessage.success('添加成功')
    } else {
      const index = seatList.value.findIndex(item => item.id === seatFormData.id)
      if (index !== -1) {
        seatList.value[index] = { ...seatList.value[index], ...seatFormData }
      }
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
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
  align-items: center;
}

.batch-tip {
  margin-bottom: 20px;
}

.status-guide {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.seat-item {
  cursor: pointer;
  position: relative;
}

.seat-card {
  transition: all 0.3s;
  position: relative;
}

.seat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.seat-card.selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.selection-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.seat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.seat-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.seat-type {
  display: flex;
  gap: 5px;
}

.seat-status {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-text {
  font-size: 14px;
  color: #666;
}

.seat-info {
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.seat-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.seat-actions .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.selected-seats-list {
  max-height: 150px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  margin-top: 10px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 不同状态的颜色 */
.seat-available {
  border-top: 4px solid #67c23a;
}

.seat-reserved {
  border-top: 4px solid #e6a23c;
}

.seat-in-use {
  border-top: 4px solid #409eff;
}

.seat-maintenance {
  border-top: 4px solid #909399;
}

.seat-unavailable {
  border-top: 4px solid #f56c6c;
  opacity: 0.8;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>