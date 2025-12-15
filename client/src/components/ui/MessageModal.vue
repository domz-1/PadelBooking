<template>
    <Modal :fullScreenBackdrop="true" @close="handleClose">
        <template #body>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 relative border border-gray-100 dark:border-gray-700 text-center">
                <div class="mb-4 flex justify-center">
                    <div v-if="type === 'success'" class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="32" />
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <HugeiconsIcon :icon="AlertCircleIcon" :size="32" />
                    </div>
                </div>
                
                <h3 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {{ title }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                    {{ message }}
                </p>

                <button 
                    @click="handleClose"
                    class="w-full py-2.5 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="type === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' 
                        : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'"
                >
                    {{ buttonText }}
                </button>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue';
import { HugeiconsIcon } from '@hugeicons/vue';
import { CheckmarkCircle02Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';

interface Props {
    type?: 'success' | 'error';
    title?: string;
    message: string;
    buttonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'success',
    title: '',
    buttonText: 'OK'
});

const emit = defineEmits(['close']);

const handleClose = () => {
    emit('close');
};
</script>
