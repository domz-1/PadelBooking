<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Story Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
                
                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>
                
                <div v-else-if="story" class="space-y-6">
                    <!-- Story Header -->
                    <div class="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                                <img v-if="story.type === 'image'" :src="story.mediaUrl" alt="Story" class="w-full h-full object-cover" />
                                <video v-else :src="story.mediaUrl" class="w-full h-full object-cover"></video>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Story Details</h2>
                                <p class="text-gray-600 dark:text-gray-400">ID: {{ story.id }}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                @click="deleteStory"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Delete Story
                            </button>
                            <button 
                                @click="goBack"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Back to Stories
                            </button>
                        </div>
                    </div>

                    <!-- Story Information Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Information -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Story Info</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span class="font-medium text-gray-800 dark:text-white capitalize">{{ story.type }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Expires At:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(story.expiresAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Caption:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ story.caption || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Media Preview -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Media Preview</h3>
                            <div class="rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-64">
                                <img v-if="story.type === 'image'" :src="story.mediaUrl" alt="Story Media" class="max-w-full max-h-full object-contain" />
                                <video v-else :src="story.mediaUrl" controls class="max-w-full max-h-full"></video>
                            </div>
                        </div>
                        
                        <!-- Timestamps -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timestamps</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Created:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(story.createdAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span class="font-medium text-gray-800 dark:text-white">{{ formatDateTime(story.updatedAt) }}</span>
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
import { StoriesAPI } from "@/api/StoriesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

const route = useRoute();
const router = useRouter();

// Component state
const loading = ref(false);
const error = ref("");
const story = ref(null);
const storyId = ref(route.params.id);

// Computed properties
const pageTitle = ref("Story Details");

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
    router.push('/stories');
};

const deleteStory = async () => {
    if (confirm('Are you sure you want to delete this story?')) {
        try {
            await StoriesAPI.deleteStory(storyId.value);
            router.push('/stories');
        } catch (err) {
            console.error('Error deleting story:', err);
            alert('Failed to delete story');
        }
    }
};

// Load story data
const loadStoryData = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await StoriesAPI.getStory(storyId.value);
        story.value = response.data.data || response.data;
    } catch (err) {
        error.value = "Failed to load story data. Please try again.";
        console.error("Error loading story:", err);
    } finally {
        loading.value = false;
    }
};

// Load data on mount
onMounted(() => {
    loadStoryData();
});
</script>
