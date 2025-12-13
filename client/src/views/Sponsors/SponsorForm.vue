<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Sponsor' : 'Add Sponsor'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Sponsor' : 'New Sponsor'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Sponsor' : 'Create Sponsor'"
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
import { SponsorsAPI } from '@/api/SponsorsAPI';
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
        placeholder: 'Sponsor Name'
    },
    {
        key: 'link',
        label: 'Website Link',
        type: 'text',
        required: true,
        placeholder: 'https://example.com'
    },
    {
        key: 'image',
        label: 'Logo Image',
        type: 'file', // Assuming Form component handles file inputs
        required: !isEditing.value // Required only on creation
    },
    {
        key: 'isActive',
        label: 'Active',
        type: 'checkbox'
    }
]);

const fetchSponsor = async (id: string) => {
    loading.value = true;
    try {
        const response = await SponsorsAPI.getSponsor(id);
        initialData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching sponsor:', error);
        router.push('/sponsors');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        // Create FormData object for file upload
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                 data.append(key, formData[key]);
            }
        });

        if (isEditing.value) {
            await SponsorsAPI.updateSponsor(route.params.id as string, data);
        } else {
            await SponsorsAPI.createSponsor(data);
        }
        router.push('/sponsors');
    } catch (error) {
        console.error('Error saving sponsor:', error);
        alert('Failed to save sponsor');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        await fetchSponsor(route.params.id as string);
    }
});
</script>
