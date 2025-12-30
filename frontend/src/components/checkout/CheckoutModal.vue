<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Checkout</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Cart Summary -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Items ({{ cart?.cartItem?.length || 0 }})</span>
              <span class="text-gray-900 dark:text-white">{{ cart?.totalPrice?.toFixed(2) || '0.00' }} KWD</span>
            </div>
            <div v-if="cart?.discount" class="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount ({{ cart.discount }}%)</span>
              <span>-{{ ((cart.totalPrice * cart.discount) / 100).toFixed(2) }} KWD</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-semibold">
              <span class="text-gray-900 dark:text-white">Total</span>
              <span class="text-gray-900 dark:text-white">{{ (cart?.totalPriceAfterDiscount || cart?.totalPrice || 0).toFixed(2) }} KWD</span>
            </div>
          </div>
        </div>

        <!-- Address Selection -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span v-if="isAdmin && cartOwnerData">
                Delivery Address for {{ cartOwnerData.name }}
              </span>
              <span v-else>
                Delivery Address
              </span>
            </label>
            <button
              @click="showAddressForm = true"
              class="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          </div>

          <!-- Existing Addresses -->
          <div v-if="userAddresses.length > 0" class="space-y-3 mb-4">
            <div
              v-for="address in userAddresses"
              :key="address.id"
              class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
              :class="{
                'border-brand-500 bg-brand-50 dark:bg-brand-900/20': selectedAddressId === address.id,
                'hover:border-gray-300 dark:hover:border-gray-500': selectedAddressId !== address.id
              }"
              @click="selectedAddressId = address.id"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      :checked="selectedAddressId === address.id"
                      class="text-brand-600 focus:ring-brand-500"
                      @change="selectedAddressId = address.id"
                    />
                    <span class="font-medium text-gray-900 dark:text-white capitalize">{{ address.type }} Address</span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p v-if="address.paciNumber">PACI: {{ address.paciNumber }}</p>
                    <p v-if="address.streetName">{{ address.streetName }}</p>
                    <p v-if="address.additionalInfo">{{ address.additionalInfo }}</p>
                    <p v-if="address.blockNumber">Block: {{ address.blockNumber }}</p>
                    <p v-if="address.buildingNumber">Building: {{ address.buildingNumber }}</p>
                    <p v-if="address.floor">Floor: {{ address.floor }}</p>
                    <p v-if="address.apartmentNo">Apartment: {{ address.apartmentNo }}</p>
                    <p v-if="address.officeNo">Office: {{ address.officeNo }}</p>
                    <p v-if="address.phone" class="font-medium">📞 {{ address.phone }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add New Address Form -->
          <div v-if="showAddressForm" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium text-gray-900 dark:text-white">Add New Address</h4>
              <button
                @click="showAddressForm = false"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Address Type -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Type</label>
                <select
                  v-model="newAddress.type"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="home">Home Address</option>
                  <option value="building">Building Address</option>
                  <option value="office">Office Address</option>
                </select>
              </div>

              <!-- PACI Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PACI Number</label>
                <input
                  v-model="newAddress.paciNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter PACI number"
                />
              </div>

              <!-- Street Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Name</label>
                <input
                  v-model="newAddress.streetName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter street name"
                />
              </div>

              <!-- Block Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Number</label>
                <input
                  v-model="newAddress.blockNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter block number"
                />
              </div>

              <!-- Building Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building Number (Optional)</label>
                <input
                  v-model="newAddress.buildingNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter building number (optional)"
                />
              </div>

              <!-- Floor (for building type) -->
              <div v-if="newAddress.type === 'building'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor *</label>
                <input
                  v-model="newAddress.floor"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter floor number"
                  required
                />
              </div>

              <!-- Apartment No (for building type) -->
              <div v-if="newAddress.type === 'building'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apartment No *</label>
                <input
                  v-model="newAddress.apartmentNo"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter apartment number"
                  required
                />
              </div>

              <!-- Office No (for office type) -->
              <div v-if="newAddress.type === 'office'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office No *</label>
                <input
                  v-model="newAddress.officeNo"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter office number"
                  required
                />
              </div>

              <!-- Additional Info -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Info</label>
                <textarea
                  v-model="newAddress.additionalInfo"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Any additional information"
                ></textarea>
              </div>

              <!-- Google Location Link -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Location Link (Optional)</label>
                <input
                  v-model="newAddress.googleLocationLink"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <!-- Phone -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  v-model="newAddress.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button
                @click="cancelAddAddress"
                class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                @click="saveNewAddress"
                :disabled="!canSaveAddress || savingAddress"
                class="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingAddress ? 'Saving...' : 'Save Address' }}
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="userAddresses.length === 0 && !showAddressForm" class="text-center py-6 text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="mb-2">
              <span v-if="isAdmin && cartOwnerData">
                No delivery addresses found for {{ cartOwnerData.name }}
              </span>
              <span v-else>
                No delivery addresses found
              </span>
            </p>
            <p class="text-sm">Add an address to continue with checkout</p>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Payment Method
          </label>
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
              :class="{
                'border-brand-500 bg-brand-50 dark:bg-brand-900/20': selectedPaymentMethod === method.value,
                'hover:border-gray-300 dark:hover:border-gray-500': selectedPaymentMethod !== method.value
              }"
              @click="selectedPaymentMethod = method.value as 'cash' | 'knet' | 'mastercard'"
            >
              <div class="flex items-center gap-3">
                <input
                  type="radio"
                  :value="method.value"
                  v-model="selectedPaymentMethod"
                  class="text-brand-600 focus:ring-brand-500"
                />
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ method.icon }}</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ method.label }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ method.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Session Status -->
        <div v-if="paymentSession" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full" :class="{
              'bg-green-500': paymentSession.status === 'completed',
              'bg-yellow-500': paymentSession.status === 'pending',
              'bg-red-500': paymentSession.status === 'failed',
              'bg-gray-500': paymentSession.status === 'expired'
            }"></div>
            <span class="font-medium text-gray-900 dark:text-white">Payment Status: {{ paymentSession.status }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Session ID: {{ paymentSession.sessionId }}</p>
          <p v-if="paymentSession.paymentLink" class="text-sm text-blue-600 dark:text-blue-400 mt-2">
            <a :href="paymentSession.paymentLink" target="_blank" class="underline">Complete Payment</a>
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <div class="flex gap-3">
          <button
            v-if="!paymentSession && selectedPaymentMethod !== 'cash'"
            @click="createPaymentSession"
            :disabled="loading || !selectedPaymentMethod"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating...' : 'Create Payment Session' }}
          </button>
          <button
            v-if="paymentSession && paymentSession.status === 'pending'"
            @click="checkPaymentStatus"
            :disabled="loading"
            class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            {{ loading ? 'Checking...' : 'Check Payment Status' }}
          </button>
          <button
            @click="submitOrder"
            :disabled="loading || !canSubmitOrder"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Submitting...' : 'Submit Order' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { CartsAPI } from '@/api/CartsAPI'
import { UsersAPI } from '@/api/UsersAPI'
import { AddressAPI } from '@/api/AddressAPI'

interface Props {
  show: boolean
  cart: any
  userId: string
  isAdmin?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'orderSubmitted'])

