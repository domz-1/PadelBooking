<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Booking Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="booking" class="space-y-6">
                    <!-- Booking Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                                <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    {{ getInitials(booking.holder?.name || 'Unknown') }}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ booking.holder?.name || 'Unknown Holder' }}</h2>
                                <p class="text-gray-600 dark:text-gray-400">{{ booking.holder?.phone || 'No Phone' }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="editBooking"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Edit Booking
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Bookings
                            </button>
                        </div>
                    </div>

                    <!-- Booking Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Date:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDate(booking.date) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Time:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ booking.startTime }} - {{ booking.endTime }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Venue:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ booking.venue?.name || 'Unknown Venue' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span :class="getStatusBadgeClass(booking.status)">{{ booking.status }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span class="font-medium text-gray-800 dark:text-white capitalize">{{ booking.type }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Financial Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Financial Details</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Total Price:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ booking.totalPrice }} KD</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Payment Status:</span>
                                    <span class="font-medium text-gray-800 dark:text-white capitalize">{{ booking.paymentStatus || 'Pending' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div v-if="booking.notes" class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notes</h3>
                            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ booking.notes }}</p>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(booking.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(booking.updatedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { BookingsAPI } from "@/api/BookingsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const booking = ref(null);
const bookingId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Booking Details");

// Utility functions
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusBadgeClass = (status) => {
    const classes = {
        'confirmed': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
        'pending': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-500',
        'cancelled': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'completed': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500',
        'no-show': 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[status] || classes.pending}`;
};

// Navigation functions
const goBack = () => {
    router.push('/bookings');
};

const editBooking = () => {
    router.push(`/bookings/edit/${bookingId.value}`);
};

// Load booking data
const loadBookingData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await BookingsAPI.getBooking(bookingId.value);
        booking.value = response.data.data || response.data;
        pageTitle.value = `Booking #${booking.value.id} - Details`;
    } catch (err) {
        error.value = "Failed to load booking data. Please try again.";
        console.error("Error loading booking:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadBookingData();
});
</script>
