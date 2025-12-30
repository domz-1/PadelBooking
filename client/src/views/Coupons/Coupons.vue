<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Coupon Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                        All Coupons ({{ pagination.totalDocuments }})
                    </h3>
                    <button 
                        @click="goToAddCoupon"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Coupon
                    </button>
                </div>
                
                <DataTable 
                    :columns="columns"
                    :data="coupons"
                    :showActions="true"
                    :onView="viewCoupon"
                    :onEdit="editCoupon"
                    :onDelete="deleteCoupon"
                >
                    <!-- Custom slots for specific columns -->
                    <template #column-code="{ item }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center">
                                <span class="text-sm font-medium text-brand-600 dark:text-brand-400">
                                    {{ item.code.charAt(0).toUpperCase() }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {{ item.code }}
                                </span>
                                <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
                                    {{ item.discount }}% OFF
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #column-discount="{ item }">
                        <span class="font-semibold text-brand-600 dark:text-brand-400">
                            {{ item.discount }}%
                        </span>
                    </template>

                    <template #column-expires="{ item }">
                        <span :class="getExpiryClass(item.expires)">
                            {{ formatDate(item.expires) }}
                        </span>
                    </template>

                    <template #column-status="{ item }">
                        <span :class="getStatusBadgeClass(item)">
                            {{ getCouponStatus(item) }}
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { CouponsAPI } from "@/api/CouponsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";

const router = useRouter();
const authStore = useAuthStore();
const currentPageTitle = ref("Coupons");
const coupons = ref([]);
const loading = ref(false);
const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
});

// Table columns configuration
const columns: Column[] = [
    { key: 'code', title: 'Code', type: 'text' },
    { key: 'discount', title: 'Discount', type: 'text' },
    { key: 'expires', title: 'Expires', type: 'text' },
    { key: 'status', title: 'Status', type: 'status' },
    { key: 'createdAt', title: 'Created', type: 'text' }
];

// Get coupons data
const fetchCoupons = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.value.currentPage,
            limit: pagination.value.limit
        };
        
        const token = authStore.token || '';
        const response = await CouponsAPI.getAllCoupons(token, params);
        
        if (response.data?.data) {
            const couponsList = response.data.data.coupons || [];
            coupons.value = couponsList.map((coupon: any) => ({
                ...coupon,
                createdAt: formatDate(coupon.createdAt),
                expires: coupon.expires
            }));
            
            // Update pagination info
            if (response.data.data.pagination) {
                pagination.value = {
                    ...response.data.data.pagination
                };
            }
        }
    } catch (error) {
        console.error('Error fetching coupons:', error);
        coupons.value = [];
    } finally {
        loading.value = false;
    }
};

// Handle page change
const handlePageChange = (page: number) => {
    pagination.value.currentPage = page;
    fetchCoupons();
};

// Utility functions
const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
};

const getCouponStatus = (coupon: any) => {
    const now = new Date();
    const expires = new Date(coupon.expires);
    
    if (expires < now) {
        return 'Expired';
    }
    return 'Active';
};

const getStatusBadgeClass = (coupon: any) => {
    const status = getCouponStatus(coupon);
    return status === 'Active' 
        ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500 rounded-full px-2 py-0.5 text-theme-xs font-medium'
        : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500 rounded-full px-2 py-0.5 text-theme-xs font-medium';
};

const getExpiryClass = (expiryDate: string | Date) => {
    const now = new Date();
    const expires = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'text-red-600 dark:text-red-400 font-medium';
    } else if (daysUntilExpiry <= 7) {
        return 'text-yellow-600 dark:text-yellow-400 font-medium';
    }
    return 'text-gray-500 dark:text-gray-400';
};

// Navigation functions
const goToAddCoupon = () => {
    router.push('/coupons/edit/new');
};

const viewCoupon = (coupon: any) => {
    router.push(`/coupons/view/${coupon._id}`);
};

const editCoupon = (coupon: any) => {
    router.push(`/coupons/edit/${coupon._id}`);
};

const deleteCoupon = async (coupon: any) => {
    if (confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
        try {
            const token = authStore.token || '';
            await CouponsAPI.deleteCoupon(coupon._id, token);
            await fetchCoupons(); // Refresh the list
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    }
};

// Load data on mount
onMounted(() => {
    fetchCoupons();
});
</script>
  