const loading = ref(false)
const selectedAddressId = ref<string>('')
const selectedPaymentMethod = ref('cash' as 'cash' | 'knet' | 'mastercard')
const paymentSession = ref<any>(null)
const userAddresses = ref<any[]>([])
const showAddressForm = ref(false)
const savingAddress = ref(false)
const cartOwnerData = ref<any>(null)

// New address form data
const newAddress = ref({
  type: 'home' as 'home' | 'building' | 'office',
  paciNumber: '',
  streetName: '',
  additionalInfo: '',
  googleLocationLink: '',
  blockNumber: '',
  buildingNumber: '',
  floor: '',
  apartmentNo: '',
  officeNo: '',
  phone: ''
})

const paymentMethods = [
  {
    value: 'cash',
    label: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: '💵'
  },
  {
    value: 'knet',
    label: 'KNET',
    description: 'Kuwait local bank cards',
    icon: '💳'
  },
  {
    value: 'mastercard',
    label: 'Mastercard',
    description: 'International credit/debit cards',
    icon: '💳'
  }
]

const canSubmitOrder = computed(() => {
  // Must have address selected
  if (!selectedAddressId.value) return false
  
  // Must have payment method selected
  if (!selectedPaymentMethod.value) return false
  
  if (selectedPaymentMethod.value === 'cash') {
    return true
  }
  
  return paymentSession.value && paymentSession.value.status === 'completed'
})

const canSaveAddress = computed(() => {
  const addr = newAddress.value
  const basicFieldsValid = addr.paciNumber && addr.streetName && addr.blockNumber

  if (addr.type === 'building') {
    return basicFieldsValid && addr.floor && addr.apartmentNo
  } else if (addr.type === 'office') {
    return basicFieldsValid && addr.officeNo
  }
  
  return basicFieldsValid
})

const fetchUserAddresses = async () => {
  try {
    if (props.isAdmin && props.cart?._id) {
      // Admin fetching cart owner's data
      const { data } = await CartsAPI.getCartOwnerData(props.cart._id)
      cartOwnerData.value = data?.data?.cartOwner
      userAddresses.value = data?.data?.cartOwner?.addresses || []
    } else {
      // Regular user fetching their own data
      const { data } = await UsersAPI.getUser(props.userId)
      userAddresses.value = data?.data?.user?.addresses || []
    }
    
    // Auto-select first address if available
    if (userAddresses.value.length > 0) {
      selectedAddressId.value = userAddresses.value[0].id
    }
  } catch (error) {
    console.error('Failed to fetch user addresses:', error)
    // If admin can't fetch cart owner data, show error
    if (props.isAdmin) {
      alert('Unable to fetch cart owner addresses. Please ensure you have admin privileges.')
    }
  }
}

