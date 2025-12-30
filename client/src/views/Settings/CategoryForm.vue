<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Category' : 'Add Category'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Category' : 'New Category'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Category' : 'Create Category'"
                    @submit="handleSubmit"
                />
                <div v-else class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SettingsAPI } from '@/api/SettingsAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id && route.params.id !== 'new');
const loading = ref(false);
const submitting = ref(false);
const initialData = ref({});

const formFields = computed<FormFieldConfig[]>(() => [
    {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Category Name'
    },
    {
        key: 'color',
        label: 'Color',
        type: 'text', // Could be color picker
        placeholder: '#000000'
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3
    }
]);

const fetchCategory = async (id: string) => {
    loading.value = true;
    try {
        // Since we don't have a direct getCategory endpoint exposed in API service yet (only getCategories),
        // we might need to fetch all and find, or add a get endpoint.
        // Assuming getCategories returns list, we can filter client side for now or add getCategory to API if backend supports it.
        // The backend routes showed GET /settings/categories but not /settings/categories/:id for GET.
        // So we'll fetch all and find.
        const response = await SettingsAPI.getCategories({});
        const categories = response.data.data || response.data;
        const category = categories.find((c: any) => c.id.toString() === id);
        if (category) {
            initialData.value = category;
        } else {
            router.push('/settings');
        }
    } catch (error) {
        console.error('Error fetching category:', error);
        router.push('/settings');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await SettingsAPI.updateCategory(route.params.id as string, formData);
        } else {
            await SettingsAPI.createCategory(formData);
        }
        router.push('/settings');
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Failed to save category');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        await fetchCategory(route.params.id as string);
    }
});
</script>
