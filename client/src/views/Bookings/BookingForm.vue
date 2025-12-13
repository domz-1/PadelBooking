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
import { useAuthStore } from '@/stores/AuthStore';
import { UsersAPI } from '@/api/UsersAPI';
import { SettingsAPI } from '@/api/SettingsAPI';
import { VenuesAPI } from '@/api/VenuesAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isEditing = computed(() => route.params.id !== undefined);
const loading = ref(false);
const submitting = ref(false);
const initialData = ref({});
const venues = ref([]);
const users = ref<any[]>([]);
const categories = ref<any[]>([]); // Added categories ref



const isAdmin = computed(() => authStore.user?.role === 'admin');

const formFields = computed<FormFieldConfig[]>(() => {
    const fields: FormFieldConfig[] = [
        {
            key: 'venueId',
            label: 'Venue',
            type: 'select',
            required: true,
            options: venues.value.map((v: any) => ({ label: v.name, value: v.id })),
            placeholder: 'Select Venue'
        }
    ];

    // Only show User dropdown for Admins
    if (isAdmin.value) {
        fields.push({
            key: 'userId',
            label: 'User',
            type: 'select',
            required: true,
            options: users.value.map((u: any) => ({ label: u.name, value: u.id })),
            placeholder: 'Select User',
            fieldClass: 'col-span-2'
        });
    }

    fields.push(
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
        }
    );

    // Only show Holder fields for Admins (or if you want them editable by users too, but per requirement "make the booking from the token holder be the owner")
    // If admin, they select user -> auto-fills holder.
    // If user, we auto-fill holder on submit.
    // REMOVED HOLDER FIELDS AS PER REQUEST

    fields.push(
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
        },
        {
            key: 'categoryId',
            label: 'Category',
            type: 'select',
            options: categories.value.map((c: any) => ({ label: c.name, value: c.id })),
            required: false
        }
    );

    return fields;
});



const fetchVenues = async () => {
    try {
        const response = await VenuesAPI.getAllVenues({});
        venues.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching venues:', error);
    }
};

const fetchCategories = async () => {
    try {
        const response = await SettingsAPI.getCategories({});
        categories.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const fetchUsers = async () => {
    try {
        const response = await UsersAPI.getAllUsers({ limit: 1000 }); // Fetch all users for dropdown
        // Check if response.data.data is the array directly, or if it's nested in users
        const responseData = response.data;
        if (Array.isArray(responseData.data)) {
            users.value = responseData.data;
        } else if (responseData.data && Array.isArray(responseData.data.users)) {
            users.value = responseData.data.users;
        } else {
            users.value = [];
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

const fetchBooking = async (id: string) => {
    loading.value = true;
    try {
        const response = await BookingsAPI.getBooking(id);
        const data = response.data.data || response.data;
        
        // Format times to HH:mm (remove seconds if present)
        if (data.startTime && data.startTime.length > 5) {
            data.startTime = data.startTime.slice(0, 5);
        }
        if (data.endTime && data.endTime.length > 5) {
            data.endTime = data.endTime.slice(0, 5);
        }
        
        initialData.value = data;
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
        // If not admin, inject current user as owner
        if (!isAdmin.value && authStore.user) {
            formData.userId = authStore.user.id;
        }

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
    await fetchCategories();
    if (isEditing.value) {
        await fetchBooking(route.params.id as string);
    } else {
        // Check for query params to pre-fill data
        const { venueId, date, startTime } = route.query;
        if (venueId || date || startTime) {
            const startHour = startTime ? parseInt((startTime as string).split(':')[0]) : 0;
            const endHour = startHour + 1;
            const formattedEndTime = `${endHour.toString().padStart(2, '0')}:00`;

            initialData.value = {
                venueId: venueId ? parseInt(venueId as string) : undefined,
                date: date as string,
                startTime: startTime as string,
                // Pre-fill end time as 1 hour later if start time exists
                endTime: startTime ? formattedEndTime : undefined,
                status: 'pending',
                type: 'standard'
            };
        }
    }
});
</script>
