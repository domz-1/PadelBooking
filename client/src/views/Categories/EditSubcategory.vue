<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="pageTitle">
                <Form 
                    :fields="formFields"
                    :initialData="initialFormData"
                    :submitButtonText="isEdit ? 'Update Subcategory' : 'Create Subcategory'"
                    :loading="loading"
                    @submit="handleSubmit"
                    @reset="handleReset"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import { SubcategoriesAPI } from "@/api/SubcategoriesAPI";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const subcategoryData = ref(null);

const isEdit = computed(() => route.params.id !== 'new');
const pageTitle = computed(() => isEdit.value ? 'Edit Subcategory' : 'Create Subcategory');

// Get category ID from query params or from existing subcategory
const categoryId = computed(() => {
    // For edit mode, first try to get it from the subcategory data
    if (isEdit.value && subcategoryData.value && subcategoryData.value.category) {
        return subcategoryData.value.category;
    }
    // For create mode, get it from query params
    if (!isEdit.value && route.query.category) {
        return route.query.category;
    }
    // Fallback: try to get it from query params even for edit mode
    if (route.query.category) {
        return route.query.category;
    }
    // Last resort: try to get it from route params
    if (route.params.categoryId) {
        return route.params.categoryId;
    }
    return null;
});

const formFields = [
    {
        key: 'nameEn',
        type: 'text',
        label: 'Name (English)',
        placeholder: 'Enter subcategory name in English',
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
        placeholder: 'Enter subcategory name in Arabic',
        required: true,
        validation: {
            minLength: 2,
            maxLength: 50
        }
    }
];

const initialFormData = ref({
    nameEn: '',
    nameAr: ''
});

const fetchSubcategory = async () => {
    if (isEdit.value) {
        try {
            console.log('Fetching subcategory data for subcategory ID:', route.params.id);
            console.log('Using category ID:', categoryId.value);
            
            // First, let's try to get the category ID from the subcategory if we don't have it
            if (!categoryId.value && route.params.id) {
                // We need to get the category ID from somewhere else
                // For now, let's try to fetch all categories and find the subcategory
                const categoriesResponse = await CategoriesAPI.getAllCategories();
                const categories = categoriesResponse.data.data.categories;
                
                for (const cat of categories) {
                    try {
                        const subResponse = await SubcategoriesAPI.getAllSubcategories(cat._id);
                        const subcategories = subResponse.data.data.getAllSubCategories;
                        const foundSub = subcategories.find(sub => sub._id === route.params.id);
                        
                        if (foundSub) {
                            subcategoryData.value = foundSub;
                            initialFormData.value = {
                                nameEn: foundSub.name.en,
                                nameAr: foundSub.name.ar
                            };
                            return;
                        }
                    } catch (err) {
                        console.log(`No subcategories found for category ${cat._id}`);
                    }
                }
                
                console.error('Subcategory not found in any category');
                alert('Subcategory not found');
                router.push('/categories');
                return;
            }
            
            // For editing, we need to fetch the specific subcategory
            // Since the API doesn't have a get single subcategory endpoint,
            // we'll need to get it from the category's subcategories list
            const response = await SubcategoriesAPI.getAllSubcategories(categoryId.value);
            const subcategories = response.data.data.getAllSubCategories;
            const subcategory = subcategories.find(sub => sub._id === route.params.id);
            
            if (subcategory) {
                subcategoryData.value = subcategory;
                initialFormData.value = {
                    nameEn: subcategory.name.en,
                    nameAr: subcategory.name.ar
                };
            } else {
                console.error('Subcategory not found with ID:', route.params.id);
                alert('Subcategory not found');
                router.push(`/categories/view/${categoryId.value}`);
            }
        } catch (error) {
            console.error('[fetchSubcategory] Error fetching subcategory:', error);
            alert('Error loading subcategory data');
            router.push('/categories');
        }
    }
};

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        const token = localStorage.getItem('token');
        const nameData = {
            en: formData.nameEn,
            ar: formData.nameAr
        };

        if (isEdit.value) {
            await SubcategoriesAPI.updateSubcategory(
                categoryId.value,
                route.params.id,
                { name: nameData },
                token
            );
        } else {
            await SubcategoriesAPI.createSubcategory(
                categoryId.value,
                { name: nameData },
                token
            );
        }
        
        // Redirect back to the category view page
        router.push(`/categories/view/${categoryId.value}`);
    } catch (error) {
        console.error('[handleSubmit] Error saving subcategory:', error);
        alert('Error saving subcategory. Please try again.');
    } finally {
        loading.value = false;
    }
};

const handleReset = () => {
    if (isEdit.value && subcategoryData.value) {
        initialFormData.value = {
            nameEn: subcategoryData.value.name.en,
            nameAr: subcategoryData.value.name.ar
        };
    } else {
        initialFormData.value = {
            nameEn: '',
            nameAr: ''
        };
    }
};

onMounted(() => {
    console.log('EditSubcategory mounted - route params:', route.params);
    console.log('EditSubcategory mounted - route query:', route.query);
    console.log('EditSubcategory mounted - isEdit:', isEdit.value);
    console.log('EditSubcategory mounted - categoryId:', categoryId.value);
    
    // For edit mode, we need to fetch the subcategory data first
    if (isEdit.value) {
        fetchSubcategory();
    } else if (!categoryId.value) {
        // For create mode, we must have a category ID
        alert('Category ID is required');
        router.push('/categories');
    }
});

// Watch for changes in categoryId to update form data
watch(categoryId, (newCategoryId) => {
    console.log('CategoryId changed to:', newCategoryId);
    if (isEdit.value && newCategoryId && !subcategoryData.value) {
        // If we now have a category ID but haven't fetched the subcategory yet
        fetchSubcategory();
    }
});
</script>