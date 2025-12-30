<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <!-- Current Logo Display -->
            <ComponentCard title="Current Logo">
                <div class="space-y-4">
                    <div v-if="loading" class="flex justify-center items-center py-8">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    </div>
                    
                    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {{ error }}
                    </div>
                    
                    <div v-else-if="currentLogo" class="text-center">
                        <img :src="currentLogo" alt="Current Logo" class="max-w-xs max-h-32 mx-auto mb-4 rounded-lg shadow-sm" />
                        <div class="flex justify-center gap-2">
                            <button 
                                @click="deleteLogo" 
                                :disabled="deleting"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                            >
                                <span v-if="!deleting">Delete Logo</span>
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
                    
                    <div v-else class="text-center py-8 text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>No logo uploaded yet</p>
                    </div>
                </div>
            </ComponentCard>

            <!-- Upload New Logo -->
            <ComponentCard title="Upload New Logo">
                <Form 
                    :fields="uploadFormFields"
                    :initial-data="uploadFormData"
                    submit-button-text="Upload Logo"
                    :show-reset-button="true"
                    :loading="uploading"
                    @submit="handleUpload"
                    @reset="handleReset"
                />
            </ComponentCard>

            <!-- Logo History/Metadata -->
            <ComponentCard title="Logo Information">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                {{ currentLogo ? 'Logo uploaded' : 'No logo uploaded' }}
                            </p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format Support</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                JPG, PNG, GIF, WebP (Max 5MB)
                            </p>
                        </div>
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
import Form from "@/components/forms/Form.vue";
import { ImagesAPI } from "@/api/ImagesAPI";

const currentPageTitle = ref("Logo Management");

// State
const loading = ref(false);
const uploading = ref(false);
const deleting = ref(false);
const error = ref("");
const currentLogo = ref(null);

// Form data
const uploadFormData = ref({
    logo: null
});

// Form fields configuration
const uploadFormFields = [
    {
        key: "logo",
        type: "file",
        label: "Select Logo Image",
        required: true,
        accept: "image/*",
        description: "Upload a logo image (JPG, PNG, GIF, WebP). Maximum file size: 5MB."
    }
];

// Load current logo on mount
onMounted(() => {
    loadCurrentLogo();
});

// Load current logo
const loadCurrentLogo = async () => {
    loading.value = true;
    error.value = "";
    
    try {
        const response = await ImagesAPI.getLogo();
        if (response.data) {
            // Create blob URL for the image
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            currentLogo.value = URL.createObjectURL(blob);
        }
    } catch (err) {
        console.error('Error loading logo:', err);
        // If logo doesn't exist, that's okay - just show empty state
        if (err.response?.status !== 404) {
            error.value = "Failed to load current logo";
        }
    } finally {
        loading.value = false;
    }
};

// Handle logo upload
const handleUpload = async (formData) => {
    if (!formData.logo) {
        error.value = "Please select a logo image";
        return;
    }

    uploading.value = true;
    error.value = "";

    try {
        await ImagesAPI.uploadLogo(formData.logo);
        
        // Reload the current logo
        if (currentLogo.value) {
            URL.revokeObjectURL(currentLogo.value);
        }
        await loadCurrentLogo();
        
        // Reset form
        uploadFormData.value = { logo: null };
        
    } catch (err) {
        console.error('Error uploading logo:', err);
        error.value = err.response?.data?.message || "Failed to upload logo";
    } finally {
        uploading.value = false;
    }
};

// Handle logo deletion
const deleteLogo = async () => {
    if (!confirm("Are you sure you want to delete the current logo?")) {
        return;
    }

    deleting.value = true;
    error.value = "";

    try {
        await ImagesAPI.deleteLogo();
        
        // Clean up the blob URL
        if (currentLogo.value) {
            URL.revokeObjectURL(currentLogo.value);
            currentLogo.value = null;
        }

    } catch (err) {
        console.error('Error deleting logo:', err);
        error.value = err.response?.data?.message || "Failed to delete logo";
    } finally {
        deleting.value = false;
    }
};

// Handle form reset
const handleReset = () => {
    uploadFormData.value = { logo: null };
    error.value = "";
};
</script>
  
