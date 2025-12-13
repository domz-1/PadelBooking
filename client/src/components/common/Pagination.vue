<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
    <!-- Mobile pagination -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="goToPrevious"
        :disabled="!hasPrevPage"
        :class="[
          'relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium',
          hasPrevPage
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
        ]"
      >
        Previous
      </button>
      <button
        @click="goToNext"
        :disabled="!hasNextPage"
        :class="[
          'relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium',
          hasNextPage
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
        ]"
      >
        Next
      </button>
    </div>

    <!-- Desktop pagination -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Showing
          <span class="font-medium">{{ startItem }}</span>
          to
          <span class="font-medium">{{ endItem }}</span>
          of
          <span class="font-medium">{{ totalDocuments }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Previous button -->
          <button
            @click="goToPrevious"
            :disabled="!hasPrevPage"
            :class="[
              'relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600',
              hasPrevPage
                ? 'hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                : 'cursor-not-allowed opacity-50'
            ]"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
          </button>

          <!-- Page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                page === currentPage
                  ? 'z-10 bg-brand-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                  : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
              ]"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0"
            >
              ...
            </span>
          </template>

          <!-- Next button -->
          <button
            @click="goToNext"
            :disabled="!hasNextPage"
            :class="[
              'relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600',
              hasNextPage
                ? 'hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                : 'cursor-not-allowed opacity-50'
            ]"
          >
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalDocuments: {
    type: Number,
    required: true
  },
  limit: {
    type: Number,
    default: 10
  },
  hasNextPage: {
    type: Boolean,
    default: false
  },
  hasPrevPage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['page-change'])

const startItem = computed(() => {
  return (props.currentPage - 1) * props.limit + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.limit, props.totalDocuments)
})

const visiblePages = computed(() => {
  const pages = []
  const totalPages = props.totalPages
  const currentPage = props.currentPage

  if (totalPages <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (currentPage <= 4) {
      // Show pages 2, 3, 4, 5, ..., last
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Show 1, ..., last-4, last-3, last-2, last-1, last
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show 1, ..., current-1, current, current+1, ..., last
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }

  return pages
})

const goToPage = (page) => {
  if (page !== props.currentPage && page !== '...') {
    emit('page-change', page)
  }
}

const goToPrevious = () => {
  if (props.hasPrevPage) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNext = () => {
  if (props.hasNextPage) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>
