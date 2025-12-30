<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Track and manage your orders</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>

      <div v-else-if="orders.length > 0" class="space-y-6">
        <div
          v-for="order in orders"
          :key="order._id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          <!-- Order Header -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{{ order._id.slice(-8).toUpperCase() }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Placed on {{ new Date(order.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ order.totalOrderPrice?.toFixed(2) }} KWD
                </p>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                  :class="getStatusClass(order.status)"
                >
                  {{ formatStatus(order.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Details -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Payment Info -->
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Payment Information</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Method: <span class="capitalize">{{ order.paymentMethod }}</span></p>
                  <p>Status: 
                    <span :class="order.isPaid ? 'text-green-600' : 'text-red-600'">
                      {{ order.isPaid ? 'Paid' : 'Pending' }}
                    </span>
                  </p>
                  <p v-if="order.paidAt">Paid on: {{ new Date(order.paidAt).toLocaleDateString() }}</p>
                </div>
              </div>

              <!-- Delivery Info -->
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">Delivery Information</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Status: 
                    <span :class="order.isDelivered ? 'text-green-600' : 'text-yellow-600'">
                      {{ order.isDelivered ? 'Delivered' : 'In Progress' }}
                    </span>
                  </p>
                  <p v-if="order.deliveredAt">Delivered on: {{ new Date(order.deliveredAt).toLocaleDateString() }}</p>
                  
                  <!-- Shipping Address -->
                  <div v-if="order.userAddress" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <p class="font-medium text-gray-700 dark:text-gray-300">Shipping Address:</p>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            :class="{
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200': order.userAddress.type === 'home',
                              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200': order.userAddress.type === 'building',
                              'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200': order.userAddress.type === 'office'
                            }">
                        {{ order.userAddress.type }}
                      </span>
                    </div>
                    <div class="space-y-1 text-xs">
                      <p><strong>Area:</strong> {{ order.userAddress.area }}</p>
                      <p><strong>Street:</strong> {{ order.userAddress.streetName }}</p>
                      <p><strong>Block:</strong> {{ order.userAddress.blockNumber }}, <strong>Building:</strong> {{ order.userAddress.buildingNumber }}</p>
                      <p v-if="order.userAddress.floor"><strong>Floor:</strong> {{ order.userAddress.floor }}</p>
                      <p v-if="order.userAddress.apartmentNo"><strong>Apartment:</strong> {{ order.userAddress.apartmentNo }}</p>
                      <p v-if="order.userAddress.officeNo"><strong>Office:</strong> {{ order.userAddress.officeNo }}</p>
                      <p v-if="order.userAddress.additionalInfo" class="text-gray-600 dark:text-gray-400 italic">
                        {{ order.userAddress.additionalInfo }}
                      </p>
                    </div>
                  </div>
                  <div v-else-if="order.userAddressId" class="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                    <p class="text-yellow-700 dark:text-yellow-400">⚠️ Address details not available</p>
                    <p class="text-yellow-600 dark:text-yellow-500">ID: {{ order.userAddressId }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-4">Order Items</h4>
              <div class="space-y-4">
                <div
                  v-for="(item, index) in order.cartItems"
                  :key="index"
                  class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <LazyImage
                    v-if="item.productId?.imgCover"
                    :image-id="item.productId.imgCover"
                    width="60px"
                    height="60px"
                    image-class="w-15 h-15 object-cover rounded-lg"
                    placeholder="/placeholder-product.png"
                  />
                  <div class="flex-1">
                    <h5 class="font-medium text-gray-900 dark:text-white">
                      {{ item.productId?.title?.en || item.productId?.title || 'Unknown Product' }}
                    </h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {{ item.quantity }} × {{ item.price }} KWD
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ (item.quantity * item.price).toFixed(2) }} KWD
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Session Details (if available) -->
            <div v-if="order.invoiceId" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Payment Details</h4>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Invoice ID: <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{{ order.invoiceId }}</code></p>
                <p v-if="order.transactionReference">Transaction Ref: <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{{ order.transactionReference }}</code></p>
                <p v-if="order.paymentLink" class="mt-2">
                  <a :href="order.paymentLink" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                    View Payment Receipt
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here</p>
        <button
          @click="$router.push('/products')"
          class="bg-brand-600 text-white py-2 px-6 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Start Shopping
        </button>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/AuthStore'
import LazyImage from '@/components/LazyImage.vue'
import { OrdersAPI } from '@/api/OrdersAPI'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref<any[]>([])
const loading = ref(false)

const currentUser = computed(() => authStore.user)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'under_delivery':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'under_preparation':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'pending':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'refunded':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await OrdersAPI.getUserOrders()
    orders.value = data?.data || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  fetchOrders()
})
</script>
