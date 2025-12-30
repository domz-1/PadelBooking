<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Review your items and proceed to checkout</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>

      <div v-else-if="cart && cart.cartItem && cart.cartItem.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Cart Items ({{ cart.cartItem.length }})</h2>
            </div>
            
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="(item, index) in cart.cartItem" :key="index" class="p-6">
                <div class="flex items-center space-x-4">
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <LazyImage
                      v-if="item.productId?.imgCover"
                      :image-id="item.productId.imgCover"
                      width="80px"
                      height="80px"
                      image-class="w-20 h-20 object-cover rounded-lg"
                      placeholder="/placeholder-product.png"
                    />
                    <div v-else class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ item.productId?.title?.en || item.productId?.title || 'Unknown Product' }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ item.productId?.description?.en || item.productId?.description || '' }}
                    </p>
                    <div class="flex items-center mt-2">
                      <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.price }} KWD</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">per item</span>
                    </div>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center space-x-3">
                    <button
                      @click="updateQuantity(item.productId._id || item.productId, item.quantity - 1)"
                      :disabled="item.quantity <= 1 || updating"
                      class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="text-lg font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item.productId._id || item.productId, item.quantity + 1)"
                      :disabled="updating"
                      class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="removeItem(item._id)"
                    :disabled="updating"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <!-- Subtotal -->
                  <div class="text-right">
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ (item.quantity * item.price).toFixed(2) }} KWD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coupon Section -->
          <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coupon Code</h3>
            <div class="flex space-x-3">
              <input
                v-model="couponCode"
                type="text"
                placeholder="Enter coupon code"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                @click="applyCoupon"
                :disabled="!couponCode || updating"
                class="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            <div v-if="cart.discount" class="mt-3 text-green-600 dark:text-green-400">
              ✓ Coupon applied: {{ cart.discount }}% discount
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm sticky top-8">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>
            </div>
            
            <div class="p-6 space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span class="text-gray-900 dark:text-white">{{ cart.totalPrice?.toFixed(2) || '0.00' }} KWD</span>
              </div>
              
              <div v-if="cart.discount" class="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({{ cart.discount }}%)</span>
                <span>-{{ ((cart.totalPrice * cart.discount) / 100).toFixed(2) }} KWD</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                <span class="text-gray-900 dark:text-white">Free</span>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div class="flex justify-between text-lg font-semibold">
                  <span class="text-gray-900 dark:text-white">Total</span>
                  <span class="text-gray-900 dark:text-white">{{ (cart.totalPriceAfterDiscount || cart.totalPrice || 0).toFixed(2) }} KWD</span>
                </div>
              </div>
            </div>
            
            <div class="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="showCheckout = true"
                class="w-full bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-4.5M9 21h6" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">Add some products to get started</p>
        <button
          @click="$router.push('/products')"
          class="bg-brand-600 text-white py-2 px-6 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Checkout Modal -->
      <CheckoutModal
        v-if="currentUser"
        :show="showCheckout"
        :cart="cart"
        :user-id="currentUser.id"
        @close="showCheckout = false"
        @order-submitted="handleOrderSubmitted"
      />
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/AuthStore'
import LazyImage from '@/components/LazyImage.vue'
import CheckoutModal from '@/components/checkout/CheckoutModal.vue'
import { CartsAPI } from '@/api/CartsAPI'

const router = useRouter()
const authStore = useAuthStore()

const cart = ref<any>(null)
const loading = ref(false)
const updating = ref(false)
const showCheckout = ref(false)
const couponCode = ref('')

const currentUser = computed(() => authStore.user)

const fetchCart = async () => {
  loading.value = true
  try {
    const { data } = await CartsAPI.getUserCart()
    cart.value = data?.data
  } catch (error) {
    console.error('Failed to fetch cart:', error)
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (productId: string, newQuantity: number) => {
  if (newQuantity < 1) return
  
  updating.value = true
  try {
    await CartsAPI.updateProductQuantity(productId, newQuantity)
    await fetchCart() // Refresh cart
  } catch (error) {
    console.error('Failed to update quantity:', error)
    alert('Failed to update quantity. Please try again.')
  } finally {
    updating.value = false
  }
}

const removeItem = async (itemId: string) => {
  if (!confirm('Are you sure you want to remove this item from your cart?')) return
  
  updating.value = true
  try {
    await CartsAPI.removeProductFromCart(itemId)
    await fetchCart() // Refresh cart
  } catch (error) {
    console.error('Failed to remove item:', error)
    alert('Failed to remove item. Please try again.')
  } finally {
    updating.value = false
  }
}

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return
  
  updating.value = true
  try {
    await CartsAPI.applyCoupon(couponCode.value.trim())
    await fetchCart() // Refresh cart
    couponCode.value = ''
  } catch (error: any) {
    console.error('Failed to apply coupon:', error)
    alert(error.response?.data?.message || 'Failed to apply coupon. Please check the code and try again.')
  } finally {
    updating.value = false
  }
}

const handleOrderSubmitted = (order: any) => {
  console.log('Order submitted:', order)
  alert('Order submitted successfully!')
  router.push('/orders/my-orders')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  fetchCart()
})
</script>
