<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalUsers || 0 }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Activated Users</p>
                            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.activatedUsers || 0 }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Deactivated Users</p>
                            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.deactivatedUsers || 0 }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Activation Rate</p>
                            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.activationRate || '0' }}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <ComponentCard title="Telegram Users Management">
                <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Telegram Users</h3>
                    <div class="flex flex-col sm:flex-row gap-2">
             
                        <button 
                            @click="showAddUserModal = true"
                            class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                        >
                            ➕ Add User
                        </button>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="mb-4 flex flex-col sm:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search by name, chat ID, username..."
                            class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <select 
                        v-model="statusFilter"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">All Status</option>
                        <option value="true">Activated</option>
                        <option value="false">Deactivated</option>
                    </select>
                </div>

                <!-- Tabs -->
                <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav class="-mb-px flex space-x-8">
                        <button
                            @click="activeTab = 'all'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'all'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            All Users
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {{ pagination.totalDocuments }}
                            </span>
                        </button>
                        <button
                            @click="activeTab = 'activated'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'activated'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            Activated
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                                {{ stats.activatedUsers || 0 }}
                            </span>
                        </button>
                        <button
                            @click="activeTab = 'deactivated'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'deactivated'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            Deactivated
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                                {{ stats.deactivatedUsers || 0 }}
                            </span>
                        </button>
                    </nav>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>

                <!-- Data Table -->
                <DataTable 
                    v-else
                    :columns="tableColumns"
                    :data="filteredUsers"
                    :showActions="true"
                    :onView="(item: any) => viewUser(item as TelegramUser)"
                    :onEdit="(item: any) => editUser(item as TelegramUser)"
                    :onDelete="(item: any) => deleteUser(item as TelegramUser)"
                >
                    <!-- Custom slots for specific columns -->
                    <template #column-name="{ item }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span class="text-sm font-medium text-white">
                                    {{ getInitials(item.name) }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-medium text-gray-800 text-sm dark:text-white/90">
                                    {{ item.name }}
                                </span>
                                <span v-if="item.username" class="block text-gray-500 text-xs dark:text-gray-400">
                                    @{{ item.username }}
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #column-chatId="{ item }">
                        <div class="font-mono text-sm text-gray-600 dark:text-gray-300">
                            {{ item.chatId }}
                        </div>
                    </template>

                    <template #column-isActivated="{ item }">
                        <button
                            @click="toggleUserActivation(item as TelegramUser)"
                            :class="[
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                                item.isActivated
                                    ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                                    : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                            ]"
                        >
                            <span :class="[
                                'w-1.5 h-1.5 rounded-full mr-1.5',
                                item.isActivated ? 'bg-green-400' : 'bg-red-400'
                            ]"></span>
                            {{ item.isActivated ? 'Active' : 'Inactive' }}
                        </button>
                    </template>

                    <template #column-messageCount="{ item }">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.messageCount || 0 }}</span>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </div>
                    </template>

                    <template #column-lastMessageAt="{ item }">
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            {{ item.lastMessageAt ? formatDate(item.lastMessageAt) : 'Never' }}
                        </div>
                    </template>

                    <template #column-createdAt="{ item }">
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            {{ formatDate(item.createdAt) }}
                        </div>
                    </template>
                </DataTable>

                <!-- Pagination -->
                <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
                    <nav class="flex items-center gap-2">
                        <button
                            @click="changePage(pagination.currentPage - 1)"
                            :disabled="pagination.currentPage <= 1"
                            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        
                        <span class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
                        </span>
                        
                        <button
                            @click="changePage(pagination.currentPage + 1)"
                            :disabled="pagination.currentPage >= pagination.totalPages"
                            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </ComponentCard>
        </div>

        <!-- Add User Modal -->
        <AddTelegramUserModal 
            v-if="showAddUserModal"
            @close="showAddUserModal = false"
            @user-added="handleUserAdded"
        />

        <!-- Edit User Modal -->
        <EditTelegramUserModal 
            v-if="showEditUserModal && selectedUser"
            :user="selectedUser"
            @close="showEditUserModal = false"
            @user-updated="handleUserUpdated"
        />

        <!-- Test Message Modal -->
        <TestMessageModal 
            v-if="showTestMessageModal"
            @close="showTestMessageModal = false"
            @message-sent="handleMessageSent"
        />

        <!-- Bulk Update Modal -->
        <BulkUpdateModal 
            v-if="showBulkUpdateModal"
            :selectedUsers="selectedUsers"
            @close="showBulkUpdateModal = false"
            @bulk-updated="handleBulkUpdated"
        />

        <!-- View User Modal -->
        <ViewTelegramUserModal 
            v-if="showViewUserModal && selectedUser"
            :user="selectedUser"
            @close="showViewUserModal = false"
            @edit-user="handleEditFromView"
        />
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import DataTable from '@/components/DataTable.vue'
import AddTelegramUserModal from './AddTelegramUserModal.vue'
import EditTelegramUserModal from './EditTelegramUserModal.vue'
import TestMessageModal from './TestMessageModal.vue'
import BulkUpdateModal from './BulkUpdateModal.vue'
import ViewTelegramUserModal from './ViewTelegramUserModal.vue'
import { TelegramUsersAPI, type TelegramUser, type TelegramUserStats } from '@/api/TelegramUsersAPI'

