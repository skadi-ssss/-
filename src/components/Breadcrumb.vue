<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <router-link v-if="item.path" :to="item.path">
        {{ item.meta.title || item.name }}
      </router-link>
      <span v-else>
        {{ item.meta.title || item.name }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

const getBreadcrumb = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)

  const breadcrumbList = matched.map(item => ({
    path: item.path,
    name: item.name,
    meta: { ...item.meta }
  }))

  breadcrumbs.value = breadcrumbList
}

watch(
    () => route.path,
    () => {
      getBreadcrumb()
    },
    { immediate: true }
)
</script>