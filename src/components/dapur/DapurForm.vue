<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div
      class="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex justify-between items-center"
      >
        <h2 class="text-xl font-bold">Tambah Dapur Baru</h2>
        <button @click="emit('close')" class="btn btn-ghost btn-sm btn-circle">
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Nama Dapur -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Nama Dapur</span>
            <span class="label-text-alt text-error">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Contoh: Dapur Umum Bandung"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- Koordinat -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Latitude</span>
            </label>
            <input
              v-model.number="formData.lat"
              type="number"
              step="any"
              class="input input-bordered w-full"
              readonly
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Longitude</span>
            </label>
            <input
              v-model.number="formData.lng"
              type="number"
              step="any"
              class="input input-bordered w-full"
              readonly
            />
          </div>
        </div>

        <!-- Alamat (Optional) -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Alamat</span>
            <span class="label-text-alt text-gray-500">Opsional</span>
          </label>
          <textarea
            v-model="formData.address"
            placeholder="Masukkan alamat lengkap..."
            class="textarea textarea-bordered w-full"
            rows="2"
          ></textarea>
        </div>

        <!-- Sekolah Tujuan -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Sekolah Tujuan</span>
            <span class="label-text-alt text-error">*</span>
          </label>

          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari sekolah berdasarkan nama atau NPSN..."
              class="input input-bordered w-full pr-10"
              @focus="showDropdown = true"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 absolute right-3 top-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <!-- Dropdown Results -->
          <div
            v-if="showDropdown && searchQuery && filteredSchools.length > 0"
            class="mt-2 max-h-60 overflow-y-auto border border-base-300 rounded-lg bg-base-100 shadow-lg z-50 absolute w-full"
          >
            <div
              v-for="school in filteredSchools.slice(0, 50)"
              :key="school.npsn"
              @click="selectSchool(school)"
              class="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
            >
              <div class="font-semibold">{{ school.school_name }}</div>
              <div class="text-sm text-gray-500">
                NPSN: {{ school.npsn }} • {{ school.stage }} •
                {{ school.district }}
              </div>
              <div class="text-xs text-gray-400">{{ school.street_name }}</div>
            </div>
          </div>

          <!-- No Results -->
          <div
            v-if="showDropdown && searchQuery && filteredSchools.length === 0"
            class="mt-2 p-3 border border-base-300 rounded-lg bg-base-100 text-center text-gray-500"
          >
            Tidak ada sekolah ditemukan
          </div>

          <!-- Selected Schools -->
          <div v-if="selectedSchools.length > 0" class="mt-2 space-y-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-semibold">
                Sekolah Terpilih ({{ selectedSchools.length }})
              </span>
              <button
                type="button"
                @click="clearAllSelections"
                class="btn btn-ghost btn-xs"
              >
                Hapus Semua
              </button>
            </div>

            <div
              v-for="school in selectedSchools"
              :key="school.npsn"
              class="p-2 bg-primary bg-opacity-10 border border-primary rounded-lg"
            >
              <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-base-content text-sm truncate">
                    {{ school.school_name }}
                  </div>
                  <div class="text-xs text-base-content opacity-70">
                    NPSN: {{ school.npsn }} • {{ school.stage }}
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeSchool(school.npsn)"
                  class="btn btn-ghost btn-xs btn-circle flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="alert alert-info">
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
          <span class="text-sm">
            Anda dapat memilih lebih dari satu sekolah. Sistem akan menghitung
            rute terpendek untuk setiap sekolah menggunakan algoritma Dijkstra.
          </span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end pt-4 border-t border-base-300">
          <button type="button" @click="emit('close')" class="btn btn-ghost">
            Batal
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="loading loading-spinner loading-sm"
            ></span>
            {{ isSubmitting ? "Menghitung Rute..." : "Simpan & Hitung Rute" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { School } from "@/types/school";
import { useSchoolStore } from "@/stores/school";

interface Props {
  lat: number;
  lng: number;
  preSelectedSchools?: School[];
}

const schoolStore = useSchoolStore();

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  submit: [
    data: {
      name: string;
      lat: number;
      lng: number;
      address?: string;
      selectedSchools: School[];
    },
  ];
}>();

const formData = ref({
  name: "",
  lat: props.lat,
  lng: props.lng,
  address: "",
});

const searchQuery = ref("");
const showDropdown = ref(false);
const selectedSchools = ref<School[]>([]);
const schools = ref<School[]>([]);
const isSubmitting = ref(false);

// Load schools data (Jabar only)
onMounted(async () => {
  try {
    if (schoolStore.schools.length === 0) {
      await schoolStore.loadSchools();
    }
    schools.value = schoolStore.schools;

    // Pre-fill selected schools if provided
    if (props.preSelectedSchools && props.preSelectedSchools.length > 0) {
      selectedSchools.value = [...props.preSelectedSchools];
    }
  } catch (error) {
    console.error("Error loading schools:", error);
  }

  document.addEventListener("click", handleClickOutside);
});

// Filter schools based on search
const filteredSchools = computed(() => {
  if (!searchQuery.value) return schools.value;

  const query = searchQuery.value.toLowerCase();
  return schools.value.filter(
    (school) =>
      school.school_name.toLowerCase().includes(query) ||
      school.npsn.includes(query) ||
      school.district.toLowerCase().includes(query)
  );
});

// Select school
const selectSchool = (school: School) => {
  // Check if already selected
  const exists = selectedSchools.value.find((s) => s.npsn === school.npsn);
  if (!exists) {
    selectedSchools.value.push(school);
  }
  searchQuery.value = "";
  showDropdown.value = false;
};

// Remove school from selection
const removeSchool = (npsn: string) => {
  selectedSchools.value = selectedSchools.value.filter((s) => s.npsn !== npsn);
};

// Clear all selections
const clearAllSelections = () => {
  selectedSchools.value = [];
};

// Form validation
const isFormValid = computed(() => {
  return formData.value.name.trim() !== "" && selectedSchools.value.length > 0;
});

// Handle submit
const handleSubmit = () => {
  if (!isFormValid.value || selectedSchools.value.length === 0) return;

  isSubmitting.value = true;

  emit("submit", {
    name: formData.value.name,
    lat: formData.value.lat,
    lng: formData.value.lng,
    address: formData.value.address || undefined,
    selectedSchools: selectedSchools.value,
  });
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".form-control")) {
    showDropdown.value = false;
  }
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
