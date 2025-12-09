import request from '@/utils/request'

// 座位管理API
export const seatApi = {
    // 获取座位列表
    getSeats(params) {
        return request({
            url: '/seats',
            method: 'get',
            params
        })
    },

    // 获取座位详情
    getSeatDetail(id) {
        return request({
            url: `/seats/${id}`,
            method: 'get'
        })
    },

    // 添加座位
    addSeat(data) {
        return request({
            url: '/seats',
            method: 'post',
            data
        })
    },

    // 更新座位
    updateSeat(id, data) {
        return request({
            url: `/seats/${id}`,
            method: 'put',
            data
        })
    },

    // 删除座位
    deleteSeat(id) {
        return request({
            url: `/seats/${id}`,
            method: 'delete'
        })
    },

    // 批量操作座位
    batchOperateSeats(data) {
        return request({
            url: '/seats/batch',
            method: 'post',
            data
        })
    },

    // 锁定座位
    lockSeat(id, data) {
        return request({
            url: `/seats/${id}/lock`,
            method: 'post',
            data
        })
    },

    // 释放座位
    releaseSeat(id) {
        return request({
            url: `/seats/${id}/release`,
            method: 'post'
        })
    },

    // 设置座位维护
    setSeatMaintenance(id, data) {
        return request({
            url: `/seats/${id}/maintenance`,
            method: 'post',
            data
        })
    },

    // 恢复座位可用
    restoreSeat(id) {
        return request({
            url: `/seats/${id}/restore`,
            method: 'post'
        })
    },

    // 获取座位实时状态
    getRealTimeStatus(params) {
        return request({
            url: '/seats/status/realtime',
            method: 'get',
            params
        })
    },

    // 获取座位统计
    getSeatStats() {
        return request({
            url: '/seats/stats',
            method: 'get'
        })
    },

    // 导出座位数据
    exportSeats(params) {
        return request({
            url: '/seats/export',
            method: 'get',
            params,
            responseType: 'blob'
        })
    },

    // 获取座位操作日志
    getSeatLogs(params) {
        return request({
            url: '/seats/logs',
            method: 'get',
            params
        })
    },

    // 获取座位区域列表
    getSeatAreas() {
        return request({
            url: '/seats/areas',
            method: 'get'
        })
    },

    // 获取座位类型列表
    getSeatTypes() {
        return request({
            url: '/seats/types',
            method: 'get'
        })
    },

    // 获取设备配置选项
    getEquipmentOptions() {
        return request({
            url: '/seats/equipment',
            method: 'get'
        })
    }
}