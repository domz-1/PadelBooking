<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-gray-600">Loading videos...</span>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <h3 class="font-medium">Error loading videos</h3>
            <p class="text-sm mt-1">{{ error }}</p>
            <button @click="loadVideos" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Retry
            </button>
        </div>
        
        <!-- Main Content -->
        <div v-else class="space-y-5 sm:space-y-6">
            <!-- Hero Section Video -->
            <ComponentCard title="Hero Section Video">
                <VideoManagementSection 
                    section-name="hero"
                    :video-data="heroVideo"
                    :is-uploading="uploadingSection === 'hero'"
                    :is-deleting="deletingSection === 'hero'"
                    @upload="handleUpload"
                    @delete="handleDelete"
                    @update-info="handleUpdateInfo"
                />
            </ComponentCard>

            <!-- Second Section Video -->
            <ComponentCard title="Second Section Video">
                <VideoManagementSection 
                    section-name="second"
                    :video-data="secondVideo"
                    :is-uploading="uploadingSection === 'second'"
                    :is-deleting="deletingSection === 'second'"
                    @upload="handleUpload"
                    @delete="handleDelete"
                    @update-info="handleUpdateInfo"
                />
            </ComponentCard>

            <!-- Video Information -->
            <ComponentCard title="Video Management Information">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hero Section</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            {{ heroVideo ? 'Video uploaded' : 'No video uploaded' }}
                        </p>
                        <p v-if="heroVideo" class="text-xs text-gray-500 mt-1">
                            {{ heroVideo.mediaType }} • {{ formatFileSize(heroVideo.size) }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Second Section</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            {{ secondVideo ? 'Video uploaded' : 'No video uploaded' }}
                        </p>
                        <p v-if="secondVideo" class="text-xs text-gray-500 mt-1">
                            {{ secondVideo.mediaType }} • {{ formatFileSize(secondVideo.size) }}
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format Support</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Videos: MP4, AVI, MOV, WebM, MKV<br>
                            Images: JPEG, PNG, GIF, WebP (Max 500MB)
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</h4>
                        <button 
                            @click="loadVideos" 
                            :disabled="isLoading"
                            class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            {{ isLoading ? 'Loading...' : 'Refresh' }}
                        </button>
                    </div>
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import VideoManagementSection from "@/components/VideoHome/VideoManagementSection.vue";
import { VideoHomeAPI } from "@/api/VideoHomeAPI";

const currentPageTitle = ref("Home Video Management");

// State management
const isLoading = ref(false);
const error = ref(null);
const heroVideo = ref(null);
const secondVideo = ref(null);
const uploadingSection = ref(null);
const deletingSection = ref(null);

// Load videos from API
const loadVideos = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Loading videos...');
    const response = await VideoHomeAPI.getAllHomeVideos();
    console.log('Videos loaded successfully:', response.data);
    
    const data = response.data.data;
    heroVideo.value = data.hero;
    secondVideo.value = data.second;
  } catch (err) {
    console.error('Error loading videos:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to load videos';
  } finally {
    isLoading.value = false;
  }
};

// Handle video upload
const handleUpload = async ({ sectionName, file, description }) => {
  uploadingSection.value = sectionName;
  
  try {
    console.log(`Uploading ${sectionName} video...`);
    await VideoHomeAPI.uploadHomeVideo(sectionName, file, description);
    console.log(`${sectionName} video uploaded successfully`);
    
    // Reload videos after upload
    await loadVideos();
  } catch (err) {
    console.error(`Error uploading ${sectionName} video:`, err);
    error.value = err.response?.data?.message || err.message || 'Failed to upload video';
  } finally {
    uploadingSection.value = null;
  }
};

// Handle video deletion
const handleDelete = async (sectionName) => {
  if (!confirm(`Are you sure you want to delete the ${sectionName} video?`)) {
    return;
  }
  
  deletingSection.value = sectionName;
  
  try {
    console.log(`Deleting ${sectionName} video...`);
    await VideoHomeAPI.deleteHomeVideo(sectionName);
    console.log(`${sectionName} video deleted successfully`);
    
    // Reload videos after deletion
    await loadVideos();
  } catch (err) {
    console.error(`Error deleting ${sectionName} video:`, err);
    error.value = err.response?.data?.message || err.message || 'Failed to delete video';
  } finally {
    deletingSection.value = null;
  }
};

// Handle video info update
const handleUpdateInfo = async ({ sectionName, description, isActive }) => {
  try {
    console.log(`Updating ${sectionName} video info...`);
    await VideoHomeAPI.updateHomeVideoInfo(sectionName, description, isActive);
    console.log(`${sectionName} video info updated successfully`);
    
    // Reload videos after update
    await loadVideos();
  } catch (err) {
    console.error(`Error updating ${sectionName} video info:`, err);
    error.value = err.response?.data?.message || err.message || 'Failed to update video info';
  }
};

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Load videos on component mount
onMounted(() => {
  console.log('VideoHome component mounted');
  loadVideos();
});
</script>
