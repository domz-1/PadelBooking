<template>
    <div class="space-y-5 sm:space-y-6">
        <ComponentCard title="Bookings Management">
            <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <HugeiconsIcon :icon="Calendar03Icon" :size="24" class="text-brand-500" />
                    All Bookings
                </h3>
                <div class="flex gap-3 w-full sm:w-auto">
                    <button 
                        v-if="isAdmin"
                        @click="copyFreeSlots"
                        :disabled="isCopying"
                        class="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        <span v-if="isCopying" class="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></span>
                        <HugeiconsIcon v-else :icon="Copy01Icon" :size="18" />
                        <span>{{ isCopying ? 'Copying...' : 'Copy Free Slots' }}</span>
                    </button>
                    <button 
                        v-if="isAdmin"
                        @click="goToAddBooking"
                        class="flex-1 sm:flex-none px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
                    >
                        <HugeiconsIcon :icon="PlusSignIcon" :size="18" />
                        <span>Add Booking</span>
                    </button>
                </div>
            </div>

            <!-- Controls: Search, Date, View Toggle -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <!-- Left Side: Search & Date -->
                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div class="relative w-full sm:w-64">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search bookings..."
                            class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <div class="absolute left-3 top-2.5 text-gray-400">
                            <HugeiconsIcon :icon="Search01Icon" :size="20" />
                        </div>
                    </div>
                    
                    <div v-if="viewMode === 'grid'" class="w-full sm:w-auto">
                        <flat-pickr
                            v-model="selectedDate"
                            :config="{ altInput: true, altFormat: 'F j, Y', dateFormat: 'Y-m-d' }"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                <!-- Right Side: View Toggle -->
                <div v-if="isAdmin" class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button 
                        @click="viewMode = 'grid'"
                        :class="[
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                            viewMode === 'grid' 
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        ]"
                    >
                        <HugeiconsIcon :icon="GridViewIcon" :size="16" />
                        Day View
                    </button>
                    <button 
                        @click="viewMode = 'list'"
                        :class="[
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                            viewMode === 'list' 
                                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        ]"
                    >
                        <HugeiconsIcon :icon="ListViewIcon" :size="16" />
                        List View
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>

            <!-- Data Display -->
            <BookingGrid 
                v-if="viewMode === 'grid' && !loading"
                :bookings="bookings"
                :venues="venues"
                :date="selectedDate"
                :is-public="!isAdmin"
                @view-booking="handleView"
                @create-booking="handleCreate"
                @join-waitlist="handleJoinWaitlist"
                :my-waitlist="myWaitlist"
            />

            <DataTable 
                v-else-if="viewMode === 'list' && !loading"
                :columns="columns"
                :data="bookings"
                :showActions="true"
                :onView="handleView"
                :onEdit="handleEdit"
                :onDelete="deleteBooking"
            >
                <template #column-status="{ item }">
                    <span :class="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                    </span>
                </template>
                
                <template #column-user="{ item }">
                    <div>
                        <span class="block font-medium text-gray-800 text-sm dark:text-white/90">
                            {{ item.User?.name || 'Unknown' }}
                        </span>
                        <span class="block text-gray-500 text-xs dark:text-gray-400">
                            {{ item.User?.email }}
                        </span>
                    </div>
                </template>

                <template #column-venue="{ item }">
                    <span class="text-gray-800 dark:text-white text-sm">
                        {{ item.Venue?.name || 'Unknown' }}
                    </span>
                </template>
            </DataTable>

            <!-- Pagination -->
            <Pagination
                v-if="pagination.totalPages > 1"
                :current-page="pagination.currentPage"
                :total-pages="pagination.totalPages"
                :total-documents="pagination.totalDocuments"
                :limit="pagination.limit"
                :has-next-page="pagination.hasNextPage"
                :has-prev-page="pagination.hasPrevPage"
                @page-change="handlePageChange"
            />
        </ComponentCard>

        <!-- Booking Modal -->
        <Modal v-if="showBookingModal" :fullScreenBackdrop="true" @close="showBookingModal = false">
            <template #body>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 relative border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                    <button 
                        @click="showBookingModal = false" 
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                    >
                        <HugeiconsIcon :icon="Cancel01Icon" :size="24" />
                    </button>
                    
                    <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <HugeiconsIcon :icon="PlusSignIcon" :size="24" class="text-brand-500" />
                        New Booking
                    </h3>

                    <BookingForm 
                        :embedded="true"
                        :is-public="!isAdmin"
                        :initial-values="bookingModalData"
                        @success="handleBookingSuccess"
                        @error="handleBookingError"
                        @cancel="showBookingModal = false"
                    />
                </div>
            </template>
        </Modal>

        <!-- Message Modal -->
        <MessageModal
            v-if="showMessageModal"
            :type="messageType"
            :title="messageTitle"
            :message="messageText"
            @close="showMessageModal = false"
        />

        <!-- Booking Details Modal -->
        <BookingDetailsModal
            v-if="showDetailsModal && selectedBooking"
            :booking="selectedBooking"
            @close="showDetailsModal = false"
            @edit="handleEditFromDetails"
            @delete="handleDeleteFromDetails"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { BookingsAPI } from "@/api/BookingsAPI";
