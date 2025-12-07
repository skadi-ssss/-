// 图表数据模拟服务
export const chartDataService = {
    // 模拟网络延迟
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    },

    // 获取折线图数据
    async getLineData(dimension = 'daily') {
        await this.delay(500) // 模拟网络延迟

        const dataMap = {
            daily: {
                title: '日预约趋势',
                xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                series: [
                    {
                        name: '预约数量',
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '实际使用',
                        data: [110, 125, 95, 130, 85, 220, 200]
                    }
                ]
            },
            weekly: {
                title: '周数据统计',
                xAxis: ['第1周', '第2周', '第3周', '第4周', '第5周'],
                series: [
                    {
                        name: '数据',
                        data: [320, 332, 301, 334, 390]
                    }
                ]
            },
            monthly: {
                title: '月数据统计',
                xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
                series: [
                    {
                        name: '数据',
                        data: [820, 932, 901, 934, 1290, 1330]
                    }
                ]
            }
        }

        return dataMap[dimension] || dataMap.daily
    },

    // 获取柱状图数据
    async getBarData(dimension = 'daily') {
        await this.delay(500)

        const dataMap = {
            daily: {
                title: '各时段使用热度',
                xAxis: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                series: [{
                    name: '使用人数',
                    data: [40, 65, 85, 95, 120, 140, 110, 75]
                }]
            },
            weekly: {
                title: '周使用统计',
                xAxis: ['第1周', '第2周', '第3周', '第4周', '第5周'],
                series: [{
                    name: '使用次数',
                    data: [150, 230, 224, 218, 135]
                }]
            },
            monthly: {
                title: '月使用统计',
                xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
                series: [{
                    name: '使用次数',
                    data: [4500, 5200, 4800, 5100, 5800, 6000]
                }]
            }
        }

        return dataMap[dimension] || dataMap.daily
    },

    // 获取饼图数据
    async getPieData(dimension = 'daily') {
        await this.delay(500)

        const dataMap = {
            daily: {
                title: '今日座位状态分布',
                series: [
                    { value: 35, name: '空闲' },
                    { value: 45, name: '已预约' },
                    { value: 20, name: '使用中' },
                    { value: 10, name: '维护中' }
                ]
            },
            weekly: {
                title: '本周违规类型分布',
                series: [
                    { value: 15, name: '占座不来' },
                    { value: 8, name: '大声喧哗' },
                    { value: 5, name: '损坏设备' },
                    { value: 12, name: '其他违规' }
                ]
            },
            monthly: {
                title: '本月用户活跃度',
                series: [
                    { value: 40, name: '高活跃' },
                    { value: 35, name: '中活跃' },
                    { value: 20, name: '低活跃' },
                    { value: 5, name: '不活跃' }
                ]
            }
        }

        return dataMap[dimension] || dataMap.daily
    },

    // 获取统计数据
    async getStats() {
        await this.delay(300)

        return {
            totalUsers: Math.floor(Math.random() * 500) + 1500,
            totalSeats: 120,
            todayReservations: Math.floor(Math.random() * 50) + 50,
            utilizationRate: Math.floor(Math.random() * 20) + 70
        }
    },

    // 获取实时数据
    async getRealtimeData() {
        await this.delay(200)

        return {
            onlineUsers: Math.floor(Math.random() * 40) + 30,
            seatUtilization: Math.floor(Math.random() * 20) + 70,
            violationRate: (Math.random() * 5).toFixed(1)
        }
    }
}