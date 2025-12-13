<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Coach Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="coach" class="space-y-6">
                    <!-- Coach Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center overflow-hidden">
                                <img v-if="coach.User?.avatar" :src="coach.User.avatar" alt="Avatar" class="w-full h-full object-cover" />
                                <span v-else class="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                    {{ getInitials(coach.User?.name || 'Unknown') }}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ coach.User?.name || 'Unknown Coach' }}</h2>
                                <p class="text-gray-600 dark:text-gray-400">{{ coach.User?.email }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="editCoach"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Edit Coach
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Coaches
                            </button>
                        </div>
                    </div>

                    <!-- Coach Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ coach.User?.name }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Email:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ coach.User?.email }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Phone:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ coach.User?.phone || 'N/A' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Rating:</span>
                                    <span class="font-medium text-yellow-500">★ {{ coach.rating?.toFixed(1) || '0.0' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bio -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Biography</h3>
                            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ coach.bio || 'No biography available.' }}</p>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(coach.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(coach.updatedAt) }}</span>
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
import { CoachesAPI } from "@/api/CoachesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const coach = ref(null);
const coachId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Coach Details");

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
    router.push('/coaches');
};

const editCoach = () => {
    router.push(`/coaches/edit/${coachId.value}`);
};

// Load coach data
const loadCoachData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await CoachesAPI.getCoach(coachId.value);
        coach.value = response.data.data || response.data;
        pageTitle.value = `${coach.value.User?.name || 'Coach'} - Details`;
    } catch (err) {
        error.value = "Failed to load coach data. Please try again.";
        console.error("Error loading coach:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadCoachData();
});
</script>
