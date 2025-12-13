<template>
  <div class="space-y-6">
    <!-- Input State Component -->
    <div>
      <label 
        v-if="showLabel" 
        :for="inputId"
        class="mb-1.5 block text-sm font-medium"
        :class="[
          disabled ? 'text-gray-300 dark:text-white/15' : 'text-gray-700 dark:text-gray-400',
          labelClass
        ]"
      >
        {{ label }}
        <span v-if="required" class="text-error-500">*</span>
      </label>
      <div class="relative">
        <input
          :id="inputId"
          ref="inputRef"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :class="[
            'w-full rounded-lg border bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
            inputClass,
            getStateClasses()
          ]"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleChange"
        />
        
        <!-- State Icon -->
        <div v-if="showStateIcon" class="absolute right-3.5 top-1/2 -translate-y-1/2">
          <slot name="state-icon" :state="state">
            <component 
              :is="getStateIcon()" 
              class="w-4 h-4"
              :class="getStateIconColor()"
            />
          </slot>
        </div>
      </div>
      
      <!-- Helper Text -->
      <p 
        v-if="showHelperText" 
        class="mt-1.5 text-theme-xs"
        :class="getHelperTextClass()"
      >
        {{ helperText }}
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'

// Props definition
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value: string) => ['text', 'email', 'password', 'number', 'tel', 'url', 'search'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  labelClass: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  inputClass: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'error', 'success', 'warning'].includes(value)
  },
  helperText: {
    type: String,
    default: ''
  },
  showStateIcon: {
    type: Boolean,
    default: true
  },
  showHelperText: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'change',
  'input'
])

// Refs
const inputRef = ref<HTMLInputElement | null>(null)

// State Icons
const ErrorIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M2.58325 7.99967C2.58325 5.00813 5.00838 2.58301 7.99992 2.58301C10.9915 2.58301 13.4166 5.00813 13.4166 7.99967C13.4166 10.9912 10.9915 13.4163 7.99992 13.4163C5.00838 13.4163 2.58325 10.9912 2.58325 7.99967ZM7.99992 1.08301C4.17995 1.08301 1.08325 4.17971 1.08325 7.99967C1.08325 11.8196 4.17995 14.9163 7.99992 14.9163C11.8199 14.9163 14.9166 11.8196 14.9166 7.99967C14.9166 4.17971 11.8199 1.08301 7.99992 1.08301ZM7.09932 5.01639C7.09932 5.51345 7.50227 5.91639 7.99932 5.91639H7.99999C8.49705 5.91639 8.89999 5.51345 8.89999 5.01639C8.89999 4.51933 8.49705 4.11639 7.99999 4.11639H7.99932C7.50227 4.11639 7.09932 4.51933 7.09932 5.01639ZM7.99998 11.8306C7.58576 11.8306 7.24998 11.4948 7.24998 11.0806V7.29627C7.24998 6.88206 7.58576 6.54627 7.99998 6.54627C8.41419 6.54627 8.74998 6.88206 8.74998 7.29627V11.0806C8.74998 11.4948 8.41419 11.8306 7.99998 11.8306Z',
        fill: '#F04438'
      })
    ])
  }
})

const SuccessIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M2.61792 8.00034C2.61792 5.02784 5.0276 2.61816 8.00009 2.61816C10.9726 2.61816 13.3823 5.02784 13.3823 8.00034C13.3823 10.9728 10.9726 13.3825 8.00009 13.3825C5.0276 13.3825 2.61792 10.9728 2.61792 8.00034ZM8.00009 1.11816C4.19917 1.11816 1.11792 4.19942 1.11792 8.00034C1.11792 11.8013 4.19917 14.8825 8.00009 14.8825C11.801 14.8825 14.8823 11.8013 14.8823 8.00034C14.8823 4.19942 11.801 1.11816 8.00009 1.11816ZM10.5192 7.266C10.8121 6.97311 10.8121 6.49823 10.5192 6.20534C10.2264 5.91245 9.75148 5.91245 9.45858 6.20534L7.45958 8.20434L6.54162 7.28638C6.24873 6.99349 5.77385 6.99349 5.48096 7.28638C5.18807 7.57927 5.18807 8.05415 5.48096 8.34704L6.92925 9.79533C7.0699 9.93599 7.26067 10.015 7.45958 10.015C7.6585 10.015 7.84926 9.93599 7.98991 9.79533L10.5192 7.266Z',
        fill: '#12B76A'
      })
    ])
  }
})

const WarningIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M2.58325 7.99967C2.58325 5.00813 5.00838 2.58301 7.99992 2.58301C10.9915 2.58301 13.4166 5.00813 13.4166 7.99967C13.4166 10.9912 10.9915 13.4163 7.99992 13.4163C5.00838 13.4163 2.58325 10.9912 2.58325 7.99967ZM7.99992 1.08301C4.17995 1.08301 1.08325 4.17971 1.08325 7.99967C1.08325 11.8196 4.17995 14.9163 7.99992 14.9163C11.8199 14.9163 14.9166 11.8196 14.9166 7.99967C14.9166 4.17971 11.8199 1.08301 7.99992 1.08301ZM7.09932 5.01639C7.09932 5.51345 7.50227 5.91639 7.99932 5.91639H7.99999C8.49705 5.91639 8.89999 5.51345 8.89999 5.01639C8.89999 4.51933 8.49705 4.11639 7.99999 4.11639H7.99932C7.50227 4.11639 7.09932 4.51933 7.09932 5.01639ZM7.24998 11.0806C7.24998 11.4948 7.58576 11.8306 7.99998 11.8306C8.41419 11.8306 8.74998 11.4948 8.74998 11.0806V8.29627C8.74998 7.88206 8.41419 7.54627 7.99998 7.54627C7.58576 7.54627 7.24998 7.88206 7.24998 8.29627V11.0806Z',
        fill: '#F79009'
      })
    ])
  }
})

// Computed
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// Methods
const getStateClasses = () => {
  const baseClasses = {
    'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800': props.state === 'default',
    'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800': props.state === 'error',
    'border-success-300 focus:border-success-300 focus:ring-success-500/10 dark:border-success-700 dark:focus:border-success-800': props.state === 'success',
    'border-warning-300 focus:border-warning-300 focus:ring-warning-500/10 dark:border-warning-700 dark:focus:border-warning-800': props.state === 'warning',
    'border-gray-100 bg-gray-50 placeholder:text-gray-300': props.disabled
  }
  return baseClasses
}

const getStateIcon = () => {
  switch (props.state) {
    case 'error':
      return ErrorIcon
    case 'success':
      return SuccessIcon
    case 'warning':
      return WarningIcon
    default:
      return null
  }
}

const getStateIconColor = () => {
  switch (props.state) {
    case 'error':
      return 'text-error-500'
    case 'success':
      return 'text-success-500'
    case 'warning':
      return 'text-warning-500'
    default:
      return ''
  }
}

const getHelperTextClass = () => {
  switch (props.state) {
    case 'error':
      return 'text-error-500'
    case 'success':
      return 'text-success-500'
    case 'warning':
      return 'text-warning-500'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  inputValue.value = value
  emit('input', value, event)
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}

const handleBlur = (event: Event) => {
  emit('blur', event)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.value, event)
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

// Expose methods for parent access
defineExpose({
  focus,
  blur,
  select,
  inputRef
})
</script>
