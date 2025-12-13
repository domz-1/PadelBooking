<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Sport' : 'Add Sport'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Sport' : 'New Sport'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Sport' : 'Create Sport'"
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
import { SportsAPI } from "@/api/SportsAPI";
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
        placeholder: 'Sport Name'
    },
    {
        key: 'icon',
        label: 'Icon URL',
        type: 'text',
        placeholder: 'https://example.com/icon.png'
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3
    }
]);

const fetchSport = async (id: string) => {
    loading.value = true;
    try {
        const response = await SportsAPI.getSport(id);
        initialData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching sport:', error);
        router.push('/sports');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await SportsAPI.updateSport(route.params.id as string, formData);
        } else {
            await SportsAPI.createSport(formData);
        }
        router.push('/sports');
    } catch (error) {
        console.error('Error saving sport:', error);
        alert('Failed to save sport');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        await fetchSport(route.params.id as string);
    }
});
</script>
