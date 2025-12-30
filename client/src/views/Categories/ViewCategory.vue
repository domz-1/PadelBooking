<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <!-- Category Details -->
            <ComponentCard title="Category Details">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span class="ml-2 text-gray-500">Loading category details...</span>
                </div>
                <div v-else-if="!category" class="text-center py-8">
                    <p class="text-red-500 text-lg">Category not found</p>
                    <button @click="handleBack" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">
                        Back to Categories
                    </button>
                </div>
                <div v-else class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Name (English)</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ category.name.en }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Name (Arabic)</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ category.name.ar }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ category.slug }}</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ formatDate(category.createdAt) }}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</h3>
                                <p class="text-lg text-gray-900 dark:text-white">{{ formatDate(category.updatedAt) }}</p>
                            </div>
                            <div v-if="category.Image">
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Image</h3>
                                <LazyImage
                                    :image-id="category.Image"
                                    :alt="category.name.en"
                                    width="128px"
                                    height="128px"
                                    image-class="w-32 h-32 object-cover rounded-lg"
                                    placeholder="/placeholder-category.png"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button @click="handleEdit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                            Edit Category
                        </button>
                        <button @click="handleBack" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">
                            Back to Categories
                        </button>
                    </div>
                </div>
            </ComponentCard>

            <!-- Subcategories -->
            <ComponentCard title="Subcategories">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white">Subcategories List</h3>
                    <button @click="handleAddSubcategory" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">
                        Add Subcategory
                    </button>
                </div>
                <DataTable 
                    :columns="subcategoryColumns" 
                    :data="subcategories" 
                    :showActions="true"
                    :onView="handleViewSubcategory"
                    :onEdit="handleEditSubcategory"
                    :onDelete="handleDeleteSubcategory"
                >
                    <template #column-name="{ item }">
                        <div>
                            <p class="font-medium text-gray-800 dark:text-white">{{ item.name.en }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.name.ar }}</p>
                        </div>
                    </template>
                </DataTable>
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
import LazyImage from "@/components/LazyImage.vue";
import DataTable from "@/components/DataTable.vue";
import { CategoriesAPI } from "@/api/CategoriesAPI";
import { SubcategoriesAPI } from "@/api/SubcategoriesAPI";

const route = useRoute();
const router = useRouter();
const category = ref(null);
const subcategories = ref([]);
const loading = ref(true);

const pageTitle = computed(() => category.value ? `Category: ${category.value.name.en}` : 'Category Details');

const subcategoryColumns = [
    { key: 'name', title: 'Name' },
    { key: 'slug', title: 'Slug' },
    { key: 'createdAt', title: 'Created At' }
];

const fetchCategory = async () => {
    try {
        console.log('Fetching all categories…');
        const response = await CategoriesAPI.getAllCategories();
        console.log('Categories response:', response);

        const categories = response.data.data.categories;
        console.log('Extracted categories array:', categories);

        category.value = categories.find(cat => cat._id === route.params.id);
        console.log('Matched category by _id:', category.value);

        if (category.value) {
            console.log('Category found, fetching subcategories…');
            await fetchSubcategories();
        } else {
            console.warn('No category matched the given route id:', route.params.id);
        }
    } catch (error) {
        console.error('Error fetching category:', error);
    } finally {
        loading.value = false;
    }
};

const fetchSubcategories = async () => {
    try {
        if (!category.value || !category.value._id) {
            console.error('Category or category ID is missing');
            return;
        }
        console.log('Fetching subcategories for categoryId:', category.value._id);
        const response = await SubcategoriesAPI.getAllSubcategories(category.value._id);
        console.log('Subcategories response:', response);
        subcategories.value = response.data.data.subcategories;
        console.log('Mapped subcategories:', subcategories.value);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
    }
};

// Removed getImageUrl - using LazyImage component

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

const handleEdit = () => {
    router.push(`/categories/edit/${category.value._id}`);
};

const handleBack = () => {
    router.push('/categories');
};

const handleAddSubcategory = () => {
    router.push({
        path: '/subcategories/edit/new',
        query: { category: category.value._id }
    });
};

const handleViewSubcategory = (item) => {
    router.push(`/subcategories/view/${item._id}`);
};

const handleEditSubcategory = (item) => {
    router.push({
        path: `/subcategories/edit/${item._id}`,
        query: { category: category.value._id }
    });
};

const handleDeleteSubcategory = async (item) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
        try {
            const token = localStorage.getItem('token');
            await SubcategoriesAPI.deleteSubcategory(category.value._id, item._id, token);
            await fetchSubcategories();
        } catch (error) {
            console.error('Error deleting subcategory:', error);
        }
    }
};

onMounted(() => {
    fetchCategory();
});
</script>
