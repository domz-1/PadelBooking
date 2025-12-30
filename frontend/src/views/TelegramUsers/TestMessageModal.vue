<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500/50 bg-opacity-50" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800 relative z-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            📤 Send Test Message
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
          <!-- Message Content -->
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message Content *
            </label>
            <textarea
              id="message"
              v-model="form.message"
              rows="6"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your test message here..."
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supports HTML formatting: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;code&gt;code&lt;/code&gt;
            </p>
          </div>

          <!-- Recipients -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipients
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="form.sendToAll"
                  type="radio"
                  :value="true"
                  name="recipients"
                  class="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Send to all activated users
                  <span class="text-gray-500">({{ activatedUsersCount }} users)</span>
                </span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.sendToAll"
                  type="radio"
                  :value="false"
                  name="recipients"
                  class="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Send to specific users
                </span>
              </label>
            </div>
          </div>

          <!-- User Selection (when not sending to all) -->
          <div v-if="!form.sendToAll" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Users
            </label>
            <div class="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-1">
              <label
                v-for="user in activatedUsers"
                :key="user._id"
                class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  v-model="form.userIds"
                  type="checkbox"
                  :value="user._id"
                  class="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <div class="ml-3 flex items-center gap-2">
                  <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">
                      {{ getInitials(user.name) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
                    <span v-if="user.username" class="text-xs text-gray-500 dark:text-gray-400 ml-1">@{{ user.username }}</span>
                  </div>
                </div>
              </label>
            </div>
            <p v-if="form.userIds.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
              {{ form.userIds.length }} user(s) selected
            </p>
          </div>

          <!-- Message Preview -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Preview</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3 text-sm">
              <div v-if="form.message" v-html="formatPreview(form.message)" class="text-gray-900 dark:text-white"></div>
              <div v-else class="text-gray-400 italic">Your message will appear here...</div>
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
              :disabled="loading || !form.message || (!form.sendToAll && form.userIds.length === 0)"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else>📤 Send Message</span>
            </button>
          </div>
        </form>

        <!-- Results Modal -->
        <div v-if="showResults" class="fixed inset-0 z-60 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeResults"></div>
            <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-gray-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  📊 Message Results
                </h3>
                <button @click="closeResults" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <!-- Summary -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-green-50 dark:bg-green-500/20 rounded-lg p-3">
                    <div class="text-green-600 dark:text-green-400 text-sm font-medium">Successful</div>
                    <div class="text-green-900 dark:text-green-300 text-2xl font-bold">{{ results?.successCount || 0 }}</div>
                  </div>
                  <div class="bg-red-50 dark:bg-red-500/20 rounded-lg p-3">
                    <div class="text-red-600 dark:text-red-400 text-sm font-medium">Failed</div>
                    <div class="text-red-900 dark:text-red-300 text-2xl font-bold">{{ results?.failureCount || 0 }}</div>
                  </div>
                </div>

                <!-- Detailed Results -->
                <div v-if="results?.results && results.results.length > 0" class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Results</h4>
                  <div class="max-h-40 overflow-y-auto space-y-1">
                    <div
                      v-for="result in results.results"
                      :key="result.chatId"
                      class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                    >
                      <span class="font-mono text-gray-600 dark:text-gray-300">{{ result.chatId }}</span>
                      <span :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        result.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                      ]">
                        {{ result.success ? 'Success' : 'Failed' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    @click="closeResults"
                    class="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { TelegramUsersAPI, type TelegramUser, type TestMessageData } from '@/api/TelegramUsersAPI'

// Emits
const emit = defineEmits<{
  close: []
  'message-sent': []
}>()

// State
const loading = ref(false)
const showResults = ref(false)
const activatedUsers = ref<TelegramUser[]>([])
const results = ref<any>(null)

const form = reactive<TestMessageData & { userIds: string[] }>({
  message: '🧪 This is a test message from Luxan E-commerce!\n\n✅ If you received this, notifications are working correctly.',
  sendToAll: true,
  userIds: []
})

// Computed
const activatedUsersCount = computed(() => activatedUsers.value.length)

// Methods
const fetchActivatedUsers = async () => {
  try {
    const response = await TelegramUsersAPI.getActivatedUsers()
    activatedUsers.value = response.data.data
  } catch (error) {
    console.error('Error fetching activated users:', error)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    const messageData: TestMessageData = {
      message: form.message.trim()
    }

    if (form.sendToAll) {
      messageData.sendToAll = true
    } else {
      messageData.userIds = form.userIds
    }

    const response = await TelegramUsersAPI.sendTestMessage(messageData)
    results.value = response.data.data
    showResults.value = true
    
    emit('message-sent')
  } catch (error: any) {
    console.error('Error sending test message:', error)
    alert(error.response?.data?.message || 'Failed to send test message')
  } finally {
    loading.value = false
  }
}

const closeResults = () => {
  showResults.value = false
  results.value = null
  emit('close')
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatPreview = (message: string) => {
  // Simple HTML formatting for preview
  return message
    .replace(/\n/g, '<br>')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<strong>$1</strong>')
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/g, '<em>$1</em>')
    .replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/g, '<code class="bg-gray-100 dark:bg-gray-600 px-1 rounded">$1</code>')
}

// Lifecycle
onMounted(() => {
  fetchActivatedUsers()
})
</script>
