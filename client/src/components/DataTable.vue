<template>
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
                <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                        <th v-for="(column, index) in columns" :key="index" class="px-5 py-3 text-left sm:px-6"
                            :class="column.widthClass || 'w-auto'">
                            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                {{ column.title }}
                            </p>
                        </th>
                        <!-- Action column header if actions are enabled -->
                        <th v-if="showActions" class="px-5 py-3 text-left sm:px-6 w-24">
                            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                                Actions
                            </p>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(item, index) in data" :key="index"
                        class="border-t border-gray-100 dark:border-gray-800">
                        <td v-for="(column, colIndex) in columns" :key="colIndex" class="px-5 py-4 sm:px-6">
                            <!-- Custom slot for column content -->
                            <slot v-if="$slots[`column-${column.key}`]" :name="`column-${column.key}`" :item="item"
                                :index="index" />

                            <!-- Default rendering based on column type -->
                            <template v-else>
                                <!-- User column with avatar -->
                                <div v-if="column.type === 'user'" class="flex items-center gap-3">
                                    <div class="w-10 h-10 overflow-hidden rounded-full">
                                        <img :src="item[column.key].avatar" :alt="item[column.key].name" />
                                    </div>
                                    <div>
                                        <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {{ item[column.key].name }}
                                        </span>
                                        <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {{ item[column.key].role }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Image column with avatar -->
                                <div v-else-if="column.type === 'img'" class="w-10 h-10 overflow-hidden rounded-full">
                                    <img :src="getValue(item, column.key) || '/placeholder-product.png'"
                                        alt="Product image" />
                                </div>

                                <!-- Team column with avatars -->
                                <div v-else-if="column.type === 'team'" class="flex -space-x-2">
                                    <div v-for="(member, memberIndex) in item[column.key]" :key="memberIndex"
                                        class="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900">
                                        <img :src="member" alt="team member" />
                                    </div>
                                </div>

                                <!-- Status column with badges -->
                                <span v-else-if="column.type === 'status'" :class="[
                                    'rounded-full px-2 py-0.5 text-theme-xs font-medium',
                                    getBadgeClass(item[column.key], column.badgeType)
                                ]">
                                    {{ item[column.key] }}
                                </span>

                                <!-- Default text column -->
                                <p v-else class="text-gray-500 text-theme-sm dark:text-gray-400">
                                    {{ item[column.key] }}
                                </p>
                            </template>
                        </td>

                        <!-- Action column with icons -->
                        <td v-if="showActions" class="px-5 py-4 sm:px-6">
                            <div class="flex items-center space-x-3">
                                <!-- View action -->
                                <button v-if="onView" @click="onView(item)"
                                    class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25 flex items-center justify-center"
                                    title="View">
                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        width="24" height="24" color="currentColor" fill="none">
                                        <path
                                            d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
                                            stroke="currentColor" stroke-width="1.5"></path>
                                        <path
                                            d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
                                            stroke="currentColor" stroke-width="1.5"></path>
                                    </svg>
                                </button>

                                <!-- Edit action -->
                                <button v-if="onEdit" @click="onEdit(item)"
                                    class="w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 hover:bg-yellow-100 dark:bg-yellow-500/15 dark:text-yellow-400 dark:hover:bg-yellow-500/25 flex items-center justify-center"
                                    title="Edit">
                                    <svg class="w-4 h-4 " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        width="24" height="24" color="currentColor" fill="none">
                                        <path
                                            d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>

                                <!-- Delete action -->
                                <button v-if="onDelete" @click="showDeleteConfirm(item)"
                                    class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25 flex items-center justify-center"
                                    title="Delete">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
        <div class="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <div class="text-center">
                <ErrorIcon class="w-12 h-12 mx-auto text-red-500" />
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this item? This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center mt-6 space-x-4">
                <button @click="cancelDelete"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Cancel
                </button>
                <button @click="confirmDelete"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { InfoCircleIcon, SettingsIcon, TrashIcon, ErrorIcon } from '../icons'
// Utility to get nested values like "imgCover.base64"
const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

// Define props
export interface Column {
  key: string
  title: string
  type?: 'user' | 'team' | 'status' | 'text' | 'img' | 'custom'
  badgeType?: string
  widthClass?: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  badgeStyles?: Record<string, string>
  showActions?: boolean
  onView?: (item: Record<string, any>) => void
  onEdit?: (item: Record<string, any>) => void
  onDelete?: (item: Record<string, any>) => void
}

const props = withDefaults(defineProps<Props>(), {
  badgeStyles: () => ({}),
  showActions: true
})

// Delete modal state
const deleteModalVisible = ref(false)
const itemToDelete = ref<Record<string, any> | null>(null)

// Default badge styles
const defaultBadgeStyles: Record<string, string> = {
  primary: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
  error: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
  warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  info: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-500',
  light: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  dark: 'bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100'
}

// Merge default and custom badge styles
const badgeStylesMap = computed(() => ({
  ...defaultBadgeStyles,
  ...props.badgeStyles
}))

// Get badge class based on status value and badge type
const getBadgeClass = (status: string, badgeType: string = 'default'): string => {
  // If badgeType is provided, use it directly
  if (badgeType && badgeStylesMap.value[badgeType]) {
    return badgeStylesMap.value[badgeType]
  }

  // Otherwise, map status to badge style
  const statusMap: Record<string, string> = {
    'Active': 'success',
    'Pending': 'warning',
    'Cancel': 'error',
    'Completed': 'primary',
    'In Progress': 'info',
    'On Hold': 'light',
    'Draft': 'dark'
  }

  const styleKey = statusMap[status] || 'primary'
  return badgeStylesMap.value[styleKey] || badgeStylesMap.value.primary
}

// Delete confirmation functions
const showDeleteConfirm = (item: Record<string, any>) => {
  itemToDelete.value = item
  deleteModalVisible.value = true
}

const cancelDelete = () => {
  deleteModalVisible.value = false
  itemToDelete.value = null
}

const confirmDelete = () => {
  if (itemToDelete.value && props.onDelete) {
    props.onDelete(itemToDelete.value)
  }
  deleteModalVisible.value = false
  itemToDelete.value = null
}
</script>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #6b7280;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>