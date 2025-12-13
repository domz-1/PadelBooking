<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Venue Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="venue" class="space-y-6">
                    <!-- Venue Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                                <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    {{ getInitials(venue.name) }}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ venue.name }}</h2>
                                <p class="text-gray-600 dark:text-gray-400">{{ venue.location }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="editVenue"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Edit Venue
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Venues
                            </button>
                        </div>
                    </div>

                    <!-- Venue Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ venue.name }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Location:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ venue.location }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Price Per Hour:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ venue.pricePerHour }} {{ currency }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Amenities -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Amenities</h3>
                            <div v-if="venue.amenities && venue.amenities.length > 0" class="flex flex-wrap gap-2">
                                <span 
                                    v-for="(amenity, index) in venue.amenities" 
                                    :key="index"
                                    class="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500 rounded-full text-sm font-medium"
                                >
                                    {{ amenity }}
                                </span>
                            </div>
                            <p v-else class="text-gray-500 dark:text-gray-400 italic">No amenities listed</p>
                        </div>

                        <!-- Description -->
                        <div v-if="venue.description" class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Description</h3>
                            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ venue.description }}</p>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(venue.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(venue.updatedAt) }}</span>
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
import { VenuesAPI } from "@/api/VenuesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const venue = ref(null);
const venueId = ref(route.params.id);
const currency = ref("USD"); // Could be fetched from global config

// Computed properties
const pageTitle = ref("Venue Details");

// Utility functions
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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

// Navigation functions
const goBack = () => {
    router.push('/venues');
};

const editVenue = () => {
    router.push(`/venues/edit/${venueId.value}`);
};

// Load venue data
const loadVenueData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await VenuesAPI.getVenue(venueId.value);
        venue.value = response.data.data || response.data;
        pageTitle.value = `${venue.value.name} - Details`;
    } catch (err) {
        error.value = "Failed to load venue data. Please try again.";
        console.error("Error loading venue:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadVenueData();
});
</script>
