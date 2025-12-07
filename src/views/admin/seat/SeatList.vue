<template>
  <div class="seat-container">
    <div class="operation-container">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加座位
      </el-button>

      <div class="filter-group">
        <el-select v-model="filterForm.area" placeholder="选择区域" clearable>
          <el-option label="A区" value="A" />
          <el-option label="B区" value="B" />
          <el-option label="C区" value="C" />
        </el-select>

        <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
          <el-option label="空闲" value="0" />
          <el-option label="已预约" value="1" />
          <el-option label="使用中" value="2" />
          <el-option label="维护中" value="3" />
        </el-select>
      </div>
    </div>

    <!-- 座位网格展示 -->
    <div class="seat-grid">
      <div v-for="seat in seatList" :key="seat.id" class="seat-item">
        <el-card
            :class="['seat-card', getSeatClass(seat.status)]"
            @click="handleSeatClick(seat)"
        >
          <div class="seat-info">
            <div class="seat-name">{{ seat.name }}</div>
            <div class="seat-status">{{ getStatusText(seat.status) }}</div>
            <div class="seat-area">区域: {{ seat.area }}</div>
          </div>

          <div class="seat-actions" v-if="seat.status === 1">
            <el-tag type="warning">预约人: {{ seat.reservedBy }}</el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 座位详情/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="400px"
    >
      <el-form
          ref="seatFormRef"
          :model="seatFormData"
          :rules="seatRules"
          label-width="80px"
      >
        <el-form-item label="座位号" prop="name">
          <el-input v-model="seatFormData.name" />
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-select v-model="seatFormData.area">
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="座位类型" prop="type">
          <el-select v-model="seatFormData.type">
            <el-option label="普通座位" value="1" />
            <el-option label="带插座" value="2" />
            <el-option label="带电脑" value="3" />
            <el-option label="VIP座位" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="seatFormData.status">
            <el-radio label="0">空闲</el-radio>
            <el-radio label="1">已预约</el-radio>
            <el-radio label="2">使用中</el-radio>
            <el-radio label="3">维护中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="seatFormData.remark"
              type="textarea"
              :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button
              v-if="dialogType === 'edit' && seatFormData.status === '1'"
              type="warning"
              @click="handleRelease"
          >
            手动释放
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
const dialogType = ref('add')
const seatFormRef = ref()
const filterForm = reactive({
  area: '',
  status: ''
})

const seatList = ref([
  { id: 1, name: 'A101', area: 'A', type: '1', status: '0', remark: '' },
  { id: 2, name: 'A102', area: 'A', type: '2', status: '1', reservedBy: '张三', remark: '带插座' },
  { id: 3, name: 'A103', area: 'A', type: '1', status: '2', remark: '' },
  { id: 4, name: 'B101', area: 'B', type: '3', status: '3', remark: '电脑维修中' },
  { id: 5, name: 'B102', area: 'B', type: '4', status: '0', remark: 'VIP座位' }
])

const seatFormData = reactive({
  id: null,
  name: '',
  area: '',
  type: '1',
  status: '0',
  remark: ''
})

const seatRules = {
  name: [
    { required: true, message: '请输入座位号', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加座位' : '编辑座位'
})

const getStatusText = (status) => {
  const map = {
    '0': '空闲',
    '1': '已预约',
    '2': '使用中',
    '3': '维护中'
  }
  return map[status] || '未知'
}

const getSeatClass = (status) => {
  const map = {
    '0': 'seat-available',
    '1': 'seat-reserved',
    '2': 'seat-in-use',
    '3': 'seat-maintenance'
  }
  return map[status] || ''
}

onMounted(() => {
  // 初始化座位数据
})

const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(seatFormData).forEach(key => {
    seatFormData[key] = ''
  })
  seatFormData.status = '0'
  seatFormData.type = '1'
  dialogVisible.value = true
}

const handleSeatClick = (seat) => {
  dialogType.value = 'edit'
  Object.assign(seatFormData, seat)
  dialogVisible.value = true
}

const handleRelease = () => {
  ElMessageBox.confirm('确定手动释放该座位吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    seatFormData.status = '0'
    seatFormData.reservedBy = ''
    ElMessage.success('释放成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await seatFormRef.value.validate()

    if (dialogType.value === 'add') {
      seatList.value.push({ ...seatFormData, id: seatList.value.length + 1 })
      ElMessage.success('添加成功')
    } else {
      const index = seatList.value.findIndex(item => item.id === seatFormData.id)
      if (index !== -1) {
        seatList.value[index] = { ...seatFormData }
      }
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.seat-container {
  padding: 20px;
}

.operation-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.seat-item {
  cursor: pointer;
}

.seat-card {
  transition: all 0.3s;
}

.seat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.seat-info {
  text-align: center;
}

.seat-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.seat-status {
  font-size: 14px;
  margin-bottom: 5px;
}

.seat-area {
  font-size: 12px;
  color: #666;
}

/* 不同状态的颜色 */
.seat-available {
  border-top: 4px solid #67c23a;
}

.seat-reserved {
  border-top: 4px solid #e6a23c;
}

.seat-in-use {
  border-top: 4px solid #409eff;
}

.seat-maintenance {
  border-top: 4px solid #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>