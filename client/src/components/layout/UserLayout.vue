<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header class="bg-white dark:bg-gray-800 shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="bg-brand-500 text-white p-1.5 rounded-lg">
                        <HugeiconsIcon :icon="TennisBallIcon" :size="24" />
                    </div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Padel Booking</h1>
                </div>
                <div class="flex items-center gap-4">
                    <template v-if="authStore.isAuthenticated">
                        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <HugeiconsIcon :icon="UserCircleIcon" :size="20" />
                            <span>{{ authStore.user?.name }}</span>
                        </div>
                        <button 
                            v-if="isAdmin"
                            @click="goToAdmin"
                            class="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-500 font-medium transition-colors"
                            title="Admin Dashboard"
                        >
                            <HugeiconsIcon :icon="DashboardSquare01Icon" :size="20" />
                            <span class="hidden sm:inline">Dashboard</span>
                        </button>
                        <button 
                            @click="logout"
                            class="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-500 font-medium transition-colors"
                            title="Logout"
                        >
                            <HugeiconsIcon :icon="Logout03Icon" :size="20" />
                            <span class="hidden sm:inline">Logout</span>
                        </button>
                    </template>
                    <template v-else>
                        <button 
                            @click="goToLogin"
                            class="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-500 font-medium transition-colors"
                        >
                            <HugeiconsIcon :icon="Login03Icon" :size="20" />
                            <span>Login</span>
                        </button>
                    </template>
                </div>
            </div>
        </header>
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot></slot>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';
import { HugeiconsIcon } from '@hugeicons/vue';
import { 
    Login03Icon, 
    Logout03Icon, 
    DashboardSquare01Icon, 
    UserCircleIcon,
    TennisBallIcon
} from '@hugeicons/core-free-icons';

const router = useRouter();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.role === 'admin' || authStore.user?.role === 'super-admin');

const goToAdmin = () => {
    router.push('/bookings');
};

const goToLogin = () => {
    router.push('/signin');
};

const logout = () => {
    authStore.logout();
    router.push('/signin');
};
</script>
