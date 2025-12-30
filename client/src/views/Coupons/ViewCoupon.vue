<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Coupon Details">
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="coupon" class="max-w-4xl">
                    <!-- Coupon Header -->
                    <div class="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-500/20 rounded-lg p-6 mb-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                                    <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                        {{ coupon.code.charAt(0).toUpperCase() }}
                                    </span>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                        {{ coupon.code }}
                                    </h2>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        {{ coupon.discount }}% Discount
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span :class="getStatusBadgeClass(coupon)">
                                    {{ getCouponStatus(coupon) }}
                                </span>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Expires: {{ formatDate(coupon.expires) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Coupon Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Coupon Details</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Code:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ coupon.code }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Discount:</span>
                                    <span class="font-medium text-brand-600 dark:text-brand-400">{{ coupon.discount }}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Expiration Date:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDate(coupon.expires) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span :class="getStatusTextClass(coupon)">
                                        {{ getCouponStatus(coupon) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Usage Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(coupon.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(coupon.updatedAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Coupon ID:</span>
                                    <span class="font-mono text-sm text-gray-500 dark:text-gray-400">{{ coupon._id }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Expiry Warning -->
                    <div v-if="isExpiringSoon(coupon)" class="mt-6 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-4">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            <div>
                                <p class="text-yellow-800 dark:text-yellow-400 font-medium">Expiry Warning</p>
                                <p class="text-yellow-600 dark:text-yellow-500 text-sm">This coupon expires within the next 7 days.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-6 flex gap-4">
                        <button 
                            @click="editCoupon"
                            class="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Edit Coupon
                        </button>
                        <button 
                            @click="deleteCoupon"
                            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Delete Coupon
                        </button>
                        <button 
                            @click="goBack"
                            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
                
                <div v-else class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">Coupon not found</p>
                    <button 
                        @click="goBack"
                        class="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Back to Coupons
                    </button>
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { CouponsAPI } from "@/api/CouponsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const couponId = ref(route.params.id);
const coupon = ref(null);
const loading = ref(true);

const pageTitle = ref('View Coupon');

// Load coupon data
const loadCouponData = async () => {
    try {
        const response = await CouponsAPI.getCoupon(couponId.value, authStore.token);
        coupon.value = response.data.data.coupon;
        pageTitle.value = `Coupon: ${coupon.value.code}`;
    } catch (error) {
        console.error('Error loading coupon:', error);
    } finally {
        loading.value = false;
    }
};

// Utility functions
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
};

const getCouponStatus = (coupon) => {
    const now = new Date();
    const expires = new Date(coupon.expires);
    
    if (expires < now) {
        return 'Expired';
    }
    return 'Active';
};

const getStatusBadgeClass = (coupon) => {
    const status = getCouponStatus(coupon);
    return status === 'Active' 
        ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500 rounded-full px-3 py-1 text-sm font-medium'
        : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500 rounded-full px-3 py-1 text-sm font-medium';
};

const getStatusTextClass = (coupon) => {
    const status = getCouponStatus(coupon);
    return status === 'Active' 
        ? 'text-green-700 dark:text-green-400 font-medium'
        : 'text-red-700 dark:text-red-400 font-medium';
};

const isExpiringSoon = (coupon) => {
    const now = new Date();
    const expires = new Date(coupon.expires);
    const daysUntilExpiry = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
};

// Navigation functions
const goBack = () => {
    router.push('/coupons');
};

const editCoupon = () => {
    router.push(`/coupons/edit/${couponId.value}`);
};

const deleteCoupon = async () => {
    if (confirm(`Are you sure you want to delete coupon ${coupon.value.code}?`)) {
        try {
            await CouponsAPI.deleteCoupon(couponId.value, authStore.token);
            router.push('/coupons');
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    }
};

// Load data on mount
onMounted(() => {
    loadCouponData();
});
</script>
  
