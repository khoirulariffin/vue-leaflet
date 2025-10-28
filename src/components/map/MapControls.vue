<template>
  <div class="z-[1000] flex gap-2 w-full">
    <!-- Filter Popover -->
    <BasePopover
      position="bottom-right"
      width="md"
      trigger-text="☰ Menu"
      custom-class="btn-primary"
    >
      <template #default="{ close }">
        <div class="p-4">
          <!-- Header -->
          <div
            class="flex items-center justify-between mb-4 pb-3 border-b border-base-300"
          >
            <h3 class="text-lg font-bold">Menu Peta</h3>
            <button
              @click="close"
              class="btn btn-ghost btn-sm btn-circle"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <!-- Menu Items -->
          <div class="space-y-2">
            <!-- Tambah Area Button -->
            <button
              @click="handleTambahArea(close)"
              class="btn btn-primary btn-block justify-start gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Area
            </button>

            <div class="divider my-2">Filter Data</div>

            <!-- Filter Province -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Provinsi</span>
                <button
                  v-if="filters.province"
                  @click="clearFilter('province')"
                  class="btn btn-ghost btn-xs"
                >
                  Reset
                </button>
              </label>
              <select
                v-model="filters.province"
                class="select select-bordered select-sm w-full"
                @change="onProvinceChange"
              >
                <option value="">Semua Provinsi</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>

            <!-- Filter City -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Kab/Kota</span>
                <button
                  v-if="filters.city"
                  @click="clearFilter('city')"
                  class="btn btn-ghost btn-xs"
                >
                  Reset
                </button>
              </label>
              <select
                v-model="filters.city"
                class="select select-bordered select-sm w-full"
                :disabled="!filters.province"
                @change="onCityChange"
              >
                <option value="">
                  {{
                    filters.province ? "Semua Kab/Kota" : "Pilih Provinsi Dulu"
                  }}
                </option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
            </div>

            <!-- Filter District -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Kecamatan</span>
                <button
                  v-if="filters.district"
                  @click="clearFilter('district')"
                  class="btn btn-ghost btn-xs"
                >
                  Reset
                </button>
              </label>
              <select
                v-model="filters.district"
                class="select select-bordered select-sm w-full"
                :disabled="!filters.city"
              >
                <option value="">
                  {{ filters.city ? "Semua Kecamatan" : "Pilih Kab/Kota Dulu" }}
                </option>
                <option
                  v-for="district in districts"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>

            <!-- Apply Filter Button -->
            <div class="pt-3 border-t border-base-300 flex gap-2">
              <button
                @click="applyFilters(close)"
                class="btn btn-success btn-sm flex-1"
                :disabled="!hasActiveFilters"
              >
                Terapkan Filter
              </button>
              <button
                @click="resetAllFilters"
                class="btn btn-ghost btn-sm"
                :disabled="!hasActiveFilters"
              >
                Reset Semua
              </button>
            </div>

            <!-- Active Filters Info -->
            <div v-if="hasActiveFilters" class="alert alert-info py-2 text-xs">
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
              <span>{{ activeFiltersCount }} filter aktif</span>
            </div>
          </div>
        </div>
      </template>
    </BasePopover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BasePopover from "@/components/base/BasePopover.vue";
import { useSchoolStore } from "@/stores/school";
import { storeToRefs } from "pinia";

interface Filters {
  province: number | string;
  city: number | string;
  district: number | string;
}

const emit = defineEmits<{
  "tambah-area": [];
  "apply-filters": [filters: Filters];
}>();

const schoolStore = useSchoolStore();
const { provinces } = storeToRefs(schoolStore);

const cities = ref<{ id: number; name: string }[]>([]);
const districts = ref<{ id: number; name: string }[]>([]);

const filters = ref<Filters>({
  province: "",
  city: "",
  district: "",
});

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.province ||
    filters.value.city ||
    filters.value.district
  );
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.province) count++;
  if (filters.value.city) count++;
  if (filters.value.district) count++;
  return count;
});

const handleTambahArea = (close: () => void) => {
  emit("tambah-area");
  close();
};

const onProvinceChange = () => {
  // Reset dependent filters
  filters.value.city = "";
  filters.value.district = "";

  // Load cities based on selected province
  if (filters.value.province) {
    cities.value = schoolStore.getCitiesByProvince(filters.value.province);
  } else {
    cities.value = [];
  }
  districts.value = [];
};

const onCityChange = () => {
  // Reset dependent filters
  filters.value.district = "";

  // Load districts based on selected city
  if (filters.value.city) {
    districts.value = schoolStore.getDistrictsByCity(filters.value.city);
  } else {
    districts.value = [];
  }
};

const clearFilter = (filterType: keyof Filters) => {
  filters.value[filterType] = "";

  // Reset dependent filters
  if (filterType === "province") {
    filters.value.city = "";
    filters.value.district = "";
    cities.value = [];
    districts.value = [];
  } else if (filterType === "city") {
    filters.value.district = "";
    districts.value = [];
  }

  // Update store dengan filter yang sudah di-clear
  schoolStore.setFilters({ ...filters.value });
};

const resetAllFilters = () => {
  filters.value = {
    province: "",
    city: "",
    district: "",
  };
  cities.value = [];
  districts.value = [];

  // Reset filters di store juga
  schoolStore.resetFilters();
};

const applyFilters = (close: () => void) => {
  schoolStore.setFilters({ ...filters.value });
  emit("apply-filters", { ...filters.value });
  close();
};
</script>
