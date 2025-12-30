<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/30 sm:p-6"
  >
    <div class="flex justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
          Customer Demographics
        </h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          User registration trends and role distribution
        </p>
      </div>
    </div>

    <!-- Registration Trend Chart -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Monthly Registrations</h4>
      <div class="h-48">
        <VueApexCharts
          v-if="registrationChartOptions"
          type="area"
          :options="registrationChartOptions"
          :series="registrationSeries"
          height="100%"
        />
      </div>
    </div>

    <!-- Role Distribution -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Role Distribution</h4>
      <div class="space-y-3">
        <div 
          v-for="role in roleDistribution" 
          :key="role._id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getRoleColor(role._id)"></div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {{ role._id }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                :class="getRoleColor(role._id)"
                :style="{ width: getRolePercentage(role.count) + '%' }"
              ></div>
            </div>
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {{ role.count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Users Summary -->
    <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</span>
        <span class="text-lg font-bold text-gray-900 dark:text-white">
          {{ totalUsers }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

// Inject analytics data
const analyticsData = inject<any>('analyticsData', null)

// Computed properties
const registrationTrend = computed(() => analyticsData?.value?.customerDemographics?.registrationTrend || [])
const roleDistribution = computed(() => analyticsData?.value?.customerDemographics?.roleDistribution || [])
const totalUsers = computed(() => {
  return roleDistribution.value.reduce((sum: number, role: any) => sum + role.count, 0)
})

// Chart data for registration trends
const registrationSeries = computed(() => [
  {
    name: 'Registrations',
    data: registrationTrend.value.map((item: any) => item.count)
  }
])

const registrationChartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 192,
    toolbar: { show: false },
    background: 'transparent'
  },
  colors: ['#3B82F6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100]
    }
  },
  stroke: {
    width: 2,
    curve: 'smooth'
  },
  xaxis: {
    categories: registrationTrend.value.map((item: any) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[item._id.month - 1]} ${item._id.year}`
    }),
    labels: {
      style: {
        colors: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280',
        fontSize: '12px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280',
        fontSize: '12px'
      }
    }
  },
  grid: {
    borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB',
    strokeDashArray: 3
  },
  tooltip: {
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    y: {
      formatter: (value: number) => `${value} registrations`
    }
  },
  legend: {
    show: false
  }
}))

// Helper functions
const getRoleColor = (role: string) => {
  const colors = {
    admin: 'bg-red-500',
    user: 'bg-blue-500',
    moderator: 'bg-green-500'
  }
  return colors[role as keyof typeof colors] || 'bg-gray-500'
}

const getRolePercentage = (count: number) => {
  const total = totalUsers.value
  return total > 0 ? Math.round((count / total) * 100) : 0
}

onMounted(() => {
  // Force chart re-render on theme change
  const observer = new MutationObserver(() => {
    // Chart will automatically re-render due to computed properties
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>
