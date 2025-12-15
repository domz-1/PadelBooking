<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-50">
    <div
      v-if="fullScreenBackdrop"
      class="fixed inset-0 h-full w-full bg-gray-500/50 dark:bg-gray-900/70 backdrop-blur-[4px]"
      aria-hidden="true"
      @click="$emit('close')"
    ></div>
    <slot name="body"></slot>
  </div>
</template>

<script setup lang="ts">
interface ModalProps {
  fullScreenBackdrop?: boolean
}

withDefaults(defineProps<ModalProps>(), {
  fullScreenBackdrop: true
})

defineEmits(['close'])
</script>
