<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/ConfigStore'

const configStore = useConfigStore()

onMounted(() => {
  configStore.fetchConfig()
})
</script>
