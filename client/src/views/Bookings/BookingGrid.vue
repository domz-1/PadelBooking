<template>
    <div class="overflow-x-auto">
        <div class="min-w-[800px]">
            <!-- Header Row: Venues -->
            <div class="grid grid-cols-[100px_repeat(auto-fit,minmax(150px,1fr))] gap-1 mb-1">
                <div class="h-12 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                    Time
                </div>
                <div v-for="venue in venues" :key="venue.id" 
                    class="h-12 flex items-center justify-center font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 rounded px-2 text-center text-sm">
                    {{ venue.name }}
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
                    class="h-20 relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    
                    <!-- Booking Slot -->
                    <div 
                        v-if="getBooking(venue.id, hour)"
                        @click="$emit('view-booking', getBooking(venue.id, hour))"
                        class="w-full h-full rounded-md p-1 text-xs cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]"
                        :class="[
                            !getBooking(venue.id, hour).Category?.color ? getStatusColor(getBooking(venue.id, hour).status) : 'text-white'
                        ]"
                        :style="getBooking(venue.id, hour).Category?.color ? { backgroundColor: getBooking(venue.id, hour).Category.color } : {}"
                    >
                        <div v-if="isStartOfBooking(getBooking(venue.id, hour), hour)">
                            <div class="font-bold truncate">{{ getBooking(venue.id, hour).User?.name || 'Unknown' }}</div>
                            <div class="truncate opacity-90">{{ getBooking(venue.id, hour).type }}</div>
                        </div>
                    </div>
                    
                    <!-- Empty Slot -->
                    <div 
                        v-else 
                        @click="$emit('create-booking', { venueId: venue.id, date: date, startTime: formatTimeForValue(hour) })"
                        class="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                    >
                        <span class="text-xs text-gray-400">+ Book</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">


const props = defineProps<{
    bookings: any[];
    venues: any[];
    date: string;
}>();

defineEmits(['view-booking', 'create-booking']);

// Generate hours from 8 AM to 11 PM (23:00)
const hours = Array.from({ length: 16 }, (_, i) => i + 8);

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
