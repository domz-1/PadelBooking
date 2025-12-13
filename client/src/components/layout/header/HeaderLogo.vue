<template>
  <router-link to="/" class="lg:hidden">
    <img class="dark:hidden w-12" src="https://luxankw.com/api/v1/logo" alt="Logo" />
    <img class="hidden dark:block w-12" src="https://luxankw.com/api/v1/logo-dark" alt="Logo" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
