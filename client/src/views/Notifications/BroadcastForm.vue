<template>
    <AdminLayout>
        <PageBreadcrumb pageTitle="Send Broadcast" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="New Broadcast Message">
                <Form
                    :fields="formFields"
                    :loading="submitting"
                    submit-button-text="Send Broadcast"
                    @submit="handleSubmit"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NotificationsAPI } from '@/api/NotificationsAPI';
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
        placeholder: 'Notification Title'
    },
    {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Enter your message here...'
    },
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
            { label: 'System', value: 'system' },
            { label: 'Promotion', value: 'promotion' },
            { label: 'Alert', value: 'alert' }
        ],
        required: true
    }
]);

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        await NotificationsAPI.sendBroadcast(formData);
        alert('Broadcast sent successfully!');
        router.push('/notifications');
    } catch (error) {
        console.error('Error sending broadcast:', error);
        alert('Failed to send broadcast');
    } finally {
        submitting.value = false;
    }
};
</script>
