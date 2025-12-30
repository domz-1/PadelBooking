<template>
  <div class="relative z-20 bg-transparent">
    <!-- Label -->
    <label 
      v-if="showLabel" 
      :for="selectId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      :class="[labelClass, { 'text-red-600': error, 'text-green-600': success }]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Select Container -->
    <div class="relative z-20 bg-transparent">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :multiple="multiple"
        :autocomplete="autocomplete"
        class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        :class="[
          inputClass,
          {
            'text-gray-800 dark:text-white/90': modelValue,
            'cursor-not-allowed bg-gray-50 dark:bg-gray-800': disabled,
            'border-red-500 focus:border-red-500 focus:ring-red-500/10': error,
            'border-green-500 focus:border-green-500 focus:ring-green-500/10': success,
            'border-brand-300 focus:border-brand-300 focus:ring-brand-500/10': !error && !success
          }
        ]"
        @change="handleChange"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <!-- Placeholder Option -->
        <option 
          v-if="placeholder" 
          value="" 
          :disabled="!allowPlaceholderSelection"
          class="text-gray-500 dark:text-gray-400"
        >
          {{ placeholder }}
        </option>
        
        <!-- Options -->
        <option 
          v-for="option in options" 
          :key="option[valueKey]"
          :value="option[valueKey]"
          :disabled="option[disabledKey]"
          class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          <slot name="option" :option="option">
            {{ option[labelKey] }}
          </slot>
        </option>
      </select>
      
      <!-- Dropdown Arrow Icon -->
      <span
        class="absolute z-30 text-gray-700 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
      >
        <slot name="dropdown-icon">
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
        </slot>
      </span>
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

interface Option {
  [key: string]: any
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  options: {
    type: Array as () => Option[],
    required: true,
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
  selectId: {
    type: String,
    default: () => `select-${Math.random().toString(36).substr(2, 9)}`,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  allowPlaceholderSelection: {
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
  multiple: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  inputClass: {
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
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  disabledKey: {
    type: String,
    default: 'disabled',
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg',
    default: 'md',
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Methods
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let value: string | string[]
  
  if (props.multiple) {
    value = Array.from(target.selectedOptions).map(option => option.value)
  } else {
    value = target.value
  }
  
  emit('update:modelValue', value)
  emit('change', value)
}

// Computed
const selectSize = computed(() => {
  const sizeMap = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
    lg: 'h-13 text-base',
  }
  return sizeMap[props.size] || sizeMap.md
})

// Expose methods for parent access
defineExpose({
  focus: () => {
    const select = document.querySelector(`#${props.selectId}`) as HTMLSelectElement
    select?.focus()
  },
  blur: () => {
    const select = document.querySelector(`#${props.selectId}`) as HTMLSelectElement
    select?.blur()
  },
})
</script>
