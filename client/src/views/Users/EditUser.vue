<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />

       

        <div class="space-y-5 sm:space-y-6">
            <ComponentCard :title="formTitle">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>

                <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ error }}
                </div>

                <Form v-else :fields="formFields" :initialData="formData" :loading="saving" submitButtonText="Save User"
                    :showResetButton="true" resetButtonText="Reset Form" @submit="handleSubmit" @reset="handleReset"
                    @array-item-add="handleArrayItemAdd" @array-item-remove="handleArrayItemRemove" @change="handleChange" />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { UsersAPI } from "@/api/UsersAPI";
import { kuwaitAreas } from "@/data/kuwaitAreas";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Component state
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const userId = ref(route.params.id);
const userData = ref(null);

// Form data
const formData = ref({
    name: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
    verified: false,
    blocked: false,
    password: "",
    addresses: []
});

// Computed properties
const isEditMode = computed(() => userId.value !== "new");
const pageTitle = computed(() => isEditMode.value ? "Edit User" : "Add User");
const formTitle = computed(() => isEditMode.value ? "Edit User Information" : "Add New User");

// Form fields configuration - computed to react to isEditMode changes
const formFields = computed(() => [
    {
        key: "name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter user's full name",
        required: true,
        validation: {
            minLength: 2,
            maxLength: 50
        }
    },
    {
        key: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter user's email address",
        required: true,
        validation: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },
    {
        key: "phone",
        type: "tel",
        label: "Phone Number",
        placeholder: "Enter user's phone number",
        required: true,
        validation: {
            pattern: /^[\+]?[1-9][\d]{0,15}$/
        }
    },
    {
        key: "role",
        type: "select",
        label: "User Role",
        required: true,
        options: [
            { label: "User", value: "user" },
            { label: "Admin", value: "admin" }
        ]
    },
    {
        key: "password",
        type: "password",
        label: "Password",
        placeholder: "Enter user's password",
        required: !isEditMode.value,
        hidden: isEditMode.value,
        validation: isEditMode.value ? {} : {
            minLength: 6,
            maxLength: 50
        }
    },
    {
        key: "isActive",
        type: "switch",
        label: "Active Status"
    },
    {
        key: "verified",
        type: "switch",
        label: "Email Verified"
    },
    {
        key: "blocked",
        type: "switch",
        label: "Blocked"
    },
    {
        type: "array",
        key: "addresses",
        label: "Addresses",
        description: "Manage user's addresses",
        allowAdd: true,
        allowRemove: true,
        minItems: 0,
        maxItems: 3,
        addButtonText: "+ Add Address",
        removeButtonText: "Remove Address",
        itemLabel: "Address",
        emptyMessage: "No addresses added. Click '+ Add Address' to add one.",
        groupClass: "grid grid-cols-1 gap-4",
        defaultItemData: {
            type: "home",
            area: "",
            paciNumber: "",
            streetName: "",
            additionalInfo: "",
            googleLocationLink: "",
            blockNumber: "",
            buildingNumber: "",
            floor: "",
            apartmentNo: "",
            officeNo: ""
        },
        fields: [
            {
                key: "type",
                type: "select",
                label: "Address Type *",
                required: true,
                options: [
                    { label: "Home", value: "home" },
                    { label: "Building", value: "building" },
                    { label: "Office", value: "office" }
                ]
            },
            {
                key: "area",
                type: "select",
                label: "Area *",
                placeholder: "Select area",
                required: true,
                options: kuwaitAreas.map(area => ({
                    label: area.nameEn,
                    value: area.id
                }))
            },
            {
                key: "paciNumber",
                type: "text",
                label: "PACI Number",
                placeholder: "Enter PACI number",
                // required: false
            },
            {
                key: "streetName",
                type: "text",
                label: "Street Name * (Required for all types)",
                placeholder: "Enter street name",
                required: true
            },
            {
                key: "blockNumber",
                type: "text",
                label: "Block Number * (Required for all types)",
                placeholder: "Enter block number",
                required: true
            },
            {
                key: "buildingNumber",
                type: "text",
                label: "Building Number (Optional)",
                placeholder: "Enter building number (optional)",
                required: false
            },
            {
                key: "floor",
                type: "text",
                label: "Floor (Required for Building type)",
                placeholder: "Enter floor number",
                required: false,
                conditional: {
                    field: "type",
                    value: "building"
                }
            },
            {
                key: "apartmentNo",
                type: "text",
                label: "Apartment No. (Required for Building type)",
                placeholder: "Enter apartment number",
                required: false,
                conditional: {
                    field: "type",
                    value: "building"
                }
            },
            {
                key: "officeNo",
                type: "text",
                label: "Office No. (Required for Office type)",
                placeholder: "Enter office number",
                required: false,
                conditional: {
                    field: "type",
                    value: "office"
                }
            },
            {
                key: "additionalInfo",
                type: "textarea",
                label: "Additional Info",
                placeholder: "Enter additional information (optional)",
                required: false,
                rows: 3
            },
            {
                key: "googleLocationLink",
                type: "url",
                label: "Google Location Link (Optional)",
                placeholder: "Enter Google Maps link",
                required: false
            }
        ]
    }
]);

