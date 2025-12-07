<template>
  <div class="reservation-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约信息查询</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="日期">
            <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input
                v-model="filterForm.username"
                placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择">
              <el-option label="全部" value="" />
              <el-option label="已预约" value="1" />
              <el-option label="使用中" value="2" />
              <el-option label="已完成" value="3" />
              <el-option label="已取消" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="reservationList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="seatName" label="座位" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="duration" label="时长(小时)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预约时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 1"
                size="small"
                type="danger"
                @click="handleCancel(row)"
            >
              取消
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)

const filterForm = reactive({
  dateRange: [],
  username: '',
  status: ''
})

const listQuery = reactive({
  page: 1,
  limit: 10
})

const reservationList = ref([
  {
    id: 1,
    username: '张三',
    seatName: 'A101',
    startTime: '2024-01-01 09:00:00',
    endTime: '2024-01-01 12:00:00',
    duration: 3,
    status: 2,
    createTime: '2024-01-01 08:30:00'
  },
  {
    id: 2,
    username: '李四',
    seatName: 'B102',
    startTime: '2024-01-01 14:00:00',
    endTime: '2024-01-01 17:00:00',
    duration: 3,
    status: 1,
    createTime: '2024-01-01 13:30:00'
  }
])

const getStatusText = (status) => {
  const map = {
    1: '已预约',
    2: '使用中',
    3: '已完成',
    4: '已取消'
  }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = {
    1: 'primary',
    2: 'success',
    3: 'info',
    4: 'danger'
  }
  return map[status] || ''
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

const handleSearch = () => {
  listQuery.page = 1
  getList()
}

const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  filterForm.dateRange = []
  getList()
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定取消该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('取消成功')
    getList()
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
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

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>