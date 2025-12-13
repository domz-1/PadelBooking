<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Venues Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Venues</h3>
                    <button 
                        @click="goToAddVenue"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add Venue
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
                    :data="venues"
                    :showActions="true"
                    :onEdit="editVenue"
                    :onDelete="deleteVenue"
                >
                    <template #column-pricePerHour="{ item }">
                        <span class="font-medium text-gray-900 dark:text-white">
                            {{ item.pricePerHour }} {{ currency }}
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
import { VenuesAPI } from "@/api/VenuesAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Venues");
const venues = ref([]);
const loading = ref(false);
const currency = ref("USD"); // Could be fetched from global config

const columns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'location', title: 'Location', type: 'text' },
    { key: 'pricePerHour', title: 'Price/Hour', type: 'custom' },
];

const fetchVenues = async () => {
    loading.value = true;
    try {
        const response = await VenuesAPI.getAllVenues({});
        venues.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching venues:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddVenue = () => {
    router.push('/venues/add');
};

const editVenue = (item: any) => {
    router.push(`/venues/edit/${item.id}`);
};

const deleteVenue = async (item: any) => {
    if (confirm('Are you sure you want to delete this venue?')) {
        try {
            await VenuesAPI.deleteVenue(item.id);
            fetchVenues();
        } catch (error) {
            console.error('Error deleting venue:', error);
            alert('Failed to delete venue');
        }
    }
};

onMounted(() => {
    fetchVenues();
});
</script>
