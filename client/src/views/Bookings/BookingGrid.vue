<template>
    <div class="overflow-x-auto">
        <div class="min-w-[800px]">
            <!-- Header Row: Venues -->
            <div class="grid grid-cols-[100px_repeat(auto-fit,minmax(150px,1fr))] gap-1 mb-1">
                <div class="h-12 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded gap-1.5">
                    <HugeiconsIcon :icon="Clock01Icon" :size="18" />
                    <span>Time</span>
                </div>
                <div v-for="venue in venues" :key="venue.id" 
                    @click="openVenueModal(venue)"
                    class="h-12 flex items-center justify-center font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 rounded px-2 text-center text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors gap-1.5">
                    <HugeiconsIcon :icon="Location01Icon" :size="16" class="text-brand-500" />
                    <span class="truncate">{{ venue.name }}</span>
                </div>
            </div>

            <!-- Grid Rows: Hours -->
            <div v-for="hour in hours" :key="hour" class="grid grid-cols-[100px_repeat(auto-fit,minmax(150px,1fr))] gap-1 mb-1">
                <!-- Time Column -->
                <div class="h-20 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded">
                    {{ formatHour(hour) }}
                </div>

                <!-- Venue Cells -->
                <div v-for="venue in venues" :key="venue.id" 
                    class="h-20 relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded transition-colors"
                    :class="[
                        !getBooking(venue.id, hour) && !isPublic ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                    ]"
                >
                    
                    <!-- Booking Slot -->
                    <div 
                        v-if="getBooking(venue.id, hour)"
                        @click="handleBookingClick(getBooking(venue.id, hour))"
                        class="w-full h-full rounded-md p-1 text-xs overflow-hidden transition-transform"
                        :class="[
                            !getBooking(venue.id, hour).Category?.color ? getStatusColor(getBooking(venue.id, hour).status) : 'text-white',
                            (isPublic && !isOwnBooking(getBooking(venue.id, hour))) ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer hover:scale-[1.02]'
                        ]"
                        :style="getBooking(venue.id, hour).Category?.color ? { backgroundColor: getBooking(venue.id, hour).Category.color } : {}"
                    >
                        <div v-if="isStartOfBooking(getBooking(venue.id, hour), hour)">
                            <div class="font-bold truncate flex items-center gap-1">
                                <HugeiconsIcon v-if="isOwnBooking(getBooking(venue.id, hour))" :icon="UserCircleIcon" :size="12" />
                                {{ getBookingDisplayName(getBooking(venue.id, hour)) }}
                            </div>
                            <div class="truncate opacity-90">
                                {{ getBookingDisplayType(getBooking(venue.id, hour)) }}
                            </div>
                            <div v-if="isWaitlisted(venue.id, hour)" class="absolute top-1 right-1 bg-yellow-500 text-white rounded-full p-0.5" title="You are on the waitlist">
                                <HugeiconsIcon :icon="HourglassIcon" :size="12" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Empty Slot -->
                    <div 
                        v-else 
                        @click="handleEmptySlotClick(venue.id, hour)"
                        class="w-full h-full flex items-center justify-center transition-opacity"
                        :class="[
                            isPublic ? 'cursor-not-allowed' : 'cursor-pointer opacity-0 hover:opacity-100'
                        ]"
                    >
                        <span v-if="!isPublic" class="text-xs text-gray-400 flex items-center gap-1">
                            <HugeiconsIcon :icon="PlusSignIcon" :size="12" />
                            Book
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Modal v-if="showVenueModal" :fullScreenBackdrop="true" @close="showVenueModal = false">
            <template #body>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 relative border border-gray-100 dark:border-gray-700">
                    <button 
                        @click="showVenueModal = false" 
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <HugeiconsIcon :icon="Cancel01Icon" :size="24" />
                    </button>
                    
                    <div v-if="selectedVenue">
                        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 pr-8">
                            <HugeiconsIcon :icon="Location01Icon" :size="24" class="text-brand-500" />
                            {{ selectedVenue.name }}
                        </h3>
                        <div class="space-y-3 text-gray-600 dark:text-gray-300">
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span class="font-medium text-sm text-gray-500 dark:text-gray-400">Type</span>
                                <span class="font-semibold">{{ selectedVenue.type || 'Standard' }}</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span class="font-medium text-sm text-gray-500 dark:text-gray-400">Price per Hour</span>
                                <span class="font-semibold text-brand-600 dark:text-brand-400">{{ selectedVenue.pricePerHour ? `$${selectedVenue.pricePerHour}` : 'N/A' }}</span>
                            </div>
                            <div v-if="selectedVenue.description" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p class="text-sm leading-relaxed">{{ selectedVenue.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';
import { HugeiconsIcon } from '@hugeicons/vue';
import { 
    Clock01Icon, 
    Location01Icon, 
    PlusSignIcon,
    UserCircleIcon,
    Cancel01Icon,
    HourglassIcon
} from '@hugeicons/core-free-icons';

const props = defineProps<{
    bookings: any[];
    venues: any[];
    date: string;
    isPublic?: boolean;
    myWaitlist?: any[];
}>();

const emit = defineEmits(['view-booking', 'create-booking', 'join-waitlist']);
const authStore = useAuthStore();
const router = useRouter();

const selectedVenue = ref<any>(null);
const showVenueModal = ref(false);

const openVenueModal = (venue: any) => {
    selectedVenue.value = venue;
    showVenueModal.value = true;
};

// Generate all 24 hours
const hours = Array.from({ length: 24 }, (_, i) => i);

const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${ampm}`;
};

const formatTimeForValue = (hour: number) => {
    const h = hour.toString().padStart(2, '0');
    return `${h}:00`;
};

const getBooking = (venueId: number, hour: number) => {
    return props.bookings.find(b => {
        if (b.venueId !== venueId) return false;
        
        const [startHour] = b.startTime.split(':').map(Number);
        const [endHour] = b.endTime.split(':').map(Number);
        
        // Check if current hour is within the booking range [start, end)
        return hour >= startHour && hour < endHour;
    });
};

const isStartOfBooking = (booking: any, hour: number) => {
    if (!booking) return false;
    const [startHour] = booking.startTime.split(':').map(Number);
    return startHour === hour;
};

const isOwnBooking = (booking: any) => {
    return authStore.user && booking.userId === authStore.user.id;
};

const isWaitlisted = (venueId: number, hour: number) => {
    if (!props.myWaitlist) return false;
    return props.myWaitlist.some(w => {
        if (w.venueId !== venueId) return false;
        const [startHour] = w.startTime.split(':').map(Number);
        return startHour === hour;
    });
};

const getBookingDisplayName = (booking: any) => {
    if (!props.isPublic) return booking.User?.name || 'Unknown';
    if (isOwnBooking(booking)) return booking.User?.name || 'You';
    return ''; // Remove 'Booked' text
};

const getBookingDisplayType = (booking: any) => {
    if (!props.isPublic) return booking.type;
    if (isOwnBooking(booking)) return booking.type;
    return '';
};

const handleBookingClick = (booking: any) => {
    if (!props.isPublic || isOwnBooking(booking)) {
        emit('view-booking', booking);
    } else {
        emit('join-waitlist', booking);
    }
};

const handleEmptySlotClick = (venueId: number, hour: number) => {
    if (props.isPublic && !authStore.isAuthenticated) {
        // Optional: Show a toast or alert saying "Please login to book"
        // For now, we can just redirect to login if they really want to book, 
        // OR we can do nothing to prevent "click on anything" feeling.
        // The requirement was "I can click on anything, and Its not good".
        // So doing nothing or showing a clear "Login" prompt is better.
        // Let's redirect to login for now as a clear action, but maybe confirm?
        if (confirm('Please login to make a booking.')) {
            router.push('/signin');
        }
        return;
    }
    emit('create-booking', { venueId, date: props.date, startTime: formatTimeForValue(hour) });
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'confirmed': 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        'cancelled': 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'pending-coach': 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'no-show': 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    };
    return colors[status] || colors.pending;
};
</script>
