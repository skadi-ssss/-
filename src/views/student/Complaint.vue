<template>
  <div class="student-complaint-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>投诉与建议</h2>
          <div class="header-info">
            <el-tag type="info">我们重视您的每一条反馈</el-tag>
          </div>
        </div>
      </template>

      <!-- 简化的投诉表单 -->
      <el-form
          ref="complaintFormRef"
          :model="complaintForm"
          :rules="complaintRules"
          label-width="100px"
      >
        <el-form-item label="投诉类型" prop="type">
          <el-select
              v-model="complaintForm.type"
              placeholder="请选择投诉类型"
              style="width: 100%;"
          >
            <el-option label="座位相关" value="seat" />
            <el-option label="设施相关" value="facility" />
            <el-option label="环境相关" value="environment" />
            <el-option label="服务相关" value="service" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="投诉标题" prop="title">
          <el-input
              v-model="complaintForm.title"
              placeholder="请简要描述投诉内容"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="详细内容" prop="content">
          <el-input
              v-model="complaintForm.content"
              type="textarea"
              :rows="4"
              placeholder="请详细描述投诉内容"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
          >
            {{ submitting ? '提交中...' : '提交投诉' }}
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的投诉记录 -->
    <el-card class="history-card" style="margin-top: 20px;">
      <template #header>
        <h3>我的投诉记录</h3>
      </template>

      <el-table :data="myComplaints" v-loading="loading">
        <el-table-column prop="title" label="投诉标题" width="200" />
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
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const submitting = ref(false)
const loading = ref(false)

const complaintForm = reactive({
  type: '',
  title: '',
  content: ''
})

const complaintRules = {
  type: [
    { required: true, message: '请选择投诉类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入投诉标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入投诉内容', trigger: 'blur' }
  ]
}

const myComplaints = ref([
  {
    id: 1,
    title: '座位损坏',
    type: 'seat',
    status: 'resolved',
    createTime: '2024-01-01 10:00:00',
    reply: '问题已解决，座位已修复'
  },
  {
    id: 2,
    title: '空调温度太低',
    type: 'facility',
    status: 'processing',
    createTime: '2024-01-02 14:30:00',
    reply: '已收到您的反馈，正在处理中'
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

const handleSubmit = async () => {
  // 提交投诉逻辑
  submitting.value = true
  setTimeout(() => {
    ElMessage.success('投诉提交成功')
    submitting.value = false
    handleReset()
  }, 1000)
}

const handleReset = () => {
  complaintForm.type = ''
  complaintForm.title = ''
  complaintForm.content = ''
}

onMounted(() => {
  // 加载投诉数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.student-complaint-container {
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