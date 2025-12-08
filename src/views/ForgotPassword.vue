<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <!-- 返回登录链接 -->
      <div class="back-to-login">
        <el-link type="primary" :icon="ArrowLeft" @click="goBackToLogin">返回登录</el-link>
      </div>

      <h2 class="forgot-password-title">找回密码</h2>

      <!-- 步骤指示器 -->
      <div class="steps-container">
        <el-steps :active="currentStep" simple>
          <el-step title="验证身份" />
          <el-step title="设置新密码" />
          <el-step title="完成" />
        </el-steps>
      </div>

      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" class="forgot-password-form">

        <!-- 步骤1: 验证身份 -->
        <div v-if="currentStep === 1" class="step-content">
          <!-- 身份选择 -->
          <div class="role-selector">
            <el-radio-group v-model="forgotForm.role" class="role-radio-group">
              <el-radio-button label="student">学生</el-radio-button>
              <el-radio-button label="admin">管理员</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 账号输入 -->
          <el-form-item prop="username">
            <el-input
                v-model="forgotForm.username"
                :placeholder="forgotForm.role === 'student' ? '请输入学号/手机号' : '请输入管理员账号'"
                prefix-icon="User"
                size="large"
            />
          </el-form-item>

        </div>

        <!-- 步骤2: 设置新密码 -->
        <div v-if="currentStep === 2" class="step-content">
          <el-form-item prop="newPassword">
            <el-input
                v-model="forgotForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                size="large"
                show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
                v-model="forgotForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                prefix-icon="Lock"
                size="large"
                show-password
            />
          </el-form-item>
        </div>

        <!-- 步骤3: 完成 -->
        <div v-if="currentStep === 3" class="step-content success-content">
          <div class="success-icon">
            <el-icon size="60" color="#67C23A">
              <CircleCheck />
            </el-icon>
          </div>
          <h3 class="success-title">密码重置成功！</h3>
          <p class="success-message">
            您的密码已成功重置，请使用新密码登录系统。
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button
              v-if="currentStep > 1 && currentStep < 3"
              type="info"
              size="large"
              @click="prevStep"
          >
            上一步
          </el-button>

          <el-button
              v-if="currentStep < 3"
              type="primary"
              size="large"
              :loading="loading"
              @click="nextStep"
          >
            {{ currentStep === 1 ? '下一步' : '重置密码' }}
          </el-button>

          <el-button
              v-if="currentStep === 3"
              type="primary"
              size="large"
              @click="goBackToLogin"
          >
            返回登录
          </el-button>
        </div>

      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()

// 表单引用
const forgotFormRef = ref()

// 步骤状态
const currentStep = ref(1)
const loading = ref(false)

// 表单数据
const forgotForm = reactive({
  role: 'student',
  username: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const forgotRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号长度不能小于3个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== forgotForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 下一步
const nextStep = async () => {
  if (!forgotFormRef.value) return

  if (currentStep.value === 1) {
    // 验证第一步的表单
    const valid = await forgotFormRef.value.validateField(['username'])
    if (!valid) return

    // 这里应该调用验证用户信息的API
    loading.value = true
    try {
      // 模拟API验证
      await new Promise(resolve => setTimeout(resolve, 1000))
      currentStep.value = 2
    } catch (error) {
      ElMessage.error('验证失败，请检查账号是否正确')
    } finally {
      loading.value = false
    }
  } else if (currentStep.value === 2) {
    // 验证第二步的表单
    const valid = await forgotFormRef.value.validateField(['newPassword', 'confirmPassword'])
    if (!valid) return

    loading.value = true
    try {
      // 这里调用重置密码的API
      // await api.resetPassword({
      //   username: forgotForm.username,
      //   role: forgotForm.role,
      //   newPassword: forgotForm.newPassword,
      //   email: forgotForm.email
      // })

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      currentStep.value = 3
    } catch (error) {
      ElMessage.error('重置密码失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 返回登录页面
const goBackToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-card {
  width: 450px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-to-login {
  position: absolute;
  top: 20px;
  left: 20px;
}

.forgot-password-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.steps-container {
  margin-bottom: 30px;
}

.forgot-password-form {
  width: 100%;
}

.role-selector {
  margin-bottom: 20px;
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

.step-content {
  margin-bottom: 30px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  color: #67C23A;
  margin-bottom: 10px;
  font-size: 20px;
}

.success-message {
  color: #666;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-buttons .el-button {
  min-width: 120px;
}
</style>