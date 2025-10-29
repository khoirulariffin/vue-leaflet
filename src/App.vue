<script setup lang="ts">
import { RouterView } from "vue-router";
import GlobalLoader from "./components/loader/GlobalLoader.vue";
</script>

<template>
  <RouterView />
  <GlobalLoader />
</template>
