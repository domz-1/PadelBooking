<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-gray-900/30 sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Statistics</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Monthly sales and revenue overview
        </p>
      </div>

      <div class="relative">
        <div class="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selected = option.value"
            :class="[
              selected === option.value
                ? 'shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              'px-3 py-2 font-medium rounded-md text-sm transition-all duration-200'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts type="area" height="310" :options="chartOptions" :series="series" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, inject } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const analyticsData = inject('analyticsData')

const options = [
  { value: 'optionOne', label: 'Monthly' },
  { value: 'optionTwo', label: 'Quarterly' },
  { value: 'optionThree', label: 'Annually' },
]

const selected = ref('optionOne')

// Compute chart data from analytics
const chartData = computed(() => {
  if (!analyticsData?.value?.monthlySales) {
    return {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      orders: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  }

  const monthlyData = analyticsData.value.monthlySales
  const categories = []
  const revenue = []
  const orders = []

  // Create data for all 12 months
  for (let i = 1; i <= 12; i++) {
    const monthData = monthlyData.find(item => item._id === i)
    categories.push(new Date(2024, i - 1).toLocaleString('default', { month: 'short' }))
    revenue.push(monthData?.revenue || 0)
    orders.push(monthData?.orders || 0)
  }

  return { categories, revenue, orders }
})

const series = computed(() => [
  {
    name: 'Revenue',
    data: chartData.value.revenue,
  },
  {
    name: 'Orders',
    data: chartData.value.orders,
  },
])

const chartOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Outfit, sans-serif',
      labels: {
        colors: isDark ? '#D1D5DB' : '#374151'
      },
      markers: {
        radius: 6,
      },
    },
    colors: ['#3B82F6', '#10B981'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      toolbar: {
        show: false,
      },
      background: 'transparent'
    },
    fill: {
      gradient: {
        enabled: true,
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    markers: {
      size: 4,
    },
    labels: {
      show: false,
      position: 'top',
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: isDark ? '#374151' : '#E5E7EB'
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: {
        format: 'MMM yyyy',
      },
      y: {
        formatter: function (val: number) {
          return val.toLocaleString()
        }
      }
    },
    xaxis: {
      type: 'category',
      categories: chartData.value.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280'
        }
      }
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      labels: {
        style: {
          colors: isDark ? '#9CA3AF' : '#6B7280'
        },
        formatter: function (val: number) {
          return val.toLocaleString()
        }
      }
    },
  }
})
</script>

<style scoped>
.area-chart {
  width: 100%;
}
</style>
