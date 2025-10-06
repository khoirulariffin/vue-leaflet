<template>
  <div class="min-h-screen transition-colors">
    <MapLeaflet />
    <ButtonDarkMode customClass="fixed bottom-4 left-2" />
  </div>
</template>

<script setup lang="ts">
import ButtonDarkMode from '@/components/button/ButtonDarkMode.vue'
import MapLeaflet from '@/components/map/MapLeaflet.vue'
</script>

<style scoped></style>
