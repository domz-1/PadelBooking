<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Users Management">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Users</h3>
                    <button 
                        @click="goToAddUser"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Add User
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search users by name, email, or phone..."
                            class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav class="-mb-px flex space-x-8">
                        <button
                            @click="activeTab = 'all'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'all'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            All Users
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {{ pagination.totalDocuments }}
                            </span>
                        </button>
                        <button
                            @click="activeTab = 'normal'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'normal'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            Normal Users
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                {{ activeTab === 'normal' ? pagination.totalDocuments : '—' }}
                            </span>
                        </button>
                        <button
                            @click="activeTab = 'guest'"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === 'guest'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            ]"
                        >
                            Guest Users
                            <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                {{ activeTab === 'guest' ? pagination.totalDocuments : '—' }}
                            </span>
                        </button>
                    </nav>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>

                <!-- Data Table -->
                <DataTable 
                    v-else
                    :columns="currentColumns"
                    :data="filteredUsers"
                    :showActions="true"
                    :onView="viewUser"
                    :onEdit="editUser"
                    :onDelete="deleteUser"
                >
                    <!-- Custom slots for specific columns -->
                    <template #column-name="{ item }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {{ getInitials(item.displayName) }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-medium text-gray-800 text-sm dark:text-white/90">
                                    {{ item.displayName }}
                                </span>
                                <span v-if="!item.isGuest" class="block text-gray-500 text-xs dark:text-gray-400" :title="item.email">
                                    {{ formatEmail(item.email) }}
                                </span>
                                <span v-else class="block text-gray-400 text-xs dark:text-gray-500 italic">
                                    Guest User
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #column-contact="{ item }">
                        <div>
                            <span class="block text-gray-800 dark:text-white text-sm">
                                {{ item.phone || '—' }}
                            </span>
                            <span v-if="!item.isGuest" class="block text-gray-500 text-xs dark:text-gray-400" :title="item.email">
                                {{ formatEmail(item.email) }}
                            </span>
                            <span v-else class="block text-gray-400 text-xs dark:text-gray-500 italic">
                                Guest User
                            </span>
                        </div>
                    </template>

                    <template #column-role="{ item }">
                        <span :class="getRoleBadgeClass(item.role)">
                            {{ item.role }}
                        </span>
                    </template>

                    <template #column-type="{ item }">
                        <span :class="item.isGuest ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'" class="rounded-full px-2 py-0.5 text-xs font-medium">
                            {{ item.isGuest ? 'Guest' : 'Registered' }}
                        </span>
                    </template>

                    <template #column-status="{ item }">
                        <span :class="getStatusBadgeClass(item.isActive)">
                            {{ item.isActive ? 'Active' : 'Inactive' }}
                        </span>
                    </template>
                </DataTable>

                <!-- Pagination -->
                <Pagination
                    v-if="pagination.totalPages > 1"
                    :current-page="pagination.currentPage"
                    :total-pages="pagination.totalPages"
                    :total-documents="pagination.totalDocuments"
                    :limit="pagination.limit"
                    :has-next-page="pagination.hasNextPage"
                    :has-prev-page="pagination.hasPrevPage"
                    @page-change="handlePageChange"
                />
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { UsersAPI } from "@/api/UsersAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import Pagination from '@/components/common/Pagination.vue';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: string;
    isGuest?: boolean;
    displayName?: string;
}

const router = useRouter();
const currentPageTitle = ref("Users");
const users = ref<User[]>([]);
const loading = ref(false);
const activeTab = ref('all');
const searchQuery = ref('');
const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
});

// Determine if a user is a guest based on email pattern
const isGuestUser = (user: any) => {
    return user.email && (
        user.email.includes('@temp.local') || 
        user.email.startsWith('guest_') ||
        user.name?.startsWith('Guest_')
    );
};

// Format guest display name
const formatGuestName = (user: any) => {
    if (user.name && user.name.startsWith('Guest_')) {
        return `Guest ${user.name.split('_')[1]?.substring(0, 6) || ''}`;
    }
    return user.name || 'Guest User';
};