import { VenuesAPI } from "@/api/VenuesAPI";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from '@/components/common/Pagination.vue';
import BookingGrid from './BookingGrid.vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { useAuthStore } from "@/stores/AuthStore";
import { HugeiconsIcon } from '@hugeicons/vue';
import Modal from '@/components/ui/Modal.vue';
import MessageModal from '@/components/ui/MessageModal.vue';
import BookingDetailsModal from './BookingDetailsModal.vue';
import BookingForm from './BookingForm.vue';
import { 
    Copy01Icon, 
    PlusSignIcon, 
    Search01Icon, 
    Calendar03Icon,
    GridViewIcon,
    ListViewIcon,
    Cancel01Icon
} from '@hugeicons/core-free-icons';

const props = defineProps<{
    isAdmin: boolean;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const bookings = ref([]);
const venues = ref([]);
const myWaitlist = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const viewMode = ref('grid'); // Default to grid view
const selectedDate = ref((route.query.date as string) || new Date().toISOString().split('T')[0]); // Default to query param or today
const isCopying = ref(false);

const showBookingModal = ref(false);
const bookingModalData = ref<any>(null);

// Details Modal State
const showDetailsModal = ref(false);
const selectedBooking = ref<any>(null);

// Message Modal State
const showMessageModal = ref(false);
const messageType = ref<'success' | 'error'>('success');
const messageTitle = ref('');
const messageText = ref('');

const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    messageType.value = type;
    messageTitle.value = title;
    messageText.value = message;
    showMessageModal.value = true;
};

const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 100 // Higher limit for grid view
});

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'date', title: 'Date', type: 'text' },
    { key: 'startTime', title: 'Start Time', type: 'text' },
    { key: 'endTime', title: 'End Time', type: 'text' },
    { key: 'user', title: 'User', type: 'custom' },
    { key: 'venue', title: 'Venue', type: 'custom' },
    { key: 'status', title: 'Status', type: 'status' },
    { key: 'totalPrice', title: 'Price', type: 'text' },
];

const fetchVenues = async () => {
    try {
        const response = await VenuesAPI.getAllVenues({});
        venues.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching venues:', error);
    }
};

const fetchWaitlist = async () => {
    if (!authStore.isAuthenticated) return;
    try {
        const response = await BookingsAPI.getMyWaitlist();
        if (response.data.success) {
            myWaitlist.value = response.data.data;
        }
    } catch (error) {
        console.error('Error fetching waitlist:', error);
    }
};

