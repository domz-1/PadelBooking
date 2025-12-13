<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Stories Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Stories</h3>
                    <button 
                        @click="goToAddStory"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Story
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>

                <!-- Data Table -->
                <DataTable 
                    v-else
                    :columns="columns"
                    :data="stories"
                    :showActions="false"
                >
                    <template #column-mediaUrl="{ item }">
                        <div class="w-16 h-16 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                            <img v-if="item.type === 'image'" :src="item.mediaUrl" alt="Story" class="w-full h-full object-cover" />
                            <video v-else :src="item.mediaUrl" class="w-full h-full object-cover"></video>
                        </div>
                    </template>

                    <template #column-expiresAt="{ item }">
                        <span>
                            {{ new Date(item.expiresAt).toLocaleString() }}
                        </span>
                    </template>
                </DataTable>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { StoriesAPI } from "@/api/StoriesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Stories");
const stories = ref([]);
const loading = ref(false);

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'mediaUrl', title: 'Media', type: 'custom' },
    { key: 'type', title: 'Type', type: 'text' },
    { key: 'expiresAt', title: 'Expires At', type: 'custom' },
];

const fetchStories = async () => {
    loading.value = true;
    try {
        const response = await StoriesAPI.getAllStories({});
        stories.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching stories:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddStory = () => {
    router.push('/stories/add');
};

onMounted(() => {
    fetchStories();
});
</script>
