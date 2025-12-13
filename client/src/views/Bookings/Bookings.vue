<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Bookings Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Bookings</h3>
                    <button 
                        @click="goToAddBooking"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Booking
                    </button>
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
                            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
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
                    <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                            @click="viewMode = 'grid'"
                            :class="[
                                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                viewMode === 'grid' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            ]"
                        >
                            Day View
                        </button>
                        <button 
                            @click="viewMode = 'list'"
                            :class="[
                                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                viewMode === 'list' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            ]"
                        >
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
                    @view-booking="handleView"
                    @create-booking="handleCreate"
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
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { BookingsAPI } from "@/api/BookingsAPI";
import { VenuesAPI } from "@/api/VenuesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from '@/components/common/Pagination.vue';
import BookingGrid from './BookingGrid.vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

import { useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const currentPageTitle = ref("Bookings");
const bookings = ref([]);
const venues = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const viewMode = ref('grid'); // Default to grid view
const selectedDate = ref((route.query.date as string) || new Date().toISOString().split('T')[0]); // Default to query param or today

// Update URL when date changes
watch(selectedDate, (newDate) => {
    router.replace({
        query: {
            ...route.query,
            date: newDate
        }
    });
});

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
    router.push({
        path: '/bookings/add',
        query: {
            venueId: data.venueId,
            date: data.date,
            startTime: data.startTime
        }
    });
};

const handleView = (booking: any) => {
    router.push(`/bookings/edit/${booking.id}`);
};

const handleEdit = (booking: any) => {
    router.push(`/bookings/edit/${booking.id}`);
};

const deleteBooking = async (item: any) => {
    if (confirm('Are you sure you want to delete this booking?')) {
        try {
            await BookingsAPI.deleteBooking(item.id);
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Failed to delete booking');
        }
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
});
</script>
