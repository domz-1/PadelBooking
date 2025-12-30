import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { useAuthStore } from '@/stores/AuthStore'

const queryClient = new QueryClient()
const pinia = createPinia()

const app = createApp(App)

app.use(pinia)
app.use(router)
// @ts-ignore
app.use(VueApexCharts)
app.use(VueQueryPlugin, {
  queryClient
})

// Initialize auth state from localStorage on app startup
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
