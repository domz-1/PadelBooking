<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Coaches Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Coaches</h3>
                    <button 
                        @click="goToAddCoach"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Coach
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
                    :data="coaches"
                    :showActions="true"
                    :onView="viewCoach"
                    :onEdit="editCoach"
                    :onDelete="deleteCoach"
                >
                    <template #column-user="{ item }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <img v-if="item.User?.avatar" :src="item.User.avatar" alt="Avatar" class="w-full h-full object-cover" />
                                <span v-else class="flex items-center justify-center w-full h-full text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {{ item.User?.name?.charAt(0) || 'C' }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-medium text-gray-800 text-sm dark:text-white/90">
                                    {{ item.User?.name || 'Unknown' }}
                                </span>
                                <span class="block text-gray-500 text-xs dark:text-gray-400">
                                    {{ item.User?.email }}
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #column-rating="{ item }">
                        <span class="flex items-center text-yellow-500">
                            ★ {{ item.rating?.toFixed(1) || '0.0' }}
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
import { CoachesAPI } from "@/api/CoachesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Coaches");
const coaches = ref([]);
const loading = ref(false);

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'user', title: 'Coach', type: 'custom' },
    { key: 'bio', title: 'Bio', type: 'text' },
    { key: 'rating', title: 'Rating', type: 'custom' },
];

const fetchCoaches = async () => {
    loading.value = true;
    try {
        const response = await CoachesAPI.getAllCoaches({});
        coaches.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching coaches:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddCoach = () => {
    router.push('/coaches/add');
};

const viewCoach = (item: any) => {
    router.push(`/coaches/view/${item.id}`);
};

const editCoach = (item: any) => {
    router.push(`/coaches/edit/${item.id}`);
};

const deleteCoach = async (item: any) => {
    if (confirm('Are you sure you want to delete this coach profile?')) {
        try {
            await CoachesAPI.deleteCoach(item.id);
            fetchCoaches();
        } catch (error) {
            console.error('Error deleting coach:', error);
            alert('Failed to delete coach');
        }
    }
};

onMounted(() => {
    fetchCoaches();
});
</script>
