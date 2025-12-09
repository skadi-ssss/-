import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useSeatStore = defineStore('seat', () => {
    const seatList = ref([])
    const loading = ref(false)
    const total = ref(0)

    // 座位状态常量
    const STATUS = {
        AVAILABLE: 'available',      // 空闲
        RESERVED: 'reserved',        // 已预约
        IN_USE: 'in_use',            // 使用中
        MAINTENANCE: 'maintenance',  // 维护中
        LOCKED: 'locked',           // 已锁定
        DISABLED: 'disabled'        // 禁用
    }

    // 座位类型常量
    const SEAT_TYPE = {
        STANDARD: 'standard',     // 标准座位
        WINDOW: 'window',         // 窗边座位
        CORNER: 'corner',         // 角落座位
        BAR: 'bar',              // 吧台座位
        SOLO: 'solo',            // 单人座位
        GROUP: 'group',          // 小组座位
        VIP: 'vip',              // VIP座位
        ACCESSIBLE: 'accessible' // 无障碍座位
    }

    // 设备配置常量
    const EQUIPMENT = {
        DESK_LAMP: 'desk_lamp',      // 台灯
        POWER_OUTLET: 'power_outlet', // 电源插座
        USB_PORT: 'usb_port',        // USB接口
        NETWORK_PORT: 'network_port', // 网线接口
        READING_LIGHT: 'reading_light', // 阅读灯
        LOCKER: 'locker',            // 储物柜
        WHITEBOARD: 'whiteboard',    // 白板
        COMPUTER: 'computer',        // 电脑
        PRINTER: 'printer',          // 打印机
        SCANNER: 'scanner',          // 扫描仪
        PROJECTOR: 'projector',      // 投影仪
        HEADPHONE: 'headphone'       // 耳机
    }

    // 获取座位列表
    const fetchSeats = async (params = {}) => {
        loading.value = true
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 模拟数据
            const mockSeats = generateMockSeats()

            // 应用筛选条件
            let filteredSeats = mockSeats

            if (params.keyword) {
                const keyword = params.keyword.toLowerCase()
                filteredSeats = filteredSeats.filter(seat =>
                    seat.seatNumber.toLowerCase().includes(keyword) ||
                    seat.area.toLowerCase().includes(keyword)
                )
            }

            if (params.area) {
                filteredSeats = filteredSeats.filter(seat => seat.area === params.area)
            }

            if (params.status) {
                filteredSeats = filteredSeats.filter(seat => seat.status === params.status)
            }

            if (params.type) {
                filteredSeats = filteredSeats.filter(seat => seat.type === params.type)
            }

            // 分页
            const page = params.page || 1
            const size = params.size || 20
            const startIndex = (page - 1) * size
            const endIndex = startIndex + size

            seatList.value = filteredSeats.slice(startIndex, endIndex)
            total.value = filteredSeats.length

            return {
                data: seatList.value,
                total: total.value,
                page,
                size
            }
        } catch (error) {
            console.error('获取座位列表失败:', error)
            ElMessage.error('获取座位列表失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 添加座位
    const addSeat = async (seatData) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const newSeat = {
                id: seatList.value.length + 1,
                ...seatData,
                createTime: new Date().toISOString(),
                lastOperation: '创建',
                lastOperationTime: new Date().toISOString(),
                enabled: true
            }

            seatList.value.unshift(newSeat)
            total.value += 1

            // 添加操作日志
            addSeatLog({
                seatNumber: seatData.seatNumber,
                operation: '创建',
                operator: '管理员',
                details: '创建新座位'
            })

            return { success: true, data: newSeat, message: '添加成功' }
        } catch (error) {
            console.error('添加座位失败:', error)
            return { success: false, message: '添加失败' }
        }
    }

    // 更新座位
    const updateSeat = async (id, seatData) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            seatList.value[index] = {
                ...seatList.value[index],
                ...seatData,
                lastOperation: '修改',
                lastOperationTime: new Date().toISOString()
            }

            // 添加操作日志
            addSeatLog({
                seatNumber: seatData.seatNumber,
                operation: '修改',
                operator: '管理员',
                details: '修改座位信息'
            })

            return { success: true, data: seatList.value[index], message: '更新成功' }
        } catch (error) {
            console.error('更新座位失败:', error)
            return { success: false, message: '更新失败' }
        }
    }

    // 删除座位
    const deleteSeat = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            const deletedSeat = seatList.value[index]
            seatList.value.splice(index, 1)
            total.value -= 1

            // 添加操作日志
            addSeatLog({
                seatNumber: deletedSeat.seatNumber,
                operation: '删除',
                operator: '管理员',
                details: '删除座位'
            })

            return { success: true, message: '删除成功' }
        } catch (error) {
            console.error('删除座位失败:', error)
            return { success: false, message: '删除失败' }
        }
    }

    // 锁定座位（手动锁定）
    const lockSeat = async (id, reason = '') => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            const seat = seatList.value[index]

            // 检查座位状态是否允许锁定
            if ([STATUS.IN_USE, STATUS.RESERVED].includes(seat.status)) {
                return {
                    success: false,
                    message: `座位当前状态为${getStatusLabel(seat.status)}，无法锁定`
                }
            }

            seatList.value[index] = {
                ...seat,
                status: STATUS.LOCKED,
                lastOperation: '锁定',
                lastOperationTime: new Date().toISOString(),
                description: reason ? `${seat.description} [锁定原因：${reason}]` : seat.description,
                currentUser: null,
                reservedBy: null
            }

            // 触发预约记录模块和违规记录模块处理
            triggerRelatedModules('lock', seat)

            // 添加操作日志
            addSeatLog({
                seatNumber: seat.seatNumber,
                operation: '锁定',
                operator: '管理员',
                details: reason ? `手动锁定座位，原因：${reason}` : '手动锁定座位'
            })

            return { success: true, message: '锁定成功' }
        } catch (error) {
            console.error('锁定座位失败:', error)
            return { success: false, message: '锁定失败' }
        }
    }

    // 释放座位（解锁）
    const releaseSeat = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            const seat = seatList.value[index]

            // 检查座位状态是否允许释放
            if (seat.status !== STATUS.LOCKED) {
                return {
                    success: false,
                    message: '只有已锁定的座位才能释放'
                }
            }

            seatList.value[index] = {
                ...seat,
                status: STATUS.AVAILABLE,
                lastOperation: '解锁',
                lastOperationTime: new Date().toISOString(),
                description: seat.description.replace(/\[锁定原因：.*?\]/, '')
            }

            // 触发相关模块处理
            triggerRelatedModules('release', seat)

            // 添加操作日志
            addSeatLog({
                seatNumber: seat.seatNumber,
                operation: '解锁',
                operator: '管理员',
                details: '释放座位锁定'
            })

            return { success: true, message: '释放成功' }
        } catch (error) {
            console.error('释放座位失败:', error)
            return { success: false, message: '释放失败' }
        }
    }

    // 设置座位为维护状态
    const setSeatMaintenance = async (id, reason = '') => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            const seat = seatList.value[index]

            seatList.value[index] = {
                ...seat,
                status: STATUS.MAINTENANCE,
                lastOperation: '设为维护',
                lastOperationTime: new Date().toISOString(),
                description: reason ? `${seat.description} [维护原因：${reason}]` : seat.description,
                currentUser: null,
                reservedBy: null
            }

            // 触发相关模块处理
            triggerRelatedModules('maintenance', seat)

            // 添加操作日志
            addSeatLog({
                seatNumber: seat.seatNumber,
                operation: '设为维护',
                operator: '管理员',
                details: reason ? `设置座位为维护状态，原因：${reason}` : '设置座位为维护状态'
            })

            return { success: true, message: '设置成功' }
        } catch (error) {
            console.error('设置维护状态失败:', error)
            return { success: false, message: '设置失败' }
        }
    }

    // 恢复座位可用状态
    const restoreSeatAvailability = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const index = seatList.value.findIndex(seat => seat.id === id)
            if (index === -1) {
                return { success: false, message: '座位不存在' }
            }

            const seat = seatList.value[index]

            // 检查座位状态
            if (![STATUS.MAINTENANCE, STATUS.LOCKED, STATUS.DISABLED].includes(seat.status)) {
                return {
                    success: false,
                    message: '只有维护中、已锁定或已禁用的座位才能恢复'
                }
            }

            seatList.value[index] = {
                ...seat,
                status: STATUS.AVAILABLE,
                lastOperation: '恢复可用',
                lastOperationTime: new Date().toISOString(),
                description: seat.description
                    .replace(/\[维护原因：.*?\]/, '')
                    .replace(/\[锁定原因：.*?\]/, '')
            }

            // 添加操作日志
            addSeatLog({
                seatNumber: seat.seatNumber,
                operation: '恢复可用',
                operator: '管理员',
                details: '恢复座位为可用状态'
            })

            return { success: true, message: '恢复成功' }
        } catch (error) {
            console.error('恢复座位失败:', error)
            return { success: false, message: '恢复失败' }
        }
    }

    // 获取座位详情
    const getSeatDetail = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const seat = seatList.value.find(seat => seat.id === id)
            if (!seat) {
                return { success: false, message: '座位不存在' }
            }

            return { success: true, data: seat }
        } catch (error) {
            console.error('获取座位详情失败:', error)
            return { success: false, message: '获取详情失败' }
        }
    }

    // 批量操作座位
    const batchOperateSeats = async (seatIds, operation, params = {}) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800))

            let successCount = 0
            let failCount = 0
            const results = []

            for (const seatId of seatIds) {
                let result

                switch (operation) {
                    case 'delete':
                        result = await deleteSeat(seatId)
                        break
                    case 'lock':
                        result = await lockSeat(seatId, params.reason)
                        break
                    case 'release':
                        result = await releaseSeat(seatId)
                        break
                    case 'maintenance':
                        result = await setSeatMaintenance(seatId, params.reason)
                        break
                    case 'restore':
                        result = await restoreSeatAvailability(seatId)
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

    // 获取座位状态统计
    const getSeatStats = () => {
        const stats = {
            total: seatList.value.length,
            available: 0,
            reserved: 0,
            inUse: 0,
            maintenance: 0,
            locked: 0,
            disabled: 0,
            utilizationRate: 0
        }

        seatList.value.forEach(seat => {
            switch (seat.status) {
                case STATUS.AVAILABLE:
                    stats.available++
                    break
                case STATUS.RESERVED:
                    stats.reserved++
                    break
                case STATUS.IN_USE:
                    stats.inUse++
                    break
                case STATUS.MAINTENANCE:
                    stats.maintenance++
                    break
                case STATUS.LOCKED:
                    stats.locked++
                    break
                case STATUS.DISABLED:
                    stats.disabled++
                    break
            }
        })

        // 计算使用率 (使用中 + 已预约) / 总座位数
        const usedSeats = stats.inUse + stats.reserved
        stats.utilizationRate = ((usedSeats / stats.total) * 100).toFixed(1)

        return stats
    }

    // 查询座位实时状态（供用户界面、管理员界面、数据显示终端调用）
    const queryRealTimeStatus = (params = {}) => {
        let queryList = [...seatList.value]

        // 应用查询条件
        if (params.area) {
            queryList = queryList.filter(seat => seat.area === params.area)
        }

        if (params.status) {
            queryList = queryList.filter(seat => seat.status === params.status)
        }

        if (params.type) {
            queryList = queryList.filter(seat => seat.type === params.type)
        }

        // 返回简化数据格式，适合终端显示
        const simplifiedData = queryList.map(seat => ({
            id: seat.id,
            seatNumber: seat.seatNumber,
            area: seat.area,
            type: seat.type,
            status: seat.status,
            statusLabel: getStatusLabel(seat.status),
            equipmentConfig: seat.equipmentConfig,
            currentUser: seat.currentUser,
            reservedBy: seat.reservedBy,
            lastUpdate: seat.lastOperationTime
        }))

        return {
            success: true,
            data: simplifiedData,
            timestamp: new Date().toISOString(),
            total: simplifiedData.length
        }
    }

    // 座位操作日志
    const seatLogs = ref([])

    // 添加座位操作日志
    const addSeatLog = (log) => {
        const newLog = {
            id: seatLogs.value.length + 1,
            ...log,
            operationTime: new Date().toISOString()
        }
        seatLogs.value.unshift(newLog)

        // 保持日志列表长度
        if (seatLogs.value.length > 100) {
            seatLogs.value = seatLogs.value.slice(0, 100)
        }
    }

    // 获取座位操作日志
    const getSeatLogs = async (params = {}) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            let logs = [...seatLogs.value]

            if (params.seatNumber) {
                logs = logs.filter(log => log.seatNumber.includes(params.seatNumber))
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
            console.error('获取座位日志失败:', error)
            return { success: false, message: '获取日志失败' }
        }
    }

    // 内部辅助方法

    // 触发相关模块处理
    const triggerRelatedModules = (operation, seat) => {
        // 这里应该调用其他模块的API
        console.log(`触发${operation}操作相关模块处理：`, seat.seatNumber)

        // 模拟调用预约记录模块
        if (operation === 'lock' && seat.reservedBy) {
            console.log(`通知预约记录模块取消预约：${seat.seatNumber} - ${seat.reservedBy}`)
        }

        // 模拟调用违规记录模块
        if (operation === 'release' && seat.currentUser) {
            console.log(`通知违规记录模块检查违规：${seat.seatNumber} - ${seat.currentUser}`)
        }
    }

    // 获取状态标签
    const getStatusLabel = (status) => {
        const map = {
            [STATUS.AVAILABLE]: '空闲',
            [STATUS.RESERVED]: '已预约',
            [STATUS.IN_USE]: '使用中',
            [STATUS.MAINTENANCE]: '维护中',
            [STATUS.LOCKED]: '已锁定',
            [STATUS.DISABLED]: '已禁用'
        }
        return map[status] || '未知'
    }

    // 生成模拟数据
    const generateMockSeats = () => {
        const seats = []
        const areas = ['A区', 'B区', 'C区', 'D区', 'VIP区']
        const statuses = Object.values(STATUS)
        const types = Object.values(SEAT_TYPE)
        const equipment = Object.values(EQUIPMENT)

        for (let i = 1; i <= 100; i++) {
            const area = areas[Math.floor(Math.random() * areas.length)]
            const seatNumber = `${area.charAt(0)}${100 + i}`
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            const seatType = types[Math.floor(Math.random() * types.length)]

            // 随机设备配置
            const equipmentConfig = []
            const eqCount = Math.floor(Math.random() * 3) + 1
            for (let j = 0; j < eqCount; j++) {
                const randomEq = equipment[Math.floor(Math.random() * equipment.length)]
                if (!equipmentConfig.includes(randomEq)) {
                    equipmentConfig.push(randomEq)
                }
            }

            seats.push({
                id: i,
                seatNumber,
                area,
                type: seatType,
                status,
                equipmentConfig,
                description: `${seatType}座位，位于${area}`,
                capacity: Math.floor(Math.random() * 2) + 1,
                enabled: Math.random() > 0.1,
                currentUser: status === STATUS.IN_USE ? `用户${Math.floor(Math.random() * 1000)}` : null,
                reservedBy: status === STATUS.RESERVED ? `预约者${Math.floor(Math.random() * 1000)}` : null,
                lastOperation: i % 5 === 0 ? '修改' : '创建',
                lastOperationTime: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
                createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
            })
        }

        return seats
    }

    return {
        // 状态
        seatList,
        seatLogs,
        loading,
        total,

        // 常量
        STATUS,
        SEAT_TYPE,
        EQUIPMENT,

        // 方法
        fetchSeats,
        addSeat,
        updateSeat,
        deleteSeat,
        lockSeat,
        releaseSeat,
        setSeatMaintenance,
        restoreSeatAvailability,
        getSeatDetail,
        batchOperateSeats,
        getSeatStats,
        queryRealTimeStatus,
        getSeatLogs,
        addSeatLog,
        getStatusLabel
    }
})