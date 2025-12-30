<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Venue' : 'Add Venue'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Venue' : 'New Venue'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Venue' : 'Create Venue'"
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
import { VenuesAPI } from "@/api/VenuesAPI";
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
        placeholder: 'Venue Name'
    },
    {
        key: 'location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'Address or Location'
    },
    {
        key: 'pricePerHour',
        label: 'Price Per Hour',
        type: 'number',
        required: true,
        min: 0
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3
    },
    {
        key: 'amenities',
        label: 'Amenities',
        type: 'array', // Assuming Form component supports array of strings
        placeholder: 'Add amenity'
    }
]);

const fetchVenue = async (id: string) => {
    loading.value = true;
    try {
        const response = await VenuesAPI.getVenue(id);
        initialData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching venue:', error);
        router.push('/venues');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await VenuesAPI.updateVenue(route.params.id as string, formData);
        } else {
            await VenuesAPI.createVenue(formData);
        }
        router.push('/venues');
    } catch (error) {
        console.error('Error saving venue:', error);
        alert('Failed to save venue');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        await fetchVenue(route.params.id as string);
    }
});
</script>
