<template>
  <div class="complaint-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>投诉管理</h2>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索投诉"
              style="width: 200px;"
              @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="complaints" v-loading="loading">
        <el-table-column prop="title" label="投诉标题" width="200" />
        <el-table-column prop="userName" label="投诉人" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column prop="reply" label="回复内容" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
                size="small"
                type="warning"
                @click="handleProcess(row)"
                v-if="row.status === 'pending'"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const searchKeyword = ref('')

const complaints = ref([
  {
    id: 1,
    title: '座位损坏',
    userName: '张三',
    type: 'seat',
    status: 'resolved',
    createTime: '2024-01-01 10:00:00',
    reply: '问题已解决，座位已修复'
  },
  {
    id: 2,
    title: '空调温度太低',
    userName: '李四',
    type: 'facility',
    status: 'processing',
    createTime: '2024-01-02 14:30:00',
    reply: '已收到反馈，正在处理'
  },
  {
    id: 3,
    title: '环境噪音',
    userName: '王五',
    type: 'environment',
    status: 'pending',
    createTime: '2024-01-03 09:15:00',
    reply: ''
  }
])

const getTypeLabel = (type) => {
  const map = {
    'seat': '座位相关',
    'facility': '设施相关',
    'environment': '环境相关',
    'service': '服务相关',
    'other': '其他'
  }
  return map[type] || '未知'
}

const getStatusLabel = (status) => {
  const map = {
    'pending': '待处理',
    'processing': '处理中',
    'resolved': '已解决',
    'rejected': '已拒绝'
  }
  return map[status] || '未知'
}

const getStatusColor = (status) => {
  const map = {
    'pending': 'danger',
    'processing': 'warning',
    'resolved': 'success',
    'rejected': 'info'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
}

const handleViewDetail = (row) => {
  console.log('查看详情:', row)
}

const handleProcess = (row) => {
  console.log('处理投诉:', row)
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.complaint-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}
</style>