<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-6">
      <!-- Header with Create Button -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
        <button
          @click="$router.push('/orders/add')"
          class="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200 font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Order
        </button>
      </div>

      <!-- Search and Filters -->
      <ComponentCard title="Search & Filters">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search Bar -->
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by Order ID, Customer, Email, Product name, or Status..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_preparation">Under Preparation</option>
              <option value="under_delivery">Under Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center gap-2 mt-4">
          <button
            @click="resetFilters"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ orders.length }} of {{ pagination.totalDocuments }} orders
          </div>
        </div>
      </ComponentCard>

      <ComponentCard :title="`Orders (${pagination.totalDocuments})`">
        <DataTable
          :columns="columns"
          :data="orders"
          :show-actions="true"
          :on-view="handleView"
          :on-edit="handleEdit"
          :on-delete="handleDelete"
        >
        <template #column-id="{ item }">
  <code
    class="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 inline-block"
    :title="item.orderId"
  >
    {{ item.orderId ? item.orderId.substring(0, 4) + '...' : '—' }}
  </code>
</template>
          <!-- Custom status column with inline select to update -->
          <template #"column-status"="{ item }">
            <div class="flex items-center gap-2">
              <span
                class="rounded-full px-2 py-0.5 text-theme-xs font-medium"
                :class="statusBadgeClass(item.status)"
              >
                {{ prettyStatus(item.status) }}
              </span>
              <select
                class="ml-2 border border-gray-300 rounded-md text-xs px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                v-model="item.status"
                @change="updateStatus(item)"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </template>

          <!-- Custom user column -->
          <!-- Custom Customer column -->
<template #column-user="{ item }">
  <div class="space-y-1">
    <p class="text-gray-900 dark:text-white font-medium text-sm">
      {{ item.user?.name || '—' }}
    </p>
    <p class="text-gray-500 dark:text-gray-400 text-xs">
      {{ item.user?.email || '—' }}
    </p>
    <p v-if="item.user?.phone" class="text-gray-500 dark:text-gray-400 text-xs">
       {{ item.user.phone }}
    </p>
  </div>
</template>


          <!-- Custom items column with product details -->
          <template #"column-itemsCount"="{ item }">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
                  {{ item.itemsCount }} {{ item.itemsCount === 1 ? 'item' : 'items' }}
                </span>
              </div>
              <div class="space-y-1 max-w-xs">
                <div v-for="(cartItem, idx) in item.cartItems?.slice(0, 2)" :key="idx" class="flex items-center gap-2 text-xs">
                  <div class="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img 
                      v-if="cartItem.productId?.imgCover"
                      :src="getImageUrl(cartItem.productId.imgCover)"
                      :alt="getProductTitle(cartItem.productId)"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-gray-700 dark:text-gray-300 truncate">
                      {{ getProductTitle(cartItem.productId) }}
                    </p>
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ cartItem.quantity }}x {{ cartItem.price }} KWD
                    </p>
                  </div>
                </div>
                <div v-if="item.cartItems?.length > 2" class="text-xs text-gray-500 dark:text-gray-400">
                  +{{ item.cartItems.length - 2 }} more items
                </div>
              </div>
            </div>
          </template>

          <!-- Custom id column -->
          <template #"column-id"="{ item }">
            <code 
              class="text-xs bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 inline-block max-w-16 truncate" 
              :title="item.orderId"
            >
              {{ item.orderId && item.orderId.toString().length > 4 ? item.orderId.toString().substring(0, 4) + '...' : item.orderId }}
            </code>
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
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import DataTable, { type Column } from '@/components/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import { OrdersAPI } from '@/api/OrdersAPI'

const router = useRouter()

type Status = 'pending' | 'under_preparation' | 'under_delivery' | 'delivered' | 'cancelled' | 'refunded'

const currentPageTitle = ref('Orders')

// Filters state
const filters = reactive({
  search: '',
  status: '' as '' | Status,
})


const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Under Preparation', value: 'under_preparation' },
  { label: 'Under Delivery', value: 'under_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

// Table
const columns = ref<Column[]>([
  { key: 'orderId', title: 'Order ID', type: 'text', widthClass: 'w-48' },
  { key: 'user', title: 'Customer', type: 'text', widthClass: 'w-48' },
  { key: 'itemsCount', title: 'Products', type: 'text', widthClass: 'w-80' },
  { key: 'totalOrderPrice', title: 'Total', type: 'text', widthClass: 'w-28' },
  { key: 'status', title: 'Status', type: 'status', badgeType: 'info', widthClass: 'w-64' },
  { key: 'createdAt', title: 'Created', type: 'text', widthClass: 'w-40' },
])

const orders = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalDocuments: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10
})

const prettyStatus = (s: Status) => {
  return s
    ? s.replace(/_/g, ' ') // under_delivery -> under delivery
        .replace(/\b\w/g, (c) => c.toUpperCase()) // title case
    : ''
}

const statusBadgeClass = (s: Status) => {
  switch (s) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'
    case 'under_preparation':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-500'
    case 'under_delivery':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    case 'delivered':
      return 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500'
    case 'cancelled':
      return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: filters.search.trim() || undefined,
      status: filters.status || undefined
    }
    
    const { data } = await OrdersAPI.getAllOrders(params)
    
    if (data?.data) {
      const list = data.data.orders || []
      orders.value = list.map((o: any) => ({
        ...o,
        id: o.orderId || o._id,
        user: o.userId ? { 
          name: o.userId.name, 
          email: o.userId.email, 
          phone: o.userId.phone,
          isGuest: o.userId.isGuest 
        } : null,
        itemsCount: Array.isArray(o.cartItems) ? o.cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) : 0,
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : '',
      }))
      
      // Update pagination info
      if (data.data.pagination) {
        pagination.value = {
          ...data.data.pagination
        }
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchOrders()
}

// Debounced search function
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    fetchOrders()
  }, 500)
}

// Watch for filter changes
watch(() => filters.search, () => {
  debouncedSearch()
})

watch(() => filters.status, () => {
  pagination.value.currentPage = 1
  fetchOrders()
})

const resetFilters = () => {
  filters.search = ''
  filters.status = '' as '' | Status
  pagination.value.currentPage = 1
  fetchOrders()
}

const getImageUrl = (imageId: string) => {
  if (!imageId) return '/placeholder-product.png'
  return `${import.meta.env.VITE_API_URL}/images/image/${imageId}`
}

const getProductTitle = (product: any) => {
  if (!product) return 'Unknown Product'
  if (typeof product.title === 'object') {
    return product.title?.en || product.title?.ar || 'Unknown Product'
  }
  return product.title || product.name || 'Unknown Product'
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-product.png'
}

const updateStatus = async (item: any) => {
  const orderId = item._id
  const status: Status = item.status
  try {
    await OrdersAPI.updateOrderStatus(orderId, status)
  } catch (e) {
    // on error, refetch to restore
    await fetchOrders()
  }
}

const handleView = (item: any) => {
  router.push(`/orders/view/${item._id}`)
}
const handleEdit = (item: any) => {
  router.push(`/orders/edit/${item._id}`)
}
const handleDelete = async (item: any) => {
  try {
    await OrdersAPI.deleteOrder(item._id)
    // Refresh the orders list
    await fetchOrders()
  } catch (e) {
    console.error('Failed to delete order:', e)
  }
}

onMounted(fetchOrders)
</script>
  