const createPaymentSession = async () => {
  loading.value = true
  try {
    const { data } = await CartsAPI.createPaymentSession({
      paymentMethod: selectedPaymentMethod.value
    })
    
    paymentSession.value = data.data
    
    // If payment link is available, open it
    if (paymentSession.value.paymentLink) {
      window.open(paymentSession.value.paymentLink, '_blank')
    }
  } catch (error) {
    console.error('Failed to create payment session:', error)
    alert('Failed to create payment session. Please try again.')
  } finally {
    loading.value = false
  }
}

const checkPaymentStatus = async () => {
  if (!paymentSession.value?.sessionId) return
  
  loading.value = true
  try {
    const { data } = await CartsAPI.checkPaymentStatus(paymentSession.value.sessionId)
    paymentSession.value.status = data.data.paymentStatus
  } catch (error) {
    console.error('Failed to check payment status:', error)
  } finally {
    loading.value = false
  }
}

const submitOrder = async () => {
  loading.value = true
  try {
    // Validate address is selected
    if (!selectedAddressId.value) {
      alert('Please select a delivery address before submitting your order.')
      loading.value = false
      return
    }

    console.log('=== ORDER SUBMISSION DEBUG ===')
    console.log('Selected Address ID:', selectedAddressId.value)
    console.log('Payment Method:', selectedPaymentMethod.value)
    console.log('User Addresses:', userAddresses.value)
    
    const selectedAddress = userAddresses.value.find(addr => addr.id === selectedAddressId.value)
    console.log('Selected Address Details:', selectedAddress)
    
    const orderData: any = {
      paymentMethod: selectedPaymentMethod.value,
      userAddressId: selectedAddressId.value
    }
    
    if (paymentSession.value?.sessionId) {
      orderData.sessionId = paymentSession.value.sessionId
    }
    
    console.log('Order Data Being Sent:', orderData)
    
    const { data } = await CartsAPI.submitOrder(orderData)
    
    console.log('Order Response:', data)
    
    emit('orderSubmitted', data.data.order)
    emit('close')
    
    alert('Order submitted successfully!')
  } catch (error: any) {
    console.error('Failed to submit order:', error)
    console.error('Error details:', error.response?.data)
    alert(error.response?.data?.message || 'Failed to submit order. Please try again.')
  } finally {
    loading.value = false
  }
}

const resetAddressForm = () => {
  newAddress.value = {
    type: 'home',
    paciNumber: '',
    streetName: '',
    additionalInfo: '',
    googleLocationLink: '',
    blockNumber: '',
    buildingNumber: '',
    floor: '',
    apartmentNo: '',
    officeNo: '',
    phone: ''
  }
}

const cancelAddAddress = () => {
  showAddressForm.value = false
  resetAddressForm()
}

const saveNewAddress = async () => {
  if (!canSaveAddress.value) return
  
  savingAddress.value = true
  try {
    // Get current user token
    const token = localStorage.getItem('token') || ''
    
    if (props.isAdmin && cartOwnerData.value) {
      // Admin adding address for cart owner
      // We need to update the cart owner's profile with the new address
      const cartOwnerId = cartOwnerData.value._id
      const currentAddresses = cartOwnerData.value.addresses || []
      const updatedAddresses = [...currentAddresses, newAddress.value]
      
      await UsersAPI.updateUser(cartOwnerId, { addresses: updatedAddresses })
    } else {
      // Regular user adding their own address
      await AddressAPI.addOrUpdateAddress(newAddress.value, token)
    }
    
    // Refresh addresses
    await fetchUserAddresses()
    
    // Select the newly added address (it will be the last one)
    if (userAddresses.value.length > 0) {
      const lastAddress = userAddresses.value[userAddresses.value.length - 1]
      selectedAddressId.value = lastAddress.id
    }
    
    // Close form and reset
    showAddressForm.value = false
    resetAddressForm()
    
    alert('Address added successfully!')
  } catch (error: any) {
    console.error('Failed to save address:', error)
    alert(error.response?.data?.message || 'Failed to save address. Please try again.')
  } finally {
    savingAddress.value = false
  }
}

// Reset payment session when payment method changes
watch(selectedPaymentMethod, () => {
  paymentSession.value = null
})

onMounted(() => {
  if (props.show && props.userId) {
    fetchUserAddresses()
  }
})

watch(() => props.show, (newShow) => {
  if (newShow && props.userId) {
    fetchUserAddresses()
  }
})
</script>
