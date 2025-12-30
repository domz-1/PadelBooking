<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Match' : 'Create Match'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Match Details' : 'New Match'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Match' : 'Create Match'"
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
import { MatchesAPI } from '@/api/MatchesAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";
import api from '@/api/api';

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id && route.params.id !== 'new');
const loading = ref(false);
const submitting = ref(false);
const initialData = ref({});
const venues = ref([]);

const formFields = computed<FormFieldConfig[]>(() => [
    {
        key: 'venueId',
        label: 'Venue',
        type: 'select',
        required: true,
        options: venues.value.map((v: any) => ({ label: v.name, value: v.id })),
        placeholder: 'Select Venue'
    },
    {
        key: 'date',
        label: 'Date',
        type: 'date',
        required: true
    },
    {
        key: 'startTime',
        label: 'Start Time',
        type: 'time',
        required: true
    },
    {
        key: 'endTime',
        label: 'End Time',
        type: 'time',
        required: true
    },
    {
        key: 'level',
        label: 'Level',
        type: 'select',
        options: [
            { label: 'Beginner', value: 'Beginner' },
            { label: 'Intermediate', value: 'Intermediate' },
            { label: 'Advanced', value: 'Advanced' },
            { label: 'Pro', value: 'Pro' }
        ],
        required: true
    },
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
            { label: 'Friendly', value: 'friendly' },
            { label: 'Competitive', value: 'competitive' }
        ],
        required: true
    },
    {
        key: 'maxPlayers',
        label: 'Max Players',
        type: 'number',
        required: true,
        min: 2
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'Open', value: 'open' },
            { label: 'Full', value: 'full' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Completed', value: 'completed' }
        ],
        required: true
    }
]);

const fetchVenues = async () => {
    try {
        const response = await api.get('/venues');
        venues.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching venues:', error);
    }
};

const fetchMatch = async (id: string) => {
    loading.value = true;
    try {
        const response = await MatchesAPI.getMatch(id);
        initialData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching match:', error);
        router.push('/matches');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await MatchesAPI.updateMatch(route.params.id as string, formData);
        } else {
            await MatchesAPI.createMatch(formData);
        }
        router.push('/matches');
    } catch (error) {
        console.error('Error saving match:', error);
        alert('Failed to save match');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    await fetchVenues();
    if (isEditing.value) {
        await fetchMatch(route.params.id as string);
    }
});
</script>
