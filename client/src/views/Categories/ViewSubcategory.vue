<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <!-- Subcategory Details -->
            <ComponentCard title="Subcategory Details">
                <div v-if="subcategory" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Name (English)</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ subcategory.name.en }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Name (Arabic)</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ subcategory.name.ar }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ subcategory.slug }}</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ categoryName }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ formatDate(subcategory.createdAt) }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ formatDate(subcategory.updatedAt) }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button @click="handleEdit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                            Edit Subcategory
                        </button>
                        <button @click="handleBack" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">
                            Back to Category
                        </button>
                    </div>
                </div>
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
import { CategoriesAPI } from "@/api/CategoriesAPI";
import { SubcategoriesAPI } from "@/api/SubcategoriesAPI";

const route = useRoute();
const router = useRouter();
const subcategory = ref(null);
const category = ref(null);

const pageTitle = computed(() => subcategory.value ? `Subcategory: ${subcategory.value.name.en}` : 'Subcategory Details');
const categoryName = computed(() => category.value ? category.value.name.en : 'Loading...');

const fetchSubcategory = async () => {
    try {
        // First, we need to find which category this subcategory belongs to
        // Since we don't have a direct endpoint, we'll fetch all categories and their subcategories
        const categoriesResponse = await CategoriesAPI.getAllCategories();
        const categories = categoriesResponse.data.data.categories;
        
        // Search through all categories to find the subcategory
        for (const cat of categories) {
            const subcategoriesResponse = await SubcategoriesAPI.getAllSubcategories(cat._id);
            const subcategories = subcategoriesResponse.data.data.subcategories;
            
            const foundSubcategory = subcategories.find(sub => sub._id === route.params.id);
            if (foundSubcategory) {
                subcategory.value = foundSubcategory;
                category.value = cat;
                break;
            }
        }
        
        if (!subcategory.value) {
            console.error('Subcategory not found');
            alert('Subcategory not found');
            router.push('/categories');
        }
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        alert('Error fetching subcategory details');
        router.push('/categories');
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

const handleEdit = () => {
    router.push({
        path: `/subcategories/edit/${subcategory.value._id}`,
        query: { category: category.value._id }
    });
};

const handleBack = () => {
    if (category.value) {
        router.push(`/categories/view/${category.value._id}`);
    } else {
        router.push('/categories');
    }
};

onMounted(() => {
    fetchSubcategory();
});
</script>