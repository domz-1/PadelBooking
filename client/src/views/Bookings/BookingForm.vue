<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Booking' : 'Add Booking'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Booking Details' : 'New Booking'">
                <Form
                    v-if="!loading"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Booking' : 'Create Booking'"
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
import { BookingsAPI } from '@/api/BookingsAPI';
import { UsersAPI } from '@/api/UsersAPI'; // You might need to create/ensure this exists and exports what you need
// import { VenuesAPI } from '@/api/VenuesAPI'; // You might need to create/ensure this exists
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";
import api from '@/api/api'; // Direct access for quick venue fetching if API doesn't exist yet

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => route.params.id && route.params.id !== 'new');
const loading = ref(false);
const submitting = ref(false);
const initialData = ref({});
const venues = ref([]);
const users = ref([]);

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
        key: 'totalPrice',
        label: 'Total Price',
        type: 'number',
        required: true,
        min: 0
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Pending Coach', value: 'pending-coach' },
            { label: 'No Show', value: 'no-show' }
        ],
        required: true
    },
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Academy', value: 'academy' }
        ],
        required: true
    }
]);

const fetchVenues = async () => {
    try {
        // Assuming a Venues API or endpoint exists
        const response = await api.get('/venues'); 
        venues.value = response.data.data || response.data; 
    } catch (error) {
        console.error('Error fetching venues:', error);
    }
};

const fetchBooking = async (id: string) => {
    loading.value = true;
    try {
        const response = await BookingsAPI.getBooking(id);
        initialData.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching booking:', error);
        router.push('/bookings');
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        if (isEditing.value) {
            await BookingsAPI.updateBooking(route.params.id as string, formData);
        } else {
            await BookingsAPI.createBooking(formData);
        }
        router.push('/bookings');
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Failed to save booking');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    await fetchVenues();
    if (isEditing.value) {
        await fetchBooking(route.params.id as string);
    }
});
</script>
