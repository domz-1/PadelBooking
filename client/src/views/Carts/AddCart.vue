<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-6">
      <ComponentCard title="Create New Cart">
        <Form
          :fields="cartFields"
          :initial-data="formData"
          :show-submit-button="true"
          submit-button-text="Create Cart"
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
import { useRouter } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Form from '@/components/forms/Form.vue'
import { CartsAPI } from '@/api/CartsAPI'
import api from '@/api/api'

const router = useRouter()
const currentPageTitle = ref('Add Cart')

const submitting = ref(false)
const users = ref<any[]>([])
const products = ref<any[]>([])

const formData = ref({
  userId: '',
  cartItem: [],
})

const cartFields = computed(() => [
  {
    key: 'userId',
    type: 'select',
    label: 'Customer',
    required: true,
    placeholder: 'Select a customer',
    options: Array.isArray(users.value) ? users.value.map(u => ({ label: `${u.name} (${u.email})`, value: u._id })) : [],
  },
  {
    key: 'cartItem',
    type: 'array',
    label: 'Cart Items',
    required: true,
    minItems: 1,
    addButtonText: '+ Add Item',
    itemLabel: 'Item',
    emptyMessage: 'No items added. Click "Add Item" to start.',
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
        placeholder: '1',
      },
    ],
  },
] as any)

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
    await CartsAPI.createCart(data)
    router.push('/carts')
  } catch (e) {
    console.error('Failed to create cart:', e)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/carts')
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchProducts()])
})
</script>
