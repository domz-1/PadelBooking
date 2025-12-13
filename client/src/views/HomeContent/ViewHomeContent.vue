<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Home Content Details">
                <div v-if="homeContent" class="space-y-6">
                    <!-- Header Info -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <span :class="homeContent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                                  class="inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1">
                                {{ homeContent.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Created By</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ homeContent.createdBy?.name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(homeContent.createdAt) }}</p>
                        </div>
                    </div>

                    <!-- Sections -->
                    <div v-for="(section, sectionIndex) in homeContent.sections" :key="sectionIndex" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium text-gray-800 dark:text-white">
                                Section {{ sectionIndex + 1 }}
                            </h3>
                            <span :class="section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                                  class="px-2 py-1 rounded-full text-xs font-medium">
                                {{ section.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </div>

                        <!-- Section Title -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title (English)
                                </label>
                                <p class="text-gray-900 dark:text-white">{{ section.title.en }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title (Arabic)
                                </label>
                                <p class="text-gray-900 dark:text-white">{{ section.title.ar }}</p>
                            </div>
                        </div>

                        <!-- Section Description -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (English)
                                </label>
                                <p class="text-gray-900 dark:text-white">{{ section.description.en }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (Arabic)
                                </label>
                                <p class="text-gray-900 dark:text-white">{{ section.description.ar }}</p>
                            </div>
                        </div>

                        <!-- Section Items -->
                        <div class="space-y-4">
                            <h4 class="text-md font-medium text-gray-800 dark:text-white">
                                Items ({{ section.items?.length || 0 }})
                            </h4>

                            <div v-if="section.items && section.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="border border-gray-100 dark:border-gray-600 rounded-lg p-4 space-y-3">
                                    <div class="flex justify-between items-center">
                                        <h5 class="font-medium text-gray-700 dark:text-gray-300">Item {{ itemIndex + 1 }}</h5>
                                        <span :class="item.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'" 
                                              class="px-2 py-1 rounded-full text-xs font-medium">
                                            {{ item.type === 'product' ? 'Product' : 'Coming Soon' }}
                                        </span>
                                    </div>

                                    <!-- Product Item -->
                                    <div v-if="item.type === 'product' && item.productId" class="space-y-2">
                                        <LazyImage
                                            v-if="item.productId.imgCover"
                                            :image-id="item.productId.imgCover"
                                            :alt="item.productId.title.en"
                                            width="100%"
                                            height="120px"
                                            image-class="w-full h-30 object-cover rounded"
                                            placeholder="/placeholder-product.png"
                                        />
                                        <div>
                                            <p class="font-medium text-gray-800 dark:text-white text-sm">{{ item.productId.title.en }}</p>
                                            <p class="text-xs text-gray-500">{{ item.productId.title.ar }}</p>
                                            <p class="text-sm font-medium text-green-600">${{ item.productId.price }}</p>
                                        </div>
                                    </div>

                                    <!-- Coming Soon Item -->
                                    <div v-if="item.type === 'coming_soon' && item.comingSoonData" class="space-y-2">
                                        <div class="w-full h-30 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded flex items-center justify-center">
                                            <span class="text-purple-600 dark:text-purple-300 font-medium text-sm">Coming Soon</span>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-800 dark:text-white text-sm">{{ item.comingSoonData.title.en }}</p>
                                            <p class="text-xs text-gray-500">{{ item.comingSoonData.title.ar }}</p>
                                            <p class="text-xs text-purple-600 font-medium">Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                                No items in this section
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            @click="$router.go(-1)"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Back
                        </button>
                        <button 
                            @click="$router.push(`/admin/home-content/edit/${homeContent._id}`)"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Edit
                        </button>
                    </div>
                </div>

                <div v-else class="text-center py-8">
                    <p class="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import LazyImage from "@/components/LazyImage.vue";
import { HomeContentAPI } from "@/api/HomeContentAPI";

const route = useRoute();
const currentPageTitle = "View Home Content";
const homeContent = ref(null);

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const fetchHomeContent = async () => {
    try {
        const response = await HomeContentAPI.getHomeContentById(route.params.id);
        homeContent.value = response.data.data.homeContent;
    } catch (error) {
        console.error('Error fetching home content:', error);
    }
};

onMounted(() => {
    fetchHomeContent();
});
</script>
