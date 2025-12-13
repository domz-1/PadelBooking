<template>
    <AdminLayout>
        <PageBreadcrumb pageTitle="Settings" />
        <div class="space-y-5 sm:space-y-6">
            <!-- Tabs -->
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        v-for="tab in tabs"
                        :key="tab.name"
                        @click="currentTab = tab.name"
                        :class="[
                            currentTab === tab.name
                                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        ]"
                    >
                        {{ tab.label }}
                    </button>
                </nav>
            </div>

            <!-- General Settings Tab -->
            <div v-if="currentTab === 'general'">
                <ComponentCard title="General Configuration">
                    <Form
                        v-if="!loadingConfig"
                        :fields="configFields"
                        :initial-data="configData"
                        :loading="submittingConfig"
                        submit-button-text="Save Changes"
                        @submit="handleConfigSubmit"
                    />
                    <div v-else class="flex justify-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    </div>
                </ComponentCard>
            </div>

            <!-- Categories Tab -->
            <div v-if="currentTab === 'categories'">
                <ComponentCard title="Categories Management">
                    <div class="mb-4 flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Categories</h3>
                        <button 
                            @click="goToAddCategory"
                            class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                            Add Category
                        </button>
                    </div>

                    <DataTable 
                        :columns="categoryColumns"
                        :data="categories"
                        :showActions="true"
                        :onEdit="editCategory"
                        :onDelete="deleteCategory"
                    >
                        <template #column-color="{ item }">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded border border-gray-200" :style="{ backgroundColor: item.color }"></div>
                                <span>{{ item.color }}</span>
                            </div>
                        </template>
                    </DataTable>
                </ComponentCard>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { SettingsAPI } from "@/api/SettingsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";

const router = useRouter();
const currentTab = ref('general');
const tabs = [
    { name: 'general', label: 'General Settings' },
    { name: 'categories', label: 'Categories' }
];

// General Settings State
const loadingConfig = ref(false);
const submittingConfig = ref(false);
const configData = ref({});
const configFields = computed<FormFieldConfig[]>(() => [
    { key: 'businessName', label: 'Business Name', type: 'text', required: true },
    { key: 'region', label: 'Region', type: 'text', required: true },
    { key: 'city', label: 'City', type: 'text', required: true },
    { key: 'timezone', label: 'Timezone', type: 'text', required: true },
    { key: 'currency', label: 'Currency', type: 'text', required: true },
    { key: 'minBookingDuration', label: 'Min Booking Duration (mins)', type: 'number', required: true },
    { key: 'themeColor', label: 'Theme Color', type: 'text' }, // Could be a color picker
    { key: 'logo', label: 'Logo URL', type: 'text' }
]);

// Categories State
const categories = ref([]);
const categoryColumns: Column[] = [
    { key: 'id', title: 'ID', type: 'text' },
    { key: 'name', title: 'Name', type: 'text' },
    { key: 'color', title: 'Color', type: 'custom' },
    { key: 'description', title: 'Description', type: 'text' }
];

// Methods
const fetchConfig = async () => {
    loadingConfig.value = true;
    try {
        const response = await SettingsAPI.getConfig();
        configData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching config:', error);
    } finally {
        loadingConfig.value = false;
    }
};

const handleConfigSubmit = async (formData: any) => {
    submittingConfig.value = true;
    try {
        await SettingsAPI.updateConfig(formData);
        alert('Settings updated successfully');
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Failed to update settings');
    } finally {
        submittingConfig.value = false;
    }
};

const fetchCategories = async () => {
    try {
        const response = await SettingsAPI.getCategories({});
        categories.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const goToAddCategory = () => {
    router.push('/settings/categories/add');
};

const editCategory = (item: any) => {
    router.push(`/settings/categories/edit/${item.id}`);
};

const deleteCategory = async (item: any) => {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await SettingsAPI.deleteCategory(item.id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    }
};

onMounted(() => {
    fetchConfig();
    fetchCategories();
});
</script>
