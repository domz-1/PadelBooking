<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <ComponentCard title="Notifications">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">My Notifications</h3>
                    <button 
                        @click="goToSendBroadcast"
                        class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Send Broadcast
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>

                <!-- Data Table -->
                <DataTable 
                    v-else
                    :columns="columns"
                    :data="notifications"
                    :showActions="false"
                >
                    <template #column-isRead="{ item }">
                        <span :class="item.isRead ? 'text-green-600' : 'text-yellow-600 font-bold'">
                            {{ item.isRead ? 'Read' : 'Unread' }}
                        </span>
                    </template>
                    
                    <template #column-actions="{ item }">
                         <button 
                            v-if="!item.isRead"
                            @click="markRead(item)"
                            class="text-sm text-brand-600 hover:text-brand-800"
                        >
                            Mark as Read
                        </button>
                    </template>
                </DataTable>
            </ComponentCard>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NotificationsAPI } from "@/api/NotificationsAPI";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";

const router = useRouter();
const currentPageTitle = ref("Notifications");
const notifications = ref([]);
const loading = ref(false);

const columns: Column[] = [
    { key: 'title', title: 'Title', type: 'text' },
    { key: 'message', title: 'Message', type: 'text' },
    { key: 'type', title: 'Type', type: 'text' },
    { key: 'isRead', title: 'Status', type: 'custom' },
    { key: 'createdAt', title: 'Date', type: 'text' },
    { key: 'actions', title: 'Actions', type: 'custom' }
];

const fetchNotifications = async () => {
    loading.value = true;
    try {
        const response = await NotificationsAPI.getMyNotifications({});
        notifications.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
    } finally {
        loading.value = false;
    }
};

const goToSendBroadcast = () => {
    router.push('/notifications/broadcast');
};

const markRead = async (item: any) => {
    try {
        await NotificationsAPI.markAsRead(item.id);
        // Update local state or refetch
        item.isRead = true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

onMounted(() => {
    fetchNotifications();
});
</script>
