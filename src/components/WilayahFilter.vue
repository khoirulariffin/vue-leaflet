<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useWilayah } from '@/composable/useWilayah'

const emit = defineEmits<{
  locationChange: [location: string]
}>()

const {
  provinces,
  regencies,
  districts,
  villages,
  selectedProvince,
  selectedRegency,
  selectedDistrict,
  selectedVillage,
  isLoadingProvinces,
  isLoadingRegencies,
  isLoadingDistricts,
  isLoadingVillages,
  selectedProvinceName,
  selectedRegencyName,
  selectedDistrictName,
  selectedVillageName,
  fullLocationName,
  fetchProvinces,
  fetchRegencies,
  fetchDistricts,
  fetchVillages,
  resetRegencies,
  resetDistricts,
  resetVillages,
} = useWilayah()

onMounted(() => {
  fetchProvinces()
})

// Watch province selection
watch(selectedProvince, async (newValue) => {
  resetRegencies()
  if (newValue) {
    await fetchRegencies(newValue)
  }
})

// Watch regency selection
watch(selectedRegency, async (newValue) => {
  resetDistricts()
  if (newValue) {
    await fetchDistricts(newValue)
  }
})

// Watch district selection
watch(selectedDistrict, async (newValue) => {
  resetVillages()
  if (newValue) {
    await fetchVillages(newValue)
  }
})

// Emit location change
watch(fullLocationName, (newValue) => {
  emit('locationChange', newValue)
})
</script>

<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold mb-4">Filter Wilayah</div>

    <!-- Province -->
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium">Provinsi</span>
      </label>
      <select
        v-model="selectedProvince"
        class="select select-bordered w-full"
        :disabled="isLoadingProvinces"
      >
        <option value="">Pilih Provinsi</option>
        <option v-for="province in provinces" :key="province.code" :value="province.code">
          {{ province.name }}
        </option>
      </select>
      <label v-if="isLoadingProvinces" class="label">
        <span class="label-text-alt text-info">Loading...</span>
      </label>
    </div>

    <!-- Regency -->
    <div v-if="selectedProvince" class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium">Kabupaten/Kota</span>
      </label>
      <select
        v-model="selectedRegency"
        class="select select-bordered w-full"
        :disabled="isLoadingRegencies || regencies.length === 0"
      >
        <option value="">Pilih Kabupaten/Kota</option>
        <option v-for="regency in regencies" :key="regency.code" :value="regency.code">
          {{ regency.name }}
        </option>
      </select>
      <label v-if="isLoadingRegencies" class="label">
        <span class="label-text-alt text-info">Loading...</span>
      </label>
    </div>

    <!-- District -->
    <div v-if="selectedRegency" class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium">Kecamatan</span>
      </label>
      <select
        v-model="selectedDistrict"
        class="select select-bordered w-full"
        :disabled="isLoadingDistricts || districts.length === 0"
      >
        <option value="">Pilih Kecamatan (Opsional)</option>
        <option v-for="district in districts" :key="district.code" :value="district.code">
          {{ district.name }}
        </option>
      </select>
      <label v-if="isLoadingDistricts" class="label">
        <span class="label-text-alt text-info">Loading...</span>
      </label>
    </div>

    <!-- Village -->
    <div v-if="selectedDistrict" class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium">Kelurahan/Desa</span>
      </label>
      <select
        v-model="selectedVillage"
        class="select select-bordered w-full"
        :disabled="isLoadingVillages || villages.length === 0"
      >
        <option value="">Pilih Kelurahan/Desa (Opsional)</option>
        <option v-for="village in villages" :key="village.code" :value="village.code">
          {{ village.name }}
        </option>
      </select>
      <label v-if="isLoadingVillages" class="label">
        <span class="label-text-alt text-info">Loading...</span>
      </label>
    </div>

    <!-- Selected Location Display -->
    <div v-if="fullLocationName" class="alert alert-info">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <div>
        <div class="text-sm font-semibold">Lokasi Terpilih:</div>
        <div class="text-xs">{{ fullLocationName }}</div>
      </div>
    </div>

    <!-- Location Summary -->
    <div v-if="selectedProvinceName" class="bg-base-200 p-4 rounded-lg space-y-2">
      <div class="text-sm">
        <span class="font-semibold">Provinsi:</span> {{ selectedProvinceName }}
      </div>
      <div v-if="selectedRegencyName" class="text-sm">
        <span class="font-semibold">Kabupaten/Kota:</span> {{ selectedRegencyName }}
      </div>
      <div v-if="selectedDistrictName" class="text-sm">
        <span class="font-semibold">Kecamatan:</span> {{ selectedDistrictName }}
      </div>
      <div v-if="selectedVillageName" class="text-sm">
        <span class="font-semibold">Kelurahan/Desa:</span> {{ selectedVillageName }}
      </div>
    </div>
  </div>
</template>
