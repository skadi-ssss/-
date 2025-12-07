// store/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const userRole = ref(localStorage.getItem('userRole') || '')

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => userRole.value === 'admin')
    const isStudent = computed(() => userRole.value === 'student')

    const login = async (username, password, role) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 学生登录逻辑
                if (role === 'student') {
                    // 这里替换为你的学生登录API
                    const mockStudentToken = 'student-jwt-token'
                    const mockStudentUser = {
                        id: 1001,
                        username: username,
                        phone: '13800138000',
                        role: 'student',
                        studentId: username // 假设学号就是用户名
                    }

                    token.value = mockStudentToken
                    user.value = mockStudentUser
                    userRole.value = 'student'

                    localStorage.setItem('token', mockStudentToken)
                    localStorage.setItem('user', JSON.stringify(mockStudentUser))
                    localStorage.setItem('userRole', 'student')

                    resolve({ success: true, data: mockStudentUser })
                }
                // 管理员登录逻辑（同事的代码）
                else if (role === 'admin') {
                    if (username === 'admin' && password === 'admin123') {
                        const mockAdminToken = 'admin-jwt-token'
                        const mockAdminUser = {
                            id: 1,
                            username: 'admin',
                            role: 'admin'
                        }

                        token.value = mockAdminToken
                        user.value = mockAdminUser
                        userRole.value = 'admin'

                        localStorage.setItem('token', mockAdminToken)
                        localStorage.setItem('user', JSON.stringify(mockAdminUser))
                        localStorage.setItem('userRole', 'admin')

                        resolve({ success: true, data: mockAdminUser })
                    } else {
                        resolve({
                            success: false,
                            error: '管理员账号或密码错误'
                        })
                    }
                } else {
                    resolve({
                        success: false,
                        error: '请选择身份'
                    })
                }
            }, 1000)
        })
    }

    const logout = () => {
        token.value = ''
        user.value = null
        userRole.value = ''
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
    }

    const checkAuth = () => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        const storedRole = localStorage.getItem('userRole')

        if (storedToken && storedUser) {
            token.value = storedToken
            user.value = JSON.parse(storedUser)
            userRole.value = storedRole || ''
        }
    }

    return {
        token,
        user,
        userRole,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        logout,
        checkAuth
    }
})