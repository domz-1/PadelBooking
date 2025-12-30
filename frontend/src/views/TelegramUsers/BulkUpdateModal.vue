<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500/50 bg-opacity-50" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800 relative z-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            📊 Bulk Update Users
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Selected Users Info -->
          <div class="bg-blue-50 dark:bg-blue-500/20 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Selected Users ({{ selectedUsers.length }})
            </h4>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <div
                v-for="user in selectedUserDetails"
                :key="user._id"
                class="flex items-center gap-2 text-sm"
              >
                <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-xs font-medium text-white">
                    {{ getInitials(user.name) }}
                  </span>
                </div>
                <span class="text-blue-800 dark:text-blue-300">{{ user.name }}</span>
                <span v-if="user.username" class="text-blue-600 dark:text-blue-400 text-xs">@{{ user.username }}</span>
                <span :class="[
                  'ml-auto px-1.5 py-0.5 rounded text-xs font-medium',
                  user.isActivated
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                ]">
                  {{ user.isActivated ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Action
            </label>
            <div class="space-y-2">
              <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  v-model="selectedAction"
                  type="radio"
                  value="activate"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Activate Users</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enable notifications for selected users
                  </p>
                </div>
              </label>

              <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  v-model="selectedAction"
                  type="radio"
                  value="deactivate"
                  class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div class="ml-3">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Deactivate Users</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Disable notifications for selected users
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Impact Summary -->
          <div v-if="selectedAction" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Impact Summary</h4>
            <div class="space-y-1 text-sm">
              <div v-if="selectedAction === 'activate'">
                <span class="text-gray-600 dark:text-gray-400">Will activate:</span>
                <span class="ml-2 font-medium text-green-600 dark:text-green-400">
                  {{ inactiveCount }} inactive user(s)
                </span>
              </div>
              <div v-if="selectedAction === 'activate'">
                <span class="text-gray-600 dark:text-gray-400">Already active:</span>
                <span class="ml-2 font-medium text-gray-600 dark:text-gray-400">
                  {{ activeCount }} user(s)
                </span>
              </div>
              <div v-if="selectedAction === 'deactivate'">
                <span class="text-gray-600 dark:text-gray-400">Will deactivate:</span>
                <span class="ml-2 font-medium text-red-600 dark:text-red-400">
                  {{ activeCount }} active user(s)
                </span>
              </div>
              <div v-if="selectedAction === 'deactivate'">
                <span class="text-gray-600 dark:text-gray-400">Already inactive:</span>
                <span class="ml-2 font-medium text-gray-600 dark:text-gray-400">
                  {{ inactiveCount }} user(s)
                </span>
              </div>
            </div>
          </div>

          <!-- Confirmation -->
          <div v-if="selectedAction" class="bg-yellow-50 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <h5 class="text-sm font-medium text-yellow-800 dark:text-yellow-300">Confirm Action</h5>
                <p class="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  This will {{ selectedAction }} {{ selectedUsers.length }} selected user(s). 
                  {{ selectedAction === 'activate' ? 'They will start receiving notifications.' : 'They will stop receiving notifications.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              @click="handleBulkUpdate"
              :disabled="loading || !selectedAction"
              :class="[
                'px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                selectedAction === 'activate'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              ]"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>
                {{ selectedAction === 'activate' ? '✅ Activate Users' : '❌ Deactivate Users' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TelegramUsersAPI, type TelegramUser, type BulkUpdateData } from '@/api/TelegramUsersAPI'

// Props
const props = defineProps<{
  selectedUsers: string[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  'bulk-updated': []
}>()

// State
const loading = ref(false)
const selectedAction = ref<'activate' | 'deactivate' | ''>('')
const selectedUserDetails = ref<TelegramUser[]>([])

// Computed
const activeCount = computed(() => 
  selectedUserDetails.value.filter(user => user.isActivated).length
)

const inactiveCount = computed(() => 
  selectedUserDetails.value.filter(user => !user.isActivated).length
)

// Methods
const fetchUserDetails = async () => {
  try {
    // Fetch all users and filter by selected IDs
    const response = await TelegramUsersAPI.getAllUsers({ limit: 1000 })
    selectedUserDetails.value = response.data.data.data.filter(user => 
      props.selectedUsers.includes(user._id)
    )
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

const handleBulkUpdate = async () => {
  if (!selectedAction.value) return

  try {
    loading.value = true
    
    const updateData: BulkUpdateData = {
      userIds: props.selectedUsers,
      isActivated: selectedAction.value === 'activate'
    }

    await TelegramUsersAPI.bulkUpdate(updateData)
    emit('bulk-updated')
  } catch (error: any) {
    console.error('Error updating users:', error)
    alert(error.response?.data?.message || 'Failed to update users')
  } finally {
    loading.value = false
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Lifecycle
onMounted(() => {
  fetchUserDetails()
})
</script>
