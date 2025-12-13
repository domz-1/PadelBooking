<template>
  <div class="space-y-6">
    <!-- Input Group Component -->
    <div>
      <label 
        v-if="showLabel" 
        :for="inputId"
        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        :class="labelClass"
      >
        {{ label }}
        <span v-if="required" class="text-error-500">*</span>
      </label>
      <div class="relative">
        <!-- Prepend Slot/Icon -->
        <div v-if="$slots.prepend || prependIcon" class="absolute left-0 top-1/2 -translate-y-1/2">
          <span
            v-if="prependIcon"
            class="border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400"
          >
            <slot name="prepend">
              <component :is="prependIcon" class="w-5 h-5" />
            </slot>
          </span>
          <slot v-else name="prepend" />
        </div>
        
        <!-- Main Input -->
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
            'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800',
            inputClass,
            {
              'border-error-300 focus:border-error-300 focus:ring-error-500/10': error,
              'border-success-300 focus:border-success-300 focus:ring-success-500/10': success,
              'border-gray-100 bg-gray-50 placeholder:text-gray-300': disabled,
              'pl-[62px]': prependIcon || $slots.prepend,
              'pr-[62px]': appendIcon || $slots.append,
            }
          ]"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleChange"
        />
        
        <!-- Append Slot/Icon -->
        <div v-if="$slots.append || appendIcon" class="absolute right-0 top-1/2 -translate-y-1/2">
          <span
            v-if="appendIcon"
            class="border-l border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400"
          >
            <slot name="append">
              <component :is="appendIcon" class="w-5 h-5" />
            </slot>
          </span>
          <slot v-else name="append" />
        </div>
      </div>
      
      <!-- Helper Text -->
      <p v-if="error && errorMessage" class="mt-1.5 text-theme-xs text-error-500">{{ errorMessage }}</p>
      <p v-if="success && successMessage" class="mt-1.5 text-theme-xs text-success-500">{{ successMessage }}</p>
      <p v-if="hint" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">{{ hint }}</p>
    </div>

    <!-- Phone Input with Prepended Country Code -->
    <div v-if="variant === 'phone-prepend'">
      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {{ phoneLabel }}
      </label>
      <div class="relative">
        <div class="absolute">
          <select
            :value="selectedCountry"
            @change="updateCountry($event, 'prepend')"
            class="appearance-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent bg-none py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            <option v-for="(code, country) in countryCodes" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400"
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
          </div>
        </div>
        <input
          :value="phoneValue"
          @input="updatePhone($event, 'prepend')"
          :placeholder="phonePlaceholder"
          type="tel"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-3 pl-[84px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
    </div>

    <!-- Phone Input with Appended Country Code -->
    <div v-if="variant === 'phone-append'">
      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {{ phoneLabel }}
      </label>
      <div class="relative">
        <div class="absolute right-0">
          <select
            :value="selectedCountry2"
            @change="updateCountry($event, 'append')"
            class="appearance-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent bg-none py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            <option v-for="(code, country) in countryCodes" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400"
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
          </div>
        </div>
        <input
          :value="phoneValue2"
          @input="updatePhone($event, 'append')"
          :placeholder="phonePlaceholder"
          type="tel"
          class="dark:bg-dark-900 h-11 w-full p-3 rounded-lg border border-gray-300 bg-transparent py-3 pr-[84px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white-30 dark:focus:border-brand-800"
        />
      </div>
    </div>

    <!-- URL Input -->
    <div v-if="variant === 'url'">
      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{{ urlLabel }}</label>
      <div class="relative">
        <span
          class="absolute left-0 top-1/2 inline-flex h-11 -translate-y-1/2 items-center justify-center border-r border-gray-200 py-3 pl-3.5 pr-3 text-gray-500 dark:border-gray-800 dark:text-gray-400"
        >
          {{ urlPrefix }}
        </span>
        <input
          :value="urlValue"
          @input="updateUrl"
          :type="urlType"
          :placeholder="urlPlaceholder"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pl-[90px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
    </div>

    <!-- Website Input with Copy Button -->
    <div v-if="variant === 'website-copy'">
      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {{ websiteLabel }}
      </label>
      <div class="relative">
        <button
          @click="copyWebsite"
          class="absolute right-0 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center gap-1 border-l border-gray-200 py-3 pl-3.5 pr-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:text-gray-400"
        >
          <svg
            class="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6.58822 4.58398C6.58822 4.30784 6.81207 4.08398 7.08822 4.08398H15.4154C15.6915 4.08398 15.9154 4.30784 15.9154 4.58398L15.9154 12.9128C15.9154 13.189 15.6916 13.4128 15.4154 13.4128H7.08821C6.81207 13.4128 6.58822 13.189 6.58822 12.9128V4.58398ZM7.08822 2.58398C5.98365 2.58398 5.08822 3.47942 5.08822 4.58398V5.09416H4.58496C3.48039 5.09416 2.58496 5.98959 2.58496 7.09416V15.4161C2.58496 16.5207 3.48039 17.4161 4.58496 17.4161H12.9069C14.0115 17.4161 14.9069 16.5207 14.9069 15.4161L14.9069 14.9128H15.4154C16.52 14.9128 17.4154 14.0174 17.4154 12.9128L17.4154 4.58398C17.4154 3.47941 16.52 2.58398 15.4154 2.58398H7.08822ZM13.4069 14.9128H7.08821C5.98364 14.9128 5.08822 14.0174 5.08822 12.9128V6.59416H4.58496C4.30882 6.59416 4.08496 6.81801 4.08496 7.09416V15.4161C4.08496 15.6922 4.30882 15.9161 4.58496 15.9161H12.9069C13.183 15.9161 13.4069 15.6922 13.4069 15.4161L13.4069 14.9128Z"
              fill=""
            />
          </svg>
          <div>{{ copyText }}</div>
        </button>
        <input
          :value="websiteValue"
          @input="updateWebsite"
          :type="websiteType"
          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-3 pl-4 pr-[90px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
  prependIcon: {
    type: [Object, Function, String],
    default: null
  },
  appendIcon: {
    type: [Object, Function, String],
    default: null
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  success: {
    type: Boolean,
    default: false
  },
  successMessage: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  // New props for variants
  variant: {
    type: String,
    default: 'default',
    validator: (v: string) => ['default', 'phone-prepend', 'phone-append', 'url', 'website-copy'].includes(v)
  },
  phoneLabel: {
    type: String,
    default: 'Phone'
  },
  phonePlaceholder: {
    type: String,
    default: '+1 (555) 000-0000'
  },
  phoneValue: {
    type: String,
    default: ''
  },
  phoneValue2: {
    type: String,
    default: ''
  },
  selectedCountry: {
    type: String,
    default: 'US'
  },
  selectedCountry2: {
    type: String,
    default: 'US'
  },
  countryCodes: {
    type: Object,
    default: () => ({ US: '+1', UK: '+44', CA: '+1' })
  },
  urlLabel: {
    type: String,
    default: 'URL'
  },
  urlPlaceholder: {
    type: String,
    default: 'www.tailadmin.com'
  },
  urlValue: {
    type: String,
    default: ''
  },
  urlPrefix: {
    type: String,
    default: 'http://'
  },
  urlType: {
    type: String,
    default: 'url'
  },
  websiteLabel: {
    type: String,
    default: 'Website'
  },
  websiteValue: {
    type: String,
    default: ''
  },
  websiteType: {
    type: String,
    default: 'url'
  },
  copyText: {
    type: String,
    default: 'Copy'
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'update:phoneValue',
  'update:phoneValue2',
  'update:selectedCountry',
  'update:selectedCountry2',
  'update:urlValue',
  'update:websiteValue',
  'focus',
  'blur',
  'change',
  'input',
  'copy'
])

// Refs
const inputRef = ref<HTMLInputElement | null>(null)

// Computed
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// Methods
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

const updateCountry = (event: Event, mode: 'prepend' | 'append') => {
  const target = event.target as HTMLSelectElement
  if (mode === 'prepend') {
    emit('update:selectedCountry', target.value)
  } else {
    emit('update:selectedCountry2', target.value)
  }
}

const updatePhone = (event: Event, mode: 'prepend' | 'append') => {
  const target = event.target as HTMLInputElement
  if (mode === 'prepend') {
    emit('update:phoneValue', target.value)
  } else {
    emit('update:phoneValue2', target.value)
  }
}

const updateUrl = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:urlValue', target.value)
}

const updateWebsite = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:websiteValue', target.value)
}

const copyWebsite = () => {
  emit('copy', props.websiteValue)
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
