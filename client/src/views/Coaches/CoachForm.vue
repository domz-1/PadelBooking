<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Coach' : 'Add Coach'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Coach Profile' : 'New Coach Profile'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Profile' : 'Create Profile'"
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
import { CoachesAPI } from '@/api/CoachesAPI';
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
        key: 'bio',
        label: 'Bio',
        type: 'textarea',
        required: true,
        rows: 4
    },
    {
        key: 'specialties',
        label: 'Specialties',
        type: 'array',
        allowAdd: true,
        allowRemove: true,
        fields: [
            { key: 'name', label: 'Specialty', type: 'text' }
        ]
    },
    {
        key: 'experience',
        label: 'Experience',
        type: 'text',
        required: true
    }
]);

const fetchCoach = async (id: string) => {
    loading.value = true;
    try {
        const response = await CoachesAPI.getCoach(id);
        const data = response.data.data || response.data;
        // Transform array of strings to array of objects for the form if needed
        if (data.specialties && Array.isArray(data.specialties)) {
             data.specialties = data.specialties.map((s: string) => ({ name: s }));
        }
        initialData.value = data;
    } catch (error) {
        console.error('Error fetching coach:', error);
        router.push('/coaches');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        // Transform back to array of strings
        if (formData.specialties && Array.isArray(formData.specialties)) {
            formData.specialties = formData.specialties.map((s: any) => s.name);
        }

        if (isEditing.value) {
            await CoachesAPI.updateCoach(route.params.id as string, formData);
        } else {
            await CoachesAPI.createProfile(formData);
        }
        router.push('/coaches');
    } catch (error) {
        console.error('Error saving coach:', error);
        alert('Failed to save coach profile');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        await fetchCoach(route.params.id as string);
    }
});
</script>
