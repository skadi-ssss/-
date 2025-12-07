<template>
  <div class="blacklist-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>黑名单管理</span>
          <el-button type="primary" @click="handleAddToBlacklist">
            <el-icon><Plus /></el-icon>
            添加至黑名单
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
          <el-form-item label="学号">
            <el-input
                v-model="filterForm.studentId"
                placeholder="请输入学号"
                clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="生效中" value="1" />
              <el-option label="已解除" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div class="stats-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalCount }}</div>
                <div class="stat-label">黑名单总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ stats.activeCount }}</div>
                <div class="stat-label">生效中</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ stats.avgViolations }}</div>
                <div class="stat-label">平均违规次数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ stats.avgCreditScore }}</div>
                <div class="stat-label">平均信用分</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 黑名单表格 -->
      <el-table
          :data="blacklist"
          v-loading="loading"
          border
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户姓名" width="120" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="creditScore" label="信用分" width="100">
          <template #default="{ row }">
            <el-rate
                v-model="row.creditScore"
                disabled
                :max="100"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :low-threshold="60"
                :high-threshold="80"
                :texts="['0-59', '60-79', '80-100']"
                show-text
                style="--el-rate-text-color: #333;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="violationCount" label="违规次数" width="100" />
        <el-table-column prop="reason" label="加入原因" />
        <el-table-column prop="startDate" label="生效时间" width="120" />
        <el-table-column prop="endDate" label="解除时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'danger' : 'info'">
              {{ row.status === '1' ? '生效中' : '已解除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="row.status === '1'"
                size="small"
                type="warning"
                @click="handleRemove(row)"
            >
              解除
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

    <!-- 添加至黑名单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="添加至黑名单"
        width="500px"
    >
      <el-form
          ref="blacklistFormRef"
          :model="blacklistForm"
          :rules="blacklistRules"
          label-width="100px"
      >
        <el-form-item label="用户" prop="userId">
          <el-select
              v-model="blacklistForm.userId"
              placeholder="请选择用户"
              filterable
              @change="handleUserSelect"
              style="width: 100%"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.username} (${user.studentId}) - 信用分: ${user.creditScore}`"
                :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="加入原因" prop="reason">
          <el-select
              v-model="blacklistForm.reason"
              placeholder="请选择加入原因"
              style="width: 100%"
          >
            <el-option label="多次违规" value="multiple_violations" />
            <el-option label="严重违规" value="serious_violation" />
            <el-option label="信用分过低" value="low_credit" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="说明" prop="description">
          <el-input
              v-model="blacklistForm.description"
              type="textarea"
              :rows="3"
              placeholder="请详细说明加入黑名单的原因"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="黑名单期限" prop="duration">
          <el-radio-group v-model="blacklistForm.duration">
            <el-radio label="7">7天</el-radio>
            <el-radio label="30">30天</el-radio>
            <el-radio label="90">90天</el-radio>
            <el-radio label="permanent">永久</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="限制措施" prop="restrictions">
          <el-checkbox-group v-model="blacklistForm.restrictions">
            <el-checkbox label="no_reservation" value="no_reservation">禁止预约</el-checkbox>
            <el-checkbox label="no_use" value="no_use">禁止使用座位</el-checkbox>
            <el-checkbox label="no_privilege" value="no_privilege">取消特殊权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看违规记录对话框 -->
    <el-dialog
        v-model="violationDialogVisible"
        title="用户违规记录"
        width="800px"
    >
      <el-table :data="userViolations" border style="width: 100%">
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column prop="type" label="违规类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">
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
            <el-tag size="small" :type="row.status === '1' ? 'success' : 'warning'">
              {{ row.status === '1' ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="violationDialogVisible = false">关闭</el-button>
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
const violationDialogVisible = ref(false)
const blacklistFormRef = ref()
const currentUserId = ref(null)

const listQuery = reactive({
  page: 1,
  limit: 10
})

const filterForm = reactive({
  username: '',
  studentId: '',
  status: ''
})

const total = ref(50)

// 模拟数据
const blacklist = ref([
  {
    id: 1,
    userId: 1,
    username: '张三',
    studentId: '2021001',
    creditScore: 60,
    violationCount: 3,
    reason: '多次违规占座',
    description: '连续三天预约后未到场，造成资源浪费',
    startDate: '2024-01-10',
    endDate: '2024-02-09',
    duration: '30',
    restrictions: ['no_reservation', 'no_use'],
    status: '1'
  },
  {
    id: 2,
    userId: 2,
    username: '李四',
    studentId: '2021002',
    creditScore: 45,
    violationCount: 5,
    reason: '信用分过低',
    description: '多次违规导致信用分低于50分',
    startDate: '2024-01-05',
    endDate: '2024-04-05',
    duration: '90',
    restrictions: ['no_reservation', 'no_use', 'no_privilege'],
    status: '1'
  },
  {
    id: 3,
    userId: 3,
    username: '王五',
    studentId: '2021003',
    creditScore: 80,
    violationCount: 1,
    reason: '严重违规',
    description: '损坏座位设备',
    startDate: '2023-12-01',
    endDate: '2023-12-08',
    duration: '7',
    restrictions: ['no_reservation'],
    status: '0'
  }
])

const userList = ref([
  { id: 1, username: '张三', studentId: '2021001', creditScore: 60 },
  { id: 2, username: '李四', studentId: '2021002', creditScore: 45 },
  { id: 3, username: '王五', studentId: '2021003', creditScore: 80 },
  { id: 4, username: '赵六', studentId: '2021004', creditScore: 95 }
])

const userViolations = ref([])

const blacklistForm = reactive({
  userId: '',
  reason: '',
  description: '',
  duration: '7',
  restrictions: ['no_reservation', 'no_use']
})

const blacklistRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请选择加入原因', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入说明', trigger: 'blur' }
  ]
}

// 计算属性
const stats = computed(() => {
  const totalCount = blacklist.value.length
  const activeCount = blacklist.value.filter(item => item.status === '1').length
  const avgViolations = blacklist.value.length > 0
      ? (blacklist.value.reduce((sum, item) => sum + item.violationCount, 0) / blacklist.value.length).toFixed(1)
      : 0
  const avgCreditScore = blacklist.value.length > 0
      ? Math.round(blacklist.value.reduce((sum, item) => sum + item.creditScore, 0) / blacklist.value.length)
      : 0

  return {
    totalCount,
    activeCount,
    avgViolations,
    avgCreditScore
  }
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
    filterForm[key] = ''
  })
  getList()
}

const handleAddToBlacklist = () => {
  dialogVisible.value = true
}

const handleUserSelect = (userId) => {
  if (userId) {
    // 加载用户的违规记录
    loadUserViolations(userId)
  }
}

const loadUserViolations = (userId) => {
  // 模拟加载违规记录
  userViolations.value = [
    {
      createTime: '2024-01-15 10:00:00',
      type: '1',
      description: '预约后30分钟未到',
      deductPoints: 5,
      status: '1'
    },
    {
      createTime: '2024-01-10 14:30:00',
      type: '2',
      description: '使用期间大声喧哗',
      deductPoints: 3,
      status: '1'
    },
    {
      createTime: '2024-01-05 09:15:00',
      type: '1',
      description: '预约未取消且未到场',
      deductPoints: 5,
      status: '1'
    }
  ]
}

const handleAddSubmit = async () => {
  try {
    await blacklistFormRef.value.validate()

    // 模拟API调用
    ElMessageBox.confirm('确定要将该用户加入黑名单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      loading.value = true

      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 获取用户信息
      const user = userList.value.find(u => u.id === blacklistForm.userId)
      if (user) {
        // 添加到黑名单
        const newItem = {
          id: blacklist.value.length + 1,
          userId: user.id,
          username: user.username,
          studentId: user.studentId,
          creditScore: user.creditScore,
          violationCount: userViolations.value.length,
          reason: blacklistForm.reason,
          description: blacklistForm.description,
          startDate: new Date().toISOString().split('T')[0],
          endDate: blacklistForm.duration === 'permanent'
              ? '永久'
              : getEndDate(parseInt(blacklistForm.duration)),
          duration: blacklistForm.duration,
          restrictions: blacklistForm.restrictions,
          status: '1'
        }

        blacklist.value.unshift(newItem)

        ElMessage.success('用户已成功加入黑名单')
        dialogVisible.value = false
        getList()
      }
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const getEndDate = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const handleRemove = (row) => {
  ElMessageBox.confirm('确定要解除该用户的黑名单限制吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      row.status = '0'
      row.endDate = new Date().toISOString().split('T')[0]
      ElMessage.success('黑名单已解除')
      loading.value = false
    }, 500)
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该黑名单记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = blacklist.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        blacklist.value.splice(index, 1)
      }
      ElMessage.success('黑名单记录已删除')
      loading.value = false
    }, 500)
  }).catch(() => {})
}

const viewViolations = (userId) => {
  currentUserId.value = userId
  loadUserViolations(userId)
  violationDialogVisible.value = true
}
</script>

<style scoped>
.blacklist-container {
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

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-rate) {
  --el-rate-font-size: 14px;
}
</style>