// Computed: All users with guest detection and proper display formatting
const allUsers = computed(() => {
    return users.value.map((user: User) => ({
        ...user,
        isGuest: isGuestUser(user),
        displayName: isGuestUser(user) ? formatGuestName(user) : user.name
    }));
});

// Computed: Current users to display (server-side filtered)
const filteredUsers = computed(() => {
    return allUsers.value;
});

// Table columns configuration based on active tab
const currentColumns = computed<Column[]>(() => {
    const baseColumns: Column[] = [
        { key: 'name', title: 'Name', type: 'custom' },
        { key: 'role', title: 'Role', type: 'status' }
    ];

    if (activeTab.value === 'guest') {
        // Minimal columns for guests
        return [
            ...baseColumns,
            { key: 'type', title: 'Type', type: 'status' },
            { key: 'createdAt', title: 'Created', type: 'text' }
        ];
    } else if (activeTab.value === 'normal') {
        // Full columns for normal users
        return [
            ...baseColumns,
            { key: 'contact', title: 'Contact', type: 'custom' },
            { key: 'status', title: 'Status', type: 'status' },
            { key: 'createdAt', title: 'Created', type: 'text' }
        ];
    } else {
        // All tab shows type column
        return [
            ...baseColumns,
            { key: 'type', title: 'Type', type: 'status' },
            { key: 'contact', title: 'Contact', type: 'custom' },
            { key: 'status', title: 'Status', type: 'status' },
            { key: 'createdAt', title: 'Created', type: 'text' }
        ];
    }
});

// Get users data
const fetchUsers = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.value.currentPage,
            limit: pagination.value.limit,
            search: searchQuery.value.trim() || undefined,
            isGuest: undefined as boolean | undefined
        };
        
        // Add filter based on active tab
        if (activeTab.value === 'guest') {
            // Filter for guest users (users with temp emails or guest names)
            params.isGuest = true;
        } else if (activeTab.value === 'normal') {
            // Filter for normal users (exclude guests)
            params.isGuest = false;
        }
        
        const response = await UsersAPI.getAllUsers(params);
        
        if (response.data.data) {
            users.value = response.data.data.users.map((user: any) => ({
                ...user,
                createdAt: formatDate(user.createdAt)
            }));
            
            // Update pagination info
            if (response.data.data.pagination) {
                pagination.value = {
                    ...response.data.data.pagination
                };
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        // Show user-friendly error message
        users.value = [];
        pagination.value = {
            currentPage: 1,
            totalPages: 1,
            totalDocuments: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10
        };
    } finally {
        loading.value = false;
    }
};

// Handle page change
const handlePageChange = (page: number) => {
    pagination.value.currentPage = page;
    fetchUsers();
};

// Utility functions
const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatEmail = (email: string) => {
    if (!email) return '—';
    if (email.length <= 30) return email;
    return email.substring(0, 27) + '...';
};

const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
        'admin': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500',
        'user': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    };
    return `rounded-full px-2 py-0.5 text-theme-xs font-medium ${classes[role] || classes.user}`;
};

const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
        ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500 rounded-full px-2 py-0.5 text-theme-xs font-medium'
        : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500 rounded-full px-2 py-0.5 text-theme-xs font-medium';
};

// Navigation functions
const goToAddUser = () => {
    router.push('/users/edit/new');
};

const viewUser = (user: any) => {
    router.push(`/users/view/${user._id}`);
};

const editUser = (user: any) => {
    router.push(`/users/edit/${user._id}`);
};

const deleteUser = async (user: any) => {
    const userName = user.isGuest ? 'this guest user' : user.name;
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
        try {
            await UsersAPI.deleteUser(user._id);
            await fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    }
};

// Debounced search function
let searchTimeout: any;
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        pagination.value.currentPage = 1;
        fetchUsers();
    }, 500);
};

// Watch for search query changes
watch(searchQuery, () => {
    debouncedSearch();
});

// Watch for tab changes
watch(activeTab, () => {
    // Reset to first page when changing tabs
    pagination.value.currentPage = 1;
    fetchUsers();
});

// Load data on mount
onMounted(() => {
    fetchUsers();
});
</script>