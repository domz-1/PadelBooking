<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Match Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="match" class="space-y-6">
                    <!-- Match Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                                <span class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    M
                                </span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Match Details</h2>
                                <p class="text-gray-600 dark:text-gray-400">ID: {{ match.id }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="editMatch"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Edit Match
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Matches
                            </button>
                        </div>
                    </div>

                    <!-- Match Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Match Info</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Date:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDate(match.date) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Time:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.startTime }} - {{ match.endTime }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Venue:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.Venue?.name || match.venueId }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span :class="getStatusBadgeClass(match.status)">{{ match.status }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Details</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Level:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.level }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.type }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Max Players:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.maxPlayers }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Creator:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ match.Creator?.name || 'Unknown' }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(match.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(match.updatedAt) }}</span>
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
import { MatchesAPI } from "@/api/MatchesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const match = ref(null);
const matchId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Match Details");

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

const getStatusBadgeClass = (status) => {
    const classes = {
        'open': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
        'full': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'cancelled': 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-500',
        'completed': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    };
    return `rounded-full px-2 py-0.5 text-sm font-medium ${classes[status] || classes.open}`;
};

// Navigation functions
const goBack = () => {
    router.push('/matches');
};

const editMatch = () => {
    router.push(`/matches/edit/${matchId.value}`);
};

// Load match data
const loadMatchData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await MatchesAPI.getMatch(matchId.value);
        match.value = response.data.data || response.data;
    } catch (err) {
        error.value = "Failed to load match data. Please try again.";
        console.error("Error loading match:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadMatchData();
});
</script>
