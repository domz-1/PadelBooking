<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>

    <div v-else class="space-y-6">
      <ComponentCard title="Edit Order">
        <Form
          ref="formRef"
          :fields="orderFields"
          :initial-data="formData"
          :show-submit-button="true"
          submit-button-text="Update Order"
          :show-reset-button="true"
          reset-button-text="Cancel"
          :loading="submitting"
          @submit="handleSubmit"
          @reset="handleCancel"
          @change="handleFormChange"
        />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Form from '@/components/forms/Form.vue'
import api from '@/api/api'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const currentPageTitle = ref('Edit Order')

const loading = ref(false)
const submitting = ref(false)
const formData = ref<any>({})
const users = ref<any[]>([])
const products = ref<any[]>([])
const formRef = ref<any>(null)

// Helper to get product by ID
const getProductById = (productId: string) => {
  return products.value.find(p => p._id === productId)
}

// Auto-calculate total price from cart items
const calculateTotal = (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) return 0
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    return total + (quantity * price)
  }, 0)
}

const orderFields = computed(() => [
  {
    key: 'userId',
    type: 'select',
    label: 'Customer',
    required: true,
    options: Array.isArray(users.value) ? users.value.map(u => ({ label: `${u.name} (${u.email})`, value: u._id })) : [],
  },
  {
    key: 'cartItems',
    type: 'array',
    label: 'Order Items',
    required: true,
    minItems: 1,
    fields: [
      {
        key: 'productId',
        type: 'select',
        label: 'Product',
        required: true,
        options: Array.isArray(products.value) ? products.value.map(p => ({ label: p.title?.en || p.name || 'Unknown', value: p._id })) : [],
      },
      {
        key: 'quantity',
        type: 'number',
        label: 'Quantity',
        required: true,
        min: 1,
      },
      {
        key: 'price',
        type: 'number',
        label: 'Price (KWD)',
        required: true,
        min: 0,
        step: 0.01,
        hint: 'Auto-filled from product, but you can edit it',
      },
    ],
  },
  {
    key: 'paymentMethod',
    type: 'select',
    label: 'Payment Method',
    required: true,
    options: [
      { label: 'Cash', value: 'cash' },
      { label: 'Card', value: 'card' },
      { label: 'Knet', value: 'knet' },
      { label: 'Mastercard', value: 'mastercard' },
    ],
  },
  {
    key: 'status',
    type: 'select',
    label: 'Order Status',
    required: true,
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Under Preparation', value: 'under_preparation' },
      { label: 'Under Delivery', value: 'under_delivery' },
      { label: 'Delivered', value: 'delivered' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'Refunded', value: 'refunded' },
    ],
  },
  {
    key: 'isPaid',
    type: 'switch',
    label: 'Payment Completed',
  },
  {
    key: 'isDelivered',
    type: 'switch',
    label: 'Delivered',
  },
  {
    key: 'totalOrderPrice',
    type: 'number',
    label: 'Total Order Price (KWD)',
    required: true,
    min: 0,
    step: 0.01,
    hint: 'Auto-calculated from items, but you can edit it',
  },
] as any)

// Handle form field changes
const handleFormChange = (field: string, value: any, currentFormData: any) => {
  // When a product is selected in cart items, auto-fill its price
  if (field.includes('cartItems') && field.includes('productId')) {
    const match = field.match(/cartItems\[(\d+)\]\.productId/)
    if (match) {
      const index = parseInt(match[1])
      const product = getProductById(value)
      if (product && formRef.value?.formData?.cartItems?.[index]) {
        // Auto-fill price from product
        const productPrice = product.price || product.priceBeforeOffer || 0
        formRef.value.formData.cartItems[index].price = productPrice
      }
    }
  }
  
  // Auto-calculate total when cart items or their quantities/prices change
  if (field.includes('cartItems') || field === 'cartItems') {
    setTimeout(() => {
      if (formRef.value?.formData) {
        const total = calculateTotal(formRef.value.formData.cartItems || [])
        formRef.value.formData.totalOrderPrice = parseFloat(total.toFixed(2))
      }
    }, 100)
  }
}

const fetchOrder = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/orders/${orderId}`)
    const order = data?.data
    if (order) {
      formData.value = {
        userId: order.userId?._id || order.userId,
        cartItems: order.cartItems?.map((item: any) => ({
          productId: item.productId?._id || item.productId,
          quantity: item.quantity,
          price: item.price,
        })) || [],
        paymentMethod: order.paymentMethod,
        status: order.status,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        totalOrderPrice: order.totalOrderPrice,
      }
    }
  } catch (e) {
    console.error('Failed to fetch order:', e)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await api.get('/users')
    users.value = data?.data?.users || data?.users || data?.data || []
  } catch (e) {
    console.error('Failed to fetch users:', e)
  }
}

const fetchProducts = async () => {
  try {
    const { data } = await api.get('/products')
    products.value = data?.data?.products || data?.products || data?.data || []
  } catch (e) {
    console.error('Failed to fetch products:', e)
  }
}

const handleSubmit = async (data: any) => {
  submitting.value = true
  try {
    await api.put(`/orders/${orderId}`, data)
    router.push('/orders')
  } catch (e) {
    console.error('Failed to update order:', e)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/orders')
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchProducts(), fetchOrder()])
})
</script>
  
