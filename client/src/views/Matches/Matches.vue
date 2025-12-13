<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Matches Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Matches</h3>
                    <button 
                        @click="goToAddMatch"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Create Match
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
                    :data="matches"
                    :showActions="true"
                    :onView="viewMatch"
                    :onEdit="editMatch"
                    :onDelete="deleteMatch"
                >
                    <template #column-status="{ item }">
                        <span :class="getStatusBadgeClass(item.status)">
                            {{ item.status }}
                        </span>
                    </template>

                    <template #column-creator="{ item }">
                        <div>
                            <span class="block font-medium text-gray-800 text-sm dark:text-white/90">
                                {{ item.Creator?.name || 'Unknown' }}
                            </span>
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
import { MatchesAPI } from "@/api/MatchesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Matches");
const matches = ref([]);
const loading = ref(false);

const columns = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'date', title: 'Date', type: 'text' },
    { key: 'startTime', title: 'Start Time', type: 'text' },
    { key: 'endTime', title: 'End Time', type: 'text' },
    { key: 'level', title: 'Level', type: 'text' },
    { key: 'type', title: 'Type', type: 'text' },
    { key: 'status', title: 'Status', type: 'status' },
    { key: 'creator', title: 'Creator', type: 'custom' },
];

const fetchMatches = async () => {
    loading.value = true;
    try {
        const response = await MatchesAPI.getOpenMatches({});
        matches.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching matches:', error);
    } finally {
        loading.value = false;
    }
};

const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
        'open': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500',
        'full': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'cancelled': 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-500',
        'completed': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[status] || classes.open}`;
};

const goToAddMatch = () => {
    router.push('/matches/add');
};

const viewMatch = (item: any) => {
    router.push(`/matches/view/${item.id}`);
};

const editMatch = (item: any) => {
    router.push(`/matches/edit/${item.id}`);
};

const deleteMatch = async (item: any) => {
    if (confirm('Are you sure you want to delete this match?')) {
        try {
            await MatchesAPI.deleteMatch(item.id);
            fetchMatches();
        } catch (error) {
            console.error('Error deleting match:', error);
            alert('Failed to delete match');
        }
    }
};

onMounted(() => {
    fetchMatches();
});
</script>
