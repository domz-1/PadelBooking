<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Categories Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white">Categories List</h3>
                    <button @click="handleAddCategory" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        Add Category
                    </button>
                </div>
                <DataTable 
                    :columns="columns" 
                    :data="categories" 
                    :showActions="true"
                    :onView="handleView"
                    :onEdit="handleEdit"
                    :onDelete="handleDelete"
                >
                    <template #column-Image="{ item }">
                        <LazyImage
                            :image-id="item.Image"
                            :alt="item.name.en"
                            width="60px"
                            height="60px"
                            image-class="w-full h-full object-cover rounded-full"
                            placeholder="/placeholder-category.png"
                        />
                    </template>
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import LazyImage from "@/components/LazyImage.vue";
import { CategoriesAPI } from "@/api/CategoriesAPI";

const router = useRouter();
const currentPageTitle = ref("Categories");
const categories = ref([]);

const columns: Column[] = [
    { key: 'Image', title: 'Image', type: 'text', widthClass: 'w-20' },
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'slug', title: 'Slug', type: 'text' },
    { key: 'createdAt', title: 'Created At', type: 'text' }
];

const fetchCategories = async () => {
    try {
        const response = await CategoriesAPI.getAllCategories();
        categories.value = response.data.data.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

// Removed getImageUrl - using LazyImage component with image IDs

const handleAddCategory = () => {
    router.push('/categories/edit/new');
};

const handleView = (item: any) => {
    router.push(`/categories/view/${item._id}`);
};

const handleEdit = (item: any) => {
    router.push(`/categories/edit/${item._id}`);
};

const handleDelete = async (item: any) => {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            const token = localStorage.getItem('token') || '';
            await CategoriesAPI.deleteCategory(item._id, token);
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
};

onMounted(() => {
    fetchCategories();
});
</script>
  
