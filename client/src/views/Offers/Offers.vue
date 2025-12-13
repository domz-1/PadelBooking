<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Offers Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Offers</h3>
                    <button 
                        @click="goToAddOffer"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Create Offer
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
                    :data="offers"
                    :showActions="true"
                    :onDelete="deleteOffer"
                >
                    <template #column-discountPercentage="{ item }">
                        <span class="text-green-600 font-bold">
                            {{ item.discountPercentage }}%
                        </span>
                    </template>
                    
                    <template #column-validUntil="{ item }">
                        <span>
                            {{ new Date(item.validUntil).toLocaleDateString() }}
                        </span>
                    </template>

                    <template #column-image="{ item }">
                        <div class="w-16 h-10 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                            <img v-if="item.image" :src="item.image" alt="Offer" class="w-full h-full object-cover" />
                            <span v-else class="flex items-center justify-center w-full h-full text-xs text-gray-500">No Img</span>
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
import { OffersAPI } from "@/api/OffersAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Offers");
const offers = ref([]);
const loading = ref(false);

const columns = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'image', title: 'Image', type: 'custom' },
    { key: 'title', title: 'Title', type: 'text' },
    { key: 'discountPercentage', title: 'Discount', type: 'custom' },
    { key: 'validUntil', title: 'Valid Until', type: 'custom' },
];

const fetchOffers = async () => {
    loading.value = true;
    try {
        const response = await OffersAPI.getAllOffers({});
        offers.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching offers:', error);
    } finally {
        loading.value = false;
    }
};

const goToAddOffer = () => {
    router.push('/offers/add');
};

const deleteOffer = async (item: any) => {
    if (confirm('Are you sure you want to delete this offer?')) {
        try {
            await OffersAPI.deleteOffer(item.id);
            fetchOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
            alert('Failed to delete offer');
        }
    }
};

onMounted(() => {
    fetchOffers();
});
</script>