const fetchBookings = async () => {
    loading.value = true;
    try {
        const params: any = {
            page: pagination.value.currentPage,
            limit: viewMode.value === 'grid' ? 100 : 10, // Fetch more for grid
        };
        
        if (viewMode.value === 'grid') {
            params.date = selectedDate.value;
        }

        const response = await BookingsAPI.getAllBookings(params);
        const result = response.data;
        
        if (result.success) {
            bookings.value = result.data;
            
            pagination.value = {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalDocuments: result.count,
                limit: params.limit,
                hasNextPage: result.currentPage < result.totalPages,
                hasPrevPage: result.currentPage > 1
            };
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (page: number) => {
    pagination.value.currentPage = page;
    fetchBookings();
};

const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
        'confirmed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
        'pending': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
        'cancelled': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'pending-coach': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500',
        'no-show': 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[status] || classes.pending}`;
};

const goToAddBooking = () => {
    router.push('/bookings/add');
};

const handleCreate = (data: any) => {
    if (!props.isAdmin && !authStore.isAuthenticated) {
        // If public user tries to book, redirect to login
        router.push('/signin');
        return;
    }
    
    if (!props.isAdmin) {
        bookingModalData.value = {
            venueId: data.venueId,
            date: data.date,
            startTime: data.startTime
        };
        showBookingModal.value = true;
        return;
    }

    router.push({
        path: '/bookings/add',
        query: {
            venueId: data.venueId,
            date: data.date,
            startTime: data.startTime
        }
    });
};

const handleBookingSuccess = () => {
    showBookingModal.value = false;
    fetchBookings();
    showMessage('success', 'Booking Created', 'Your booking has been created successfully.');
};

const handleBookingError = (errorMsg: string) => {
    showMessage('error', 'Booking Failed', errorMsg);
};

const handleView = (booking: any) => {
    if (props.isAdmin) {
        router.push(`/bookings/edit/${booking.id}`);
    } else {
        // For non-admin, only allow viewing own bookings
        if (authStore.user && booking.userId === authStore.user.id) {
             selectedBooking.value = booking;
             showDetailsModal.value = true;
        }
    }
};

const handleEditFromDetails = (booking: any) => {
    showDetailsModal.value = false;
    bookingModalData.value = { ...booking }; // Pass full booking object for editing
    showBookingModal.value = true;
};

const handleDeleteFromDetails = async (booking: any) => {
    if (confirm('Are you sure you want to delete this booking?')) {
        try {
            await BookingsAPI.deleteBooking(booking.id);
            showDetailsModal.value = false;
            fetchBookings();
            showMessage('success', 'Booking Deleted', 'The booking has been deleted successfully.');
        } catch (error) {
            console.error('Error deleting booking:', error);
            showMessage('error', 'Error', 'Failed to delete booking.');
        }
    }
};

const handleEdit = (booking: any) => {
    router.push(`/bookings/edit/${booking.id}`);
};

const deleteBooking = async (item: any) => {
    if (confirm('Are you sure you want to delete this booking?')) {
        try {
            await BookingsAPI.deleteBooking(item.id);
            fetchBookings();
            showMessage('success', 'Booking Deleted', 'The booking has been deleted successfully.');
        } catch (error) {
            console.error('Error deleting booking:', error);
            showMessage('error', 'Error', 'Failed to delete booking.');
        }
    }
};

const handleJoinWaitlist = async (booking: any) => {
    if (!authStore.isAuthenticated) {
        router.push('/signin');
        return;
    }

    if (confirm(`Do you want to join the waitlist for this slot? (${booking.startTime} - ${booking.endTime})`)) {
        try {
            await BookingsAPI.joinWaitlist({
                venueId: booking.venueId,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            });
            showMessage('success', 'Joined Waitlist', 'You have been added to the waitlist. You will be notified if this slot becomes available.');
        } catch (error: any) {
            console.error('Error joining waitlist:', error);
            const msg = error.response?.data?.message || 'Failed to join waitlist.';
            showMessage('error', 'Error', msg);
        }
    }
};

const isVenueFree = (venueId: number, hour: number, bookingsList: any[]) => {
    return !bookingsList.some(b => {
        if (b.venueId !== venueId) return false;
        // Treat cancelled as free? usually yes.
        if (b.status === 'cancelled') return false;

        const [startHour] = b.startTime.split(':').map(Number);
        const [endHour] = b.endTime.split(':').map(Number);
        
        // Check if current hour is within the booking range [start, end)
        return hour >= startHour && hour < endHour;
    });
};

const copyFreeSlots = async () => {
    isCopying.value = true;
    try {
        // 1. Calculate dates
        const todayStr = selectedDate.value;
        const todayDate = new Date(todayStr);
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

        // 2. Fetch bookings
        // We need to fetch ALL bookings for these days, so we use a high limit
        const [todayRes, tomorrowRes] = await Promise.all([
            BookingsAPI.getAllBookings({ date: todayStr, limit: 1000 }),
            BookingsAPI.getAllBookings({ date: tomorrowStr, limit: 1000 })
        ]);

        const bookingsToday = todayRes.data.data || [];
        const bookingsTomorrow = tomorrowRes.data.data || [];

        let clipboardText = `📅 Free Slots for ${todayStr}\n\n`;

        // 3. Day Schedule (08:00 - 23:00)
        clipboardText += `☀️ Day Schedule (08:00 - 23:00)\n`;
        for (let h = 8; h < 23; h++) {
            const freeVenues = venues.value.filter((v: any) => isVenueFree(v.id, h, bookingsToday));
            if (freeVenues.length > 0) {
                const timeStr = `${h.toString().padStart(2, '0')}:00`;
                const venueNames = freeVenues.map((v: any) => v.name).join(', ');
                clipboardText += `${timeStr} - ${venueNames}\n`;
            }
        }

        clipboardText += `\n🌙 Night Shift (17:00 Today - 05:00 Tomorrow)\n`;
        
        // Night Part 1: Today 17:00 - 23:59 (using 24 as upper bound for loop)
        for (let h = 17; h < 24; h++) {
            const freeVenues = venues.value.filter((v: any) => isVenueFree(v.id, h, bookingsToday));
            if (freeVenues.length > 0) {
                const timeStr = `${h.toString().padStart(2, '0')}:00`;
                const venueNames = freeVenues.map((v: any) => v.name).join(', ');
                clipboardText += `${timeStr} - ${venueNames}\n`;
            }
        }

        // Tomorrow 00:00 - 05:00
        for (let h = 0; h < 5; h++) {
             const freeVenues = venues.value.filter((v: any) => isVenueFree(v.id, h, bookingsTomorrow));
            if (freeVenues.length > 0) {
                const timeStr = `${h.toString().padStart(2, '0')}:00`;
                const venueNames = freeVenues.map((v: any) => v.name).join(', ');
                clipboardText += `${timeStr} (+1) - ${venueNames}\n`;
            }
        }

        await navigator.clipboard.writeText(clipboardText);
        showMessage('success', 'Copied!', 'Free slots copied to clipboard.');

    } catch (error) {
        console.error('Error copying free slots:', error);
        showMessage('error', 'Error', 'Failed to copy free slots.');
    } finally {
        isCopying.value = false;
    }
};

let searchTimeout: any;
watch(searchQuery, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        pagination.value.currentPage = 1;
        fetchBookings();
    }, 500);
});

watch([viewMode, selectedDate], () => {
    pagination.value.currentPage = 1;
    fetchBookings();
});

onMounted(() => {
    fetchVenues();
    fetchBookings();
    fetchWaitlist();
});
</script>
