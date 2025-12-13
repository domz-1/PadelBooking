<template>
  <div v-if="!field.hidden" :class="field.fieldClass">
    <!-- Label -->
    <label 
      v-if="field.label && showLabel" 
      :for="fieldId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      :class="[
        field.labelClass,
        { 
          'text-red-600': field.error || hasError, 
          'text-green-600': field.success,
          'cursor-not-allowed': field.disabled 
        }
      ]"
    >
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>

    <!-- Text Input -->
    <input
      v-if="isTextInput"
      :id="fieldId"
      :type="field.type"
      :value="formData[field.key]"
      @input="handleInput"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :readonly="field.readonly"
      :required="field.required"
      :min="field.min"
      :max="field.max"
      :step="field.step"
      :minlength="field.validation?.minLength || field.minlength"
      :maxlength="field.validation?.maxLength || field.maxlength"
      :autocomplete="field.autocomplete || 'off'"
      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      :class="[
        field.inputClass,
        {
          'cursor-not-allowed bg-gray-50 dark:bg-gray-800': field.disabled,
          'border-red-500 focus:border-red-500 focus:ring-red-500/10': field.error || hasError,
          'border-green-500 focus:border-green-500 focus:ring-green-500/10': field.success,
          'border-brand-300 focus:border-brand-300 focus:ring-brand-500/10': !field.error && !hasError && !field.success
        }
      ]"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      :value="formData[field.key]"
      @input="handleInput"
      :placeholder="field.placeholder"
      :rows="field.rows || 4"
      :cols="field.cols"
      :disabled="field.disabled"
      :readonly="field.readonly"
      :required="field.required"
      :maxlength="field.validation?.maxLength || field.maxlength"
      :minlength="field.validation?.minLength || field.minlength"
      :autocomplete="field.autocomplete || 'off'"
      class="dark:bg-dark-900 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      :class="[
        field.inputClass,
        {
          'cursor-not-allowed bg-gray-50 dark:bg-gray-800': field.disabled,
          'border-red-500 focus:border-red-500 focus:ring-red-500/10': field.error || hasError,
          'border-green-500 focus:border-green-500 focus:ring-green-500/10': field.success,
          'border-brand-300 focus:border-brand-300 focus:ring-brand-500/10': !field.error && !hasError && !field.success,
          'resize-none': field.resizable === false,
          'resize-vertical': field.resizable !== false && field.resizeDirection === 'vertical',
          'resize-horizontal': field.resizable !== false && field.resizeDirection === 'horizontal',
          'resize': field.resizable !== false && field.resizeDirection === 'both'
        }
      ]"
    />

    <!-- Select -->
    <div v-else-if="field.type === 'select'" class="relative z-20 bg-transparent">
      <select
        :id="fieldId"
        :value="formData[field.key]"
        @change="handleChange"
        :disabled="field.disabled"
        :required="field.required"
        :multiple="field.multiple"
        :autocomplete="field.autocomplete || 'off'"
        class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        :class="[
          field.inputClass,
          {
            'text-gray-800 dark:text-white/90': formData[field.key],
            'cursor-not-allowed bg-gray-50 dark:bg-gray-800': field.disabled,
            'border-red-500 focus:border-red-500 focus:ring-red-500/10': field.error || hasError,
            'border-green-500 focus:border-green-500 focus:ring-green-500/10': field.success,
            'border-brand-300 focus:border-brand-300 focus:ring-brand-500/10': !field.error && !hasError && !field.success
          }
        ]"
      >
        <option 
          v-if="field.placeholder" 
          value="" 
          disabled
          class="text-gray-500 dark:text-gray-400"
        >
          {{ field.placeholder }}
        </option>
        <option 
          v-for="option in field.options" 
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {{ option.label }}
        </option>
      </select>
      <span
        class="absolute z-30 text-gray-700 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
      >
        <svg
          class="stroke-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
            stroke=""
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <!-- Checkbox -->
    <div v-else-if="field.type === 'checkbox'" class="flex items-center">
      <input
        :id="fieldId"
        type="checkbox"
        :checked="formData[field.key]"
        @change="handleCheckboxChange"
        :disabled="field.disabled"
        :required="field.required"
        class="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label 
        v-if="field.label" 
        :for="fieldId"
        class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400"
      >
        {{ field.label }}
      </label>
    </div>

    <!-- Switch/Toggle -->
    <div v-else-if="field.type === 'switch'" class="flex items-center">
      <label :for="fieldId" class="relative inline-flex items-center cursor-pointer">
        <input
          :id="fieldId"
          type="checkbox"
          :checked="formData[field.key]"
          @change="handleCheckboxChange"
          :disabled="field.disabled"
          :required="field.required"
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
        <span v-if="field.label" class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-400">
          {{ field.label }}
        </span>
      </label>
    </div>

    <!-- Radio Buttons -->
    <div v-else-if="field.type === 'radio' && field.options" class="space-y-2">
      <div v-for="option in field.options" :key="option.value" class="flex items-center">
        <input
          :id="`${fieldId}-${option.value}`"
          type="radio"
          :name="field.key"
          :value="option.value"
          :checked="formData[field.key] === option.value"
          @change="handleRadioChange"
          :disabled="field.disabled || option.disabled"
          :required="field.required"
          class="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label 
          :for="`${fieldId}-${option.value}`"
          class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          {{ option.label }}
        </label>
      </div>
    </div>

    <!-- File Input -->
    <!-- File Input -->
    <div v-else-if="field.type === 'file'" class="relative">
      <label
        :for="fieldId"
        class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-brand-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-brand-600 transition-all duration-200"
        :class="[
          field.inputClass,
          {
            'cursor-not-allowed opacity-60': field.disabled,
            'border-red-400 dark:border-red-500': field.error || hasError,
            'border-green-400 dark:border-green-500': field.success,
            'border-brand-300 dark:border-brand-600': !field.error && !hasError && !field.success
          }
        ]"
      >
        <svg
          class="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 11v6m0 0l-3-3m3 3l3-3"
          />
        </svg>
        <span class="truncate">
          {{
            formData[field.key]
              ? Array.isArray(formData[field.key])
                ? `${formData[field.key].length} file(s) selected`
                : formData[field.key].name
              : field.placeholder || 'Choose file(s)...'
          }}
        </span>
      </label>
      <input
        :id="fieldId"
        type="file"
        @change="handleFileChange"
        :accept="field.accept"
        :multiple="field.multiple"
        :capture="field.capture"
        :disabled="field.disabled"
        :required="field.required"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :key="fileInputKey"
      />
      <!-- Clear button for single file selection -->
      <button
        v-if="!field.multiple && formData[field.key]"
        type="button"
        @click="clearSingleFile"
        class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
        title="Clear selected file"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <!-- Clear button for multiple file selection -->
      <button
        v-if="field.multiple && formData[field.key] && Array.isArray(formData[field.key]) && formData[field.key].length > 0"
        type="button"
        @click="clearFiles"
        class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
        title="Clear selected files"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <!-- Color Input -->
    <div v-else-if="field.type === 'color'" class="relative">
      <input
        :id="fieldId"
        type="color"
        :value="formData[field.key]"
        @input="handleInput"
        :disabled="field.disabled"
        :required="field.required"
        class="w-16 h-11 rounded-lg border border-gray-300 bg-transparent cursor-pointer dark:border-gray-700"
        :class="field.inputClass"
      />
    </div>

    <!-- Range Input -->
    <div v-else-if="field.type === 'range'" class="relative">
      <input
        :id="fieldId"
        type="range"
        :value="formData[field.key]"
        @input="handleInput"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        :disabled="field.disabled"
        :required="field.required"
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        :class="field.inputClass"
      />
      <div v-if="field.showValue" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {{ formData[field.key] }}
      </div>
    </div>

    <!-- Helper Text -->
    <div v-if="field.error || field.success || field.hint || hasError || showCharCount" class="mt-1.5 text-xs">
      <p v-if="field.error || hasError" class="text-red-600">{{ field.errorMessage || hasError }}</p>
      <p v-else-if="field.success" class="text-green-600">{{ field.successMessage }}</p>
      <p v-else-if="field.hint" class="text-gray-500">{{ field.hint }}</p>
      <p v-else-if="showCharCount" class="text-gray-500">
        {{ charCount }}/{{ field.validation?.maxLength || field.maxlength || '∞' }} characters
        <span v-if="field.validation?.minLength && charCount < field.validation.minLength" class="text-red-500">(minimum {{ field.validation.minLength }})</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Force-re-render key for the file input
