<template>
    <AdminLayout>
        <PageBreadcrumb pageTitle="Add Story" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="New Story">
                <Form
                    :fields="formFields"
                    :loading="submitting"
                    submit-button-text="Create Story"
                    @submit="handleSubmit"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { StoriesAPI } from '@/api/StoriesAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";

const router = useRouter();
const submitting = ref(false);

const formFields = computed<FormFieldConfig[]>(() => [
    {
        key: 'media',
        label: 'Media File',
        type: 'file',
        required: true
    },
    {
        key: 'caption',
        label: 'Caption',
        type: 'text',
        placeholder: 'Story caption'
    }
]);

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                 data.append(key, formData[key]);
            }
        });

        await StoriesAPI.createStory(data);
        router.push('/stories');
    } catch (error) {
        console.error('Error creating story:', error);
        alert('Failed to create story');
    } finally {
        submitting.value = false;
    }
};
</script>
