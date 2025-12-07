<template>
  <div class="feedback-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>反馈信息管理</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>

      <el-table :data="feedbackList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" />
        <el-table-column prop="content" label="反馈内容" />
        <el-table-column prop="type" label="反馈类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ feedbackTypeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="反馈时间" />
        <el-table-column label="操作" width="200">
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
                size="small"
                type="danger"
                @click="handleDelete(row)"
            >
              删除
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

const listQuery = reactive({
  page: 1,
  limit: 10
})

const feedbackTypeMap = {
  1: '功能建议',
  2: '故障报告',
  3: '投诉建议',
  4: '其他'
}

const feedbackList = ref([
  {
    id: 1,
    username: '张三',
    content: '希望增加预约提醒功能',
    type: 1,
    status: 0,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: '李四',
    content: '座位A101的插座损坏',
    type: 2,
    status: 1,
    createTime: '2024-01-02 11:00:00'
  }
])

onMounted(() => {
  getList()
})

const getList = () => {
  loading.value = true
  // 调用API获取反馈列表
  setTimeout(() => {
    total.value = 50
    loading.value = false
  }, 500)
}

const handleProcess = (row) => {
  ElMessageBox.confirm('确定标记为已处理吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success('处理成功')
    getList()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该反馈吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const handleExport = () => {
  // 导出功能
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.feedback-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>