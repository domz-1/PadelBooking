<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500/50 bg-opacity-50" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800 relative z-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Add Telegram User
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
          <!-- Username (Primary Field) -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username *
            </label>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-2 text-gray-400">@</span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                @input="updateNameFromUsername"
                class="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="username"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Telegram username (without @)
            </p>
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
              Telegram chat ID (numeric) - Required for sending messages
            </p>
          </div>

          <!-- Display Name (Auto-generated) -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Auto-generated from username"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Auto-filled from username, you can customize it
            </p>
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
              :disabled="loading || !form.username || !form.chatId"
              class="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TelegramUsersAPI, type TelegramUserCreateData } from '@/api/TelegramUsersAPI'

// Emits
const emit = defineEmits<{
  close: []
  'user-added': []
}>()

// State
const loading = ref(false)
const form = reactive<TelegramUserCreateData>({
  name: '',
  chatId: '',
  isActivated: true,
  username: '', // Primary field - required
  firstName: '',
  lastName: '',
  languageCode: 'en',
  notes: ''
})

// Methods
const updateNameFromUsername = () => {
  if (form.username && !form.name) {
    // Auto-generate display name from username
    form.name = form.username.charAt(0).toUpperCase() + form.username.slice(1)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Ensure name is set (auto-generate from username if empty)
    if (!form.name.trim() && form.username?.trim()) {
      form.name = form.username.charAt(0).toUpperCase() + form.username.slice(1)
    }
    
    // Clean up form data
    const formData: TelegramUserCreateData = {
      name: form.name.trim() || form.username?.trim() || 'Unknown User',
      chatId: form.chatId.trim(),
      isActivated: form.isActivated,
      languageCode: 'en' // Always default to English
    }

    // Add optional fields if they have values
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

    await TelegramUsersAPI.createUser(formData)
    emit('user-added')
  } catch (error: any) {
    console.error('Error creating user:', error)
    alert(error.response?.data?.message || 'Failed to create user')
  } finally {
    loading.value = false
  }
}
</script>
