<template>
  <div class="payment-component">
    <div class="payment-methods">
      <h3>Choose Payment Method</h3>
      
      <div class="payment-method" @click="selectPaymentMethod('knet')">
        <input type="radio" id="knet" name="payment" value="knet" v-model="selectedPaymentMethod">
        <label for="knet">KNET</label>
      </div>
      
      <div class="payment-method" @click="selectPaymentMethod('mastercard')">
        <input type="radio" id="mastercard" name="payment" value="mastercard" v-model="selectedPaymentMethod">
        <label for="mastercard">Mastercard</label>
      </div>
      
      <div class="payment-method" @click="selectPaymentMethod('cash')">
        <input type="radio" id="cash" name="payment" value="cash" v-model="selectedPaymentMethod">
        <label for="cash">Cash on Delivery</label>
      </div>
    </div>

    <div class="shipping-address" v-if="selectedPaymentMethod">
      <h3>Shipping Address</h3>
      <form @submit.prevent="processPayment">
        <div class="form-group">
          <label for="street">Street:</label>
          <input type="text" id="street" v-model="shippingAddress.street" required>
        </div>
        
        <div class="form-group">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="shippingAddress.city" required>
        </div>
        
        <div class="form-group">
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="shippingAddress.phone" required>
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="isProcessing">
          {{ isProcessing ? 'Processing...' : 'Proceed to Payment' }}
        </button>
      </form>
    </div>

    <div class="payment-status" v-if="paymentStatus">
      <div :class="['alert', paymentStatus.success ? 'alert-success' : 'alert-error']">
        {{ paymentStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { CartsAPI } from '@/api/CartsAPI'

const router = useRouter()
const authStore = useAuthStore()

const selectedPaymentMethod = ref('')
const shippingAddress = reactive({
  street: '',
  city: '',
  phone: ''
})
const isProcessing = ref(false)
const paymentStatus = ref<any>(null)

const selectPaymentMethod = (method: string) => {
  selectedPaymentMethod.value = method
}

const processPayment = async () => {
  if (!selectedPaymentMethod.value) {
    alert('Please select a payment method')
    return
  }

  isProcessing.value = true
  paymentStatus.value = null

  try {
    // Use the CartsAPI to create payment session and submit order
    const paymentData = {
      paymentMethod: selectedPaymentMethod.value as 'cash' | 'knet' | 'mastercard'
    }

    if (selectedPaymentMethod.value !== 'cash') {
      // Create payment session for online payments
      const sessionResponse = await CartsAPI.createPaymentSession(paymentData)
      
      if (sessionResponse.data?.data?.paymentLink) {
        // Redirect to payment page
        window.location.href = sessionResponse.data.data.paymentLink
      }
    } else {
      // For cash orders, submit directly
      const orderResponse = await CartsAPI.submitOrder({
        paymentMethod: 'cash'
      })
      
      if (orderResponse.data?.status === 'success') {
        paymentStatus.value = {
          success: true,
          message: 'Order placed successfully!'
        }
        // Redirect to order confirmation after a short delay
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      }
    }

  } catch (error: any) {
    paymentStatus.value = {
      success: false,
      message: error.response?.data?.message || error.message || 'Payment processing failed'
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.payment-component {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.payment-methods {
  margin-bottom: 30px;
}

.payment-method {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
}

.payment-method:hover {
  background-color: #f5f5f5;
}

.payment-method input[type="radio"] {
  margin-right: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>