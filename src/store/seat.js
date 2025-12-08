import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSeatStore = defineStore('seat', () => {
    const seatList = ref([])
    const loading = ref(false)
    const total = ref(0)

    // 座位状态常量
    const STATUS = {
        AVAILABLE: '0',      // 空闲
        RESERVED: '1',       // 已预约
        IN_USE: '2',         // 使用中
        MAINTENANCE: '3',    // 维护中
        UNAVAILABLE: '4'     // 不可用
    }

    // 判断座位状态是否可以预约
    const canReserve = (seat) => {
        if (!seat) return false

        // 判断是否正在被使用
        if (seat.status === STATUS.IN_USE) {
            return {
                success: false,
                message: '该座位正在被使用，无法预约'
            }
        }

        // 判断是否还能正常使用
        if (seat.status === STATUS.UNAVAILABLE) {
            return {
                success: false,
                message: '该座位不可用，无法预约'
            }
        }

        // 判断是否已经被预约
        if (seat.status === STATUS.RESERVED) {
            return {
                success: false,
                message: '该座位已被预约，无法再次预约'
            }
        }

        // 判断是否处于维护状态
        if (seat.status === STATUS.MAINTENANCE) {
            return {
                success: false,
                message: '该座位正在维护中，无法预约'
            }
        }

        // 如果是空闲状态，可以预约
        if (seat.status === STATUS.AVAILABLE) {
            return {
                success: true,
                message: '可以预约'
            }
        }

        return {
            success: false,
            message: '未知状态，无法预约'
        }
    }

    // 预约座位
    const reserveSeat = async (seatId, reservationInfo) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 检查是否可以预约
            const canReserveResult = canReserve(seat)
            if (!canReserveResult.success) {
                throw new Error(canReserveResult.message)
            }

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.RESERVED,
                    reservedBy: reservationInfo.userName,
                    reservationTime: reservationInfo.reservationTime,
                    reservationDuration: reservationInfo.duration,
                    lastOperation: 'reserve'
                }
            }

            return { success: true, message: '预约成功' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 开始使用座位
    const startUsingSeat = async (seatId, userInfo) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 检查座位状态
            if (seat.status !== STATUS.RESERVED) {
                throw new Error('只有已预约的座位才能开始使用')
            }

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.IN_USE,
                    currentUser: userInfo.userName,
                    startTime: new Date().toISOString(),
                    lastOperation: 'start_use'
                }
            }

            return { success: true, message: '开始使用成功' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 结束使用座位
    const endUsingSeat = async (seatId) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 检查座位状态
            if (seat.status !== STATUS.IN_USE) {
                throw new Error('只有使用中的座位才能结束使用')
            }

            // 计算使用时长
            const startTime = new Date(seat.startTime)
            const endTime = new Date()
            const duration = Math.floor((endTime - startTime) / (1000 * 60)) // 分钟

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.AVAILABLE,
                    currentUser: '',
                    endTime: endTime.toISOString(),
                    lastDuration: duration,
                    lastOperation: 'end_use'
                }
            }

            return {
                success: true,
                message: '结束使用成功',
                duration: duration
            }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 设置座位为维护状态
    const setSeatMaintenance = async (seatId, reason) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.MAINTENANCE,
                    maintenanceReason: reason || '系统维护',
                    maintenanceStartTime: new Date().toISOString(),
                    currentUser: '',
                    reservedBy: '',
                    lastOperation: 'maintenance'
                }
            }

            return { success: true, message: '已设置为维护状态' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 设置座位为不可用状态
    const setSeatUnavailable = async (seatId, reason) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.UNAVAILABLE,
                    maintenanceReason: reason || '设备故障',
                    maintenanceStartTime: new Date().toISOString(),
                    currentUser: '',
                    reservedBy: '',
                    lastOperation: 'unavailable'
                }
            }

            return { success: true, message: '已设置为不可用状态' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 恢复座位为可用状态
    const restoreSeatAvailability = async (seatId) => {
        try {
            const seat = seatList.value.find(s => s.id === seatId)
            if (!seat) {
                throw new Error('座位不存在')
            }

            // 检查座位状态
            if (![STATUS.MAINTENANCE, STATUS.UNAVAILABLE].includes(seat.status)) {
                throw new Error('只有维护中或不可用的座位才能恢复')
            }

            // 更新座位状态
            const index = seatList.value.findIndex(s => s.id === seatId)
            if (index !== -1) {
                seatList.value[index] = {
                    ...seatList.value[index],
                    status: STATUS.AVAILABLE,
                    maintenanceReason: '',
                    maintenanceEndTime: new Date().toISOString(),
                    lastOperation: 'restore'
                }
            }

            return { success: true, message: '已恢复为可用状态' }
        } catch (error) {
            return { success: false, message: error.message }
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
            unavailable: 0,
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
                case STATUS.UNAVAILABLE:
                    stats.unavailable++
                    break
            }
        })

        // 计算使用率 (使用中 + 已预约) / 总座位数
        stats.utilizationRate = ((stats.inUse + stats.reserved) / stats.total * 100).toFixed(1)

        return stats
    }

    // 原来的方法保持不变
    const fetchSeats = async (params) => {
        loading.value = true
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
            console.error('获取座位列表失败:', error)
        } finally {
            loading.value = false
        }
    }

    const updateSeat = async (id, data) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            return true
        } catch (error) {
            console.error('更新座位失败:', error)
            return false
        }
    }

    const deleteSeat = async (id) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            return true
        } catch (error) {
            console.error('删除座位失败:', error)
            return false
        }
    }

    return {
        seatList,
        loading,
        total,
        STATUS,
        canReserve,
        reserveSeat,
        startUsingSeat,
        endUsingSeat,
        setSeatMaintenance,
        setSeatUnavailable,
        restoreSeatAvailability,
        getSeatStats,
        fetchSeats,
        updateSeat,
        deleteSeat
    }
})