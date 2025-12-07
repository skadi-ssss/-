<template>
  <div class="violation-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>违规记录管理</span>
          <el-button type="primary" @click="handleAddViolation">
            <el-icon><Plus /></el-icon>
            手动登记违规
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="用户姓名">
            <el-input
                v-model="filterForm.username"
                placeholder="请输入用户姓名"
                clearable
            />
          </el-form-item>
          <el-form-item label="违规类型">
            <el-select v-model="filterForm.type" placeholder="请选择违规类型" clearable>
              <el-option label="占座不来" value="1" />
              <el-option label="预约超时未签到" value="2" />
              <el-option label="大声喧哗" value="3" />
              <el-option label="损坏设备" value="4" />
              <el-option label="其他违规" value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="待处理" value="0" />
              <el-option label="已处理" value="1" />
              <el-option label="已撤销" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 违规记录表格 -->
      <el-table
          :data="violationList"
          v-loading="loading"
          border
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="seatName" label="座位" width="100" />
        <el-table-column prop="type" label="违规类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getViolationType(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="违规描述" />
        <el-table-column prop="deductPoints" label="扣分" width="80">
          <template #default="{ row }">
            <span style="color: #f56c6c;">-{{ row.deductPoints }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column prop="createTime" label="登记时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 0"
                size="small"
                type="primary"
                @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
                v-if="row.status === 0"
                size="small"
                type="warning"
                @click="handleRevoke(row)"
            >
              撤销
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 手动登记违规对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="手动登记违规"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          ref="violationFormRef"
          :model="violationForm"
          :rules="violationRules"
          label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户" prop="userId">
              <el-select
                  v-model="violationForm.userId"
                  placeholder="请选择用户"
                  filterable
                  @change="handleUserChange"
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="座位" prop="seatId">
              <el-select
                  v-model="violationForm.seatId"
                  placeholder="请选择座位"
                  filterable
                  style="width: 100%"
              >
                <el-option
                    v-for="seat in seatList"
                    :key="seat.id"
                    :label="`${seat.name} (${seat.area}区)`"
                    :value="seat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="违规类型" prop="type">
          <el-select
              v-model="violationForm.type"
              placeholder="请选择违规类型"
              style="width: 100%"
          >
            <el-option label="占座不来" value="1" />
            <el-option label="预约超时未签到" value="2" />
            <el-option label="大声喧哗" value="3" />
            <el-option label="损坏设备" value="4" />
            <el-option label="其他违规" value="5" />
          </el-select>
        </el-form-item>

        <el-form-item label="扣分" prop="deductPoints">
          <el-input-number
              v-model="violationForm.deductPoints"
              :min="1"
              :max="20"
              :step="1"
              style="width: 100%"
          />
          <div class="form-tip">本次违规将扣除用户{{ violationForm.deductPoints }}信用分</div>
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

        <el-form-item label="是否释放座位" prop="releaseSeat">
          <el-switch
              v-model="violationForm.releaseSeat"
              active-text="是"
              inactive-text="否"
          />
          <div class="form-tip" v-if="violationForm.releaseSeat">
            登记违规后将自动释放该座位供其他用户使用
          </div>
        </el-form-item>

        <el-form-item label="加入黑名单" prop="addToBlacklist">
          <el-switch
              v-model="violationForm.addToBlacklist"
              active-text="是"
              inactive-text="否"
          />
          <div class="form-tip" v-if="violationForm.addToBlacklist">
            该用户将被加入黑名单，暂时无法预约和使用座位
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 处理违规对话框 -->
    <el-dialog
        v-model="processDialogVisible"
        title="处理违规"
        width="500px"
    >
      <el-form
          ref="processFormRef"
          :model="processForm"
          :rules="processRules"
          label-width="100px"
      >
        <el-form-item label="处理措施" prop="measure">
          <el-select
              v-model="processForm.measure"
              placeholder="请选择处理措施"
              style="width: 100%"
          >
            <el-option label="警告处理" value="warning" />
            <el-option label="扣除信用分" value="deduct" />
            <el-option label="加入黑名单" value="blacklist" />
            <el-option label="限制预约" value="restrict" />
            <el-option label="其他处理" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="处理说明" prop="remark">
          <el-input
              v-model="processForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请填写处理说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleProcessSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const processDialogVisible = ref(false)
const violationFormRef = ref()
const processFormRef = ref()
const currentViolationId = ref(null)

const listQuery = reactive({
  page: 1,
  limit: 10
})

const filterForm = reactive({
  username: '',
  type: '',
  status: '',
  dateRange: []
})

const total = ref(100)

// 模拟数据
const violationList = ref([
  {
    id: 1,
    userId: 1,
    username: '张三',
    studentId: '2021001',
    seatId: 1,
    seatName: 'A101',
    type: '1',
    description: '预约后30分钟未到，占座不来',
    deductPoints: 5,
    status: '1',
    handler: '管理员A',
    handleTime: '2024-01-15 10:30:00',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    userId: 2,
    username: '李四',
    studentId: '2021002',
    seatId: 2,
    seatName: 'A102',
    type: '2',
    description: '大声喧哗影响他人学习',
    deductPoints: 3,
    status: '0',
    handler: '',
    handleTime: '',
    createTime: '2024-01-15 11:00:00'
  }
])

const userList = ref([
  { id: 1, username: '张三', studentId: '2021001', creditScore: 85 },
  { id: 2, username: '李四', studentId: '2021002', creditScore: 90 },
  { id: 3, username: '王五', studentId: '2021003', creditScore: 70 },
  { id: 4, username: '赵六', studentId: '2021004', creditScore: 95 }
])

const seatList = ref([
  { id: 1, name: 'A101', area: 'A', status: '1' },
  { id: 2, name: 'A102', area: 'A', status: '1' },
  { id: 3, name: 'B101', area: 'B', status: '0' },
  { id: 4, name: 'B102', area: 'B', status: '2' }
])

const violationForm = reactive({
  userId: '',
  seatId: '',
  type: '1',
  deductPoints: 5,
  description: '',
  releaseSeat: true,
  addToBlacklist: false
})

const violationRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择违规类型', trigger: 'change' }
  ],
  deductPoints: [
    { required: true, message: '请输入扣分数值', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入违规描述', trigger: 'blur' }
  ]
}

