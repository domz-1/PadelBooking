<template>
  <div class="fixed inset-0 z-999999 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500/50 bg-opacity-50" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800 relative z-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            👤 User Details
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

        <div class="space-y-6">
          <!-- User Header -->
          <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-xl font-bold text-white">
                {{ getInitials(user.name) }}
              </span>
            </div>
            <div class="flex-1">
              <h4 class="text-xl font-semibold text-gray-900 dark:text-white">{{ user.name }}</h4>
              <p v-if="user.username" class="text-gray-600 dark:text-gray-400">@{{ user.username }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.isActivated
                    ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                ]">
                  <span :class="[
                    'w-1.5 h-1.5 rounded-full mr-1.5',
                    user.isActivated ? 'bg-green-400' : 'bg-red-400'
                  ]"></span>
                  {{ user.isActivated ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <button
              @click="$emit('edit-user', user)"
              class="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              ✏️ Edit
            </button>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h5 class="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h5>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Chat ID</label>
                  <div class="mt-1 flex items-center gap-2">
                    <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                      {{ user.chatId }}
                    </code>
                    <button
                      @click="copyToClipboard(user.chatId)"
                      class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy to clipboard"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="user.firstName || user.lastName">
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided' }}
                  </p>
                </div>

                <div v-if="user.languageCode">
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Language</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ getLanguageName(user.languageCode) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="text-lg font-medium text-gray-900 dark:text-white">Activity Statistics</h5>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 dark:bg-blue-500/20 rounded-lg p-3">
                  <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">Messages Sent</div>
                  <div class="text-blue-900 dark:text-blue-300 text-2xl font-bold">{{ user.messageCount || 0 }}</div>
                </div>
                
                <div class="bg-purple-50 dark:bg-purple-500/20 rounded-lg p-3">
                  <div class="text-purple-600 dark:text-purple-400 text-sm font-medium">Days Active</div>
                  <div class="text-purple-900 dark:text-purple-300 text-2xl font-bold">{{ getDaysActive() }}</div>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Message</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ user.lastMessageAt ? formatDate(user.lastMessageAt) : 'Never' }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(user.createdAt) }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(user.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="user.notes" class="space-y-3">
            <h5 class="text-lg font-medium text-gray-900 dark:text-white">Notes</h5>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ user.notes }}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="space-y-3">
            <h5 class="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h5>
            <div class="flex flex-wrap gap-3">
              <button
                @click="toggleActivation"
                :disabled="loading"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                  user.isActivated
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'
                    : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30'
                ]"
              >
                {{ user.isActivated ? '❌ Deactivate' : '✅ Activate' }}
              </button>

              <button
                @click="sendTestMessage"
                :disabled="loading || !user.isActivated"
                class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30 rounded-md shadow-sm"
              >
                📤 Send Test Message
              </button>

              <button
                @click="$emit('edit-user', user)"
                class="px-4 py-2 text-sm font-medium text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/30 rounded-md shadow-sm"
              >
                ✏️ Edit User
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TelegramUsersAPI, type TelegramUser } from '@/api/TelegramUsersAPI'

// Props
const props = defineProps<{
  user: TelegramUser
}>()

// Emits
const emit = defineEmits<{
  close: []
  'edit-user': [user: TelegramUser]
}>()

// State
const loading = ref(false)

// Methods
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getLanguageName = (code: string) => {
  const languages: Record<string, string> = {
    'en': 'English',
    'ar': 'Arabic',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian'
  }
  return languages[code] || code.toUpperCase()
}

const getDaysActive = () => {
  const createdDate = new Date(props.user.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const toggleActivation = async () => {
  try {
    loading.value = true
    await TelegramUsersAPI.toggleActivation(props.user._id)
    props.user.isActivated = !props.user.isActivated
  } catch (error: any) {
    console.error('Error toggling activation:', error)
    alert(error.response?.data?.message || 'Failed to toggle activation')
  } finally {
    loading.value = false
  }
}

const sendTestMessage = async () => {
  try {
    loading.value = true
    await TelegramUsersAPI.sendTestMessage({
      message: '🧪 This is a test message from Luxan E-commerce!\n\n✅ If you received this, notifications are working correctly.',
      userIds: [props.user._id]
    })
    alert('Test message sent successfully!')
  } catch (error: any) {
    console.error('Error sending test message:', error)
    alert(error.response?.data?.message || 'Failed to send test message')
  } finally {
    loading.value = false
  }
}
</script>
