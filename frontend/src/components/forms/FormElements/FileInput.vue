<template>
  <div class="space-y-6">
    <div v-if="showLabel">
      <label 
        :for="inputId" 
        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        :class="labelClass"
      >
        {{ label }}
        <span v-if="required" class="text-error-500">*</span>
      </label>
    </div>
    <div class="relative">
      <input
        :id="inputId"
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        :class="[
          'focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400',
          inputClass,
          {
            'border-error-300 focus:border-error-300 focus:ring-error-500/10': error,
            'border-success-300 focus:border-success-300 focus:ring-success-500/10': success,
            'border-gray-100 bg-gray-50 placeholder:text-gray-300': disabled,
          }
        ]"
        @change="handleFileChange"
        @dragover="handleDragOver"
        @drop="handleDrop"
      />
      <div v-if="showFileList && selectedFiles.length > 0" class="mt-2 space-y-1">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="flex items-center justify-between p-2 text-sm bg-gray-50 rounded-lg dark:bg-gray-800"
        >
          <span class="truncate text-gray-700 dark:text-gray-300">{{ file.name }}</span>
          <button
            type="button"
            @click="removeFile(index)"
            class="ml-2 text-gray-500 hover:text-error-500 dark:text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <p v-if="error && errorMessage" class="mt-1.5 text-theme-xs text-error-500">{{ errorMessage }}</p>
      <p v-if="success && successMessage" class="mt-1.5 text-theme-xs text-success-500">{{ successMessage }}</p>
      <p v-if="hint" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Array, File, FileList],
    default: () => [],
  },
  label: {
    type: String,
    default: 'Upload file',
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  labelClass: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: '*',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  success: {
    type: Boolean,
    default: false,
  },
  successMessage: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  showFileList: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'file-added', 'file-removed'])

const fileInput = ref(null)
const inputId = `file-input-${Math.random().toString(36).substr(2, 9)}`

const selectedFiles = computed(() => {
  if (!props.modelValue) return []
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (props.modelValue instanceof FileList) return Array.from(props.modelValue)
  if (props.modelValue instanceof File) return [props.modelValue]
  return []
})

const handleFileChange = (event) => {
  const files = event.target.files
  const fileArray = Array.from(files)
  
  if (props.multiple) {
    const newFiles = [...selectedFiles.value, ...fileArray]
    emit('update:modelValue', newFiles)
  } else {
    emit('update:modelValue', fileArray[0] || null)
  }
  
  emit('change', fileArray)
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  const files = event.dataTransfer.files
  const fileArray = Array.from(files)
  
  if (props.multiple) {
    const newFiles = [...selectedFiles.value, ...fileArray]
    emit('update:modelValue', newFiles)
  } else {
    emit('update:modelValue', fileArray[0] || null)
  }
  
  emit('change', fileArray)
}

const removeFile = (index) => {
  const newFiles = [...selectedFiles.value]
  const removedFile = newFiles.splice(index, 1)[0]
  emit('update:modelValue', newFiles)
  emit('file-removed', removedFile)
}

const clearFiles = () => {
  emit('update:modelValue', [])
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openFileDialog = () => {
  if (!props.disabled && fileInput.value) {
    fileInput.value.click()
  }
}

defineExpose({
  clearFiles,
  openFileDialog,
  selectedFiles,
})
</script>