const processForm = reactive({
  measure: '',
  remark: ''
})

const processRules = {
  measure: [
    { required: true, message: '请选择处理措施', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请输入处理说明', trigger: 'blur' }
  ]
}

// 计算属性
const selectedUser = computed(() => {
  if (!violationForm.userId) return null
  return userList.value.find(user => user.id === violationForm.userId)
})

// 方法
const getViolationType = (type) => {
  const typeMap = {
    '1': '占座不来',
    '2': '预约超时未签到',
    '3': '大声喧哗',
    '4': '损坏设备',
    '5': '其他违规'
  }
  return typeMap[type] || '未知类型'
}

const getTypeTagType = (type) => {
  const typeMap = {
    '1': 'danger',
    '2': 'warning',
    '3': 'info',
    '4': 'danger',
    '5': 'info'
  }
  return typeMap[type] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    '0': '待处理',
    '1': '已处理',
    '2': '已撤销'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const statusMap = {
    '0': 'warning',
    '1': 'success',
    '2': 'info'
  }
  return statusMap[status] || 'info'
}

onMounted(() => {
  getList()
})

const getList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  listQuery.page = 1
  getList()
}

const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    if (key === 'dateRange') {
      filterForm[key] = []
    } else {
      filterForm[key] = ''
    }
  })
  getList()
}

const handleAddViolation = () => {
  dialogVisible.value = true
}

const handleDialogClose = () => {
  violationFormRef.value?.resetFields()
  Object.keys(violationForm).forEach(key => {
    if (key !== 'type') {
      violationForm[key] = ''
    }
  })
  violationForm.type = '1'
  violationForm.deductPoints = 5
  violationForm.releaseSeat = true
  violationForm.addToBlacklist = false
}

const handleUserChange = (userId) => {
  if (userId) {
    const user = userList.value.find(u => u.id === userId)
    if (user) {
      // 根据信用分调整默认扣分
      if (user.creditScore < 60) {
        violationForm.deductPoints = 10
      } else if (user.creditScore < 80) {
        violationForm.deductPoints = 8
      } else {
        violationForm.deductPoints = 5
      }
    }
  }
}

const handleSubmit = async () => {
  try {
    await violationFormRef.value.validate()

    // 模拟API调用
    ElMessageBox.confirm('确定要登记该违规吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      loading.value = true

      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 扣减用户信用分
      const userIndex = userList.value.findIndex(u => u.id === violationForm.userId)
      if (userIndex !== -1) {
        userList.value[userIndex].creditScore -= violationForm.deductPoints
      }

      // 如果选择释放座位，更新座位状态
      if (violationForm.releaseSeat && violationForm.seatId) {
        const seatIndex = seatList.value.findIndex(s => s.id === violationForm.seatId)
        if (seatIndex !== -1) {
          seatList.value[seatIndex].status = '0' // 空闲
        }
      }

      // 如果选择加入黑名单，添加到黑名单
      if (violationForm.addToBlacklist) {
        // 这里可以调用黑名单添加API
      }

      // 记录违规日志
      const violationLog = {
        id: violationList.value.length + 1,
        userId: violationForm.userId,
        username: selectedUser.value?.username || '',
        seatId: violationForm.seatId,
        seatName: seatList.value.find(s => s.id === violationForm.seatId)?.name || '',
        type: violationForm.type,
        description: violationForm.description,
        deductPoints: violationForm.deductPoints,
        status: '0',
        createTime: new Date().toLocaleString()
      }

      violationList.value.unshift(violationLog)

      ElMessage.success('违规登记成功')
      dialogVisible.value = false
      getList()
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleProcess = (row) => {
  currentViolationId.value = row.id
  processDialogVisible.value = true
}

const handleProcessSubmit = async () => {
  try {
    await processFormRef.value.validate()

    // 模拟API调用
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新违规记录状态
    const index = violationList.value.findIndex(v => v.id === currentViolationId.value)
    if (index !== -1) {
      violationList.value[index].status = '1'
      violationList.value[index].handler = '当前管理员'
      violationList.value[index].handleTime = new Date().toLocaleString()
    }

    ElMessage.success('违规处理成功')
    processDialogVisible.value = false
    getList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleRevoke = (row) => {
  ElMessageBox.confirm('确定要撤销该违规记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API调用
    loading.value = true
    setTimeout(() => {
      row.status = '2'
      ElMessage.success('违规记录已撤销')
      loading.value = false
    }, 500)
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该违规记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟API调用
    loading.value = true
    setTimeout(() => {
      const index = violationList.value.findIndex(v => v.id === row.id)
      if (index !== -1) {
        violationList.value.splice(index, 1)
      }
      ElMessage.success('违规记录已删除')
      loading.value = false
    }, 500)
  }).catch(() => {})
}
</script>

<style scoped>
.violation-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>