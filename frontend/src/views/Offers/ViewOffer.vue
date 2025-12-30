<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Offer Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="offer" class="space-y-6">
                    <!-- Offer Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                <img v-if="offer.image" :src="offer.image" alt="Offer" class="w-full h-full object-cover" />
                                <span v-else class="flex items-center justify-center w-full h-full text-xs text-gray-500">No Img</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ offer.title }}</h2>
                                <p class="text-green-600 font-bold">{{ offer.discountPercentage }}% OFF</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="deleteOffer"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Delete Offer
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Offers
                            </button>
                        </div>
                    </div>

                    <!-- Offer Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Offer Info</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Title:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ offer.title }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Discount:</span>
                                    <span class="font-medium text-green-600">{{ offer.discountPercentage }}%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Valid Until:</span>
                                    <span :class="getExpiryClass(offer.validUntil)">{{ formatDate(offer.validUntil) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Description</h3>
                            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ offer.description }}</p>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(offer.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(offer.updatedAt) }}</span>
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
import { OffersAPI } from "@/api/OffersAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const offer = ref(null);
const offerId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Offer Details");

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getExpiryClass = (dateString) => {
    const now = new Date();
    const expiry = new Date(dateString);
    if (expiry < now) return 'text-red-600 font-bold';
    return 'font-medium text-gray-800 dark:text-white';
};

// Navigation functions
const goBack = () => {
    router.push('/offers');
};

const deleteOffer = async () => {
    if (confirm('Are you sure you want to delete this offer?')) {
        try {
            await OffersAPI.deleteOffer(offerId.value);
            router.push('/offers');
        } catch (err) {
            console.error('Error deleting offer:', err);
            alert('Failed to delete offer');
        }
    }
};

// Load offer data
const loadOfferData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await OffersAPI.getOffer(offerId.value);
        offer.value = response.data.data || response.data;
        pageTitle.value = `${offer.value.title} - Details`;
    } catch (err) {
        error.value = "Failed to load offer data. Please try again.";
        console.error("Error loading offer:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadOfferData();
});
</script>
