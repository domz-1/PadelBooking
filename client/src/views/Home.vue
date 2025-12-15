<template>
    <UserLayout>
        <BookingsView :is-admin="false" />
    </UserLayout>
</template>

<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import BookingsView from "./Bookings/BookingsView.vue";
</script>
