<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Sponsor Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="sponsor" class="space-y-6">
                    <!-- Sponsor Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-24 h-16 bg-white dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                <img v-if="sponsor.image" :src="sponsor.image" alt="Sponsor" class="max-w-full max-h-full object-contain" />
                                <span v-else class="text-xs text-gray-500">No Logo</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ sponsor.name }}</h2>
                                <a :href="sponsor.link" target="_blank" class="text-brand-600 hover:underline">{{ sponsor.link }}</a>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="deleteSponsor"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Delete Sponsor
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Sponsors
                            </button>
                        </div>
                    </div>

                    <!-- Sponsor Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sponsor Info</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Name:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ sponsor.name }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span :class="sponsor.isActive ? 'text-green-600 font-medium' : 'text-gray-500'">
                                        {{ sponsor.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Website:</span>
                                    <a :href="sponsor.link" target="_blank" class="text-brand-600 hover:underline truncate max-w-[200px]">{{ sponsor.link }}</a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(sponsor.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(sponsor.updatedAt) }}</span>
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
import { SponsorsAPI } from "@/api/SponsorsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const sponsor = ref(null);
const sponsorId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Sponsor Details");

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
    router.push('/sponsors');
};

const deleteSponsor = async () => {
    if (confirm('Are you sure you want to delete this sponsor?')) {
        try {
            await SponsorsAPI.deleteSponsor(sponsorId.value);
            router.push('/sponsors');
        } catch (err) {
            console.error('Error deleting sponsor:', err);
            alert('Failed to delete sponsor');
        }
    }
};

// Load sponsor data
const loadSponsorData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await SponsorsAPI.getSponsor(sponsorId.value);
        sponsor.value = response.data.data || response.data;
        pageTitle.value = `${sponsor.value.name} - Details`;
    } catch (err) {
        error.value = "Failed to load sponsor data. Please try again.";
        console.error("Error loading sponsor:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadSponsorData();
});
</script>
