<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="pageTitle">
                <!-- Current Image Display (for edit mode) -->
                <div v-if="isEdit && currentImage" class="mb-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-3">Current Image</h3>
                    <div class="flex items-center space-x-4">
                        <LazyImage
                            :image-id="typeof currentImage === 'string' ? currentImage : currentImage._id"
                            :alt="categoryData?.name?.en || 'Category Image'"
                            width="128px"
                            height="128px"
                            image-class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            placeholder="/placeholder-category.png"
                        />
                        <button
                            @click="deleteCurrentImage"
                            :disabled="loading"
                            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete Image
                        </button>
                    </div>
                </div>
                
                <Form 
                    :fields="formFields"
                    :initialData="initialFormData"
                    :submitButtonText="isEdit ? 'Update Category' : 'Create Category'"
                    :loading="loading"
                    @submit="handleSubmit"
                    @reset="handleReset"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import LazyImage from "@/components/LazyImage.vue";
import { CategoriesAPI } from "@/api/CategoriesAPI";
import { ImagesAPI } from "@/api/ImagesAPI";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const categoryData = ref(null);
const currentImage = ref(null);

console.log("[EditCategory] route.params.id:", route.params.id);

const isEdit = computed(() => route.params.id !== 'new');
const pageTitle = computed(() => isEdit.value ? 'Edit Category' : 'Create Category');

console.log("[EditCategory] isEdit:", isEdit.value);
console.log("[EditCategory] pageTitle:", pageTitle.value);

const formFields = [
    {
        key: 'nameEn',
        type: 'text',
        label: 'Name (English)',
        placeholder: 'Enter category name in English',
        required: true,
        validation: {
            minLength: 2,
            maxLength: 50
        }
    },
    {
        key: 'nameAr',
        type: 'text',
        label: 'Name (Arabic)',
        placeholder: 'Enter category name in Arabic',
        required: true,
        validation: {
            minLength: 2,
            maxLength: 50
        }
    },
    {
        key: 'Image',
        type: 'file',
        label: 'Category Image',
        accept: 'image/*',
        required: !isEdit.value
    }
];

const initialFormData = ref({
    nameEn: '',
    nameAr: '',
    Image: null
});

// Function to delete current image
const deleteCurrentImage = async () => {
    if (!currentImage.value || !currentImage.value._id) {
        console.log("[deleteCurrentImage] No image to delete");
        return;
    }
    
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    loading.value = true;
    try {
        console.log("[deleteCurrentImage] deleting image with id:", currentImage.value._id);
        await ImagesAPI.deleteImageById(currentImage.value._id);
        
        // Clear the current image
        currentImage.value = null;
        
        // Update the category to remove the image reference
        const token = localStorage.getItem('token');
        const nameData = {
            en: categoryData.value.name.en,
            ar: categoryData.value.name.ar
        };
        
        // Update category without image
        await CategoriesAPI.updateCategory(route.params.id, nameData, token);
        
        console.log("[deleteCurrentImage] image deleted successfully");
        alert('Image deleted successfully');
    } catch (error) {
        console.error('[deleteCurrentImage] Error deleting image:', error);
        alert('Error deleting image. Please try again.');
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async () => {
    console.log("[fetchCategory] called, isEdit:", isEdit.value);
    if (isEdit.value) {
        try {
            console.log("[fetchCategory] fetching all categories...");
            const response = await CategoriesAPI.getAllCategories();
            console.log("[fetchCategory] response:", response);
            const categories = response.data.data.categories;
            console.log("[fetchCategory] categories array:", categories);
            const category = categories.find(cat => cat._id === route.params.id);
            console.log("[fetchCategory] found category:", category);
            if (category) {
                categoryData.value = category;
                
                // Set current image if it exists
                if (category.Image && category.Image.base64) {
                    currentImage.value = category.Image;
                    console.log("[fetchCategory] currentImage set:", currentImage.value);
                }
                
                initialFormData.value = {
                    nameEn: category.name.en,
                    nameAr: category.name.ar,
                    Image: null // Always null for file inputs, existing image is handled separately
                };
                console.log("[fetchCategory] initialFormData set:", initialFormData.value);
            } else {
                console.warn("[fetchCategory] no category matched the id:", route.params.id);
            }
        } catch (error) {
            console.error('[fetchCategory] Error fetching category:', error);
        }
    }
};

const handleSubmit = async (formData) => {
    console.log("[handleSubmit] called with formData:", formData);
    loading.value = true;
    try {
        const token = localStorage.getItem('token');
        console.log("[handleSubmit] token from localStorage:", token);
        const nameData = {
            en: formData.nameEn,
            ar: formData.nameAr
        };
        console.log("[handleSubmit] nameData:", nameData);

        if (isEdit.value) {
            console.log("[handleSubmit] updating category with id:", route.params.id);
            // Only pass Image if a new file was selected
            const imageFile = formData.Image instanceof File ? formData.Image : undefined;
            await CategoriesAPI.updateCategory(
                route.params.id,
                nameData,
                token,
                imageFile
            );
            console.log("[handleSubmit] updateCategory success");
        } else {
            console.log("[handleSubmit] creating new category");
            await CategoriesAPI.createCategory(
                nameData,
                formData.Image,
                token
            );
            console.log("[handleSubmit] createCategory success");
        }
        
        router.push('/categories');
    } catch (error) {
        console.error('[handleSubmit] Error saving category:', error);
        alert('Error saving category. Please try again.');
    } finally {
        loading.value = false;
        console.log("[handleSubmit] loading set to false");
    }
};

const handleReset = () => {
    console.log("[handleReset] called");
    if (isEdit.value && categoryData.value) {
        initialFormData.value = {
            nameEn: categoryData.value.name.en,
            nameAr: categoryData.value.name.ar,
            Image: null // Always null for file inputs, existing image is handled separately
        };
        console.log("[handleReset] reset to categoryData:", initialFormData.value);
    } else {
        initialFormData.value = {
            nameEn: '',
            nameAr: '',
            Image: null
        };
        console.log("[handleReset] reset to empty form:", initialFormData.value);
    }
};

onMounted(() => {
    console.log("[onMounted] component mounted, calling fetchCategory...");
    fetchCategory();
});
</script>
