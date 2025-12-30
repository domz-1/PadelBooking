<template>
  <div class="relative" ref="multiSelectRef">
    <!-- Label -->
    <label 
      v-if="showLabel" 
      :for="selectId"
      class="mb-1.5 block text-sm font-medium"
      :class="[
        disabled ? 'text-gray-300 dark:text-white/15' : 'text-gray-700 dark:text-gray-400',
        labelClass
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>
    
    <div
      @click="toggleDropdown"
      :id="selectId"
      class="dark:bg-dark-900 h-11 flex items-center w-full appearance-none rounded-lg border bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      :class="[
        selectClass,
        {
          'text-gray-800 dark:text-white/90': isOpen,
          'border-error-300 focus:border-error-300 focus:ring-error-500/10': error,
          'border-success-300 focus:border-success-300 focus:ring-success-500/10': success,
          'border-gray-100 bg-gray-50 placeholder:text-gray-300': disabled,
          'cursor-not-allowed': disabled
        }
      ]"
    >
      <span v-if="selectedItems.length === 0" class="text-gray-400"> {{ placeholder }} </span>
      <div class="flex flex-wrap items-center flex-auto gap-2">
        <div
          v-for="item in selectedItems"
          :key="item[valueKey]"
          class="group flex items-center justify-center h-[30px] rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
          :class="chipClass"
        >
          <span>{{ item[labelKey] }}</span>
          <button
            v-if="!disabled && !readonly"
            @click.stop="removeItem(item)"
            class="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
            :class="removeButtonClass"
            aria-label="Remove item"
          >
            <slot name="remove-icon">
              <svg
                role="button"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                  fill="currentColor"
                />
              </svg>
            </slot>
          </button>
        </div>
      </div>
      <slot name="dropdown-icon" :is-open="isOpen">
        <svg
          class="ml-auto"
          :class="{ 'transform rotate-180': isOpen }"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </div>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen && !disabled"
        class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-sm dark:bg-gray-900"
        :class="dropdownClass"
      >
        <ul
          class="overflow-y-auto divide-y divide-gray-200 custom-scrollbar max-h-60 dark:divide-gray-800"
          :class="listClass"
          role="listbox"
          aria-multiselectable="true"
        >
          <li
            v-for="item in filteredOptions"
            :key="item[valueKey]"
            @click="toggleItem(item)"
            class="relative flex items-center w-full px-3 py-2 border-transparent cursor-pointer first:rounded-t-lg last:rounded-b-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            :class="[
              itemClass,
              { 
                'bg-gray-50 dark:bg-white/[0.03]': isSelected(item),
                'opacity-50 cursor-not-allowed': item[disabledKey]
              }
            ]"
            role="option"
            :aria-selected="isSelected(item)"
            :aria-disabled="item[disabledKey]"
          >
            <slot name="option" :item="item" :selected="isSelected(item)">
              <span class="grow">{{ item[labelKey] }}</span>
              <svg
                v-if="isSelected(item)"
                class="w-5 h-5 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </slot>
          </li>
        </ul>
      </div>
    </transition>
    
    <!-- Helper Text -->
    <p v-if="error && errorMessage" class="mt-1.5 text-theme-xs text-error-500">{{ errorMessage }}</p>
    <p v-if="success && successMessage" class="mt-1.5 text-theme-xs text-success-500">{{ successMessage }}</p>
    <p v-if="hint" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue"

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
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
    default: () => `multiselect-${Math.random().toString(36).substr(2, 9)}`,
  },
  placeholder: {
    type: String,
    default: 'Select items...',
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
  selectClass: {
    type: String,
    default: '',
  },
  chipClass: {
    type: String,
    default: '',
  },
  removeButtonClass: {
    type: String,
    default: '',
  },
  dropdownClass: {
    type: String,
    default: '',
  },
  listClass: {
    type: String,
    default: '',
  },
  itemClass: {
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
  maxItems: {
    type: Number,
    default: null,
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'select', 'remove'])

const isOpen = ref(false)
const selectedItems = ref(props.modelValue)
const multiSelectRef = ref(null)
const searchQuery = ref('')

// Computed
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  
  return props.options.filter(option => 
    option[props.labelKey].toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const isMaxItemsReached = computed(() => {
  return props.maxItems !== null && selectedItems.value.length >= props.maxItems
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedItems.value = newValue
}, { deep: true })

// Methods
const toggleDropdown = () => {
  if (props.disabled || props.readonly) return
  
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
  } else {
    emit('close')
  }
}

const toggleItem = (item) => {
  if (item[props.disabledKey]) return
  
  if (isSelected(item)) {
    removeItem(item)
  } else {
    if (isMaxItemsReached.value) return
    
    const index = selectedItems.value.findIndex((selected) => selected[props.valueKey] === item[props.valueKey])
    if (index === -1) {
      selectedItems.value.push(item)
      emit('select', item)
      emit('update:modelValue', selectedItems.value)
    }
  }
}

const removeItem = (item) => {
  const index = selectedItems.value.findIndex((selected) => selected[props.valueKey] === item[props.valueKey])
  if (index !== -1) {
    selectedItems.value.splice(index, 1)
    emit('remove', item)
    emit('update:modelValue', selectedItems.value)
  }
}

const isSelected = (item) => {
  return selectedItems.value.some((selected) => selected[props.valueKey] === item[props.valueKey])
}

const clearAll = () => {
  selectedItems.value = []
  emit('update:modelValue', selectedItems.value)
}

const handleClickOutside = (event) => {
  if (multiSelectRef.value && !multiSelectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Expose methods for parent access
defineExpose({
  clearAll,
  toggleDropdown,
  selectedItems
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
