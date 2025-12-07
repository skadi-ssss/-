<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 头部 -->
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建新账户，开始您的旅程</p>
      </div>

      <!-- 注册表单 -->
      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="80px"
          class="register-form"
          size="large"
          @submit.prevent="handleRegister"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名（3-16位字母数字）"
              clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20位）"
              show-password
              clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrength"></div>
            <span class="strength-text">{{ strengthText }}</span>
          </div>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              clearable
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 用户协议 -->
        <el-form-item prop="agreed">
          <el-checkbox v-model="registerForm.agreed">
            我已阅读并同意
            <el-button type="primary" link @click="showAgreement = true">
              《用户服务协议》
            </el-button>
            和
            <el-button type="primary" link @click="showPrivacy = true">
              《隐私政策》
            </el-button>
          </el-checkbox>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              class="register-btn"
              :loading="registering"
              @click="handleRegister"
          >
            立即注册
          </el-button>
        </el-form-item>

        <!-- 已有账号 -->
        <div class="login-link">
          已有账号？
          <el-button type="primary" link @click="gotoLogin">
            立即登录
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 用户协议弹窗 -->
    <el-dialog
        v-model="showAgreement"
        title="用户服务协议"
        width="60%"
        center
    >
      <div class="agreement-content">
        <!-- 协议内容 -->
        <p>这里是用户服务协议的具体内容...</p>
      </div>
      <template #footer>
        <el-button @click="showAgreement = false">取消</el-button>
        <el-button type="primary" @click="agreeAgreement">
          同意协议
        </el-button>
      </template>
    </el-dialog>

    <!-- 隐私政策弹窗 -->
    <el-dialog
        v-model="showPrivacy"
        title="隐私政策"
        width="60%"
        center
    >
      <div class="privacy-content">
        <!-- 隐私政策内容 -->
        <p>这里是隐私政策的具体内容...</p>
      </div>
      <template #footer>
        <el-button @click="showPrivacy = false">取消</el-button>
        <el-button type="primary" @click="agreePrivacy">
          同意政策
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Iphone,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreed: false
})

// 表单引用
const registerFormRef = ref()

// 状态
const registering = ref(false)
const showAgreement = ref(false)
const showPrivacy = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return 'weak'

  let strength = 0
  if (password.length >= 6) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const map = {
    weak: '弱',
    medium: '中',
    strong: '强'
  }
  return `密码强度：${map[passwordStrength.value]}`
})

// 验证规则
const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z0-9]{3,16}$/.test(value)) {
    callback(new Error('用户名必须是3-16位字母或数字'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度需在6-20位之间'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!value) {
    callback()
  } else if (!phoneRegex.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

const validateAgreed = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  agreed: [
    { validator: validateAgreed, trigger: 'change' }
  ]
}


// 注册处理
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registering.value = true

      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 这里应该调用实际的注册API
        // const response = await registerApi(registerForm)

        ElMessage.success('注册成功！')

        // 跳转到登录页面
        setTimeout(() => {
          router.push('/login')
        }, 1500)

      } catch (error) {
        ElMessage.error(error.message || '注册失败，请稍后重试')
      } finally {
        registering.value = false
      }
    } else {
      ElMessage.warning('请完善表单信息')
    }
  })
}

// 跳转到登录
const gotoLogin = () => {
  router.push('/login')
}

// 同意协议
const agreeAgreement = () => {
  registerForm.agreed = true
  showAgreement.value = false
  ElMessage.success('已同意用户服务协议')
}

// 同意隐私政策
const agreePrivacy = () => {
  registerForm.agreed = true
  showPrivacy.value = false
  ElMessage.success('已同意隐私政策')
}

// 监听密码变化
watch(() => registerForm.password, () => {
  // 实时检查密码强度
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

.verify-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  line-height: 20px;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  flex: 1;
  transition: all 0.3s;
}

.strength-bar.weak {
  background: #f56c6c;
  width: 33%;
}

.strength-bar.medium {
  background: #e6a23c;
  width: 66%;
}

.strength-bar.strong {
  background: #67c23a;
  width: 100%;
}

.strength-text {
  font-size: 12px;
  color: #666;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.other-login {
  margin: 30px 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dcdfe6;
}

.divider span {
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.login-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.login-icons .el-button {
  width: 44px;
  height: 44px;
  font-size: 20px;
  color: #666;
  border: 1px solid #dcdfe6;
}

.login-icons .el-button:hover {
  border-color: #409eff;
  color: #409eff;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link .el-button {
  margin-left: 5px;
}

.agreement-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }
}
</style>