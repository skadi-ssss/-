<template>
  <div>
    <div class="header">
      <h3>用户列表</h3>
      <div>
        <el-button type="primary" @click="handleAdd">添加用户</el-button>
        <el-input
            v-model="search"
            placeholder="输入关键字搜索"
            style="width: 200px; margin-left: 10px;"
        />
      </div>
    </div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const search = ref('')
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const form = reactive({
  id: '',
  username: '',
  email: '',
  phone: ''
})

const dialogTitle = computed(() => {
  return form.id ? '编辑用户' : '添加用户'
})

// 模拟数据
const mockData = []
for (let i = 1; i <= 100; i++) {
  mockData.push({
    id: i,
    username: 'user' + i,
    email: `user${i}@example.com`,
    phone: '13800138000',
    createTime: '2023-01-01 12:00:00'
  })
}

// 获取数据
const getTableData = () => {
  // 模拟过滤和分页
  let data = mockData
  if (search.value) {
    data = data.filter(item => item.username.includes(search.value) || item.email.includes(search.value))
  }
  total.value = data.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = data.slice(start, end)
}

onMounted(() => {
  getTableData()
})

const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getTableData()
}

const handleAdd = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    // 这里应该调用删除接口，然后重新获取数据
    getTableData()
  }).catch(() => {})
}

const submitForm = () => {
  // 这里应该调用添加或编辑接口
  ElMessage.success('保存成功')
  dialogVisible.value = false
  getTableData()
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>