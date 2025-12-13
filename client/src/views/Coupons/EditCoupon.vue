<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="cardTitle">
                <div class="max-w-2xl">
                    <Form 
                        :fields="formFields"
                        :initialData="couponData"
                        :showSubmitButton="true"
                        :submitButtonText="isEdit ? 'Update Coupon' : 'Create Coupon'"
                        :showResetButton="true"
                        :loading="loading"
                        @submit="handleSubmit"
                        @reset="handleReset"
                    />
                </div>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { CouponsAPI } from "@/api/CouponsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const couponId = ref(route.params.id);
const isEdit = computed(() => couponId.value !== 'new');
const pageTitle = computed(() => isEdit.value ? 'Edit Coupon' : 'Create Coupon');
const cardTitle = computed(() => isEdit.value ? 'Update Coupon Details' : 'Create New Coupon');

const loading = ref(false);
const couponData = ref({});

// Form fields configuration
const formFields = [
    {
        key: 'code',
        type: 'text',
        label: 'Coupon Code',
        placeholder: 'Enter coupon code (e.g., SUMMER2024)',
        required: true,
        
        hint: 'Unique code that customers will use at checkout'
    },
    {
        key: 'discount',
        type: 'number',
        label: 'Discount Percentage',
        placeholder: 'Enter discount percentage',
        required: true,
        min: 1,
        max: 100,
        validation: {
            min: 1,
            max: 100,
            custom: (value) => {
                const num = parseFloat(value);
                if (isNaN(num) || num < 1) return 'Discount must be at least 1%';
                if (num > 100) return 'Discount cannot exceed 100%';
                return true;
            }
        },
        hint: 'Percentage discount applied to the order total'
    },
    {
        key: 'expires',
        type: 'date',
        label: 'Expiration Date',
        required: true,
        validation: {
            custom: (value) => {
                if (!value) return 'Expiration date is required';
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) return 'Expiration date must be in the future';
                return true;
            }
        },
        hint: 'Coupon will expire after this date'
    }
];

// Load coupon data if editing
const loadCouponData = async () => {
    if (!isEdit.value) return;
    
    loading.value = true;
    try {
        const response = await CouponsAPI.getCoupon(couponId.value, authStore.token);
        couponData.value = response.data.data.coupon;
    } catch (error) {
        console.error('Error loading coupon:', error);
        router.push('/coupons');
    } finally {
        loading.value = false;
    }
};

// Handle form submission
const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        const couponDataToSubmit = {
            code: formData.code.toUpperCase(), // Convert to uppercase for consistency
            discount: parseFloat(formData.discount),
            expires: formData.expires
        };

        if (isEdit.value) {
            await CouponsAPI.updateCoupon(couponId.value, couponDataToSubmit, authStore.token);
        } else {
            await CouponsAPI.createCoupon(couponDataToSubmit, authStore.token);
        }
        
        router.push('/coupons');
    } catch (error) {
        console.error('Error saving coupon:', error);
    } finally {
        loading.value = false;
    }
};

// Handle form reset
const handleReset = () => {
    if (isEdit.value) {
        loadCouponData();
    }
};

// Load data on mount
onMounted(() => {
    loadCouponData();
});
</script>
  
