<template>
  <div class="user-list-container">
    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-input
          v-model="listQuery.keyword"
          placeholder="搜索用户名/手机号/邮箱"
          style="width: 300px"
          @keyup.enter="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <!-- 用户表格 -->
    <el-table
        :data="userList"
        v-loading="loading"
        border
        style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
          >
            编辑
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
        width="500px"
    >
      <el-form
          ref="userFormRef"
          :model="userFormData"
          :rules="userRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userFormData.username" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userFormData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userFormData.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userFormData.password" type="password" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userFormData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref()
const total = ref(0)

const listQuery = reactive({
  page: 1,
  limit: 10,
  keyword: ''
})

const userList = ref([
  {
    id: 1,
    username: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: '李四',
    phone: '13800138001',
    email: 'lisi@example.com',
    status: 0,
    createTime: '2024-01-02 11:00:00'
  }
])

const userFormData = reactive({
  id: null,
  username: '',
  phone: '',
  email: '',
  password: '',
  status: 1
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
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

const handleFilter = () => {
  listQuery.page = 1
  getList()
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(userFormData).forEach(key => {
    userFormData[key] = ''
  })
  userFormData.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(userFormData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await userFormRef.value.validate()

    if (dialogType.value === 'add') {
      ElMessage.success('添加成功')
    } else {
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.user-list-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.filter-container {
  margin-bottom: 20px;
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