<template>
  <router-link to="/" class="lg:hidden">
    <img class="dark:hidden w-12" :src="configStore.logoUrl" alt="Logo" />
    <img class="hidden dark:block w-12" :src="configStore.logoUrl" alt="Logo" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useConfigStore } from '@/stores/ConfigStore'

const configStore = useConfigStore()
</script>
