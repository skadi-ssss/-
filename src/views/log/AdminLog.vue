<template>
  <div class="log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理操作日志</span>
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
                placeholder="搜索管理员/操作"
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
        <el-table-column prop="adminName" label="管理员" width="120" />
        <el-table-column prop="module" label="操作模块" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.module }}</el-tag>
          </template>
        </el-table-column>
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
    adminName: 'admin',
    module: '用户管理',
    operation: '添加用户',
    operationType: 'add',
    details: '添加用户李四',
    ip: '192.168.1.100',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    adminName: 'admin',
    module: '座位管理',
    operation: '修改座位',
    operationType: 'update',
    details: '修改座位A101状态为维护中',
    ip: '192.168.1.100',
    createTime: '2024-01-01 11:00:00'
  },
  {
    id: 3,
    adminName: 'admin',
    module: '预约管理',
    operation: '取消预约',
    operationType: 'cancel',
    details: '取消用户张三的预约',
    ip: '192.168.1.100',
    createTime: '2024-01-01 12:00:00'
  }
])

const getOperationType = (type) => {
  const map = {
    add: 'success',
    update: 'primary',
    delete: 'danger',
    cancel: 'warning',
    export: 'info'
  }
  return map[type] || ''
}

onMounted(() => {
  getList()
})

const getList = () => {
  loading.value = true
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