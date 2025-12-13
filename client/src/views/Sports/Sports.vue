<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Sports Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Sports</h3>
                    <button 
                        @click="goToAddSport"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Sport
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
                    :data="sports"
                    :showActions="true"
                    :onEdit="editSport"
                    :onDelete="deleteSport"
                >
                    <template #column-icon="{ item }">
                        <div class="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <img v-if="item.icon" :src="item.icon" alt="Sport Icon" class="w-full h-full object-cover" />
                            <span v-else class="text-xs text-gray-500">No Icon</span>
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
import { SportsAPI } from "@/api/SportsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Sports");
const sports = ref([]);
const loading = ref(false);

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'icon', title: 'Icon', type: 'custom' },
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'description', title: 'Description', type: 'text' },
];

const fetchSports = async () => {
    loading.value = true;
    try {
        const response = await SportsAPI.getAllSports({});
        sports.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching sports:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddSport = () => {
    router.push('/sports/add');
};

const editSport = (item: any) => {
    router.push(`/sports/edit/${item.id}`);
};

const deleteSport = async (item: any) => {
    if (confirm('Are you sure you want to delete this sport?')) {
        try {
            await SportsAPI.deleteSport(item.id);
            fetchSports();
        } catch (error) {
            console.error('Error deleting sport:', error);
            alert('Failed to delete sport');
        }
    }
};

onMounted(() => {
    fetchSports();
});
</script>