const fileInputKey = ref(0)
import type { FormFieldConfig } from './Form.vue'

interface Props {
  field: FormFieldConfig
  formData: Record<string, any>
  showLabel?: boolean
  fieldError?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const emit = defineEmits<{
  update: [key: string, value: any]
}>()

// Generate unique field ID
const fieldId = computed(() => `field-${props.field.key}`)

// Check if field has validation error
const hasError = computed(() => {
  return props.fieldError || null
})

// Check if field is a text input type
const isTextInput = computed(() => {
  const textTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime']
  return textTypes.includes(props.field.type)
})

// Check if we should show character count
const showCharCount = computed(() => {
  return (props.field.type === 'text' || props.field.type === 'textarea') && 
         (props.field.validation?.maxLength || props.field.validation?.minLength || props.field.maxlength || props.field.minlength)
})

// Calculate character count
const charCount = computed(() => {
  const value = props.formData[props.field.key]
  return value && typeof value === 'string' ? value.length : 0
})

// Handle text input changes
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let value: any = target.value
  
  // Convert to number if field type is number
  if (props.field.type === 'number') {
    value = target.value === '' ? null : Number(target.value)
  }
  
  emit('update', props.field.key, value)
}

// Handle select changes
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let value: any = target.value
  
  // Handle multiple select
  if (props.field.multiple) {
    value = Array.from(target.selectedOptions).map(option => option.value)
  }
  
  emit('update', props.field.key, value)
}

// Handle checkbox changes
const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', props.field.key, target.checked)
}

// Handle radio changes
const handleRadioChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', props.field.key, target.value)
}

// Handle file changes
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (props.field.multiple) {
    // For multiple files, append new files to existing ones
    const existingFiles = props.formData[props.field.key] || []
    const newFiles = files ? Array.from(files) : []
    const allFiles = [...existingFiles, ...newFiles]
    emit('update', props.field.key, allFiles)
  } else {
    emit('update', props.field.key, files && files.length > 0 ? files[0] : null)
  }
}

// Clear selected files
const clearFiles = () => {
  emit('update', props.field.key, [])
  // Reset file input to allow selecting the same files again
  fileInputKey.value++
}

// Clear single file
const clearSingleFile = () => {
  emit('update', props.field.key, null)
  // Reset file input to allow selecting the same file again
  fileInputKey.value++
}
</script>