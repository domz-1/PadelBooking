<template>
  <div class="relative">
    <!-- Label -->
    <label 
      v-if="showLabel" 
      :for="textareaId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      :class="[labelClass, { 'text-red-600': error, 'text-green-600': success }]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Textarea -->
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :cols="cols"
      :disabled="disabled"
      :required="required"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :spellcheck="spellcheck"
      :wrap="wrap"
      class="dark:bg-dark-900 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      :class="[
        textareaClass,
        {
          'cursor-not-allowed bg-gray-50 dark:bg-gray-800': disabled,
          'border-red-500 focus:border-red-500 focus:ring-red-500/10': error,
          'border-green-500 focus:border-green-500 focus:ring-green-500/10': success,
          'border-brand-300 focus:border-brand-300 focus:ring-brand-500/10': !error && !success,
          'resize-none': !resizable,
          'resize-vertical': resizable && resizeDirection === 'vertical',
          'resize-horizontal': resizable && resizeDirection === 'horizontal',
          'resize': resizable && resizeDirection === 'both'
        }
      ]"
      @input="handleInput"
      @change="handleChange"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @keydown="$emit('keydown', $event)"
      @keyup="$emit('keyup', $event)"
    ></textarea>
    
    <!-- Character Counter -->
    <div v-if="showCharCounter && maxlength" class="mt-1 text-xs text-gray-500">
      {{ modelValue?.toString().length || 0 }} / {{ maxlength }}
    </div>
    
    <!-- Helper Text -->
    <div v-if="error || success || hint" class="mt-1.5 text-xs">
      <p v-if="error" class="text-red-600">{{ errorMessage }}</p>
      <p v-else-if="success" class="text-green-600">{{ successMessage }}</p>
      <p v-else-if="hint" class="text-gray-500">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  labelClass: {
    type: String,
    default: '',
  },
  textareaId: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substr(2, 9)}`,
  },
  placeholder: {
    type: String,
    default: 'Enter your message...',
  },
  rows: {
    type: Number,
    default: 4,
  },
  cols: {
    type: Number,
    default: 50,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: null,
  },
  minlength: {
    type: Number,
    default: null,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  spellcheck: {
    type: Boolean,
    default: true,
  },
  wrap: {
    type: String as () => 'soft' | 'hard' | 'off',
    default: 'soft',
  },
  resizable: {
    type: Boolean,
    default: true,
  },
  resizeDirection: {
    type: String as () => 'vertical' | 'horizontal' | 'both',
    default: 'vertical',
  },
  textareaClass: {
    type: String,
    default: '',
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
  showCharCounter: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur', 'keydown', 'keyup'])

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  if (props.maxlength && value.length > props.maxlength) {
    return // Prevent input beyond maxlength
  }
  
  emit('update:modelValue', value)
  emit('input', value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  emit('change', value)
}

// Computed
const charCount = computed(() => {
  return props.modelValue?.length || 0
})

// Expose methods for parent access
defineExpose({
  focus: () => {
    const textarea = document.querySelector(`#${props.textareaId}`) as HTMLTextAreaElement
    textarea?.focus()
  },
  blur: () => {
    const textarea = document.querySelector(`#${props.textareaId}`) as HTMLTextAreaElement
    textarea?.blur()
  },
  select: () => {
    const textarea = document.querySelector(`#${props.textareaId}`) as HTMLTextAreaElement
    textarea?.select()
  },
  textareaRef: () => {
    return document.querySelector(`#${props.textareaId}`) as HTMLTextAreaElement
  },
})
</script>
