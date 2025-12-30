<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 w-full">
    <div v-for="(field, index) in fields" :key="field.key || `field-${index}`" class="space-y-4">
      <!-- Array Field (e.g., addresses) -->
      <div v-if="field.type === 'array' && !field.hidden" class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 v-if="field.label" class="text-lg font-semibold text-gray-800 dark:text-white">
              {{ field.label }}
            </h3>
            <p v-if="field.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ field.description }}
            </p>
          </div>
          <button v-if="field.allowAdd !== false && (!field.maxItems || formData[field.key]?.length < field.maxItems)"
            type="button" @click="addArrayItem(field.key)"
            :class="field.addButtonClass || 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium'">
            {{ field.addButtonText || '+ Add' }}
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="(item, itemIndex) in formData[field.key]" :key="`${field.key}-${itemIndex}`"
            :class="field.itemContainerClass || 'p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 relative'">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium text-gray-700 dark:text-gray-300">
                {{ field.itemLabel || field.label || 'Item' }} #{{ itemIndex + 1 }}
              </h4>
              <button
                v-if="field.allowRemove !== false && (!field.minItems || formData[field.key].length > field.minItems)"
                type="button" @click="removeArrayItem(field.key, itemIndex)"
                :class="field.removeButtonClass || 'px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 text-sm font-medium'">
                {{ field.removeButtonText || 'Remove' }}
              </button>
            </div>

            <div :class="field.groupClass || 'grid grid-cols-1 gap-4'">
              <div v-for="(subField, subIndex) in field.fields" :key="`${subField.key}-${itemIndex}-${subIndex}`">
                <FormField :field="subField" :form-data="item"
                  @update="(key, value) => updateArrayField(field.key, itemIndex, key, value)" />
              </div>
            </div>
          </div>

          <div v-if="!formData[field.key] || formData[field.key].length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="mt-2">{{ field.emptyMessage || 'No items added yet' }}</p>
          </div>
        </div>
      </div>

      <!-- Field Group -->
      <div v-else-if="field.type === 'group' && !field.hidden" class="space-y-4">
        <h3 v-if="field.label" class="text-lg font-semibold text-gray-800 dark:text-white">
          {{ field.label }}
        </h3>
        <p v-if="field.description" class="text-sm text-gray-600 dark:text-gray-400">
          {{ field.description }}
        </p>
        <div :class="field.groupClass || 'grid grid-cols-1 gap-4'">
          <div v-for="(subField, subIndex) in field.fields" :key="subField.key || `subfield-${subIndex}`">
            <FormField :field="subField" :form-data="getNestedFormData(field.key)"
              @update="(key, value) => updateNestedField(field.key, key, value)" />
          </div>
        </div>
      </div>

      <!-- Single Field -->
      <FormField v-else-if="!field.hidden" :field="field" :form-data="formData" :field-error="errors[field.key]" @update="updateField" />
    </div>

    <!-- Submit Button -->
    <div v-if="showSubmitButton" class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button type="submit" :disabled="loading || disabled" :class="[
        submitButtonClass || 'px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium',
        loading && 'opacity-75 cursor-not-allowed'
      ]">
        <span v-if="!loading" class="flex items-center gap-2">
          <svg v-if="!loading" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ submitButtonText || 'Submit' }}
        </span>
        <span v-else class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ loadingText || 'Processing...' }}
        </span>
      </button>

      <button v-if="showResetButton" type="button" @click="resetForm" :disabled="loading"
        :class="resetButtonClass || 'px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'">
        {{ resetButtonText || 'Reset' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import FormField from './FormField.vue'

export interface FormFieldConfig {
  key: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' |
  'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'file' |
  'date' | 'time' | 'datetime' | 'color' | 'range' | 'group' | 'array'
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string | RegExp
    custom?: (value: any) => boolean | string
  }
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  rows?: number
  cols?: number
  resizable?: boolean
  multiple?: boolean
  accept?: string
  capture?: boolean | 'user' | 'environment'
  min?: number | string
  max?: number | string
  step?: number | 'any'
  fieldClass?: string
  labelClass?: string
  inputClass?: string
  fields?: FormFieldConfig[]
  groupClass?: string
  description?: string
  allowAdd?: boolean
  allowRemove?: boolean
  minItems?: number
  maxItems?: number
  addButtonText?: string
  addButtonClass?: string
  removeButtonText?: string
  removeButtonClass?: string
  itemLabel?: string
  itemContainerClass?: string
  emptyMessage?: string
  defaultItemData?: Record<string, any>
  error?: boolean
  errorMessage?: string
  success?: boolean
  successMessage?: string
  hint?: string
  fullWidth?: boolean
  gridColumn?: string
  autocomplete?: string
  showValue?: boolean
  minlength?: number
  maxlength?: number
  resizeDirection?: 'vertical' | 'horizontal' | 'both'
}

export interface FormProps {
  fields: FormFieldConfig[]
  initialData?: Record<string, any>
  showSubmitButton?: boolean
  submitButtonText?: string
  submitButtonClass?: string
  showResetButton?: boolean
  resetButtonText?: string
  resetButtonClass?: string
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  validateOnSubmit?: boolean
  validateOnChange?: boolean
}

const props = withDefaults(defineProps<FormProps>(), {
  showSubmitButton: true,
  showResetButton: false,
  validateOnSubmit: true,
  validateOnChange: false,
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  reset: []
  change: [field: string, value: any, formData: Record<string, any>]
  error: [errors: Record<string, string>]
  arrayItemAdd: [fieldKey: string, index: number]
  arrayItemRemove: [fieldKey: string, index: number]
}>()

const formData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string>>({})

const initializeFormData = () => {
  const initial: Record<string, any> = {}

  const processFields = (fields: FormFieldConfig[], parentKey = '') => {
    fields.forEach(field => {
      const fullKey = parentKey ? `${parentKey}.${field.key}` : field.key

      if (field.type === 'group' && field.fields) {
        // Initialize nested object for group fields
        if (!parentKey) {
          initial[field.key] = getNestedValue(props.initialData, field.key) || {}
        }
        processFields(field.fields, field.key)
      } else if (field.type === 'array') {
        const arrayValue = getNestedValue(props.initialData, field.key)
        console.log(`Form: Processing array field ${field.key}, value:`, arrayValue)
        // Ensure array items have the correct structure based on the field configuration
        if (Array.isArray(arrayValue) && arrayValue.length > 0) {
          initial[field.key] = arrayValue
        } else {
          initial[field.key] = []
        }
      } else if (field.key) {
        const value = getNestedValue(props.initialData, fullKey)
        setNestedValue(initial, fullKey, value !== undefined ? value : getDefaultValue(field))
      }
    })
  }

  processFields(props.fields)
  Object.assign(formData, initial)
}

const getNestedValue = (obj: any, path: string): any => {
  if (!obj) return undefined
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

const setNestedValue = (obj: any, path: string, value: any): void => {
  const parts = path.split('.')
  const lastPart = parts.pop()!
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {}
    return acc[part]
  }, obj)
  target[lastPart] = value
}

const getNestedFormData = (key: string) => {
  return formData[key] || {}
}

const getDefaultValue = (field: FormFieldConfig): any => {
  switch (field.type) {
    case 'checkbox':
    case 'switch':
      return false
    case 'select':
      return field.multiple ? [] : ''
    case 'file':
      return field.multiple ? [] : null
    case 'number':
    case 'range':
      return field.min || 0
    case 'array':
      return []
    default:
      return ''
  }
}

const addArrayItem = (fieldKey: string) => {
  const field = findFieldByKey(fieldKey)
  if (!field || field.type !== 'array') return

  if (field.maxItems && formData[fieldKey].length >= field.maxItems) {
    return
  }

  const newItem: Record<string, any> = {}

  if (field.defaultItemData) {
    Object.assign(newItem, field.defaultItemData)
  } else if (field.fields) {
    field.fields.forEach(subField => {
      newItem[subField.key] = getDefaultValue(subField)
    })
  }

  formData[fieldKey].push(newItem)
  emit('arrayItemAdd', fieldKey, formData[fieldKey].length - 1)
  emit('change', fieldKey, formData[fieldKey], { ...formData })
}

const removeArrayItem = (fieldKey: string, index: number) => {
  const field = findFieldByKey(fieldKey)
  if (!field || field.type !== 'array') return

  if (field.minItems && formData[fieldKey].length <= field.minItems) {
    return
  }

  formData[fieldKey].splice(index, 1)
  emit('arrayItemRemove', fieldKey, index)
  emit('change', fieldKey, formData[fieldKey], { ...formData })
}

const updateArrayField = (arrayKey: string, itemIndex: number, fieldKey: string, value: any) => {
  if (formData[arrayKey] && formData[arrayKey][itemIndex]) {
    formData[arrayKey][itemIndex][fieldKey] = value
    emit('change', `${arrayKey}[${itemIndex}].${fieldKey}`, value, { ...formData })

    if (props.validateOnChange) {
      validateField(fieldKey, value)
    }
  }
}

const updateNestedField = (parentKey: string, fieldKey: string, value: any) => {
  if (!formData[parentKey]) {
    formData[parentKey] = {}
  }
  formData[parentKey][fieldKey] = value
  emit('change', `${parentKey}.${fieldKey}`, value, { ...formData })

  if (props.validateOnChange) {
    validateField(`${parentKey}.${fieldKey}`, value)
  }
}

const updateField = (key: string, value: any) => {
  formData[key] = value
  emit('change', key, value, { ...formData })

  if (props.validateOnChange) {
    validateField(key, value)
  }
}

const validateField = (key: string, value: any): string | null => {
  const field = findFieldByKey(key)
  if (!field) return null

  // Handle computed required values
  // @ts-ignore
  const isRequired = typeof field.required === 'function' ? field.required() : field.required
  
  if (isRequired && (value === '' || value === null || value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (field.type === 'file' && (!value || (Array.isArray(value) && value.length === 0))))) {
    return `${field.label || key} is required`
  }

  if (!field.validation) return null

  const { validation } = field

  if (field.type === 'number' && typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `${field.label || key} must be at least ${validation.min}`
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${field.label || key} must be at most ${validation.max}`
    }
  }

  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label || key} must be at least ${validation.minLength} characters`
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label || key} must be at most ${validation.maxLength} characters`
    }
  }

  if (validation.pattern) {
    const pattern = typeof validation.pattern === 'string'
      ? new RegExp(validation.pattern)
      : validation.pattern
    if (!pattern.test(value)) {
      return `${field.label || key} format is invalid`
    }
  }

  if (validation.custom) {
    const result = validation.custom(value)
    if (typeof result === 'string') return result
    if (!result) return `${field.label || key} is invalid`
  }

  return null
}

const findFieldByKey = (key: string): FormFieldConfig | null => {
  const searchFields = (fields: FormFieldConfig[]): FormFieldConfig | null => {
    for (const field of fields) {
      if (field.type === 'group' && field.fields) {
        if (field.key === key) return field
        const found = searchFields(field.fields)
        if (found) return found
      } else if (field.type === 'array' && field.fields) {
        if (field.key === key) return field
        const found = searchFields(field.fields)
        if (found) return found
      } else if (field.key === key) {
        return field
      }
    }
    return null
  }

  return searchFields(props.fields)
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  const validateFields = (fields: FormFieldConfig[], parentKey = '') => {
    fields.forEach(field => {
      if (field.type === 'group' && field.fields) {
        validateFields(field.fields, field.key)
      } else if (field.type === 'array' && field.fields) {
        const error = validateField(field.key, formData[field.key])
        if (error) {
          newErrors[field.key] = error
        }
        if (Array.isArray(formData[field.key])) {
          formData[field.key].forEach((item: any, index: number) => {
            field.fields?.forEach(subField => {
              const itemError = validateField(subField.key, item[subField.key])
              if (itemError) {
                newErrors[`${field.key}[${index}].${subField.key}`] = itemError
              }
            })
          })
        }
      } else if (field.key) {
        const fullKey = parentKey ? `${parentKey}.${field.key}` : field.key
        const value = parentKey ? formData[parentKey]?.[field.key] : formData[field.key]
        const error = validateField(field.key, value)
        if (error) {
          newErrors[fullKey] = error
        }
      }
    })
  }

  validateFields(props.fields)
  errors.value = newErrors

  if (Object.keys(newErrors).length > 0) {
    emit('error', newErrors)
    return false
  }

  return true
}

const handleSubmit = () => {
  if (props.validateOnSubmit && !validateForm()) {
    return
  }

  emit('submit', { ...formData })
}

const resetForm = () => {
  initializeFormData()
  errors.value = {}
  emit('reset')
}

watch(() => props.initialData, () => {
  console.log('Form: initialData changed:', props.initialData)
  initializeFormData()
}, { deep: true })

onMounted(() => {
  console.log('Form: Component mounted, initialData:', props.initialData)
  initializeFormData()
})

defineExpose({
  formData,
  errors,
  validateForm,
  resetForm,
  updateField,
  addArrayItem,
  removeArrayItem
})
</script>