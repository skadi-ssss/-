import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export const useComplaintStore = defineStore('complaint', () => {
    // 投诉列表
    const complaintList = ref([])
    const loading = ref(false)
    const total = ref(0)

    // 投诉状态常量
    const COMPLAINT_STATUS = {
        PENDING: 'pending',      // 待处理
        PROCESSING: 'processing', // 处理中
        RESOLVED: 'resolved',    // 已解决
        REJECTED: 'rejected',    // 已拒绝
        CLOSED: 'closed'         // 已关闭
    }

    // 投诉类型常量
    const COMPLAINT_TYPE = {
        SEAT: 'seat',           // 座位相关
        FACILITY: 'facility',   // 设施相关
        ENVIRONMENT: 'environment', // 环境相关
        SERVICE: 'service',     // 服务相关
        OTHER: 'other'          // 其他
    }

    // 优先级常量
    const PRIORITY = {
        HIGH: 'high',      // 高
        MEDIUM: 'medium',  // 中
        LOW: 'low'         // 低
    }

    // 投诉统计
    const complaintStats = reactive({
        total: 0,
        pending: 0,
        processing: 0,
        resolved: 0,
        rejected: 0,
        closed: 0,
        avgResponseTime: '0小时',
        resolutionRate: '0%'
    })

    // 获取投诉列表
    const fetchComplaints = async (params = {}) => {
        loading.value = true
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 800))

            // 模拟数据
            const mockComplaints = generateMockComplaints()

            // 应用筛选条件
            let filteredComplaints = mockComplaints

            if (params.keyword) {
                const keyword = params.keyword.toLowerCase()
                filteredComplaints = filteredComplaints.filter(complaint =>
                    complaint.title.toLowerCase().includes(keyword) ||
                    complaint.content.toLowerCase().includes(keyword) ||
                    complaint.userName.toLowerCase().includes(keyword)
                )
            }

            if (params.status) {
                filteredComplaints = filteredComplaints.filter(complaint => complaint.status === params.status)
            }

            if (params.type) {
                filteredComplaints = filteredComplaints.filter(complaint => complaint.type === params.type)
            }

            if (params.priority) {
                filteredComplaints = filteredComplaints.filter(complaint => complaint.priority === params.priority)
            }

            if (params.startDate && params.endDate) {
                const start = new Date(params.startDate)
                const end = new Date(params.endDate)
                end.setHours(23, 59, 59, 999)

                filteredComplaints = filteredComplaints.filter(complaint => {
                    const complaintDate = new Date(complaint.createTime)
                    return complaintDate >= start && complaintDate <= end
                })
            }

            // 分页
            const page = params.page || 1
            const size = params.size || 20
            const startIndex = (page - 1) * size
            const endIndex = startIndex + size

            complaintList.value = filteredComplaints.slice(startIndex, endIndex)
            total.value = filteredComplaints.length

            // 更新统计
            updateComplaintStats(filteredComplaints)

            return {
                data: complaintList.value,
                total: total.value,
                page,
                size
            }
        } catch (error) {
            console.error('获取投诉列表失败:', error)
            ElMessage.error('获取投诉列表失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 用户提交投诉
    const submitComplaint = async (complaintData) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const newComplaint = {
                id: generateId(),
                ...complaintData,
                status: COMPLAINT_STATUS.PENDING,
                priority: calculatePriority(complaintData),
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                readStatus: false
            }

            complaintList.value.unshift(newComplaint)
            total.value += 1

            // 更新统计
            updateComplaintStats(complaintList.value)

            // 添加操作日志
            addComplaintLog({
                complaintId: newComplaint.id,
                operation: '提交投诉',
                operator: complaintData.userName || '用户',
                details: `提交投诉：${complaintData.title}`
            })

            return {
                success: true,
                data: newComplaint,
                message: '投诉提交成功，我们会尽快处理'
            }
        } catch (error) {
            console.error('提交投诉失败:', error)
            return { success: false, message: '提交投诉失败' }
        }
    }

    // 更新投诉状态（管理员处理）
    const updateComplaintStatus = async (id, updateData) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = complaintList.value.findIndex(complaint => complaint.id === id)
            if (index === -1) {
                return { success: false, message: '投诉不存在' }
            }

            const oldComplaint = complaintList.value[index]
            const newComplaint = {
                ...oldComplaint,
                ...updateData,
                updateTime: new Date().toISOString(),
                processTime: updateData.status === COMPLAINT_STATUS.PROCESSING ?
                    new Date().toISOString() : oldComplaint.processTime,
                resolveTime: updateData.status === COMPLAINT_STATUS.RESOLVED ?
                    new Date().toISOString() : oldComplaint.resolveTime
            }

            complaintList.value[index] = newComplaint

            // 更新统计
            updateComplaintStats(complaintList.value)

            // 添加操作日志
            const operation = getStatusOperation(updateData.status)
            addComplaintLog({
                complaintId: id,
                operation,
                operator: updateData.adminName || '管理员',
                details: updateData.reply || `${operation}投诉`
            })

            // 记录到管理员操作日志
            addAdminLog({
                module: '投诉管理',
                action: operation,
                target: `投诉ID: ${id}`,
                details: updateData.reply || `${operation}投诉`
            })

            return {
                success: true,
                data: newComplaint,
                message: '更新成功'
            }
        } catch (error) {
            console.error('更新投诉状态失败:', error)
            return { success: false, message: '更新失败' }
        }
    }

    // 回复投诉
    const replyComplaint = async (id, replyData) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = complaintList.value.findIndex(complaint => complaint.id === id)
            if (index === -1) {
                return { success: false, message: '投诉不存在' }
            }

            const complaint = complaintList.value[index]
            const updateData = {
                reply: replyData.reply,
                replyTime: new Date().toISOString(),
                adminId: replyData.adminId,
                adminName: replyData.adminName,
                status: COMPLAINT_STATUS.RESOLVED
            }

            return await updateComplaintStatus(id, updateData)
        } catch (error) {
            console.error('回复投诉失败:', error)
            return { success: false, message: '回复失败' }
        }
    }

    // 删除投诉
    const deleteComplaint = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = complaintList.value.findIndex(complaint => complaint.id === id)
            if (index === -1) {
                return { success: false, message: '投诉不存在' }
            }

            const deletedComplaint = complaintList.value[index]
            complaintList.value.splice(index, 1)
            total.value -= 1

            // 更新统计
            updateComplaintStats(complaintList.value)

            // 添加操作日志
            addComplaintLog({
                complaintId: id,
                operation: '删除投诉',
                operator: '管理员',
                details: '删除投诉记录'
            })

            // 记录到管理员操作日志
            addAdminLog({
                module: '投诉管理',
                action: '删除',
                target: `投诉ID: ${id}`,
                details: '删除投诉记录'
            })

            return { success: true, message: '删除成功' }
        } catch (error) {
            console.error('删除投诉失败:', error)
            return { success: false, message: '删除失败' }
        }
    }

    // 批量处理投诉
    const batchProcessComplaints = async (complaintIds, operation, params = {}) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800))

            let successCount = 0
            let failCount = 0
            const results = []

            for (const complaintId of complaintIds) {
                let result

                switch (operation) {
                    case 'process':
                        result = await updateComplaintStatus(complaintId, {
                            status: COMPLAINT_STATUS.PROCESSING,
                            adminId: params.adminId,
                            adminName: params.adminName
                        })
                        break
                    case 'resolve':
                        result = await updateComplaintStatus(complaintId, {
                            status: COMPLAINT_STATUS.RESOLVED,
                            reply: params.reply || '已处理',
                            adminId: params.adminId,
                            adminName: params.adminName
                        })
                        break
                    case 'reject':
                        result = await updateComplaintStatus(complaintId, {
                            status: COMPLAINT_STATUS.REJECTED,
                            reply: params.reply || '投诉不成立',
                            adminId: params.adminId,
                            adminName: params.adminName
                        })
                        break
                    case 'close':
                        result = await updateComplaintStatus(complaintId, {
                            status: COMPLAINT_STATUS.CLOSED,
                            adminId: params.adminId,
                            adminName: params.adminName
                        })
                        break
                    case 'delete':
                        result = await deleteComplaint(complaintId)
                        break
                    default:
                        result = { success: false, message: '未知操作' }
                }

                if (result.success) {
                    successCount++
                } else {
                    failCount++
                }

                results.push(result)
            }

            // 批量操作日志
            addComplaintLog({
                complaintId: '批量操作',
                operation: `批量${operation}`,
                operator: params.adminName || '管理员',
                details: `批量${operation} ${complaintIds.length} 条投诉`
            })

            return {
                success: true,
                data: { successCount, failCount, results },
                message: `操作完成，成功：${successCount}，失败：${failCount}`
            }
        } catch (error) {
            console.error('批量操作失败:', error)
            return { success: false, message: '批量操作失败' }
        }
    }

    // 获取投诉详情
    const getComplaintDetail = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const complaint = complaintList.value.find(complaint => complaint.id === id)
            if (!complaint) {
                return { success: false, message: '投诉不存在' }
            }

            // 标记为已读
            if (!complaint.readStatus) {
                complaint.readStatus = true
            }

            return { success: true, data: complaint }
        } catch (error) {
            console.error('获取投诉详情失败:', error)
            return { success: false, message: '获取详情失败' }
        }
    }

    // 获取投诉统计
    const getComplaintStats = () => {
        return { ...complaintStats }
    }

    // 获取投诉趋势数据（用于图表）
    const getComplaintTrend = async (days = 30) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const trendData = []
            const today = new Date()

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]

                // 模拟每日投诉数量
                const count = Math.floor(Math.random() * 10) + 1

                trendData.push({
                    date: dateStr,
                    count,
                    pending: Math.floor(count * 0.3),
                    resolved: Math.floor(count * 0.5),
                    rejected: Math.floor(count * 0.2)
                })
            }

            return {
                success: true,
                data: trendData,
                days
            }
        } catch (error) {
            console.error('获取投诉趋势失败:', error)
            return { success: false, message: '获取趋势数据失败' }
        }
    }

    // 投诉操作日志
    const complaintLogs = ref([])

    // 添加投诉操作日志
    const addComplaintLog = (log) => {
        const newLog = {
            id: complaintLogs.value.length + 1,
            ...log,
            operationTime: new Date().toISOString()
        }
        complaintLogs.value.unshift(newLog)

        // 保持日志列表长度
        if (complaintLogs.value.length > 200) {
            complaintLogs.value = complaintLogs.value.slice(0, 200)
        }
    }

    // 获取投诉操作日志
    const getComplaintLogs = async (params = {}) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            let logs = [...complaintLogs.value]

            if (params.complaintId) {
                logs = logs.filter(log => log.complaintId.includes(params.complaintId))
            }

            if (params.operation) {
                logs = logs.filter(log => log.operation === params.operation)
            }

            if (params.startDate && params.endDate) {
                logs = logs.filter(log => {
                    const logTime = new Date(log.operationTime)
                    return logTime >= new Date(params.startDate) &&
                        logTime <= new Date(params.endDate)
                })
            }

            return {
                success: true,
                data: logs.slice(0, params.limit || 50),
                total: logs.length
            }
        } catch (error) {
            console.error('获取投诉日志失败:', error)
            return { success: false, message: '获取日志失败' }
        }
    }

    // 内部辅助方法

    // 生成模拟投诉数据
    const generateMockComplaints = () => {
        const complaints = []
        const types = Object.values(COMPLAINT_TYPE)
        const statuses = Object.values(COMPLAINT_STATUS)
        const priorities = Object.values(PRIORITY)
        const users = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
        const locations = ['A区', 'B区', 'C区', 'D区', 'VIP区', '自习室1', '自习室2', '走廊']

        for (let i = 1; i <= 50; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            const priority = priorities[Math.floor(Math.random() * priorities.length)]
            const userName = users[Math.floor(Math.random() * users.length)]
            const location = locations[Math.floor(Math.random() * locations.length)]

            const createTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)

            complaints.push({
                id: generateId(),
                userId: `user_${Math.floor(Math.random() * 1000)}`,
                userName,
                title: getComplaintTitle(type),
                content: getComplaintContent(type, location),
                type,
                location,
                status,
                priority,
                createTime: createTime.toISOString(),
                updateTime: new Date(createTime.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
                readStatus: Math.random() > 0.3,
                images: Math.random() > 0.7 ? [`https://picsum.photos/200/150?random=${i}`] : [],
                contactInfo: `${Math.floor(Math.random() * 10000000000)}`,
                seatNumber: Math.random() > 0.5 ? `${location.charAt(0)}${Math.floor(Math.random() * 100) + 101}` : null,
                reply: status !== COMPLAINT_STATUS.PENDING ? getRandomReply(status) : null,
                replyTime: status !== COMPLAINT_STATUS.PENDING ?
                    new Date(createTime.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString() : null,
                adminId: status !== COMPLAINT_STATUS.PENDING ? 'admin_001' : null,
                adminName: status !== COMPLAINT_STATUS.PENDING ? '管理员' : null,
                processTime: status !== COMPLAINT_STATUS.PENDING ?
                    new Date(createTime.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString() : null,
                resolveTime: status === COMPLAINT_STATUS.RESOLVED ?
                    new Date(createTime.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString() : null
            })
        }

        return complaints.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    }

    // 更新投诉统计
    const updateComplaintStats = (complaints) => {
        const stats = {
            total: complaints.length,
            pending: 0,
            processing: 0,
            resolved: 0,
            rejected: 0,
            closed: 0,
            avgResponseTime: '0小时',
            resolutionRate: '0%'
        }

        let totalResponseTime = 0
        let responseCount = 0
        let resolvedCount = 0

        complaints.forEach(complaint => {
            switch (complaint.status) {
                case COMPLAINT_STATUS.PENDING:
                    stats.pending++
                    break
                case COMPLAINT_STATUS.PROCESSING:
                    stats.processing++
                    break
                case COMPLAINT_STATUS.RESOLVED:
                    stats.resolved++
                    resolvedCount++
                    break
                case COMPLAINT_STATUS.REJECTED:
                    stats.rejected++
                    break
                case COMPLAINT_STATUS.CLOSED:
                    stats.closed++
                    break
            }

            // 计算平均响应时间
            if (complaint.processTime && complaint.createTime) {
                const processTime = new Date(complaint.processTime)
                const createTime = new Date(complaint.createTime)
                const diffHours = (processTime - createTime) / (1000 * 60 * 60)
                totalResponseTime += diffHours
                responseCount++
            }
        })

        // 计算平均响应时间
        if (responseCount > 0) {
            const avgHours = totalResponseTime / responseCount
            stats.avgResponseTime = avgHours < 24 ?
                `${avgHours.toFixed(1)}小时` : `${(avgHours / 24).toFixed(1)}天`
        }

        // 计算解决率
        if (stats.total > 0) {
            const resolutionRate = (resolvedCount / stats.total) * 100
            stats.resolutionRate = resolutionRate.toFixed(1) + '%'
        }

        Object.assign(complaintStats, stats)
    }

    // 计算优先级
    const calculatePriority = (complaintData) => {
        // 根据投诉类型和内容判断优先级
        const { type, content } = complaintData

        if (type === COMPLAINT_TYPE.SEAT && content.includes('损坏')) {
            return PRIORITY.HIGH
        } else if (type === COMPLAINT_TYPE.FACILITY) {
            return PRIORITY.HIGH
        } else if (type === COMPLAINT_TYPE.ENVIRONMENT) {
            return PRIORITY.MEDIUM
        } else if (type === COMPLAINT_TYPE.SERVICE) {
            return PRIORITY.MEDIUM
        } else {
            return PRIORITY.LOW
        }
    }

    // 获取状态对应的操作
    const getStatusOperation = (status) => {
        const map = {
            [COMPLAINT_STATUS.PENDING]: '受理',
            [COMPLAINT_STATUS.PROCESSING]: '处理',
            [COMPLAINT_STATUS.RESOLVED]: '解决',
            [COMPLAINT_STATUS.REJECTED]: '拒绝',
            [COMPLAINT_STATUS.CLOSED]: '关闭'
        }
        return map[status] || '操作'
    }

    // 生成ID
    const generateId = () => {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    // 获取投诉标题
    const getComplaintTitle = (type) => {
        const titles = {
            [COMPLAINT_TYPE.SEAT]: ['座位损坏无法使用', '座位被占用', '座位预约问题', '座位设备故障'],
            [COMPLAINT_TYPE.FACILITY]: ['空调温度不适', '灯光太暗', '网络连接问题', '打印机故障'],
            [COMPLAINT_TYPE.ENVIRONMENT]: ['噪音太大', '卫生状况差', '温度不适宜', '空气质量差'],
            [COMPLAINT_TYPE.SERVICE]: ['管理员态度不好', '处理问题不及时', '服务不到位', '沟通困难'],
            [COMPLAINT_TYPE.OTHER]: ['其他投诉', '建议意见', '问题反馈']
        }
        const typeTitles = titles[type] || titles[COMPLAINT_TYPE.OTHER]
        return typeTitles[Math.floor(Math.random() * typeTitles.length)]
    }

    // 获取投诉内容
    const getComplaintContent = (type, location) => {
        const contents = {
            [COMPLAINT_TYPE.SEAT]: `在${location}的座位出现问题，希望能够尽快解决。`,
            [COMPLAINT_TYPE.FACILITY]: `${location}的设施需要维修，影响了正常使用。`,
            [COMPLAINT_TYPE.ENVIRONMENT]: `${location}的环境需要改善，希望管理员关注。`,
            [COMPLAINT_TYPE.SERVICE]: `服务方面存在不足，希望能够改进。`,
            [COMPLAINT_TYPE.OTHER]: `有相关问题需要处理，请及时联系。`
        }
        return contents[type] || contents[COMPLAINT_TYPE.OTHER]
    }

    // 获取随机回复
    const getRandomReply = (status) => {
        const replies = {
            [COMPLAINT_STATUS.PROCESSING]: ['我们已收到您的投诉，正在处理中。', '问题已受理，会尽快安排处理。'],
            [COMPLAINT_STATUS.RESOLVED]: ['问题已解决，感谢您的反馈。', '已处理完毕，如有问题请再次联系。'],
            [COMPLAINT_STATUS.REJECTED]: ['经核实，投诉内容不成立。', '根据规定，无法受理此投诉。'],
            [COMPLAINT_STATUS.CLOSED]: ['投诉已关闭。', '处理完成，投诉关闭。']
        }
        const statusReplies = replies[status] || ['已处理。']
        return statusReplies[Math.floor(Math.random() * statusReplies.length)]
    }

    // 记录到管理员操作日志（假设已存在adminLog模块）
    const addAdminLog = (log) => {
        // 这里调用现有的管理员日志模块
        console.log('管理员操作日志:', log)
    }

    return {
        // 状态
        complaintList,
        complaintLogs,
        complaintStats,
        loading,
        total,

        // 常量
        COMPLAINT_STATUS,
        COMPLAINT_TYPE,
        PRIORITY,

        // 方法
        fetchComplaints,
        submitComplaint,
        updateComplaintStatus,
        replyComplaint,
        deleteComplaint,
        batchProcessComplaints,
        getComplaintDetail,
        getComplaintStats,
        getComplaintTrend,
        getComplaintLogs,
        addComplaintLog,

        // 辅助方法（暴露给组件使用）
        getStatusLabel: (status) => {
            const map = {
                [COMPLAINT_STATUS.PENDING]: '待处理',
                [COMPLAINT_STATUS.PROCESSING]: '处理中',
                [COMPLAINT_STATUS.RESOLVED]: '已解决',
                [COMPLAINT_STATUS.REJECTED]: '已拒绝',
                [COMPLAINT_STATUS.CLOSED]: '已关闭'
            }
            return map[status] || '未知'
        },

        getTypeLabel: (type) => {
            const map = {
                [COMPLAINT_TYPE.SEAT]: '座位相关',
                [COMPLAINT_TYPE.FACILITY]: '设施相关',
                [COMPLAINT_TYPE.ENVIRONMENT]: '环境相关',
                [COMPLAINT_TYPE.SERVICE]: '服务相关',
                [COMPLAINT_TYPE.OTHER]: '其他'
            }
            return map[type] || '未知'
        },

        getPriorityLabel: (priority) => {
            const map = {
                [PRIORITY.HIGH]: '高',
                [PRIORITY.MEDIUM]: '中',
                [PRIORITY.LOW]: '低'
            }
            return map[priority] || '未知'
        },

        getPriorityColor: (priority) => {
            const map = {
                [PRIORITY.HIGH]: 'danger',
                [PRIORITY.MEDIUM]: 'warning',
                [PRIORITY.LOW]: 'info'
            }
            return map[priority] || 'info'
        },

        getStatusColor: (status) => {
            const map = {
                [COMPLAINT_STATUS.PENDING]: 'danger',
                [COMPLAINT_STATUS.PROCESSING]: 'warning',
                [COMPLAINT_STATUS.RESOLVED]: 'success',
                [COMPLAINT_STATUS.REJECTED]: 'info',
                [COMPLAINT_STATUS.CLOSED]: 'info'
            }
            return map[status] || 'info'
        }
    }
})