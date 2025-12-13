<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>

    <div v-else-if="cart" class="space-y-6">
      <!-- Cart Header -->
      <ComponentCard title="Cart Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cart ID</label>
            <code class="block text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">{{ cart._id }}</code>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Price</label>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ cart.totalPrice }} KWD</p>
            <p v-if="cart.totalPriceAfterDiscount" class="text-sm text-green-600 dark:text-green-400">
              After discount: {{ cart.totalPriceAfterDiscount }} KWD ({{ cart.discount }}% off)
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cart Status</label>
            <span class="inline-block rounded-full px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500">
              Ready for Processing
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items Count</label>
            <p class="text-gray-900 dark:text-white">{{ cart.cartItem?.length || 0 }} items</p>
          </div>
        </div>
      </ComponentCard>

      <!-- Customer Info -->
      <ComponentCard title="Customer Information" v-if="cart.userId">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <p class="text-gray-900 dark:text-white">{{ cart.userId.name || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p class="text-gray-900 dark:text-white">{{ cart.userId.email || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <p class="text-gray-900 dark:text-white">{{ cart.userId.phone || '—' }}</p>
          </div>
        </div>
      </ComponentCard>

      <!-- Cart Items -->
      <ComponentCard title="Cart Items">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Image</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, idx) in cart.cartItem" :key="idx">
                <td class="px-4 py-3">
                  <LazyImage
                    v-if="item.productId?.imgCover"
                    :image-id="item.productId.imgCover"
                    width="50px"
                    height="50px"
                    image-class="w-12 h-12 object-cover rounded"
                    placeholder="/placeholder-product.png"
                  />
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ item.productId?.title?.en || 'Unknown Product' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ item.price }} KWD</td>
                <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  {{ (item.quantity * item.price).toFixed(2) }} KWD
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <!-- Admin Order Processing -->
      

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          @click="$router.push(`/carts/edit/${cartId}`)"
          class="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200 font-medium"
        >
          Edit Cart
        </button>
        <button
          @click="$router.push('/carts')"
          class="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
        >
          Back to Carts
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Cart not found</p>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import LazyImage from '@/components/LazyImage.vue'
import { CartsAPI } from '@/api/CartsAPI'

const route = useRoute()
const router = useRouter()
const cartId = route.params.id as string
const currentPageTitle = ref('View Cart')

const cart = ref<any>(null)
const loading = ref(false)


const fetchCart = async () => {
  loading.value = true
  try {
    const { data } = await CartsAPI.getCartById(cartId)
    cart.value = data?.data
  } catch (e) {
    console.error('Failed to fetch cart:', e)
  } finally {
    loading.value = false
  }
}

const handleOrderSubmitted = (order: any) => {
  console.log('Order submitted:', order)
  // Refresh cart data
  fetchCart()
  // Optionally redirect to orders page
  router.push('/orders')
}

// Admin: Direct order processing without payment sessions
const processOrder = async (paymentMethod: 'cash' | 'knet' | 'mastercard') => {
  if (!cart.value?.userId?.addresses || cart.value.userId.addresses.length === 0) {
    alert('No address found for this user. Please add an address first.')
    return
  }

  const confirmMessage = `Are you sure you want to process this cart as a ${paymentMethod.toUpperCase()} order?\n\n` +
    `This will directly create an order for:\n` +
    `Customer: ${cart.value.userId.name || 'Unknown'}\n` +
    `Total: ${cart.value.totalPriceAfterDiscount || cart.value.totalPrice} KWD\n` +
    `Payment Method: ${paymentMethod.toUpperCase()}\n\n` +
    `This action bypasses payment validation and creates the order immediately.`

  if (!confirm(confirmMessage)) {
    return
  }

  loading.value = true
  try {
    // Use the first address as default
    const userAddressId = cart.value.userId.addresses[0]._id || cart.value.userId.addresses[0].id

    const { data } = await CartsAPI.submitAdminOrder(cartId, {
      paymentMethod,
      userAddressId,
      forceSubmit: true // Always force submit for admin processing
    })

    // Show success message
    alert(`Order processed successfully as ${paymentMethod.toUpperCase()} payment!\n\nOrder ID: ${data.data?.orderId || 'Generated'}\nRedirecting to orders page...`)
    
    // Redirect to orders page
    router.push('/orders')
  } catch (error: any) {
    console.error('Failed to process order:', error)
    alert(`Failed to process order: ${error.response?.data?.message || 'Unknown error'}`)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCart)
</script>