// const router = useRouter() // Not needed for this component

// Page title
const currentPageTitle = ref('Telegram Users')

// Data
const users = ref<TelegramUser[]>([])
const stats = ref<TelegramUserStats>({
  totalUsers: 0,
  activatedUsers: 0,
  deactivatedUsers: 0,
  recentUsers: 0,
  activationRate: '0'
})
const loading = ref(false)
const selectedUsers = ref<string[]>([])
const selectedUser = ref<TelegramUser | null>(null)

// Filters and search
const searchQuery = ref('')
const statusFilter = ref('')
const activeTab = ref('all')

// Pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalDocuments: 0,
  limit: 10
})

// Modals
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showTestMessageModal = ref(false)
const showBulkUpdateModal = ref(false)
const showViewUserModal = ref(false)

// Table columns
const tableColumns = [
  { key: 'name', title: 'Name', type: 'text' as const },
  { key: 'chatId', title: 'Chat ID', type: 'text' as const },
  { key: 'isActivated', title: 'Status', type: 'text' as const },
  { key: 'lastMessageAt', title: 'Last Message', type: 'text' as const },
  { key: 'createdAt', title: 'Created', type: 'text' as const }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by tab
  if (activeTab.value === 'activated') {
    filtered = filtered.filter(user => user.isActivated)
  } else if (activeTab.value === 'deactivated') {
    filtered = filtered.filter(user => !user.isActivated)
  }

  // Filter by status
  if (statusFilter.value !== '') {
    const isActivated = statusFilter.value === 'true'
    filtered = filtered.filter(user => user.isActivated === isActivated)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.chatId.toLowerCase().includes(query) ||
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      isActivated: statusFilter.value !== '' ? statusFilter.value === 'true' : undefined
    }

    const response = await TelegramUsersAPI.getAllUsers(params)
    console.log('📊 Telegram Users API Response:', response.data)
    users.value = response.data.data.telegramUsers
    console.log('👥 Users loaded:', users.value.length)
    pagination.value = {
      currentPage: response.data.data.pagination.currentPage,
      totalPages: response.data.data.pagination.totalPages,
      totalDocuments: response.data.data.pagination.totalDocuments,
      limit: pagination.value.limit
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await TelegramUsersAPI.getStats()
    stats.value = response.data.data.statistics
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const toggleUserActivation = async (user: TelegramUser) => {
  try {
    await TelegramUsersAPI.toggleActivation(user._id)
    user.isActivated = !user.isActivated
    await fetchStats()
  } catch (error) {
    console.error('Error toggling user activation:', error)
  }
}

const viewUser = (user: TelegramUser) => {
  selectedUser.value = user
  showViewUserModal.value = true
}

const editUser = (user: TelegramUser) => {
  selectedUser.value = user
  showEditUserModal.value = true
}

const handleEditFromView = (user: TelegramUser) => {
  // Close view modal and open edit modal
  showViewUserModal.value = false
  selectedUser.value = user
  showEditUserModal.value = true
}

const deleteUser = async (user: TelegramUser) => {
  if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
    try {
      await TelegramUsersAPI.deleteUser(user._id)
      await fetchUsers()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
    fetchUsers()
  }
}

// const handleSelectionChange = (selectedIds: string[]) => {
//   selectedUsers.value = selectedIds
// }

const handleUserAdded = () => {
  showAddUserModal.value = false
  fetchUsers()
  fetchStats()
}

const handleUserUpdated = () => {
  showEditUserModal.value = false
  fetchUsers()
  fetchStats()
}

const handleMessageSent = () => {
  showTestMessageModal.value = false
}

const handleBulkUpdated = () => {
  showBulkUpdateModal.value = false
  selectedUsers.value = []
  fetchUsers()
  fetchStats()
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch([searchQuery, statusFilter, activeTab], () => {
  pagination.value.currentPage = 1
  fetchUsers()
})

// Lifecycle
onMounted(() => {
  fetchUsers()
  fetchStats()
})
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>
