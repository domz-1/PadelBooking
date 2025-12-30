<template>
    <Modal :fullScreenBackdrop="true" @close="$emit('close')">
        <template #body>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 relative border border-gray-100 dark:border-gray-700">
                <!-- Close Button -->
                <button 
                    @click="$emit('close')" 
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <HugeiconsIcon :icon="Cancel01Icon" :size="24" />
                </button>

                <!-- Header -->
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <HugeiconsIcon :icon="Calendar03Icon" :size="24" class="text-brand-500" />
                        Booking Details
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ID: #{{ booking.id }}
                    </p>
                </div>

                <!-- Details -->
                <div class="space-y-4 mb-8">
                    <!-- Venue -->
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gray-400">
                            <HugeiconsIcon :icon="Location01Icon" :size="20" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Venue</p>
                            <p class="text-gray-900 dark:text-white font-medium">{{ booking.Venue?.name || 'Unknown Venue' }}</p>
                        </div>
                    </div>

                    <!-- Date & Time -->
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gray-400">
                            <HugeiconsIcon :icon="Clock01Icon" :size="20" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
                            <p class="text-gray-900 dark:text-white font-medium">
                                {{ booking.date }} | {{ booking.startTime }} - {{ booking.endTime }}
                            </p>
                        </div>
                    </div>

                    <!-- Price -->
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gray-400">
                            <HugeiconsIcon :icon="Money03Icon" :size="20" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Price</p>
                            <p class="text-gray-900 dark:text-white font-medium">{{ booking.totalPrice }} SAR</p>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gray-400">
                            <HugeiconsIcon :icon="Tick02Icon" :size="20" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                            <span :class="getStatusBadgeClass(booking.status)">
                                {{ booking.status }}
                            </span>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="booking.notes" class="flex items-start gap-3">
                        <div class="mt-1 text-gray-400">
                            <HugeiconsIcon :icon="Note01Icon" :size="20" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
                            <p class="text-gray-700 dark:text-gray-300 text-sm">{{ booking.notes }}</p>
                        </div>
                    </div>
                </div>

                <!-- Waitlist (Admin Only) -->
                <div v-if="authStore.user?.role === 'admin' && waitlistEntries.length > 0" class="mb-8">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <HugeiconsIcon :icon="HourglassIcon" :size="16" class="text-yellow-500" />
                        Waitlist ({{ waitlistEntries.length }})
                    </h4>
                    <div class="space-y-2">
                        <div v-for="entry in waitlistEntries" :key="entry.id" class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-medium text-brand-600 dark:text-brand-400">
                                    {{ entry.User?.name?.charAt(0) || '?' }}
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ entry.User?.name }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ entry.User?.email }}</p>
                                </div>
                            </div>
                            <span class="text-xs text-gray-400">
                                {{ new Date(entry.createdAt).toLocaleDateString() }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button 
                        @click="$emit('delete', booking)"
                        class="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <HugeiconsIcon :icon="Delete02Icon" :size="18" />
                        Delete
                    </button>
                    <button 
                        @click="$emit('edit', booking)"
                        class="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <HugeiconsIcon :icon="Edit02Icon" :size="18" />
                        Edit
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue';
import { ref, onMounted } from 'vue';
import { BookingsAPI } from '@/api/BookingsAPI';
import { useAuthStore } from '@/stores/AuthStore';
import { HugeiconsIcon } from '@hugeicons/vue';
import { 
    Cancel01Icon, 
    Calendar03Icon, 
    Location01Icon, 
    Clock01Icon, 
    Money03Icon, 
    Tick02Icon, 
    Note01Icon,
    Delete02Icon,
    Edit02Icon,
    HourglassIcon
} from '@hugeicons/core-free-icons';

const props = defineProps<{
    booking: any;
}>();

defineEmits(['close', 'edit', 'delete']);

const authStore = useAuthStore();
const waitlistEntries = ref<any[]>([]);

const fetchWaitlist = async () => {
    if (authStore.user?.role !== 'admin') return;
    
    try {
        const response = await BookingsAPI.getWaitlistForSlot({
            venueId: props.booking.venueId,
            date: props.booking.date,
            startTime: props.booking.startTime,
            endTime: props.booking.endTime
        });
        if (response.data.success) {
            waitlistEntries.value = response.data.data;
        }
    } catch (error) {
        console.error('Error fetching waitlist:', error);
    }
};

onMounted(() => {
    fetchWaitlist();
});

const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
        'confirmed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
        'pending': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
        'cancelled': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'pending-coach': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500',
        'no-show': 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-500'
    };
    return `rounded-full px-2 py-0.5 text-xs font-medium ${classes[status] || classes.pending}`;
};
</script>
