<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Sport Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="sport" class="space-y-6">
                    <!-- Sport Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                                <img v-if="sport.icon" :src="sport.icon" alt="Sport Icon" class="w-full h-full object-cover" />
                                <span v-else class="text-xs text-gray-500">No Icon</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ sport.name }}</h2>
                                <p class="text-gray-600 dark:text-gray-400">ID: {{ sport.id }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="deleteSport"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Delete Sport
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Sports
                            </button>
                        </div>
                    </div>

                    <!-- Sport Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sport Info</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ sport.name }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Icon URL:</span>
                                    <a v-if="sport.icon" :href="sport.icon" target="_blank" class="text-brand-600 hover:underline truncate max-w-[200px]">{{ sport.icon }}</a>
                                    <span v-else class="text-gray-500">N/A</span>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Description</h3>
                            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ sport.description || 'No description provided.' }}</p>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(sport.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(sport.updatedAt) }}</span>
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
import { SportsAPI } from "@/api/SportsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const sport = ref(null);
const sportId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Sport Details");

// Utility functions
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

// Navigation functions
const goBack = () => {
    router.push('/sports');
};

const deleteSport = async () => {
    if (confirm('Are you sure you want to delete this sport?')) {
        try {
            await SportsAPI.deleteSport(sportId.value);
            router.push('/sports');
        } catch (err) {
            console.error('Error deleting sport:', err);
            alert('Failed to delete sport');
        }
    }
};

// Load sport data
const loadSportData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await SportsAPI.getSport(sportId.value);
        sport.value = response.data.data || response.data;
        pageTitle.value = `${sport.value.name} - Details`;
    } catch (err) {
        error.value = "Failed to load sport data. Please try again.";
        console.error("Error loading sport:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadSportData();
});
</script>
