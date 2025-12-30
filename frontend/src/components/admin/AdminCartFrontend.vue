<template>
  <div class="space-y-6">
    <!-- Frontend Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Admin Cart Management</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Manage payment sessions and submit orders for any cart in the system.
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-4.5M9 21h6" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Carts</dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ totalCarts }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Paid Carts</dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ paidCarts }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Payments</dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ pendingCarts }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Carts Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">All Carts</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Items
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="cart in carts" :key="cart._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ cart.userId?.name || 'Unknown' }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ cart.userId?.email || 'No email' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ cart.cartItem?.length || 0 }} items
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ cart.totalPriceAfterDiscount || cart.totalPrice }} KWD
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getPaymentStatusClass(cart.paymentSession?.status)"
                >
                  {{ getPaymentStatusText(cart.paymentSession?.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewCart(cart._id)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View
                </button>
                
                <button
                  v-if="!cart.paymentSession"
                  @click="quickCreatePaymentSession(cart._id, 'knet')"
                  :disabled="loading"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                >
                  Create Payment
                </button>
                
                <button
                  v-if="cart.paymentSession?.status === 'completed' || cart.paymentStatusInfo?.isPaid"
                  @click="quickSubmitOrder(cart._id)"
                  :disabled="loading"
                  class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50"
                >
                  Submit Order
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-if="!loading && carts.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No carts found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CartsAPI } from '@/api/CartsAPI'

const router = useRouter()
const carts = ref<any[]>([])
const loading = ref(false)

const totalCarts = computed(() => carts.value.length)
const paidCarts = computed(() => 
  carts.value.filter(cart => 
    cart.paymentSession?.status === 'completed' || 
    cart.paymentStatusInfo?.isPaid
  ).length
)
const pendingCarts = computed(() => 
  carts.value.filter(cart => 
    cart.paymentSession?.status === 'pending'
  ).length
)

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-400'
  }
}

const getPaymentStatusText = (status: string) => {
  if (!status) return 'No Session'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const fetchCarts = async () => {
  loading.value = true
  try {
    const { data } = await CartsAPI.getAllCarts()
    carts.value = data?.data || []
  } catch (error) {
    console.error('Failed to fetch carts:', error)
  } finally {
    loading.value = false
  }
}

const viewCart = (cartId: string) => {
  router.push(`/carts/${cartId}`)
}

const quickCreatePaymentSession = async (cartId: string, paymentMethod: 'cash' | 'knet' | 'mastercard') => {
  loading.value = true
  try {
    await CartsAPI.createAdminPaymentSession(cartId, { paymentMethod })
    alert(`${paymentMethod.toUpperCase()} payment session created successfully!`)
    await fetchCarts() // Refresh data
  } catch (error: any) {
    console.error('Failed to create payment session:', error)
    alert(error.response?.data?.message || 'Failed to create payment session')
  } finally {
    loading.value = false
  }
}

const quickSubmitOrder = async (cartId: string) => {
  const cart = carts.value.find(c => c._id === cartId)
  if (!cart?.userId?.addresses || cart.userId.addresses.length === 0) {
    alert('No address found for this user.')
    return
  }

  loading.value = true
  try {
    const userAddressId = cart.userId.addresses[0]._id || cart.userId.addresses[0].id
    const paymentMethod = cart.paymentSession?.paymentMethod || 'cash'

    await CartsAPI.submitAdminOrder(cartId, {
      paymentMethod,
      userAddressId,
      forceSubmit: true // Force submit for quick action
    })

    alert('Order submitted successfully!')
    await fetchCarts() // Refresh data
  } catch (error: any) {
    console.error('Failed to submit order:', error)
    alert(error.response?.data?.message || 'Failed to submit order')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCarts)
</script>
