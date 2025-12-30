<template>
  <admin-layout>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Analytics</h3>
        <p class="text-gray-600 dark:text-gray-400">Please wait while we fetch your frontend data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button 
          @click="fetchAnalyticsData" 
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="analyticsData" class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12 space-y-6 ">
        <ecommerce-metrics :metrics="analyticsData.metrics" />
      </div>
     
    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../components/ecommerce/MonthlyTarget.vue'
import MonthlySale from '../components/ecommerce/MonthlySale.vue'
import CustomerDemographic from '../components/ecommerce/CustomerDemographic.vue'
import StatisticsChart from '../components/ecommerce/StatisticsChart.vue'
import RecentOrders from '../components/ecommerce/RecentOrders.vue'
import { AnalyticsAPI } from '@/api/AnalyticsAPI'
import { useAuthStore } from '@/stores/AuthStore'

export default {
  components: {
    AdminLayout,
    EcommerceMetrics,
    MonthlyTarget,
    MonthlySale,
    CustomerDemographic,
    StatisticsChart,
    RecentOrders,
  },
  name: 'Ecommerce',
  data() {
    return {
      analyticsData: null,
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.fetchAnalyticsData()
  },
  methods: {
    async fetchAnalyticsData() {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const token = authStore.token
        
        // Fetch all analytics data in parallel
        const [
          metricsResponse,
          monthlySalesResponse,
          customerDemographicsResponse,
          recentOrdersResponse,
          topProductsResponse,
          salesByCategoryResponse
        ] = await Promise.all([
          AnalyticsAPI.getEcommerceMetrics(token),
          AnalyticsAPI.getMonthlySales(token),
          AnalyticsAPI.getCustomerDemographics(token),
          AnalyticsAPI.getRecentOrders(token),
          AnalyticsAPI.getTopSellingProducts(token),
          AnalyticsAPI.getSalesByCategory(token)
        ])

        this.analyticsData = {
          metrics: metricsResponse.data,
          monthlySales: monthlySalesResponse.data,
          customerDemographics: customerDemographicsResponse.data,
          recentOrders: recentOrdersResponse.data,
          topProducts: topProductsResponse.data,
          salesByCategory: salesByCategoryResponse.data
        }

        // Emit events to child components with the data
        this.$emit('analytics-data', this.analyticsData)
        
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
        this.error = 'Failed to load frontend data. Please try again.'
      } finally {
        this.loading = false
      }
    }
  },
  provide() {
    return {
      analyticsData: this.analyticsData,
      refreshAnalytics: this.fetchAnalyticsData
    }
  }
}
</script>
