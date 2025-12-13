<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="User Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="user" class="space-y-6">
                    <!-- User Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                                <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    {{ getInitials(user.name) }}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ user.name }}</h2>
                                <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="editUser"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Edit User
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Users
                            </button>
                        </div>
                    </div>

                    <!-- User Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Full Name:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ user.name }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Email:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ user.email }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Phone:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ user.phone }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Role:</span>
                                    <span :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Account Status -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Status</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span :class="getStatusBadgeClass(user.isActive)">
                                        {{ user.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Email Verified:</span>
                                    <span :class="user.verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                        {{ user.verified ? 'Yes' : 'No' }}
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Blocked:</span>
                                    <span :class="user.blocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                                        {{ user.blocked ? 'Yes' : 'No' }}
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Verification Method:</span>
                                    <span class="font-medium text-gray-800 dark:text-white capitalize">{{ user.verificationMethod || 'None' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDate(user.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDate(user.updatedAt) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">User ID:</span>
                                    <span class="font-mono text-sm text-gray-800 dark:text-white">{{ user._id }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Wishlist Items:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ user.wishlist?.length || 0 }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Addresses Section -->
                    <div v-if="user.addresses && user.addresses.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Addresses</h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div v-for="(address, index) in user.addresses" :key="index" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-medium text-gray-800 dark:text-white">Address {{ index + 1 }}</h4>
                                    <span :class="getAddressTypeBadgeClass(address.type)" class="capitalize">
                                        {{ address.type || 'Home' }}
                                    </span>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div v-if="address.area" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Area:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ getAreaName(address.area) }}</span>
                                    </div>
                                    <div v-if="address.paciNumber" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">PACI Number:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.paciNumber }}</span>
                                    </div>
                                    <div v-if="address.streetName" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Street Name:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.streetName }}</span>
                                    </div>
                                    <div v-if="address.blockNumber" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Block Number:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.blockNumber }}</span>
                                    </div>
                                    <div v-if="address.buildingNumber" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Building Number:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.buildingNumber }}</span>
                                    </div>
                                    <div v-if="address.floor" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Floor:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.floor }}</span>
                                    </div>
                                    <div v-if="address.apartmentNo" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Apartment No.:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.apartmentNo }}</span>
                                    </div>
                                    <div v-if="address.officeNo" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Office No.:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.officeNo }}</span>
                                    </div>
                                    <div v-if="address.additionalInfo" class="pt-2">
                                        <span class="text-gray-600 dark:text-gray-400">Additional Info:</span>
                                        <p class="mt-1 text-gray-800 dark:text-white">{{ address.additionalInfo }}</p>
                                    </div>
                                    <div v-if="address.googleLocationLink" class="pt-2">
                                        <span class="text-gray-600 dark:text-gray-400">Google Location:</span>
                                        <a :href="address.googleLocationLink" target="_blank" 
                                           class="block mt-1 text-brand-500 hover:text-brand-600 underline text-sm">
                                            View on Google Maps
                                        </a>
                                    </div>
                                    
                                    <!-- Legacy fields support -->
                                    <div v-if="address.city && !address.streetName" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">City:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.city }}</span>
                                    </div>
                                    <div v-if="address.street && !address.streetName" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Street:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.street }}</span>
                                    </div>
                                    <div v-if="address.phone" class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Phone:</span>
                                        <span class="font-medium text-gray-800 dark:text-white">{{ address.phone }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Wishlist Section -->
                    <div v-if="user.wishlist && user.wishlist.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Wishlist Items</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="(item, index) in user.wishlist" :key="index" class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                <p class="text-sm font-medium text-gray-800 dark:text-white">{{ item }}</p>
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
import { useAuthStore } from "@/stores/AuthStore";
import { UsersAPI } from "@/api/UsersAPI";
import { kuwaitAreas, getAreaById } from "@/data/kuwaitAreas";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Component state
const loading = ref(false);
const error = ref("");
const user = ref(null);
const userId = ref(route.params.id);

// Computed properties
const pageTitle = ref("User Details");

// Utility functions
const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getRoleBadgeClass = (role) => {
    const classes = {
        'admin': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'user': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[role] || classes.user}`;
};

const getStatusBadgeClass = (isActive) => {
    return isActive 
        ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500 rounded-full px-2 py-0.5 text-theme-xs font-medium'
        : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500 rounded-full px-2 py-0.5 text-theme-xs font-medium';
};

const getAddressTypeBadgeClass = (type) => {
    const classes = {
        'home': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500',
        'building': 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-500',
        'office': 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[type] || classes.home}`;
};

const getAreaName = (areaId) => {
    const area = getAreaById(areaId);
    return area ? area.nameEn : 'Unknown Area';
};

// Navigation functions
const goBack = () => {
    router.push('/users');
};

const editUser = () => {
    router.push(`/users/edit/${userId.value}`);
};

// Load user data
const loadUserData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await UsersAPI.getUser(userId.value, authStore.token);
        user.value = response.data.data.user;
        pageTitle.value = `${user.value.name} - User Details`;
    } catch (err) {
        error.value = "Failed to load user data. Please try again.";
        console.error("Error loading user:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadUserData();
});
</script>