<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-6">
      <!-- Header with Create Button -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Carts Management</h2>
        <button
          @click="$router.push('/carts/add')"
          class="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200 font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Cart
        </button>
      </div>

      <ComponentCard title="All Carts">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading carts...</p>
        </div>

        <DataTable
          v-else
          :columns="columns"
          :data="formattedCarts"
          :show-actions="true"
          :on-view="handleView"
          :on-edit="handleEdit"
          :on-delete="handleDelete"
        >
          <!-- Custom column for user -->
          <template #column-user="{ item }">
            <div v-if="item.userInfo">
              <p class="font-medium text-gray-900 dark:text-white">{{ item.userInfo.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400" :title="item.userInfo.email">
                {{ item.userInfo.email.length > 20 ? item.userInfo.email.substring(0, 20) + '...' : item.userInfo.email }}
              </p>
            </div>
            <span v-else class="text-gray-400">—</span>
          </template>

          <!-- Custom column for items count -->
          <template #column-itemsCount="{ item }">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {{ item.itemsCount }} items
            </span>
          </template>

          <!-- Custom column for total price -->
          <template #column-totalPrice="{ item }">
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ item.totalPrice }} KWD</p>
              <p v-if="item.totalPriceAfterDiscount" class="text-sm text-green-600 dark:text-green-400">
                After discount: {{ item.totalPriceAfterDiscount }} KWD
              </p>
            </div>
          </template>

          <!-- Custom column for payment status -->
          <template #column-paymentStatus="{ item }">
            <span
              v-if="item.paymentStatus"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getPaymentStatusClass(item.paymentStatus)"
            >
              {{ item.paymentStatus }}
            </span>
            <span v-else class="text-gray-400">—</span>
          </template>
        </DataTable>

        <!-- Pagination -->
        <Pagination
          v-if="pagination.totalPages > 1"
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-documents="pagination.totalDocuments"
          :limit="pagination.limit"
          :has-next-page="pagination.hasNextPage"
          :has-prev-page="pagination.hasPrevPage"
          @page-change="handlePageChange"
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
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import { CartsAPI } from '@/api/CartsAPI'

const router = useRouter()
const currentPageTitle = ref('Carts')

const carts = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalDocuments: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10
})

const columns = ref<any>([
  { key: 'user', title: 'Customer', type: 'text' },
  { key: 'itemsCount', title: 'Items', type: 'text', widthClass: 'w-24' },
  { key: 'totalPrice', title: 'Total', type: 'text' },
  { key: 'paymentStatus', title: 'Payment Status', type: 'text' },
  { key: 'updatedAt', title: 'Last Updated', type: 'text' },
])

const formattedCarts = computed(() => {
  return carts.value.map(cart => ({
    ...cart,
    userInfo: cart.userId ? {
      name: cart.userId.name || '—',
      email: cart.userId.email || '—'
    } : null,
    itemsCount: cart.cartItem?.length || 0,
    totalPrice: cart.totalPrice?.toFixed(2) || '0.00',
    totalPriceAfterDiscount: cart.totalPriceAfterDiscount?.toFixed(2) || null,
    paymentStatus: cart.paymentSession?.status || null,
    updatedAt: cart.updatedAt ? new Date(cart.updatedAt).toLocaleDateString() : '—'
  }))
})

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'expired':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const fetchCarts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit
    }
    const { data } = await CartsAPI.getAllCarts(params)
    
    if (data?.data) {
      carts.value = data.data.carts || []
      
      // Update pagination info
      if (data.data.pagination) {
        pagination.value = {
          ...data.data.pagination
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch carts:', e)
    carts.value = []
  } finally {
    loading.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchCarts()
}

const handleView = (item: any) => {
  router.push(`/carts/view/${item._id}`)
}

const handleEdit = (item: any) => {
  router.push(`/carts/edit/${item._id}`)
}

const handleDelete = async (item: any) => {
  try {
    await CartsAPI.deleteCart(item._id)
    await fetchCarts()
  } catch (e) {
    console.error('Failed to delete cart:', e)
  }
}

onMounted(fetchCarts)
</script>
