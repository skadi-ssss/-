<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">智慧自习室管理系统</h2>

      <!-- 身份选择 -->
      <div class="role-selector">
        <el-radio-group v-model="loginForm.role" class="role-radio-group">
          <el-radio-button label="student">学生</el-radio-button>
          <el-radio-button label="admin">管理员</el-radio-button>
        </el-radio-group>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">

        <!-- 用户名输入 -->
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              :placeholder="loginForm.role === 'student' ? '请输入学号/手机号' : '请输入管理员账号'"
              prefix-icon="User"
              size="large"
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              size="large"
              :loading="loading"
              @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册链接（仅对学生显示） -->
        <div v-if="loginForm.role === 'student'" class="register-link">
          还没有账号？
          <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>

      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  role: 'student' // 默认学生身份
})

// 其他状态
const loading = ref(false)

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ]
}

// 登录处理函数
const handleLogin = async () => {
  // 验证表单
  if (!loginFormRef.value) return
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const result = await authStore.login(
        loginForm.username,
        loginForm.password,
        loginForm.role
    )

    if (result.success) {
      ElMessage.success('登录成功！')

      // 根据身份跳转到不同界面
      if (loginForm.role === 'student') {
        // 学生跳转到学生端主页（你的系统）
        router.push('/student')
      } else {
        // 管理员跳转到管理端主页（同事的系统）
        router.push('/admin')
      }
    } else {
      ElMessage.error(result.error || '登录失败，请检查用户名和密码')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面（仅学生）
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.role-selector {
  margin-bottom: 30px;
  text-align: center;
}

.role-radio-group {
  width: 100%;
}

.role-radio-group .el-radio-button {
  flex: 1;
}

.role-radio-group .el-radio-button__inner {
  width: 100%;
  padding: 12px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
</style>