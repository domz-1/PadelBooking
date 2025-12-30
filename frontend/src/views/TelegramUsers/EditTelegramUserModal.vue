<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500/50 bg-opacity-50" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800 relative z-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Edit Telegram User
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

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter user's display name"
            />
          </div>

          <!-- Chat ID -->
          <div>
            <label for="chatId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chat ID *
            </label>
            <input
              id="chatId"
              v-model="form.chatId"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              placeholder="123456789"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Telegram chat ID (numeric)
            </p>
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-2 text-gray-400">@</span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="username"
              />
            </div>
          </div>

          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="First name"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Last name"
            />
          </div>

          <!-- Activation Status -->
          <div class="flex items-center">
            <input
              id="isActivated"
              v-model="form.isActivated"
              type="checkbox"
              class="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label for="isActivated" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Activate user for notifications
            </label>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Optional notes about this user..."
            ></textarea>
          </div>

          <!-- User Stats -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">User Statistics</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Messages Sent:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ user.messageCount || 0 }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Last Message:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">
                  {{ user.lastMessageAt ? formatDate(user.lastMessageAt) : 'Never' }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Created:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ formatDate(user.createdAt) }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Updated:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ formatDate(user.updatedAt) }}</span>
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
              type="submit"
              :disabled="loading || !form.name || !form.chatId"
              class="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TelegramUsersAPI, type TelegramUser, type TelegramUserUpdateData } from '@/api/TelegramUsersAPI'

// Props
const props = defineProps<{
  user: TelegramUser
}>()

// Emits
const emit = defineEmits<{
  close: []
  'user-updated': []
}>()

// State
const loading = ref(false)
const form = reactive<TelegramUserUpdateData>({
  name: '',
  chatId: '',
  isActivated: true,
  username: '',
  firstName: '',
  lastName: '',
  languageCode: 'en',
  notes: ''
})

// Methods
const initializeForm = () => {
  // Explicitly set only the allowed form fields (no ID fields)
  form.name = props.user.name
  form.chatId = props.user.chatId
  form.isActivated = props.user.isActivated
  form.username = props.user.username || ''
  form.firstName = props.user.firstName || ''
  form.lastName = props.user.lastName || ''
  form.languageCode = props.user.languageCode || 'en'
  form.notes = props.user.notes || ''
  
  console.log('📋 Form initialized with user data (no ID):', {
    name: form.name,
    chatId: form.chatId,
    isActivated: form.isActivated,
    username: form.username
  })
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Clean up form data - explicitly exclude ID and other system fields
    const formData: TelegramUserUpdateData = {}

    // Only include allowed fields
    if (form.name?.trim()) {
      formData.name = form.name.trim()
    }
    if (form.chatId?.trim()) {
      formData.chatId = form.chatId.trim()
    }
    if (typeof form.isActivated === 'boolean') {
      formData.isActivated = form.isActivated
    }
    if (form.username?.trim()) {
      formData.username = form.username.trim()
    }
    if (form.firstName?.trim()) {
      formData.firstName = form.firstName.trim()
    }
    if (form.lastName?.trim()) {
      formData.lastName = form.lastName.trim()
    }
    if (form.notes?.trim()) {
      formData.notes = form.notes.trim()
    }

    // Final safety check - create completely clean object with only allowed fields
    const cleanFormData: TelegramUserUpdateData = {}
    
    // Only copy explicitly allowed fields
    if (formData.name) cleanFormData.name = formData.name
    if (formData.chatId) cleanFormData.chatId = formData.chatId
    if (typeof formData.isActivated === 'boolean') cleanFormData.isActivated = formData.isActivated
    if (formData.username) cleanFormData.username = formData.username
    if (formData.firstName) cleanFormData.firstName = formData.firstName
    if (formData.lastName) cleanFormData.lastName = formData.lastName
    if (formData.notes) cleanFormData.notes = formData.notes
    
    console.log('📝 Clean form data being sent:', cleanFormData)
    console.log('📝 Original form data keys:', Object.keys(formData))

    await TelegramUsersAPI.updateUser(props.user._id, cleanFormData)
    emit('user-updated')
  } catch (error: any) {
    console.error('Error updating user:', error)
    alert(error.response?.data?.message || 'Failed to update user')
  } finally {
    loading.value = false
  }
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

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>
