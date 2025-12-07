import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { requiresAuth: false }
    },

    // ============ 管理员路由 ============
    {
        path: '/admin',
        component: () => import('@/views/admin/Layout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: () => import('@/views/admin/dashboard/Index.vue')
            },
            {
                path: 'user/list',
                name: 'AdminUserList',
                component: () => import('@/views/admin/user/UserList.vue')
            },
            {
                path: 'user/feedback',
                name: 'AdminFeedback',
                component: () => import('@/views/admin/user/Feedback.vue')
            },
            {
                path: 'user/reservation',
                name: 'AdminReservation',
                component: () => import('@/views/admin/user/Reservation.vue')
            },
            {
                path: 'seat/list',
                name: 'AdminSeatList',
                component: () => import('@/views/admin/seat/SeatList.vue')
            },
            {
                path: 'analysis',
                name: 'AdminAnalysis',
                component: () => import('@/views/admin/analysis/Analysis.vue')
            }
        ]
    },

    // ============ 学生路由 ============
    {
        path: '/student',
        component: () => import('@/views/student/Layout.vue'),
        meta: { requiresAuth: true, requiresStudent: true },
        children: [
            {
                path: '',  // 修改：空路径，访问 /student 时显示
                name: 'StudentMain',
                component: () => import('@/views/student/MainPage.vue')  // 修改：使用 MainPage.vue
            },
            {
                path: 'reservation',
                name: 'StudentReservation',
                component: () => import('@/views/student/Reservation.vue')
            },
            {
                path: 'profile',
                name: 'StudentProfile',
                component: () => import('@/views/student/Profile.vue')
            },
            {
                path: 'rooms',
                name: 'StudentRooms',
                component: () => import('@/views/student/Rooms.vue')
            },
            {
                path: 'about',
                name: 'StudentAbout',
                component: () => import('@/views/student/About.vue')
            }
        ]
    },

    // 根路径重定向 - 添加登录状态判断
    {
        path: '/',
        redirect: (to) => {
            const authStore = useAuthStore()
            authStore.checkAuth()

            if (authStore.isAuthenticated) {
                if (authStore.isAdmin) {
                    return '/admin'
                } else if (authStore.isStudent) {
                    return '/student'  // 修改：重定向到 /student
                }
            }
            return '/login'
        }
    },

    // 404页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 添加调试信息
router.beforeEach((to) => {
    console.log('=== 路由跳转开始 ===')
    console.log('目标路径:', to.path)
    console.log('目标名称:', to.name)

    const authStore = useAuthStore()
    authStore.checkAuth()

    console.log('认证状态:', {
        isAuthenticated: authStore.isAuthenticated,
        isAdmin: authStore.isAdmin,
        isStudent: authStore.isStudent,
        userRole: authStore.userRole
    })

    // 不需要认证的页面
    if (!to.meta.requiresAuth) {
        console.log('页面不需要认证，直接放行')
        return true
    }

    // 需要认证但未登录
    if (!authStore.isAuthenticated) {
        console.log('用户未登录，重定向到登录页')
        return {
            path: '/login',
            query: { redirect: to.fullPath }
        }
    }

    // 检查管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        console.log('需要管理员权限但用户不是管理员，重定向到学生页')
        return '/student'
    }

    // 检查学生权限
    if (to.meta.requiresStudent && !authStore.isStudent) {
        console.log('需要学生权限但用户不是学生，重定向到管理员页')
        return '/admin'
    }

    console.log('权限验证通过，允许访问')
    return true
})

export default router