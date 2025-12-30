<template>
    <AdminLayout>
        <PageBreadcrumb pageTitle="Create Offer" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="New Offer">
                <Form
                    :fields="formFields"
                    :loading="submitting"
                    submit-button-text="Create Offer"
                    @submit="handleSubmit"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { OffersAPI } from '@/api/OffersAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";

const router = useRouter();
const submitting = ref(false);

const formFields = computed<FormFieldConfig[]>(() => [
    {
        key: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Offer Title'
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        rows: 3
    },
    {
        key: 'discountPercentage',
        label: 'Discount Percentage',
        type: 'number',
        required: true,
        min: 0,
        max: 100
    },
    {
        key: 'validUntil',
        label: 'Valid Until',
        type: 'date',
        required: true
    },
    {
        key: 'image',
        label: 'Image URL',
        type: 'text',
        placeholder: 'https://example.com/image.jpg'
    }
]);

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        await OffersAPI.createOffer(formData);
        router.push('/offers');
    } catch (error) {
        console.error('Error creating offer:', error);
        alert('Failed to create offer');
    } finally {
        submitting.value = false;
    }
};
</script>
