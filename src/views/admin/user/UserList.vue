<template>
  <div class="user-list-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="关键词">
          <el-input
              v-model="listQuery.keyword"
              placeholder="请输入用户名/手机号"
              clearable
              @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
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
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
        width="500px"
        @close="resetForm"
    >
      <el-form
          ref="userFormRef"
          :model="userForm"
          :rules="userRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="userForm.username"
              placeholder="请输入用户名"
              maxlength="20"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
              v-model="userForm.phone"
              placeholder="请输入手机号"
              maxlength="11"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="userForm.email"
              placeholder="请输入邮箱"
              type="email"
          />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input
              v-model="userForm.password"
              placeholder="请输入密码"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="formLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive , onMounted} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)
const formLoading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'

// 表单引用
const userFormRef = ref()

// 分页查询参数
const listQuery = reactive({
  page: 1,
  limit: 10,
  keyword: ''
})

// 总条数
const total = ref(0)

// 用户列表数据
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
  },
  {
    id: 3,
    username: '王五',
    phone: '13800138002',
    email: 'wangwu@example.com',
    status: 1,
    createTime: '2024-01-03 12:00:00'
  }
])

// 表单数据 - 使用 userForm
const userForm = reactive({
  id: null,
  username: '',
  phone: '',
  email: '',
  password: '',
  status: 1
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

// 获取用户列表
const getList = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    total.value = userList.value.length
    loading.value = false
  }, 500)
}

// 搜索
const handleFilter = () => {
  listQuery.page = 1
  getList()
}

// 重置搜索
const resetFilter = () => {
  listQuery.keyword = ''
  handleFilter()
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'

  // 复制数据到表单
  Object.keys(userForm).forEach(key => {
    if (key !== 'password') { // 编辑时不复制密码字段
      userForm[key] = row[key]
    }
  })

  // 重置密码字段
  userForm.password = ''

  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用户吗？删除后不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    userList.value = userList.value.filter(user => user.id !== row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {
    // 用户取消操作
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await userFormRef.value.validate()

    formLoading.value = true

    // 模拟API请求
    setTimeout(() => {
      if (dialogType.value === 'add') {
        // 新增用户
        const newUser = {
          id: userList.value.length + 1,
          username: userForm.username,
          phone: userForm.phone,
          email: userForm.email,
          status: userForm.status,
          createTime: new Date().toLocaleString()
        }
        userList.value.unshift(newUser)
        ElMessage.success('添加成功')
      } else {
        // 编辑用户
        const index = userList.value.findIndex(user => user.id === userForm.id)
        if (index !== -1) {
          userList.value[index] = {
            ...userList.value[index],
            username: userForm.username,
            phone: userForm.phone,
            email: userForm.email,
            status: userForm.status
          }
        }
        ElMessage.success('更新成功')
      }

      formLoading.value = false
      dialogVisible.value = false
      getList()
    }, 800)

  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }

  // 重置表单数据
  Object.assign(userForm, {
    id: null,
    username: '',
    phone: '',
    email: '',
    password: '',
    status: 1
  })
}

// 分页大小变化
const handleSizeChange = (size) => {
  listQuery.limit = size
  listQuery.page = 1
  getList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  listQuery.page = page
  getList()
}

// 初始化加载数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>