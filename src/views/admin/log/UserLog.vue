<template>
  <div class="log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户日志查询</span>
          <div class="header-actions">
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateChange"
            />
            <el-input
                v-model="searchKeyword"
                placeholder="搜索用户名/操作"
                style="width: 200px; margin-left: 10px;"
                @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="logList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="operation" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationType(row.operationType)">
              {{ row.operation }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="操作详情" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
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
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const dateRange = ref([])
const searchKeyword = ref('')
const total = ref(0)

const listQuery = reactive({
  page: 1,
  limit: 10,
  startDate: '',
  endDate: '',
  keyword: ''
})

const logList = ref([
  {
    id: 1,
    username: '张三',
    operation: '登录系统',
    operationType: 'login',
    details: '用户登录成功',
    ip: '192.168.1.100',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: '李四',
    operation: '预约座位',
    operationType: 'reserve',
    details: '预约座位A101成功',
    ip: '192.168.1.101',
    createTime: '2024-01-01 11:00:00'
  },
  {
    id: 3,
    username: '王五',
    operation: '提交反馈',
    operationType: 'feedback',
    details: '提交功能建议',
    ip: '192.168.1.102',
    createTime: '2024-01-01 12:00:00'
  }
])

const getOperationType = (type) => {
  const map = {
    login: 'success',
    reserve: 'primary',
    feedback: 'warning',
    error: 'danger'
  }
  return map[type] || 'info'
}

onMounted(() => {
  getList()
})

const getList = () => {
  loading.value = true
  // 调用API获取日志列表
  setTimeout(() => {
    total.value = 100
    loading.value = false
  }, 500)
}

const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    listQuery.startDate = dates[0]
    listQuery.endDate = dates[1]
  } else {
    listQuery.startDate = ''
    listQuery.endDate = ''
  }
  listQuery.page = 1
  getList()
}

const handleSearch = () => {
  listQuery.keyword = searchKeyword.value
  listQuery.page = 1
  getList()
}
</script>

<style scoped>
.log-container {
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