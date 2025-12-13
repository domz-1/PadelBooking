<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
    <!-- Total Users -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-500/15"
      >
        <svg
          class="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500  dark:text-gray-400">Total Users</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            {{ metrics?.totalUsers?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Total Orders -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl dark:bg-green-500/15"
      >
        <svg
          class="w-6 h-6 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 text-theme-xs dark:text-gray-400">Total Orders</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            {{ metrics?.totalOrders?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Total Products -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl dark:bg-purple-500/15"
      >
        <svg
          class="w-6 h-6 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 text-theme-xs dark:text-gray-400">Total Products</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            {{ metrics?.totalProducts?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Total Revenue -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-500/15"
      >
        <svg
          class="w-6 h-6 text-orange-600 dark:text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 text-theme-xs dark:text-gray-400">Total Revenue</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            ${{ metrics?.totalRevenue?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Active Coupons -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-pink-50 rounded-xl dark:bg-pink-500/15"
      >
        <svg
          class="w-6 h-6 text-pink-600 dark:text-pink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 text-theme-xs dark:text-gray-400">Active Coupons</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            {{ metrics?.activeCoupons?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>

    <!-- Today Revenue -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black/[1] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-yellow-50 rounded-xl dark:bg-yellow-500/15"
      >
        <svg
          class="w-6 h-6 text-yellow-600 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 text-theme-xs dark:text-gray-400">Today Revenue</span>
          <h4 class="mt-2 font-bold text-gray-800 text-theme-sm dark:text-white/90">
            ${{ metrics?.todayRevenue?.toLocaleString() || '0' }}
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { AnalyticsAPI } from '@/api/AnalyticsAPI'

interface MetricsProps {
  totalUsers?: number
  totalOrders?: number
  totalProducts?: number
  totalRevenue?: number
  activeCoupons?: number
  todayRevenue?: number
}

const authStore = useAuthStore()
const metrics = ref<MetricsProps>({})

onMounted(async () => {
  console.log('[EcommerceMetrics] Component mounted')
  const token = authStore.token
  console.log('[EcommerceMetrics] Token from authStore:', token)

  try {
    console.log('[EcommerceMetrics] Calling AnalyticsAPI.getEcommerceMetrics...')
    const data = await AnalyticsAPI.getEcommerceMetrics(token as string)
    console.log('[EcommerceMetrics] API response data:', data)
    metrics.value = {
      totalUsers: data.data?.metrics?.totalUsers ?? 0,
      totalOrders: data.data?.metrics?.totalOrders ?? 0,
      totalProducts: data.data?.metrics?.totalProducts ?? 0,
      totalRevenue: data.data?.metrics?.totalRevenue ?? 0,
      activeCoupons: data.data?.metrics?.activeCoupons ?? 0,
      todayRevenue: data.data?.metrics?.todayRevenue ?? 0
    }
    console.log('[EcommerceMetrics] metrics ref updated:', metrics.value)
  } catch (err) {
    console.error('[EcommerceMetrics] Failed to fetch metrics:', err)
  }
})
</script>
