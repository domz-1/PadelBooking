<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="'Bookings'" />
        <BookingsView :is-admin="true" />
    </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import BookingsView from "./BookingsView.vue";
</script>
