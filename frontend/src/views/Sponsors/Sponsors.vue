<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Sponsors Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Sponsors</h3>
                    <button 
                        @click="goToAddSponsor"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Sponsor
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
                    :data="sponsors"
                    :showActions="true"
                    :onView="handleView"
                    :onEdit="editSponsor"
                    :onDelete="deleteSponsor"
                >
                    <template #column-image="{ item }">
                        <div class="w-16 h-10 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                            <img v-if="item.image" :src="item.image" alt="Sponsor" class="w-full h-full object-cover" />
                            <span v-else class="flex items-center justify-center w-full h-full text-xs text-gray-500">No Img</span>
                        </div>
                    </template>

                    <template #column-link="{ item }">
                        <a :href="item.link" target="_blank" class="text-brand-600 hover:underline truncate block max-w-xs">
                            {{ item.link }}
                        </a>
                    </template>

                    <template #column-isActive="{ item }">
                        <span :class="item.isActive ? 'text-green-600' : 'text-gray-500'">
                            {{ item.isActive ? 'Active' : 'Inactive' }}
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
import { SponsorsAPI } from "@/api/SponsorsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Sponsors");
const sponsors = ref([]);
const loading = ref(false);

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'image', title: 'Logo', type: 'custom' },
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'link', title: 'Website', type: 'custom' },
    { key: 'isActive', title: 'Status', type: 'custom' },
];

const fetchSponsors = async () => {
    loading.value = true;
    try {
        const response = await SponsorsAPI.getAllSponsors({});
        sponsors.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching sponsors:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddSponsor = () => {
    router.push('/sponsors/add');
};

const handleView = (item: any) => {
    router.push(`/sponsors/view/${item.id}`);
};

const editSponsor = (item: any) => {
    router.push(`/sponsors/edit/${item.id}`);
};

const deleteSponsor = async (item: any) => {
    if (confirm('Are you sure you want to delete this sponsor?')) {
        try {
            await SponsorsAPI.deleteSponsor(item.id);
            fetchSponsors();
        } catch (error) {
            console.error('Error deleting sponsor:', error);
            alert('Failed to delete sponsor');
        }
    }
};

onMounted(() => {
    fetchSponsors();
});
</script>
