<template>
  <div class="seat-management-container">
    <!-- 操作工具栏 -->
    <div class="operation-toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAddSeat">
          <el-icon><Plus /></el-icon>
          添加座位
        </el-button>

        <el-button type="success" @click="handleBatchAdd">
          <el-icon><DocumentAdd /></el-icon>
          批量添加
        </el-button>

        <el-button type="warning" @click="handleExportSeats">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>

        <el-button v-if="selectedSeats.length > 0" type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <div class="right-filters">
        <el-input
            v-model="filterParams.keyword"
            placeholder="搜索座位号/区域"
            style="width: 200px;"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
            v-model="filterParams.area"
            placeholder="区域"
            clearable
            style="width: 120px; margin-left: 10px;"
            @change="handleFilter"
        >
          <el-option v-for="area in areaList" :key="area" :label="area" :value="area" />
        </el-select>

        <el-select
            v-model="filterParams.status"
            placeholder="状态"
            clearable
            style="width: 120px; margin-left: 10px;"
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="空闲" :value="STATUS.AVAILABLE" />
          <el-option label="已预约" :value="STATUS.RESERVED" />
          <el-option label="使用中" :value="STATUS.IN_USE" />
          <el-option label="维护中" :value="STATUS.MAINTENANCE" />
          <el-option label="已锁定" :value="STATUS.LOCKED" />
        </el-select>

        <el-select
            v-model="filterParams.type"
            placeholder="座位类型"
            clearable
            style="width: 140px; margin-left: 10px;"
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option v-for="type in seatTypeList" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedSeats.length > 0" class="batch-operation-bar">
      <span>已选择 {{ selectedSeats.length }} 个座位</span>
      <el-button-group style="margin-left: 20px;">
        <el-button size="small" @click="handleBatchLock">
          批量锁定
        </el-button>
        <el-button size="small" @click="handleBatchRelease">
          批量释放
        </el-button>
        <el-button size="small" @click="handleBatchSetMaintenance">
          设为维护
        </el-button>
      </el-button-group>
      <el-button link @click="selectedSeats = []" style="margin-left: 10px;">
        取消选择
      </el-button>
    </div>

    <!-- 座位列表 -->
    <div class="seat-content">
      <div class="seat-list-view">
        <el-table
            ref="seatTableRef"
            :data="seats"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="seatNumber" label="座位号" width="100" fixed>
            <template #default="{ row }">
              <span class="seat-number">{{ row.seatNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="area" label="区域" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.area }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="座位类型" width="120">
            <template #default="{ row }">
              <span>{{ getSeatTypeLabel(row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="equipment" label="设备配置" width="180">
            <template #default="{ row }">
              <div class="equipment-tags">
                <el-tag
                    v-for="eq in row.equipmentConfig"
                    :key="eq"
                    size="small"
                    class="equipment-tag"
                >
                  {{ eq }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="currentUser" label="当前用户" width="120">
            <template #default="{ row }">
              <span v-if="row.currentUser">{{ row.currentUser }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="reservedBy" label="预约人" width="120">
            <template #default="{ row }">
              <span v-if="row.reservedBy">{{ row.reservedBy }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastOperation" label="最后操作" width="180">
            <template #default="{ row }">
              <div v-if="row.lastOperation">
                <div>{{ row.lastOperation }}</div>
                <div class="operation-time">{{ row.lastOperationTime }}</div>
              </div>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button
                    size="small"
                    type="primary"
                    @click="handleEditSeat(row)"
                >
                  编辑
                </el-button>

                <el-button
                    size="small"
                    :type="row.status === STATUS.LOCKED ? 'success' : 'warning'"
                    @click="handleToggleLock(row)"
                >
                  {{ row.status === STATUS.LOCKED ? '解锁' : '锁定' }}
                </el-button>

                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteSeat(row)"
                >
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑座位对话框 -->
    <el-dialog
        v-model="seatDialog.visible"
        :title="seatDialog.title"
        width="600px"
        destroy-on-close
    >
      <el-form
          ref="seatFormRef"
          :model="seatForm"
          :rules="seatFormRules"
          label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="座位号" prop="seatNumber">
              <el-input
                  v-model="seatForm.seatNumber"
                  placeholder="如：A101"
                  :disabled="seatDialog.mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域" prop="area">
              <el-select v-model="seatForm.area" placeholder="选择区域">
                <el-option
                    v-for="area in areaList"
                    :key="area"
                    :label="area"
                    :value="area"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="座位类型" prop="type">
              <el-select v-model="seatForm.type" placeholder="选择座位类型">
                <el-option
                    v-for="type in seatTypeList"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="座位状态" prop="status">
              <el-select v-model="seatForm.status" placeholder="选择状态">
                <el-option
                    v-for="status in availableStatuses"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备配置" prop="equipmentConfig">
          <el-select
              v-model="seatForm.equipmentConfig"
              multiple
              placeholder="选择设备配置"
              style="width: 100%;"
          >
            <el-option
                v-for="item in equipmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注说明" prop="description">
          <el-input
              v-model="seatForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入座位的备注信息"
          />
        </el-form-item>

        <el-form-item label="座位图片" prop="imageUrl">
          <el-upload
              class="seat-uploader"
              action="#"
              :show-file-list="false"
              :on-change="handleImageUpload"
              :auto-upload="false"
              accept="image/*"
          >
            <img v-if="seatForm.imageUrl" :src="seatForm.imageUrl" class="seat-image" />
            <el-icon v-else class="seat-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
        </el-form-item>

        <el-form-item label="容量" prop="capacity">
          <el-input-number
              v-model="seatForm.capacity"
              :min="1"
              :max="10"
              placeholder="可容纳人数"
          />
        </el-form-item>

        <el-form-item label="启用状态" prop="enabled">
          <el-switch
              v-model="seatForm.enabled"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="seatDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSeat" :loading="seatDialog.loading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加对话框 -->
    <el-dialog
        v-model="batchAddDialog.visible"
        title="批量添加座位"
        width="500px"
    >
      <el-form ref="batchAddFormRef" :model="batchAddForm" label-width="100px">
        <el-form-item label="起始座位号" prop="startNumber">
          <el-input v-model="batchAddForm.startNumber" placeholder="如：A101" />
        </el-form-item>

        <el-form-item label="结束座位号" prop="endNumber">
          <el-input v-model="batchAddForm.endNumber" placeholder="如：A110" />
        </el-form-item>

        <el-form-item label="区域" prop="area">
          <el-select v-model="batchAddForm.area" placeholder="选择区域">
            <el-option
                v-for="area in areaList"
                :key="area"
                :label="area"
                :value="area"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="座位类型" prop="type">
          <el-select v-model="batchAddForm.type" placeholder="选择座位类型">
            <el-option
                v-for="type in seatTypeList"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备配置" prop="equipmentConfig">
          <el-select
              v-model="batchAddForm.equipmentConfig"
              multiple
              placeholder="选择设备配置"
              style="width: 100%;"
          >
            <el-option
                v-for="item in equipmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="description">
          <el-input
              v-model="batchAddForm.description"
              type="textarea"
              :rows="2"
              placeholder="座位通用备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmBatchAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 座位实时状态面板 -->
    <div class="realtime-status-panel">
      <el-card>
        <template #header>
          <div class="panel-header">
            <span>座位实时状态统计</span>
            <el-button type="text" @click="refreshRealTimeData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="4" v-for="stat in realTimeStats" :key="stat.status">
            <div class="stat-item" :style="{ borderColor: stat.color }">
              <div class="stat-value">{{ stat.count }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-percentage">{{ stat.percentage }}%</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 座位日志查看 -->
    <div class="seat-logs-section">
      <el-card>
        <template #header>
          <span>座位操作日志</span>
        </template>

        <el-table :data="seatLogs" size="small">
          <el-table-column prop="seatNumber" label="座位号" width="100" />
          <el-table-column prop="operation" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getOperationTagType(row.operation)">
                {{ row.operation }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="details" label="操作详情" />
          <el-table-column prop="operationTime" label="操作时间" width="180" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSeatStore } from '@/store/seat'

const seatStore = useSeatStore()
const seatTableRef = ref()
const seatFormRef = ref()
const batchAddFormRef = ref()

// 常量定义
const STATUS = {
  AVAILABLE: 'available',      // 空闲
  RESERVED: 'reserved',        // 已预约
  IN_USE: 'in_use',            // 使用中
  MAINTENANCE: 'maintenance',  // 维护中
  LOCKED: 'locked',           // 已锁定
  DISABLED: 'disabled'        // 禁用
}

// 区域列表
const areaList = ref(['A区', 'B区', 'C区', 'D区', 'E区', 'VIP区', '安静区', '讨论区'])

// 座位类型列表
const seatTypeList = ref([
  { value: 'standard', label: '标准座位' },
  { value: 'window', label: '窗边座位' },
  { value: 'corner', label: '角落座位' },
  { value: 'bar', label: '吧台座位' },
  { value: 'solo', label: '单人座位' },
  { value: 'group', label: '小组座位' },
  { value: 'vip', label: 'VIP座位' },
  { value: 'accessible', label: '无障碍座位' }
])

// 设备配置选项
const equipmentOptions = ref([
  { value: 'desk_lamp', label: '台灯' },
  { value: 'power_outlet', label: '电源插座' },
  { value: 'usb_port', label: 'USB接口' },
  { value: 'network_port', label: '网线接口' },
  { value: 'reading_light', label: '阅读灯' },
  { value: 'locker', label: '储物柜' },
  { value: 'whiteboard', label: '白板' },
  { value: 'computer', label: '电脑' },
  { value: 'printer', label: '打印机' },
  { value: 'scanner', label: '扫描仪' },
  { value: 'projector', label: '投影仪' },
  { value: 'headphone', label: '耳机' }
])

// 状态标签类型映射
const statusTagTypes = {
  [STATUS.AVAILABLE]: 'success',
  [STATUS.RESERVED]: 'warning',
  [STATUS.IN_USE]: 'primary',
  [STATUS.MAINTENANCE]: 'info',
  [STATUS.LOCKED]: 'danger',
  [STATUS.DISABLED]: 'info'
}

// 操作标签类型映射
const operationTagTypes = {
  '创建': 'success',
  '修改': 'warning',
  '删除': 'danger',
  '锁定': 'info',
  '解锁': 'primary',
  '预约': 'success',
  '取消预约': 'warning',
  '开始使用': 'primary',
  '结束使用': 'info',
  '设为维护': 'warning',
  '恢复可用': 'success'
}

// 响应式数据
const loading = ref(false)
const seats = ref([])
const selectedSeats = ref([])
const seatLogs = ref([])
const realTimeStats = ref([])

// 分页参数
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 筛选参数
const filterParams = reactive({
  keyword: '',
  area: '',
  status: '',
  type: ''
})

// 座位对话框
const seatDialog = reactive({
  visible: false,
  title: '',
  mode: 'add', // 'add' 或 'edit'
  loading: false
})

// 批量添加对话框
const batchAddDialog = reactive({
  visible: false
})

// 座位表单
const seatForm = reactive({
  id: null,
  seatNumber: '',
  area: '',
  type: 'standard',
  status: STATUS.AVAILABLE,
  equipmentConfig: [],
  description: '',
  imageUrl: '',
  capacity: 1,
  enabled: true
})

// 批量添加表单
const batchAddForm = reactive({
  startNumber: '',
  endNumber: '',
  area: '',
  type: 'standard',
  equipmentConfig: [],
  description: ''
})

// 表单验证规则
const seatFormRules = {
  seatNumber: [
    { required: true, message: '请输入座位号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '座位号只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择座位类型', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入座位容量', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '容量必须在1-10之间', trigger: 'blur' }
  ]
}

// 可用的状态选项（编辑时）
const availableStatuses = computed(() => {
  return [
    { value: STATUS.AVAILABLE, label: '空闲' },
    { value: STATUS.RESERVED, label: '已预约' },
    { value: STATUS.IN_USE, label: '使用中' },
    { value: STATUS.MAINTENANCE, label: '维护中' },
    { value: STATUS.LOCKED, label: '已锁定' },
    { value: STATUS.DISABLED, label: '禁用' }
  ]
})

// 生命周期钩子
onMounted(() => {
  fetchSeats()
  fetchRealTimeStats()
  fetchSeatLogs()
})

// 获取座位列表
const fetchSeats = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockSeats = generateMockSeats()
    seats.value = mockSeats.filter(seat => {
      const matchesKeyword = !filterParams.keyword ||
          seat.seatNumber.includes(filterParams.keyword) ||
          seat.area.includes(filterParams.keyword)
      const matchesArea = !filterParams.area || seat.area === filterParams.area
      const matchesStatus = !filterParams.status || seat.status === filterParams.status
      const matchesType = !filterParams.type || seat.type === filterParams.type

      return matchesKeyword && matchesArea && matchesStatus && matchesType
    })

    pagination.total = seats.value.length
  } catch (error) {
    console.error('获取座位列表失败:', error)
    ElMessage.error('获取座位列表失败')
  } finally {
    loading.value = false
  }
}

// 获取实时统计数据
const fetchRealTimeStats = async () => {
  try {
    const stats = seatStore.getSeatStats()

    realTimeStats.value = [
      {
        status: STATUS.AVAILABLE,
        label: '空闲',
        count: stats.available,
        percentage: ((stats.available / stats.total) * 100).toFixed(1),
        color: '#67c23a'
      },
      {
        status: STATUS.RESERVED,
        label: '已预约',
        count: stats.reserved,
        percentage: ((stats.reserved / stats.total) * 100).toFixed(1),
        color: '#e6a23c'
      },
      {
        status: STATUS.IN_USE,
        label: '使用中',
        count: stats.inUse,
        percentage: ((stats.inUse / stats.total) * 100).toFixed(1),
        color: '#409eff'
      },
      {
        status: STATUS.MAINTENANCE,
        label: '维护中',
        count: stats.maintenance,
        percentage: ((stats.maintenance / stats.total) * 100).toFixed(1),
        color: '#909399'
      },
      {
        status: STATUS.LOCKED,
        label: '已锁定',
        count: stats.locked,
        percentage: ((stats.locked / stats.total) * 100).toFixed(1),
        color: '#f56c6c'
      },
      {
        status: STATUS.DISABLED,
        label: '已禁用',
        count: stats.disabled,
        percentage: ((stats.disabled / stats.total) * 100).toFixed(1),
        color: '#9e9e9e'
      }
    ]
  } catch (error) {
    console.error('获取实时统计失败:', error)
  }
}

// 获取座位操作日志
const fetchSeatLogs = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    seatLogs.value = [
      {
        id: 1,
        seatNumber: 'A101',
        operation: '创建',
        operator: '管理员',
        details: '创建座位A101',
        operationTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        seatNumber: 'A101',
        operation: '修改',
        operator: '管理员',
        details: '修改设备配置',
        operationTime: '2024-01-02 11:00:00'
      },
      {
        id: 3,
        seatNumber: 'A101',
        operation: '锁定',
        operator: '管理员',
        details: '设备维修，暂时锁定',
        operationTime: '2024-01-03 09:00:00'
      },
      {
        id: 4,
        seatNumber: 'A101',
        operation: '解锁',
        operator: '管理员',
        details: '设备维修完成，恢复可用',
        operationTime: '2024-01-03 15:00:00'
      }
    ]
  } catch (error) {
    console.error('获取座位日志失败:', error)
  }
}

// 生成模拟座位数据
const generateMockSeats = () => {
  const seats = []
  const areas = ['A区', 'B区', 'C区', 'D区', 'VIP区']
  const statuses = [STATUS.AVAILABLE, STATUS.RESERVED, STATUS.IN_USE, STATUS.MAINTENANCE, STATUS.LOCKED]
  const types = ['standard', 'window', 'corner', 'vip', 'accessible']
  const equipmentOptions = ['desk_lamp', 'power_outlet', 'usb_port', 'network_port']

  for (let i = 1; i <= 50; i++) {
    const area = areas[Math.floor(Math.random() * areas.length)]
    const seatNumber = `${area.charAt(0)}${100 + i}`
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const type = types[Math.floor(Math.random() * types.length)]

    // 随机设备配置
    const equipmentCount = Math.floor(Math.random() * 3) + 1
    const equipmentConfig = []
    for (let j = 0; j < equipmentCount; j++) {
      const randomEq = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)]
      if (!equipmentConfig.includes(randomEq)) {
        equipmentConfig.push(randomEq)
      }
    }

    seats.push({
      id: i,
      seatNumber,
      area,
      type,
      status,
      equipmentConfig,
      description: '标准自习座位',
      capacity: Math.floor(Math.random() * 2) + 1,
      enabled: Math.random() > 0.1,
      currentUser: status === STATUS.IN_USE ? '用户' + Math.floor(Math.random() * 100) : null,
      reservedBy: status === STATUS.RESERVED ? '预约者' + Math.floor(Math.random() * 100) : null,
      lastOperation: i % 5 === 0 ? '修改' : '创建',
      lastOperationTime: `2024-01-${String(Math.floor(i / 2) + 1).padStart(2, '0')} 10:00:00`,
      createTime: `2024-01-${String(Math.floor(i / 5) + 1).padStart(2, '0')} 09:00:00`,
      imageUrl: `https://picsum.photos/200/150?random=${i}`
    })
  }

  return seats
}

// 辅助方法
const getStatusLabel = (status) => {
  const map = {
    [STATUS.AVAILABLE]: '空闲',
    [STATUS.RESERVED]: '已预约',
    [STATUS.IN_USE]: '使用中',
    [STATUS.MAINTENANCE]: '维护中',
    [STATUS.LOCKED]: '已锁定',
    [STATUS.DISABLED]: '已禁用'
  }
  return map[status] || '未知'
}

const getStatusTagType = (status) => {
  return statusTagTypes[status] || 'info'
}

const getSeatTypeLabel = (type) => {
  const typeObj = seatTypeList.value.find(t => t.value === type)
  return typeObj ? typeObj.label : '未知'
}

const getEquipmentLabel = (value) => {
  const eq = equipmentOptions.value.find(e => e.value === value)
  return eq ? eq.label : value
}

const getOperationTagType = (operation) => {
  return operationTagTypes[operation] || 'info'
}

// 事件处理
const handleAddSeat = () => {
  seatDialog.mode = 'add'
  seatDialog.title = '添加座位'

  // 重置表单
  Object.keys(seatForm).forEach(key => {
    seatForm[key] = ''
  })
  seatForm.id = null
  seatForm.type = 'standard'
  seatForm.status = STATUS.AVAILABLE
  seatForm.equipmentConfig = []
  seatForm.capacity = 1
  seatForm.enabled = true

  seatDialog.visible = true

  nextTick(() => {
    if (seatFormRef.value) {
      seatFormRef.value.clearValidate()
    }
  })
}

const handleEditSeat = (row) => {
  seatDialog.mode = 'edit'
  seatDialog.title = '编辑座位'

  // 填充表单数据
  Object.keys(seatForm).forEach(key => {
    if (row[key] !== undefined) {
      seatForm[key] = row[key]
    }
  })

  seatDialog.visible = true

  nextTick(() => {
    if (seatFormRef.value) {
      seatFormRef.value.clearValidate()
    }
  })
}

const handleDeleteSeat = (row) => {
  ElMessageBox.confirm(`确定删除座位 ${row.seatNumber} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        try {
          // 调用删除API
          await seatStore.deleteSeat(row.id)

          // 更新列表
          const index = seats.value.findIndex(s => s.id === row.id)
          if (index !== -1) {
            seats.value.splice(index, 1)
          }

          ElMessage.success('删除成功')
          fetchRealTimeStats() // 更新统计
        } catch (error) {
          ElMessage.error('删除失败')
        } finally {
          instance.confirmButtonLoading = false
          done()
        }
      } else {
        done()
      }
    }
  })
}

const handleSaveSeat = async () => {
  try {
    await seatFormRef.value.validate()

    seatDialog.loading = true

    if (seatDialog.mode === 'add') {
      // 调用添加API
      const newSeat = {
        ...seatForm,
        id: seats.value.length + 1,
        createTime: new Date().toLocaleString()
      }
      seats.value.unshift(newSeat)
      ElMessage.success('添加成功')
    } else {
      // 调用编辑API
      const index = seats.value.findIndex(s => s.id === seatForm.id)
      if (index !== -1) {
        seats.value[index] = {
          ...seats.value[index],
          ...seatForm,
          lastOperation: '修改',
          lastOperationTime: new Date().toLocaleString()
        }
      }
      ElMessage.success('更新成功')
    }

    seatDialog.visible = false
    fetchRealTimeStats() // 更新统计

    // 添加操作日志
    addSeatLog({
      seatNumber: seatForm.seatNumber,
      operation: seatDialog.mode === 'add' ? '创建' : '修改',
      operator: '管理员',
      details: seatDialog.mode === 'add' ? '创建新座位' : '修改座位信息'
    })
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    seatDialog.loading = false
  }
}

const handleToggleLock = (row) => {
  const isLocked = row.status === STATUS.LOCKED
  const action = isLocked ? '解锁' : '锁定'

  ElMessageBox.confirm(`确定${action}座位 ${row.seatNumber} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const newStatus = isLocked ? STATUS.AVAILABLE : STATUS.LOCKED

    // 更新状态
    const index = seats.value.findIndex(s => s.id === row.id)
    if (index !== -1) {
      seats.value[index] = {
        ...seats.value[index],
        status: newStatus,
        lastOperation: action,
        lastOperationTime: new Date().toLocaleString(),
        currentUser: null,
        reservedBy: null
      }
    }

    ElMessage.success(`${action}成功`)
    fetchRealTimeStats() // 更新统计

    // 添加操作日志
    addSeatLog({
      seatNumber: row.seatNumber,
      operation: action,
      operator: '管理员',
      details: isLocked ? '解除座位锁定' : '锁定座位（设备维修/临时预留）'
    })
  }).catch(() => {})
}

const handleBatchAdd = () => {
  batchAddDialog.visible = true

  nextTick(() => {
    if (batchAddFormRef.value) {
      batchAddFormRef.value.clearValidate()
    }
  })
}

const handleConfirmBatchAdd = () => {
  const { startNumber, endNumber, area, type, equipmentConfig, description } = batchAddForm

  // 解析座位号范围
  const prefix = startNumber.match(/^[A-Za-z]+/)?.[0] || ''
  const startNum = parseInt(startNumber.match(/\d+/)?.[0]) || 0
  const endNum = parseInt(endNumber.match(/\d+/)?.[0]) || 0

  if (startNum === 0 || endNum === 0 || endNum < startNum) {
    ElMessage.error('座位号范围无效')
    return
  }

  // 批量创建座位
  const newSeats = []
  for (let i = startNum; i <= endNum; i++) {
    const seatNumber = `${prefix}${i}`

    newSeats.push({
      id: seats.value.length + newSeats.length + 1,
      seatNumber,
      area,
      type,
      status: STATUS.AVAILABLE,
      equipmentConfig: [...equipmentConfig],
      description,
      capacity: 1,
      enabled: true,
      createTime: new Date().toLocaleString()
    })
  }

  seats.value.unshift(...newSeats)
  ElMessage.success(`成功添加 ${newSeats.length} 个座位`)
  batchAddDialog.visible = false

  // 重置表单
  Object.keys(batchAddForm).forEach(key => {
    batchAddForm[key] = ''
  })
  batchAddForm.type = 'standard'
  batchAddForm.equipmentConfig = []

  // 添加操作日志
  addSeatLog({
    seatNumber: `${startNumber}-${endNumber}`,
    operation: '批量创建',
    operator: '管理员',
    details: `批量创建座位 ${startNumber} 到 ${endNumber}`
  })
}

const handleBatchDelete = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请选择要删除的座位')
    return
  }

  const seatNumbers = selectedSeats.value.map(s => s.seatNumber).join(', ')

  ElMessageBox.confirm(`确定删除选中的 ${selectedSeats.value.length} 个座位吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 过滤掉选中的座位
    seats.value = seats.value.filter(seat =>
        !selectedSeats.value.some(selected => selected.id === seat.id)
    )

    selectedSeats.value = []
    ElMessage.success('删除成功')
    fetchRealTimeStats() // 更新统计

    // 添加操作日志
    addSeatLog({
      seatNumber: seatNumbers,
      operation: '批量删除',
      operator: '管理员',
      details: `批量删除座位：${seatNumbers}`
    })
  }).catch(() => {})
}

const handleBatchLock = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请选择要锁定的座位')
    return
  }

  // 批量锁定座位
  selectedSeats.value.forEach(seat => {
    const index = seats.value.findIndex(s => s.id === seat.id)
    if (index !== -1) {
      seats.value[index] = {
        ...seats.value[index],
        status: STATUS.LOCKED,
        lastOperation: '锁定',
        lastOperationTime: new Date().toLocaleString(),
        currentUser: null,
        reservedBy: null
      }
    }
  })

  ElMessage.success(`成功锁定 ${selectedSeats.value.length} 个座位`)
  selectedSeats.value = []
  fetchRealTimeStats()

  // 添加操作日志
  addSeatLog({
    seatNumber: '批量操作',
    operation: '批量锁定',
    operator: '管理员',
    details: `批量锁定 ${selectedSeats.value.length} 个座位`
  })
}

const handleBatchRelease = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请选择要释放的座位')
    return
  }

  // 批量释放座位
  selectedSeats.value.forEach(seat => {
    const index = seats.value.findIndex(s => s.id === seat.id)
    if (index !== -1 && seat.status === STATUS.LOCKED) {
      seats.value[index] = {
        ...seats.value[index],
        status: STATUS.AVAILABLE,
        lastOperation: '解锁',
        lastOperationTime: new Date().toLocaleString()
      }
    }
  })

  ElMessage.success(`成功释放 ${selectedSeats.value.length} 个座位`)
  selectedSeats.value = []
  fetchRealTimeStats()

  // 添加操作日志
  addSeatLog({
    seatNumber: '批量操作',
    operation: '批量释放',
    operator: '管理员',
    details: `批量释放 ${selectedSeats.value.length} 个座位`
  })
}

const handleBatchSetMaintenance = () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning('请选择要设为维护的座位')
    return
  }

  ElMessageBox.prompt('请输入维护原因', '设为维护状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入维护原因'
  }).then(({ value }) => {
    // 批量设为维护
    selectedSeats.value.forEach(seat => {
      const index = seats.value.findIndex(s => s.id === seat.id)
      if (index !== -1) {
        seats.value[index] = {
          ...seats.value[index],
          status: STATUS.MAINTENANCE,
          lastOperation: '设为维护',
          lastOperationTime: new Date().toLocaleString(),
          description: value ? `维护原因：${value}` : seat.description,
          currentUser: null,
          reservedBy: null
        }
      }
    })

    ElMessage.success(`成功设置 ${selectedSeats.value.length} 个座位为维护状态`)
    selectedSeats.value = []
    fetchRealTimeStats()

    // 添加操作日志
    addSeatLog({
      seatNumber: '批量操作',
      operation: '批量维护',
      operator: '管理员',
      details: `批量设置 ${selectedSeats.value.length} 个座位为维护状态，原因：${value}`
    })
  }).catch(() => {})
}

const handleExportSeats = () => {
  // 导出座位数据
  const data = JSON.stringify(seats.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `seats_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

const handleImageUpload = (file) => {
  // 模拟图片上传
  const reader = new FileReader()
  reader.onload = (e) => {
    seatForm.imageUrl = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSelectionChange = (selection) => {
  selectedSeats.value = selection
}

const handleSearch = () => {
  pagination.current = 1
  fetchSeats()
}

const handleFilter = () => {
  pagination.current = 1
  fetchSeats()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchSeats()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  fetchSeats()
}

const refreshRealTimeData = () => {
  fetchRealTimeStats()
  fetchSeats()
  ElMessage.success('数据已刷新')
}

// 添加座位日志
const addSeatLog = (log) => {
  const newLog = {
    id: seatLogs.value.length + 1,
    ...log,
    operationTime: new Date().toLocaleString()
  }
  seatLogs.value.unshift(newLog)

  // 保持日志列表长度
  if (seatLogs.value.length > 20) {
    seatLogs.value = seatLogs.value.slice(0, 20)
  }
}
</script>

<style scoped>
.seat-management-container {
  padding: 20px;
}

.operation-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.left-actions {
  display: flex;
  gap: 10px;
}

.right-filters {
  display: flex;
  align-items: center;
}

.batch-operation-bar {
  background-color: #f0f9ff;
  border: 1px solid #c8e6ff;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.seat-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.seat-list-view {
  margin-bottom: 20px;
}

.seat-number {
  font-weight: bold;
  color: #409eff;
}

.equipment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.equipment-tag {
  margin: 2px;
}

.empty-text {
  color: #999;
  font-style: italic;
}

.operation-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.realtime-status-panel {
  margin-top: 20px;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-percentage {
  font-size: 12px;
  color: #999;
}

.seat-logs-section {
  margin-top: 20px;
}

.seat-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat-uploader:hover {
  border-color: #409eff;
}

.seat-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seat-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  margin-top: 7px;
  color: #666;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>