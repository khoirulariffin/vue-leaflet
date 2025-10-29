<template>
  <BasePopover
    position="bottom-right"
    width="md"
    custom-class="bg-[oklch(0.62_0.12_45)] hover:bg-[oklch(0.58_0.12_45)] text-white border-none"
  >
    <template #trigger>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Settings
    </template>

    <template #default="{ close }">
      <div class="p-4">
        <!-- Header -->
        <div
          class="flex items-center justify-between mb-4 pb-3 border-b border-base-300"
        >
          <h3 class="text-lg font-bold">Pengaturan Peta</h3>
          <button
            @click="close"
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <!-- Settings Options -->
        <div class="space-y-3">
          <!-- Show Markers -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                v-model="settingsStore.showMarkers"
                class="checkbox checkbox-primary"
              />
              <span class="label-text font-medium"
                >Tampilkan Marker Sekolah</span
              >
            </label>
          </div>

          <div class="divider my-2">Area Boundaries</div>

          <!-- Show Province Areas -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                v-model="settingsStore.showProvinceAreas"
                class="checkbox checkbox-error"
              />
              <div>
                <span class="label-text font-medium">Area Provinsi</span>
                <p class="text-xs text-gray-500">
                  Tampilkan batas wilayah provinsi
                </p>
              </div>
            </label>
          </div>

          <!-- Show City Areas -->
          <!-- <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                v-model="settingsStore.showCityAreas"
                class="checkbox checkbox-warning"
              />
              <div>
                <span class="label-text font-medium">Area Kab/Kota</span>
                <p class="text-xs text-gray-500">
                  Tampilkan batas wilayah kabupaten/kota
                </p>
              </div>
            </label>
          </div> -->

          <!-- Show District Areas -->
          <!-- <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                v-model="settingsStore.showDistrictAreas"
                class="checkbox checkbox-info"
              />
              <div>
                <span class="label-text font-medium">Area Kecamatan</span>
                <p class="text-xs text-gray-500">
                  Tampilkan batas wilayah kecamatan
                </p>
              </div>
            </label>
          </div> -->

          <!-- Reset Button -->
          <div class="pt-3 border-t border-base-300">
            <button @click="handleReset" class="btn btn-ghost btn-sm btn-block">
              Reset ke Default
            </button>
          </div>

          <!-- Info -->
          <!-- <div class="alert alert-info py-2 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current shrink-0 w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Area dibuat dari convex hull marker sekolah</span>
          </div> -->
        </div>
      </div>
    </template>
  </BasePopover>
</template>

<script setup lang="ts">
import BasePopover from "@/components/base/BasePopover.vue";
import { useMapSettingsStore } from "@/stores/mapSettings";

const settingsStore = useMapSettingsStore();

const handleReset = () => {
  settingsStore.resetSettings();
};
</script>
