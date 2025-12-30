<template>
    <div v-if="embedded">
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
    </div>
    <AdminLayout v-else>
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

    <MessageModal
        v-if="showMessageModal"
        :type="messageType"
        :title="messageTitle"
        :message="messageText"
        @close="showMessageModal = false"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookingsAPI } from '@/api/BookingsAPI';
import { useAuthStore } from '@/stores/AuthStore';
import { UsersAPI } from '@/api/UsersAPI';
import { SettingsAPI } from '@/api/SettingsAPI';
import { VenuesAPI } from '@/api/VenuesAPI';
import { CoachesAPI } from '@/api/CoachesAPI';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import type { FormFieldConfig } from "@/components/forms/Form.vue";
import MessageModal from '@/components/ui/MessageModal.vue';

const props = defineProps<{
    isPublic?: boolean;
    embedded?: boolean;
    initialValues?: any; // For passing data when embedded
}>();

const emit = defineEmits(['success', 'cancel', 'error']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isEditing = computed(() => route.params.id !== undefined || (props.initialValues && props.initialValues.id));
const loading = ref(false);
const submitting = ref(false);
const initialData = ref({});
const venues = ref([]);
const users = ref<any[]>([]);
const categories = ref<any[]>([]);
const coaches = ref<any[]>([]);

// Message Modal State
const showMessageModal = ref(false);
const messageType = ref<'success' | 'error'>('success');
const messageTitle = ref('');
const messageText = ref('');

const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    messageType.value = type;
    messageTitle.value = title;
    messageText.value = message;
    showMessageModal.value = true;
};

const isAdmin = computed(() => authStore.user?.role === 'admin');

// ... (formFields computed property remains same)

// ... (fetch functions remain same)

const handleSubmit = async (formData: any) => {
    submitting.value = true;
    try {
        // If not admin OR if in public mode, inject current user as owner
        if ((!isAdmin.value || props.isPublic) && authStore.user) {
            formData.userId = authStore.user.id;
        }

        // Sanitize optional fields
        if (!formData.coachId) formData.coachId = null;
        if (!formData.categoryId) formData.categoryId = null;

        if (isEditing.value) {
            const id = route.params.id || props.initialValues?.id;
            await BookingsAPI.updateBooking(id as string, formData);
        } else {
            await BookingsAPI.createBooking(formData);
        }
        
        if (props.embedded) {
            emit('success');
        } else {
            router.push('/bookings');
        }
    } catch (error: any) {
        console.error('Error saving booking:', error);
        const errorMsg = error.response?.data?.message || 'Failed to save booking';
        
        if (props.embedded) {
            emit('error', errorMsg);
        } else {
            showMessage('error', 'Error', errorMsg);
        }
    } finally {
        submitting.value = false;
    }
};

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

    // Only show User dropdown for Admins AND if not in public mode
    if (isAdmin.value && !props.isPublic) {
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
                const hour = i;
                const h = hour % 12 || 12;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const value = `${hour.toString().padStart(2, '0')}:00`;
                const label = `${h}:00 ${ampm}`;
                return { label, value };
            })
        },
        {
            key: 'endTime',
            label: 'End Time',
            type: 'select',
            required: true,
            options: Array.from({ length: 24 }, (_, i) => {
                const hour = i;
                const h = hour % 12 || 12;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const value = `${hour.toString().padStart(2, '0')}:00`;
                const label = `${h}:00 ${ampm}`;
                return { label, value };
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
        },
        {
            key: 'coachId',
            label: 'Coach (for Academy)',
            type: 'select',
            options: coaches.value.map((c: any) => ({ label: c.name || c.User?.name || 'Unknown', value: c.id })),
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

const fetchCoaches = async () => {
    try {
        const response = await CoachesAPI.getAllCoaches({});
        coaches.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching coaches:', error);
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
        const response = await UsersAPI.getAllUsers({ limit: 1000 });
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
        
        if (data.startTime && data.startTime.length > 5) {
            data.startTime = data.startTime.slice(0, 5);
        }
        if (data.endTime && data.endTime.length > 5) {
            data.endTime = data.endTime.slice(0, 5);
        }
        // Ensure date is YYYY-MM-DD
        if (data.date && data.date.includes('T')) {
            data.date = data.date.split('T')[0];
        }
        
        initialData.value = data;
    } catch (error) {
        console.error('Error fetching booking:', error);
        if (!props.embedded) router.push('/bookings');
    } finally {
        loading.value = false;
    }
};



onMounted(async () => {
    await fetchVenues();
    await fetchUsers();
    await fetchCategories();
    await fetchCoaches();
    
    if (props.initialValues) {
        // Use passed initial values if embedded
        const { venueId, date, startTime } = props.initialValues;
        if (venueId || date || startTime) {
            const startHour = startTime ? parseInt((startTime as string).split(':')[0]) : 0;
            const endHour = startHour + 1;
            const formattedEndTime = `${endHour.toString().padStart(2, '0')}:00`;

            initialData.value = {
                venueId: venueId ? parseInt(venueId as string) : undefined,
                date: date as string,
                startTime: startTime as string,
                endTime: startTime ? formattedEndTime : undefined,
                status: 'pending',
                type: 'standard',
                ...props.initialValues // Merge any other values
            };
        } else if (props.initialValues.id) {
            await fetchBooking(props.initialValues.id);
        }
    } else if (isEditing.value) {
        await fetchBooking(route.params.id as string);
    } else {
        const { venueId, date, startTime } = route.query;
        if (venueId || date || startTime) {
            const startHour = startTime ? parseInt((startTime as string).split(':')[0]) : 0;
            const endHour = startHour + 1;
            const formattedEndTime = `${endHour.toString().padStart(2, '0')}:00`;

            initialData.value = {
                venueId: venueId ? parseInt(venueId as string) : undefined,
                date: date as string,
                startTime: startTime as string,
                endTime: startTime ? formattedEndTime : undefined,
                status: 'pending',
                type: 'standard'
            };
        }
    }
});
</script>
