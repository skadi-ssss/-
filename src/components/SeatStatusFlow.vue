<template>
  <div class="status-flow-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>座位状态流程图</span>
        </div>
      </template>

      <div class="flow-diagram">
        <div class="flow-step">
          <div class="step-icon step-start">
            <el-icon><Position /></el-icon>
          </div>
          <div class="step-label">开始</div>
        </div>

        <div class="flow-arrow">→</div>

        <div class="flow-step">
          <div class="step-icon step-question" :class="{'active': isBeingUsed}">
            <el-icon><QuestionFilled /></el-icon>
          </div>
          <div class="step-label">是否正在被使用？</div>
          <div class="step-result" v-if="isBeingUsed">
            <el-tag type="warning">是</el-tag>
            <div class="step-action">显示"正在使用"状态</div>
          </div>
        </div>

        <div class="flow-arrow" v-if="!isBeingUsed">→</div>

        <div class="flow-step" v-if="!isBeingUsed">
          <div class="step-icon step-question" :class="{'active': !isAvailable}">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="step-label">是否正常可用？</div>
          <div class="step-result" v-if="!isAvailable">
            <el-tag type="danger">否</el-tag>
            <div class="step-action">显示"不可使用"，锁定状态</div>
          </div>
        </div>

        <div class="flow-arrow" v-if="!isBeingUsed && isAvailable">→</div>

        <div class="flow-step" v-if="!isBeingUsed && isAvailable">
          <div class="step-icon step-question" :class="{'active': isReserved}">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="step-label">是否已经被预约？</div>
          <div class="step-result" v-if="isReserved">
            <el-tag type="warning">是</el-tag>
            <div class="step-action">锁定座位，防止重复预约</div>
          </div>
        </div>

        <div class="flow-arrow" v-if="!isBeingUsed && isAvailable && !isReserved">→</div>

        <div class="flow-step" v-if="!isBeingUsed && isAvailable && !isReserved">
          <div class="step-icon step-action" :class="{'active': isReserving}">
            <el-icon><Check /></el-icon>
          </div>
          <div class="step-label">进行预约操作</div>
          <div class="step-result" v-if="isReserving">
            <el-tag type="success">预约成功</el-tag>
            <div class="step-action">预约座位并锁定</div>
          </div>
        </div>
      </div>

      <div class="status-controls">
        <el-button-group>
          <el-button
              :type="isBeingUsed ? 'primary' : 'default'"
              @click="isBeingUsed = true"
          >
            正在使用
          </el-button>
          <el-button
              :type="!isAvailable ? 'primary' : 'default'"
              @click="setUnavailable"
          >
            不可用
          </el-button>
          <el-button
              :type="isReserved ? 'primary' : 'default'"
              @click="isReserved = true"
          >
            已预约
          </el-button>
          <el-button
              :type="isReserving ? 'primary' : 'default'"
              @click="setReserving"
          >
            可预约
          </el-button>
          <el-button @click="resetFlow">
            重置
          </el-button>
        </el-button-group>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isBeingUsed = ref(false)
const isAvailable = ref(true)
const isReserved = ref(false)
const isReserving = ref(false)

const setUnavailable = () => {
  isBeingUsed.value = false
  isAvailable.value = false
  isReserved.value = false
  isReserving.value = false
}

const setReserving = () => {
  isBeingUsed.value = false
  isAvailable.value = true
  isReserved.value = false
  isReserving.value = true
}

const resetFlow = () => {
  isBeingUsed.value = false
  isAvailable.value = true
  isReserved.value = false
  isReserving.value = false
}
</script>

<style scoped>
.status-flow-container {
  margin-bottom: 20px;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.step-start {
  background-color: #409eff;
}

.step-question {
  background-color: #e6a23c;
}

.step-action {
  background-color: #67c23a;
}

.step-icon.active {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
}

.step-label {
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.step-result {
  margin-top: 10px;
  text-align: center;
}

.step-action {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.flow-arrow {
  font-size: 24px;
  color: #999;
}

.status-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>