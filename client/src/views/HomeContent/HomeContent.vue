<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Home Content Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-800 dark:text-white">Home Content List</h3>
                    <button @click="handleAddHomeContent" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                        Add Home Content
                    </button>
                </div>
                <DataTable 
                    :columns="columns" 
                    :data="homeContentList" 
                    :showActions="true"
                    :onView="handleView"
                    :onEdit="handleEdit"
                    :onDelete="handleDelete"
                >
                    <template #column-isActive="{ item }">
                        <span :class="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                              class="px-2 py-1 rounded-full text-xs font-medium">
                            {{ item.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </template>
                    <template #column-sections="{ item }">
                        <div class="space-y-1">
                            <div v-for="(section, index) in item.sections" :key="index" class="text-sm">
                                <p class="font-medium text-gray-800 dark:text-white">{{ section.title.en }}</p>
                                <p class="text-xs text-gray-500">{{ section.items?.length || 0 }} items</p>
                            </div>
                        </div>
                    </template>
                    <template #column-createdBy="{ item }">
                        <div v-if="item.createdBy">
                            <p class="font-medium text-gray-800 dark:text-white">{{ item.createdBy.name }}</p>
                            <p class="text-sm text-gray-500">{{ item.createdBy.email }}</p>
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
import { HomeContentAPI } from "@/api/HomeContentAPI";

const router = useRouter();
const currentPageTitle = ref("Home Content Management");
const homeContentList = ref([]);

const columns: Column[] = [
    { key: 'isActive', title: 'Status', type: 'custom' },
    { key: 'sections', title: 'Sections', type: 'custom' },
    { key: 'createdBy', title: 'Created By', type: 'custom' },
    { key: 'createdAt', title: 'Created At', type: 'text' },
    { key: 'updatedAt', title: 'Updated At', type: 'text' }
];

const fetchHomeContent = async () => {
    try {
        const response = await HomeContentAPI.getAllHomeContent();
        const content = response.data.data.homeContent || [];
        homeContentList.value = content.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt).toLocaleDateString(),
            updatedAt: new Date(item.updatedAt).toLocaleDateString()
        }));
    } catch (error) {
        console.error('Error fetching home content:', error);
    }
};

const handleAddHomeContent = () => {
    router.push('/admin/home-content/add');
};

const handleView = (item: any) => {
    router.push(`/admin/home-content/view/${item._id}`);
};

const handleEdit = (item: any) => {
    router.push(`/admin/home-content/edit/${item._id}`);
};

const handleDelete = async (item: any) => {
    if (confirm('Are you sure you want to delete this home content?')) {
        try {
            await HomeContentAPI.deleteHomeContent(item._id);
            await fetchHomeContent();
        } catch (error) {
            console.error('Error deleting home content:', error);
            alert('Error deleting home content');
        }
    }
};

onMounted(() => {
    fetchHomeContent();
});
</script>
