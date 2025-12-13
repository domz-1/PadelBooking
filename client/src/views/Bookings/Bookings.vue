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

                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
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
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>

                <!-- Data Table -->
                <DataTable 
                    v-else
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
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from '@/components/common/Pagination.vue';

const router = useRouter();
const currentPageTitle = ref("Bookings");
const bookings = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
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

const fetchBookings = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.value.currentPage,
            limit: pagination.value.limit,
            // search: searchQuery.value.trim() || undefined // Add search if supported by API
        };
        
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

const handleView = (booking: any) => {
    router.push(`/bookings/view/${booking.id}`);
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

onMounted(() => {
    fetchBookings();
});
</script>
