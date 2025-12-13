<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>

    <div v-else class="space-y-6">
      <ComponentCard title="Edit Cart">
        <Form
          :fields="cartFields"
          :initial-data="formData"
          :show-submit-button="true"
          submit-button-text="Update Cart"
          :show-reset-button="true"
          reset-button-text="Cancel"
          :loading="submitting"
          @submit="handleSubmit"
          @reset="handleCancel"
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
import { CartsAPI } from '@/api/CartsAPI'
import api from '@/api/api'

const route = useRoute()
const router = useRouter()
const cartId = route.params.id as string
const currentPageTitle = ref('Edit Cart')

const loading = ref(false)
const submitting = ref(false)
const formData = ref<any>({})
const products = ref<any[]>([])

const cartFields = computed(() => [
  {
    key: 'cartItem',
    type: 'array',
    label: 'Cart Items',
    required: true,
    minItems: 1,
    addButtonText: '+ Add Item',
    itemLabel: 'Item',
    fields: [
      {
        key: 'productId',
        type: 'select',
        label: 'Product',
        required: true,
        placeholder: 'Select a product',
        options: Array.isArray(products.value) ? products.value.map(p => ({ label: p.title?.en || p.name || 'Unknown', value: p._id })) : [],
      },
      {
        key: 'quantity',
        type: 'number',
        label: 'Quantity',
        required: true,
        min: 1,
      },
    ],
  },
] as any)

const fetchCart = async () => {
  loading.value = true
  try {
    const { data } = await CartsAPI.getCartById(cartId)
    const cart = data?.data
    if (cart) {
      formData.value = {
        cartItem: cart.cartItem?.map((item: any) => ({
          productId: item.productId?._id || item.productId,
          quantity: item.quantity,
        })) || [],
      }
    }
  } catch (e) {
    console.error('Failed to fetch cart:', e)
  } finally {
    loading.value = false
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
    await CartsAPI.updateCart(cartId, data)
    router.push('/carts')
  } catch (e) {
    console.error('Failed to update cart:', e)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/carts')
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCart()])
})
</script>
