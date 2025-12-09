<template>
  <div class="complaint-container">
    <el-card class="complaint-card">
      <template #header>
        <div class="card-header">
          <h2>投诉与建议</h2>
          <div class="header-info">
            <el-tag type="info">我们重视您的每一条反馈</el-tag>
          </div>
        </div>
      </template>

      <!-- 投诉表单 -->
      <el-form
          ref="complaintFormRef"
          :model="complaintForm"
          :rules="complaintRules"
          label-width="100px"
          class="complaint-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="投诉类型" prop="type">
              <el-select
                  v-model="complaintForm.type"
                  placeholder="请选择投诉类型"
                  style="width: 100%;"
              >
                <el-option
                    v-for="type in complaintTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生地点" prop="location">
              <el-input
                  v-model="complaintForm.location"
                  placeholder="请输入具体位置，如：A区101座位"
              />
            </el-form-item>
          </el-col>
        </el-row>

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
              placeholder="请详细描述投诉内容，包括时间、具体情况等"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="座位号" prop="seatNumber">
              <el-input
                  v-model="complaintForm.seatNumber"
                  placeholder="如有相关座位号，请填写"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactInfo">
              <el-input
                  v-model="complaintForm.contactInfo"
                  placeholder="请输入联系方式，方便我们与您沟通"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上传图片" prop="images">
          <el-upload
              class="complaint-upload"
              action="#"
              :file-list="complaintForm.images"
              :on-change="handleImageUpload"
              :on-remove="handleImageRemove"
              :auto-upload="false"
              list-type="picture-card"
              accept="image/*"
              :limit="3"
              :on-exceed="handleExceed"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传3张图片，每张不超过2MB</div>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              @click="handleSubmit"
              :loading="submitting"
              style="width: 200px;"
          >
            {{ submitting ? '提交中...' : '提交投诉' }}
          </el-button>
          <el-button
              size="large"
              @click="handleReset"
              style="margin-left: 20px;"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的投诉历史 -->
    <el-card class="history-card" v-if="authStore.user">
      <template #header>
        <div class="card-header">
          <h3>我的投诉记录</h3>
          <el-button
              type="text"
              @click="refreshMyComplaints"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
          :data="myComplaints"
          v-loading="loading"
          style="width: 100%"
      >
        <el-table-column prop="title" label="投诉标题" width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ complaintStore.getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="complaintStore.getStatusColor(row.status)">
              {{ complaintStore.getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="reply" label="回复内容" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click="viewComplaintDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useComplaintStore } from '@/store/complaint'
import { useAuthStore } from '@/store/auth'

const complaintStore = useComplaintStore()
const authStore = useAuthStore()
const complaintFormRef = ref()
const submitting = ref(false)
const loading = ref(false)

// 投诉类型选项
const complaintTypeOptions = [
  { value: 'seat', label: '座位相关' },
  { value: 'facility', label: '设施相关' },
  { value: 'environment', label: '环境相关' },
  { value: 'service', label: '服务相关' },
  { value: 'other', label: '其他' }
]

// 投诉表单
const complaintForm = reactive({
  type: '',
  location: '',
  title: '',
  content: '',
  seatNumber: '',
  contactInfo: '',
  images: []
})

// 表单验证规则
const complaintRules = {
  type: [
    { required: true, message: '请选择投诉类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入发生地点', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入投诉标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度在5到50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入投诉内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度在10到500个字符', trigger: 'blur' }
  ],
  contactInfo: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
}

// 我的投诉历史
const myComplaints = computed(() => {
  if (!authStore.user) return []

  return complaintStore.complaintList.filter(
      complaint => complaint.userId === authStore.user.id
  ).slice(0, 10) // 只显示最近10条
})

// 生命周期钩子
onMounted(() => {
  if (authStore.user) {
    loadMyComplaints()
  }
})

// 加载我的投诉
const loadMyComplaints = async () => {
  loading.value = true
  try {
    await complaintStore.fetchComplaints({
      page: 1,
      size: 10
    })
  } catch (error) {
    console.error('加载投诉记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交投诉
const handleSubmit = async () => {
  try {
    await complaintFormRef.value.validate()

    submitting.value = true

    const complaintData = {
      ...complaintForm,
      userId: authStore.user?.id || 'anonymous',
      userName: authStore.user?.username || '匿名用户',
      images: complaintForm.images.map(img => img.url || img.raw)
    }

    const result = await complaintStore.submitComplaint(complaintData)

    if (result.success) {
      ElMessage.success(result.message)
      handleReset()
      loadMyComplaints() // 刷新列表
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请检查表单')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  complaintFormRef.value?.resetFields()
  complaintForm.images = []
}

// 处理图片上传
const handleImageUpload = (file, fileList) => {
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }

  complaintForm.images = fileList
  return true
}

// 处理图片移除
const handleImageRemove = (file, fileList) => {
  complaintForm.images = fileList
}

// 处理超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传3张图片')
}

// 查看投诉详情
const viewComplaintDetail = (complaint) => {
  ElMessageBox.alert(
      `
      <div class="complaint-detail">
        <h3>${complaint.title}</h3>
        <p><strong>投诉类型：</strong>${complaintStore.getTypeLabel(complaint.type)}</p>
        <p><strong>发生地点：</strong>${complaint.location}</p>
        <p><strong>投诉时间：</strong>${formatDate(complaint.createTime)}</p>
        <p><strong>投诉内容：</strong>${complaint.content}</p>
        ${complaint.reply ? `<p><strong>管理员回复：</strong>${complaint.reply}</p>` : ''}
        ${complaint.replyTime ? `<p><strong>回复时间：</strong>${formatDate(complaint.replyTime)}</p>` : ''}
      </div>
    `,
      '投诉详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭',
        customClass: 'complaint-detail-dialog'
      }
  )
}

// 刷新我的投诉
const refreshMyComplaints = () => {
  loadMyComplaints()
  ElMessage.success('已刷新')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.complaint-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.complaint-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.complaint-form {
  padding: 20px 0;
}

.complaint-upload {
  width: 100%;
}

.complaint-upload :deep(.el-upload) {
  width: 100px;
  height: 100px;
}

.upload-tip {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
}

.history-card {
  margin-top: 30px;
}

.complaint-detail {
  line-height: 1.6;
}

.complaint-detail h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.complaint-detail p {
  margin: 8px 0;
}

.complaint-detail strong {
  color: #666;
  display: inline-block;
  width: 80px;
}

:deep(.complaint-detail-dialog) {
  min-width: 500px;
}
</style>