<template>
  <div class="flex items-center space-x-3">
    <!-- Label before switch -->
    <label 
      v-if="showLabel && labelPosition === 'left'" 
      :for="switchId"
      class="text-sm font-medium text-gray-700 dark:text-gray-400"
      :class="[labelClass, { 'text-red-600': error, 'text-green-600': success }]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Toggle Switch -->
    <button
      :id="switchId"
      type="button"
      role="switch"
      :aria-checked="checked"
      :aria-label="label"
      :disabled="disabled"
      :class="[
        switchClass,
        {
          'cursor-not-allowed opacity-50': disabled,
          'cursor-pointer': !disabled,
          'bg-green-600': checked,
          'bg-gray-200 dark:bg-gray-700': !checked,
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-500': !disabled,
          'ring-2 ring-red-500 ring-offset-2': error,
          'ring-2 ring-green-500 ring-offset-2': success && !error,
        }
      ]"
      class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden"
      @click="toggle"
      @keydown.space.prevent="toggle"
      @keydown.enter.prevent="toggle"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          {
            'translate-x-5': checked,
            'translate-x-0': !checked,
          }
        ]"
      />
    </button>
    
    <!-- Label after switch -->
    <label 
      v-if="showLabel && labelPosition === 'right'" 
      :for="switchId"
      class="text-sm font-medium text-gray-700 dark:text-gray-400"
      :class="[labelClass, { 'text-red-600': error, 'text-green-600': success }]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Helper Text -->
    <div v-if="error || success || hint" class="text-xs">
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
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  labelPosition: {
    type: String as () => 'left' | 'right',
    default: 'right',
  },
  labelClass: {
    type: String,
    default: '',
  },
  switchId: {
    type: String,
    default: () => `switch-${Math.random().toString(36).substr(2, 9)}`,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg',
    default: 'md',
  },
  switchClass: {
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
  trueValue: {
    type: [String, Number, Boolean],
    default: true,
  },
  falseValue: {
    type: [String, Number, Boolean],
    default: false,
  },
  trueLabel: {
    type: String,
    default: '',
  },
  falseLabel: {
    type: String,
    default: '',
  },
  showLabels: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'toggle'])

// Computed
const checked = computed(() => {
  return props.modelValue === props.trueValue
})

const displayLabel = computed(() => {
  if (checked.value && props.trueLabel) {
    return props.trueLabel
  } else if (!checked.value && props.falseLabel) {
    return props.falseLabel
  }
  return props.label
})

const switchSize = computed(() => {
  const sizeMap = {
    sm: { width: 'w-9', height: 'h-5', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { width: 'w-11', height: 'h-6', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { width: 'w-14', height: 'h-7', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  }
  return sizeMap[props.size] || sizeMap.md
})

// Methods
const toggle = () => {
  if (props.disabled) return
  
  const newValue = checked.value ? props.falseValue : props.trueValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
  emit('toggle', newValue)
}

// Expose methods for parent access
defineExpose({
  toggle,
  checked,
})
</script>