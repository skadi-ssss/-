<template>
  <div class="violation-log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>违规日志查询</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
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
          <el-form-item label="处理结果">
            <el-select v-model="filterForm.result" placeholder="请选择处理结果" clearable>
              <el-option label="警告处理" value="warning" />
              <el-option label="扣除信用分" value="deduct" />
              <el-option label="加入黑名单" value="blacklist" />
              <el-option label="限制预约" value="restrict" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
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

      <!-- 日志表格 -->
      <el-table
          :data="logList"
          v-loading="loading"
          border
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="seatName" label="座位" width="100" />
        <el-table-column prop="type" label="违规类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getViolationType(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="违规描述" min-width="200" />
        <el-table-column prop="result" label="处理结果" width="120">
          <template #default="{ row }">
            <el-tag :type="getResultTagType(row.result)" size="small">
              {{ getResultText(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deductPoints" label="扣分" width="80">
          <template #default="{ row }">
            <span v-if="row.deductPoints" style="color: #f56c6c;">
              -{{ row.deductPoints }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column prop="createTime" label="登记时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click="handleViewDetail(row)"
            >
              详情
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

    <!-- 日志详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="违规日志详情"
        width="600px"
    >
      <div class="log-detail" v-if="currentLog">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">用户:</span>
              <span class="value">{{ currentLog.username }} ({{ currentLog.studentId }})</span>
            </div>
            <div class="detail-item">
              <span class="label">座位:</span>
              <span class="value">{{ currentLog.seatName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">违规类型:</span>
              <span class="value">
                <el-tag :type="getTypeTagType(currentLog.type)" size="small">
                  {{ getViolationType(currentLog.type) }}
                </el-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">登记时间:</span>
              <span class="value">{{ currentLog.createTime }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>违规详情</h4>
          <div class="detail-item">
            <span class="label">违规描述:</span>
            <div class="value description">{{ currentLog.description }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h4>处理结果</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">处理结果:</span>
              <span class="value">
                <el-tag :type="getResultTagType(currentLog.result)" size="small">
                  {{ getResultText(currentLog.result) }}
                </el-tag>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">扣除信用分:</span>
              <span class="value">{{ currentLog.deductPoints || '0' }}分</span>
            </div>
            <div class="detail-item">
              <span class="label">处理人:</span>
              <span class="value">{{ currentLog.handler }}</span>
            </div>
            <div class="detail-item">
              <span class="label">处理时间:</span>
              <span class="value">{{ currentLog.handleTime }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentLog.remark">
          <h4>处理说明</h4>
          <div class="detail-item">
            <div class="value remark">{{ currentLog.remark }}</div>
          </div>
        </div>

        <div class="detail-section" v-if="currentLog.evidence">
          <h4>违规证据</h4>
          <div class="evidence-list">
            <div v-for="(item, index) in currentLog.evidence" :key="index" class="evidence-item">
              <el-image
                  style="width: 100px; height: 100px"
                  :src="item.url"
                  :preview-src-list="[item.url]"
                  fit="cover"
              />
              <div class="evidence-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref(null)

const listQuery = reactive({
  page: 1,
  limit: 10
})

const filterForm = reactive({
  username: '',
  type: '',
  result: '',
  dateRange: []
})

const total = ref(100)

// 模拟数据
const logList = ref([
  {
    id: 1,
    username: '张三',
    studentId: '2021001',
    seatName: 'A101',
    type: '1',
    description: '预约后30分钟未到，占座不来',
    result: 'deduct',
    deductPoints: 5,
    handler: '管理员A',
    handleTime: '2024-01-15 10:30:00',
    createTime: '2024-01-15 10:00:00',
    remark: '用户多次出现此类违规行为，予以警告',
    evidence: [
      { url: 'https://via.placeholder.com/100x100', description: '座位照片' }
    ]
  },
  {
    id: 2,
    username: '李四',
    studentId: '2021002',
    seatName: 'A102',
    type: '3',
    description: '自习期间大声喧哗，影响他人学习',
    result: 'warning',
    deductPoints: 3,
    handler: '管理员B',
    handleTime: '2024-01-15 11:15:00',
    createTime: '2024-01-15 11:00:00',
    remark: '第一次警告，下次将从重处理',
    evidence: []
  },
  {
    id: 3,
    username: '王五',
    studentId: '2021003',
    seatName: 'B101',
    type: '4',
    description: '损坏座位设备，需要维修',
    result: 'blacklist',
    deductPoints: 10,
    handler: '管理员C',
    handleTime: '2024-01-14 15:30:00',
    createTime: '2024-01-14 15:00:00',
    remark: '设备维修费用较高，将加入黑名单并通报批评',
    evidence: [
      { url: 'https://via.placeholder.com/100x100', description: '损坏设备照片' }
    ]
  }
])

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

const getResultText = (result) => {
  const resultMap = {
    'warning': '警告处理',
    'deduct': '扣除信用分',
    'blacklist': '加入黑名单',
    'restrict': '限制预约',
    'other': '其他处理'
  }
  return resultMap[result] || '未知'
}

const getResultTagType = (result) => {
  const resultMap = {
    'warning': 'warning',
    'deduct': 'danger',
    'blacklist': 'danger',
    'restrict': 'info',
    'other': 'info'
  }
  return resultMap[result] || 'info'
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

const handleExport = () => {
  ElMessage.success('日志导出成功')
}

const handleViewDetail = (row) => {
  currentLog.value = row
  detailDialogVisible.value = true
}
</script>

<style scoped>
.violation-log-container {
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

.log-detail {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.detail-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-item .description,
.detail-item .remark {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  line-height: 1.5;
  margin-top: 5px;
}

.evidence-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.evidence-item {
  text-align: center;
}

.evidence-desc {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
</style>