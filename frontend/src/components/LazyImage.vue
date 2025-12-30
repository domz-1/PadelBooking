<template>
  <div class="lazy-image-container" :style="{ width: width, height: height }">
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      @error="handleError"
      @load="handleLoad"
    />
    <div v-else-if="loading" class="lazy-image-loading" :class="loadingClass">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
    </div>
    <div v-else-if="error" class="lazy-image-error" :class="errorClass">
      <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-xs text-gray-500 mt-2">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import api from '@/api/api'

interface Props {
  imageId?: string | null
  alt?: string
  width?: string
  height?: string
  imageClass?: string
  loadingClass?: string
  errorClass?: string
  placeholder?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Image',
  width: '100%',
  height: 'auto',
  imageClass: 'w-full h-full object-cover',
  loadingClass: 'flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800',
  errorClass: 'flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800',
  placeholder: '',
  errorMessage: 'Failed to load image'
})

const imageSrc = ref<string>('')
const loading = ref(false)
const error = ref(false)

const loadImage = async () => {
  if (!props.imageId) {
    if (props.placeholder) {
      imageSrc.value = props.placeholder
    }
    return
  }

  loading.value = true
  error.value = false

  try {
    // Fetch image from API
    const response = await api.get(`/images/image/${props.imageId}`, {
      responseType: 'blob'
    })
    
    // Create object URL from blob
    const blob = response.data
    imageSrc.value = URL.createObjectURL(blob)
  } catch (e) {
    console.error('Failed to load image:', e)
    error.value = true
    if (props.placeholder) {
      imageSrc.value = props.placeholder
    }
  } finally {
    loading.value = false
  }
}

const handleError = () => {
  error.value = true
  if (props.placeholder) {
    imageSrc.value = props.placeholder
  }
}

const handleLoad = () => {
  loading.value = false
  error.value = false
}

// Watch for imageId changes
watch(() => props.imageId, () => {
  // Revoke old object URL to prevent memory leaks
  if (imageSrc.value && imageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageSrc.value)
  }
  loadImage()
}, { immediate: true })

onMounted(() => {
  loadImage()
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}
</style>
