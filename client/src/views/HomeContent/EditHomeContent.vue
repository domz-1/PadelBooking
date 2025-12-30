<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Home Content' : 'Add Home Content'">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Active Status -->
                    <div class="flex items-center space-x-3">
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            v-model="formData.isActive"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        >
                        <label for="isActive" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <!-- Sections -->
                    <div v-for="(section, sectionIndex) in formData.sections" :key="sectionIndex" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                        <h3 class="text-lg font-medium text-gray-800 dark:text-white">
                            Section {{ sectionIndex + 1 }}
                        </h3>

                        <!-- Section Active Status -->
                        <div class="flex items-center space-x-3">
                            <input 
                                type="checkbox" 
                                :id="`section-${sectionIndex}-active`" 
                                v-model="section.isActive"
                                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            >
                            <label :for="`section-${sectionIndex}-active`" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Section Active
                            </label>
                        </div>

                        <!-- Section Title -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title (English)
                                </label>
                                <input 
                                    type="text" 
                                    v-model="section.title.en"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title (Arabic)
                                </label>
                                <input 
                                    type="text" 
                                    v-model="section.title.ar"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                            </div>
                        </div>

                        <!-- Section Description -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (English)
                                </label>
                                <textarea 
                                    v-model="section.description.en"
                                    required
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                ></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (Arabic)
                                </label>
                                <textarea 
                                    v-model="section.description.ar"
                                    required
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Section Items -->
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <h4 class="text-md font-medium text-gray-800 dark:text-white">Items</h4>
                                <button 
                                    type="button"
                                    @click="addItem(sectionIndex)"
                                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                    Add Item
                                </button>
                            </div>

                            <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="border border-gray-100 dark:border-gray-600 rounded p-4 space-y-3">
                                <div class="flex justify-between items-center">
                                    <h5 class="font-medium text-gray-700 dark:text-gray-300">Item {{ itemIndex + 1 }}</h5>
                                    <button 
                                        type="button"
                                        @click="removeItem(sectionIndex, itemIndex)"
                                        class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <!-- Item Type -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Item Type
                                    </label>
                                    <select 
                                        v-model="item.type"
                                        @change="onItemTypeChange(sectionIndex, itemIndex)"
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="product">Product</option>
                                        <option value="coming_soon">Coming Soon</option>
                                    </select>
                                </div>

                                <!-- Product Selection -->
                                <div v-if="item.type === 'product'">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Product
                                    </label>
                                    <select 
                                        v-model="item.productId"
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a product</option>
                                        <option v-for="product in products" :key="product._id" :value="product._id">
                                            {{ product.title.en }} - {{ product.title.ar }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Coming Soon Data -->
                                <div v-if="item.type === 'coming_soon'" class="space-y-3">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Title (English)
                                            </label>
                                            <input 
                                                type="text" 
                                                v-model="item.comingSoonData.title.en"
                                                required
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            >
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Title (Arabic)
                                            </label>
                                            <input 
                                                type="text" 
                                                v-model="item.comingSoonData.title.ar"
                                                required
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3">
                        <button 
                            type="button"
                            @click="$router.go(-1)"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            :disabled="loading"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { HomeContentAPI } from "@/api/HomeContentAPI";
import { ProductsAPI } from "@/api/ProductsAPI";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const products = ref([]);

const isEditing = computed(() => !!route.params.id);
const currentPageTitle = computed(() => isEditing.value ? "Edit Home Content" : "Add Home Content");

const formData = ref({
    isActive: true,
    sections: [
        {
            title: { en: '', ar: '' },
            description: { en: '', ar: '' },
            items: [],
            isActive: true
        },
        {
            title: { en: '', ar: '' },
            description: { en: '', ar: '' },
            items: [],
            isActive: true
        }
    ]
});

const fetchProducts = async () => {
    try {
        const response = await ProductsAPI.getAllProducts();
        products.value = response.data.data.products;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

const fetchHomeContent = async () => {
    if (isEditing.value) {
        try {
            const response = await HomeContentAPI.getHomeContentById(route.params.id);
            const homeContent = response.data.data.homeContent;
            
            // Ensure proper structure for all items
            homeContent.sections.forEach(section => {
                section.items.forEach(item => {
                    if (item.type === 'coming_soon') {
                        if (!item.comingSoonData) {
                            item.comingSoonData = {
                                title: { en: '', ar: '' }
                            };
                        }
                    } else if (item.type === 'product') {
                        // Extract productId from the product object if it's nested
                        if (item.productId && typeof item.productId === 'object' && item.productId._id) {
                            item.productId = item.productId._id;
                        }
                        // Initialize comingSoonData for consistency
                        if (!item.comingSoonData) {
                            item.comingSoonData = {
                                title: { en: '', ar: '' }
                            };
                        }
                    }
                });
            });
            
            formData.value = homeContent;
        } catch (error) {
            console.error('Error fetching home content:', error);
        }
    }
};

const addItem = (sectionIndex) => {
    formData.value.sections[sectionIndex].items.push({
        type: 'product',
        productId: '',
        comingSoonData: {
            title: { en: '', ar: '' }
        }
    });
};

const removeItem = (sectionIndex, itemIndex) => {
    formData.value.sections[sectionIndex].items.splice(itemIndex, 1);
};

const onItemTypeChange = (sectionIndex, itemIndex) => {
    const item = formData.value.sections[sectionIndex].items[itemIndex];
    if (item.type === 'product') {
        item.productId = '';
        delete item.comingSoonData;
    } else if (item.type === 'coming_soon') {
        delete item.productId;
        if (!item.comingSoonData) {
            item.comingSoonData = {
                title: { en: '', ar: '' }
            };
        }
    }
};

const validateForm = () => {
    for (let i = 0; i < formData.value.sections.length; i++) {
        const section = formData.value.sections[i];
        
        if (!section.title.en.trim() || !section.title.ar.trim()) {
            alert(`Section ${i + 1}: Title is required in both languages`);
            return false;
        }
        
        if (!section.description.en.trim() || !section.description.ar.trim()) {
            alert(`Section ${i + 1}: Description is required in both languages`);
            return false;
        }
        
        for (let j = 0; j < section.items.length; j++) {
            const item = section.items[j];
            
            if (item.type === 'product' && !item.productId) {
                alert(`Section ${i + 1}, Item ${j + 1}: Product selection is required`);
                return false;
            }
            
            if (item.type === 'coming_soon') {
                if (!item.comingSoonData || !item.comingSoonData.title || 
                    !item.comingSoonData.title.en.trim() || !item.comingSoonData.title.ar.trim()) {
                    alert(`Section ${i + 1}, Item ${j + 1}: Coming soon title is required in both languages`);
                    return false;
                }
            }
        }
    }
    
    return true;
};

const cleanFormData = () => {
    const cleanedData = JSON.parse(JSON.stringify(formData.value));
    
    delete cleanedData._id;
    delete cleanedData.createdBy;
    delete cleanedData.createdAt;
    delete cleanedData.updatedAt;
    delete cleanedData.__v;
    delete cleanedData.id;
    
    cleanedData.sections.forEach(section => {
        section.items.forEach(item => {
            if (item.type === 'product') {
                delete item.comingSoonData;
            } else if (item.type === 'coming_soon') {
                delete item.productId;
                if (!item.comingSoonData) {
                    item.comingSoonData = {
                        title: { en: '', ar: '' }
                    };
                }
            }
        });
    });
    
    return cleanedData;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }
    
    loading.value = true;
    try {
        const cleanedData = cleanFormData();
        if (isEditing.value) {
            await HomeContentAPI.updateHomeContent(route.params.id, cleanedData);
        } else {
            await HomeContentAPI.createHomeContent(cleanedData);
        }
        router.push('/admin/home-content');
    } catch (error) {
        console.error('Error saving home content:', error);
        alert('Error saving home content');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchProducts(),
        fetchHomeContent()
    ]);
});
</script>