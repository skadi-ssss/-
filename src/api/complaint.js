import request from '@/utils/request'

// 投诉管理API
export const complaintApi = {
    // 获取投诉列表
    getComplaints(params) {
        return request({
            url: '/complaints',
            method: 'get',
            params
        })
    },

    // 获取投诉详情
    getComplaintDetail(id) {
        return request({
            url: `/complaints/${id}`,
            method: 'get'
        })
    },

    // 提交投诉
    submitComplaint(data) {
        return request({
            url: '/complaints',
            method: 'post',
            data
        })
    },

    // 更新投诉状态
    updateComplaintStatus(id, data) {
        return request({
            url: `/complaints/${id}/status`,
            method: 'put',
            data
        })
    },

    // 回复投诉
    replyComplaint(id, data) {
        return request({
            url: `/complaints/${id}/reply`,
            method: 'post',
            data
        })
    },

    // 删除投诉
    deleteComplaint(id) {
        return request({
            url: `/complaints/${id}`,
            method: 'delete'
        })
    },

    // 批量处理投诉
    batchProcessComplaints(data) {
        return request({
            url: '/complaints/batch',
            method: 'post',
            data
        })
    },

    // 获取投诉统计
    getComplaintStats() {
        return request({
            url: '/complaints/stats',
            method: 'get'
        })
    },

    // 获取投诉趋势数据
    getComplaintTrend(params) {
        return request({
            url: '/complaints/trend',
            method: 'get',
            params
        })
    },

    // 导出投诉数据
    exportComplaints(params) {
        return request({
            url: '/complaints/export',
            method: 'get',
            params,
            responseType: 'blob'
        })
    },

    // 获取投诉操作日志
    getComplaintLogs(params) {
        return request({
            url: '/complaints/logs',
            method: 'get',
            params
        })
    },

    // 获取投诉类型选项
    getComplaintTypes() {
        return request({
            url: '/complaints/types',
            method: 'get'
        })
    },

    // 获取投诉优先级选项
    getPriorityOptions() {
        return request({
            url: '/complaints/priorities',
            method: 'get'
        })
    },

    // 上传投诉图片
    uploadComplaintImage(data) {
        return request({
            url: '/complaints/upload',
            method: 'post',
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}