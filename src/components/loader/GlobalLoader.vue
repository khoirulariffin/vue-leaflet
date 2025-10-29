<script setup lang="ts">
import { useGlobalStore } from "@/stores/global";

withDefaults(
  defineProps<{
    message?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    message: "Memuat data...",
    size: "md",
  }
);

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const globalStore = useGlobalStore();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="globalStore.global.loading"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        class="flex flex-col items-center justify-center gap-4 bg-white dark:bg-primaryDarkBgColor rounded-lg p-8 shadow-2xl"
      >
        <!-- Spinner -->
        <div
          :class="[sizeClasses[size]]"
          class="animate-spin rounded-full border-4 border-gray-200 border-t-primary"
        ></div>

        <!-- Message -->
        <p
          class="text-primaryTextColor dark:text-white font-medium text-center"
        >
          {{ globalStore.global.title ?? message }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