// Load user data if in edit mode
const loadUserData = async () => {
    if (!isEditMode.value) return;

    loading.value = true;
    error.value = "";

    try {
        const response = await UsersAPI.getUser(userId.value);
        userData.value = response.data.data;
        console.log("Loaded user data:", userData.value);

        // Populate form data
        formData.value = {
            name: userData.value.name || "",
            email: userData.value.email || "",
            phone: userData.value.phone || "",
            role: userData.value.role || "user",
            isActive: userData.value.isActive || false,
            verified: userData.value.verified || false,
            blocked: userData.value.blocked || false,
            password: "", // Don't populate password for security
            addresses: userData.value.addresses || []
        };
    } catch (err) {
        error.value = "Failed to load user data. Please try again.";
        console.error("Error loading user:", err);
    } finally {
        loading.value = false;
    }
};

// Handle form submission
const handleSubmit = async (formValues) => {
    console.log("Form submitted with values:", formValues);
    console.log("isEditMode:", isEditMode.value);
    console.log("userId:", userId.value);

    saving.value = true;
    error.value = "";

    try {
        const userDataToSubmit = {
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            role: formValues.role,
            isActive: formValues.isActive,
            verified: formValues.verified,
            blocked: formValues.blocked,
            addresses: formValues.addresses || []
        };

        // Only include password for new users
        if (!isEditMode.value && formValues.password) {
            userDataToSubmit.password = formValues.password;
        }

        console.log("Submitting data:", userDataToSubmit);

        if (isEditMode.value) {
            await UsersAPI.updateUser(userId.value, userDataToSubmit, authStore.token);
        } else {
            await UsersAPI.createUser(userDataToSubmit);
        }

        console.log("User saved successfully, navigating to users list");
        router.push("/users");
    } catch (err) {
        error.value = err.response?.data?.message || "Failed to save user. Please try again.";
        console.error("Error saving user:", err);
    } finally {
        saving.value = false;
    }
};

// Handle form reset
const handleReset = () => {
    console.log("Form reset triggered");
    if (isEditMode.value && userData.value) {
        formData.value = {
            name: userData.value.name || "",
            email: userData.value.email || "",
            phone: userData.value.phone || "",
            role: userData.value.role || "user",
            isActive: userData.value.isActive || false,
            verified: userData.value.verified || false,
            blocked: userData.value.blocked || false,
            password: "",
            addresses: userData.value.addresses || []
        };
    } else {
        formData.value = {
            name: "",
            email: "",
            phone: "",
            role: "user",
            isActive: true,
            verified: false,
            blocked: false,
            password: "",
            addresses: []
        };
    }
};

// Handle array item events
const handleArrayItemAdd = (fieldKey, index) => {
    console.log('Array item added:', fieldKey, index);
};

const handleArrayItemRemove = (fieldKey, index) => {
    console.log('Array item removed:', fieldKey, index);
};

const handleChange = (field, value, formData) => {
    console.log('Field changed:', field, value);
};

// Watch for route changes to handle navigation between new/edit modes
watch(() => route.params.id, (newId) => {
    console.log("Route changed, new userId:", newId);
    userId.value = newId;
    if (isEditMode.value) {
        loadUserData();
    } else {
        // Reset form for new user
        formData.value = {
            name: "",
            email: "",
            phone: "",
            role: "user",
            isActive: true,
            verified: false,
            blocked: false,
            password: "",
            addresses: []
        };
    }
});

// Load data on mount
onMounted(() => {
    console.log("Component mounted, isEditMode:", isEditMode.value);
    if (isEditMode.value) {
        loadUserData();
    }
});
</script>