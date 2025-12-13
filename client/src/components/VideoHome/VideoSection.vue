<template>
    <div class="space-y-4">
        <!-- Description -->
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ description }}
        </div>

        <!-- Loading State -->
        <div v-if="videoStore.isLoadingVideos" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="videoStore.videosError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to load video: {{ videoStore.videosError.message }}
        </div>
        
        <!-- Video Display -->
        <div v-else-if="currentVideo" class="text-center">
            <div class="max-w-2xl mx-auto mb-4">
                <video 
                    v-if="currentVideo.mediaType === 'video'"
                    :src="videoUrl" 
                    controls 
                    class="w-full max-h-96 rounded-lg shadow-sm bg-black"
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
                <img 
                    v-else
                    :src="videoUrl"
                    :alt="currentVideo.description || 'Home media'"
                    class="w-full max-h-96 rounded-lg shadow-sm object-cover"
                />
            </div>
            
            <!-- Video Info -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 text-left">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">File Name:</span>
                        <p class="text-gray-600 dark:text-gray-400">{{ currentVideo.originalName }}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                        <p class="text-gray-600 dark:text-gray-400">{{ formatFileSize(currentVideo.size) }}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Format:</span>
                        <p class="text-gray-600 dark:text-gray-400">{{ currentVideo.mimetype }}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                        <p class="text-gray-600 dark:text-gray-400 capitalize">{{ currentVideo.mediaType }}</p>
                    </div>
                    <div v-if="currentVideo.mediaType === 'video' && currentVideo.resolution">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Resolution:</span>
                        <p class="text-gray-600 dark:text-gray-400">
                            {{ currentVideo.resolution.width || 0 }}x{{ currentVideo.resolution.height || 0 }}
                        </p>
                    </div>
                    <div v-if="currentVideo.mediaType === 'video'">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                        <p class="text-gray-600 dark:text-gray-400">{{ formatDuration(currentVideo.duration) }}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <p class="text-gray-600 dark:text-gray-400">
                            <span :class="currentVideo.isActive ? 'text-green-600' : 'text-red-600'">
                                {{ currentVideo.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </p>
                    </div>
                </div>
                <div v-if="currentVideo.description" class="mt-4">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">{{ currentVideo.description }}</p>
                </div>
            </div>
            
            <div class="flex justify-center gap-2">
                <button 
                    @click="openEditModal" 
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                >
                    Edit Info
                </button>
                <button 
                    @click="handleDelete" 
                    :disabled="videoStore.isDeletingVideo"
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                    <span v-if="!videoStore.isDeletingVideo">Delete {{ currentVideo.mediaType }}</span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                    </span>
                </button>
            </div>
        </div>
        
        <!-- No Video State -->
        <div v-else class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>No {{ sectionName }} media uploaded yet</p>
        </div>

        <!-- Upload Section -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-md font-medium text-gray-800 dark:text-white mb-4">
                Upload New {{ sectionName === 'hero' ? 'Hero' : 'Second' }} Media
            </h4>
            
            <form @submit.prevent="handleUpload" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Media File
                    </label>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="video/*,image/*"
                        @change="handleFileChange"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Supported formats: Videos (MP4, AVI, MOV, WebM, MKV) or Images (JPEG, PNG, GIF, WebP). Max size: 500MB.
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        v-model="uploadForm.description"
                        rows="3"
                        maxlength="500"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter media description..."
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-1">{{ uploadForm.description?.length || 0 }}/500 characters</p>
                </div>
                
                <div class="flex gap-2">
                    <button
                        type="submit"
                        :disabled="!uploadForm.file || videoStore.isUploadingVideo"
                        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                    >
                        <span v-if="!videoStore.isUploadingVideo">Upload Media</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </span>
                    </button>
                    <button
                        type="button"
                        @click="resetUploadForm"
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Edit {{ sectionName === 'hero' ? 'Hero' : 'Second' }} Media Information
                </h3>
                
                <form @submit.prevent="handleUpdateInfo">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                v-model="editForm.description"
                                rows="3"
                                maxlength="500"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter media description..."
                            ></textarea>
                            <p class="text-xs text-gray-500 mt-1">{{ editForm.description?.length || 0 }}/500 characters</p>
                        </div>
                        
                        <div class="flex items-center">
                            <input
                                v-model="editForm.isActive"
                                type="checkbox"
                                id="isActive"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            >
                            <label for="isActive" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Media is active
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            @click="showEditModal = false"
                            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            :disabled="videoStore.isUpdatingVideo"
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <span v-if="!videoStore.isUpdatingVideo">Update</span>
                            <span v-else class="flex items-center gap-2">
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    sectionName: {
        type: String,
        required: true,
        validator: (value) => ['hero', 'second'].includes(value)
    },
    videoStore: {
        type: Object,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
})

// Refs
const fileInput = ref(null)
const showEditModal = ref(false)

// Form data
const uploadForm = ref({
    file: null,
    description: ''
})

const editForm = ref({
    description: '',
    isActive: true
})

// Computed
const currentVideo = computed(() => {
    return props.videoStore.getVideoInfo(props.sectionName)
})

const videoUrl = computed(() => {
    if (currentVideo.value) {
        return props.videoStore.getVideoUrl(props.sectionName)
    }
    return null
})

// Methods
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        uploadForm.value.file = file
    }
}

const handleUpload = async () => {
    if (!uploadForm.value.file) return

    try {
        await props.videoStore.uploadVideo(
            props.sectionName,
            uploadForm.value.file,
            uploadForm.value.description
        )
        resetUploadForm()
    } catch (error) {
        console.error('Upload error:', error)
    }
}

const handleDelete = async () => {
    const mediaType = currentVideo.value?.mediaType || 'media'
    if (!confirm(`Are you sure you want to delete the current ${props.sectionName} ${mediaType}?`)) {
        return
    }

    try {
        await props.videoStore.deleteVideo(props.sectionName)
    } catch (error) {
        console.error('Delete error:', error)
    }
}

const handleUpdateInfo = async () => {
    try {
        await props.videoStore.updateVideoInfo(
            props.sectionName,
            editForm.value.description,
            editForm.value.isActive
        )
        showEditModal.value = false
    } catch (error) {
        console.error('Update error:', error)
    }
}

const openEditModal = () => {
    if (currentVideo.value) {
        editForm.value = {
            description: currentVideo.value.description || '',
            isActive: currentVideo.value.isActive
        }
    }
    showEditModal.value = true
}

const resetUploadForm = () => {
    uploadForm.value = {
        file: null,
        description: ''
    }
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Utility functions
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
}
</script>
