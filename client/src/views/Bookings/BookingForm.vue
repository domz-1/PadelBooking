<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="isEditing ? 'Edit Booking' : 'Add Booking'" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="isEditing ? 'Edit Booking Details' : 'New Booking'">
                <Form
                    v-if="!loading"
                    ref="formRef"
                    :fields="formFields"
                    :initial-data="initialData"
                    :loading="submitting"
                    :submit-button-text="isEditing ? 'Update Booking' : 'Create Booking'"
                    @submit="handleSubmit"
                    @change="handleFormChange"
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
const users = ref<any[]>([]);

const fetchUsers = async () => {
    try {
        const response = await UsersAPI.getAllUsers({ limit: 1000 }); // Fetch all users for dropdown
        users.value = response.data.data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

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
        key: 'userId',
        label: 'User',
        type: 'select',
        required: true,
        options: users.value.map((u: any) => ({ label: u.name, value: u.id })),
        placeholder: 'Select User',
        fieldClass: 'col-span-2'
    },
    {
        key: 'date',
        label: 'Date',
        type: 'date',
        required: true,
        min: new Date().toISOString().split('T')[0]
    },
    {
        key: 'startTime',
        label: 'Start Time',
        type: 'select',
        required: true,
        options: Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            return { label: `${hour}:00`, value: `${hour}:00` };
        })
    },
    {
        key: 'endTime',
        label: 'End Time',
        type: 'select',
        required: true,
        options: Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            return { label: `${hour}:00`, value: `${hour}:00` };
        })
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
        key: 'holder.name',
        label: 'Holder Name',
        type: 'text',
        placeholder: 'Enter holder name',
        required: false,
        fieldClass: 'col-span-1'
    },
    {
        key: 'holder.phone',
        label: 'Holder Phone',
        type: 'tel',
        placeholder: 'Enter holder phone',
        required: false,
        fieldClass: 'col-span-1'
    },
    {
        key: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Enter any notes...',
        required: false,
        fieldClass: 'col-span-2',
        rows: 3
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

// Watch for user selection to auto-fill holder info
// We need to access the form data, but it's inside the Form component.
// However, the Form component emits 'change' event which we can listen to, 
// OR we can pass initialData which is reactive? No, initialData is just initial.
// The Form component exposes formData via defineExpose, but we can't easily access it from here without a ref.
// Better approach: The Form component emits 'change'. We can listen to it.
// But the current usage in template is: <Form ... /> without @change handler.
// Let's add a ref to the Form component.

const formRef = ref<any>(null);

const handleFormChange = (key: string, value: any) => {
    if (key === 'userId') {
        const selectedUser = users.value.find((u: any) => u.id === value);
        if (selectedUser) {
            // We need to update the form data. 
            // The Form component updates its internal state, but we want to trigger updates to other fields.
            // The Form component exposes updateField method.
            if (formRef.value) {
                formRef.value.updateField('holder.name', selectedUser.name);
                formRef.value.updateField('holder.phone', selectedUser.phone || '');
            }
        }
    }
};

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
    await fetchUsers();
    if (isEditing.value) {
        await fetchBooking(route.params.id as string);
    }
});
</script>
