<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[1002] flex items-center justify-center bg-black bg-opacity-50"
    @click.self="emit('close')"
  >
    <div
      class="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center p-4 border-b border-base-300"
      >
        <h2 class="text-xl font-bold">🎯 Rekomendasi Lokasi Dapur</h2>
        <button @click="emit('close')" class="btn btn-ghost btn-sm btn-circle">
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Step 1: Select Schools -->
        <div v-if="step === 1">
          <div class="alert alert-info mb-4">
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
              Pilih sekolah-sekolah yang ingin dilayani. Sistem akan menghitung
              lokasi optimal dapur.
            </span>
          </div>

          <!-- Search -->
          <div class="form-control mb-4">
            <label class="label"
              ><span class="label-text font-semibold">Cari Sekolah</span></label
            >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan nama atau NPSN..."
              class="input input-bordered w-full"
            />
          </div>

          <!-- Selected Count -->
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold"
              >Sekolah Terpilih: {{ selectedSchools.length }}</span
            >
            <button
              v-if="selectedSchools.length > 0"
              @click="clearAllSelections"
              class="btn btn-ghost btn-xs"
            >
              Hapus Semua
            </button>
          </div>

          <!-- Selected Schools -->
          <div
            v-if="selectedSchools.length > 0"
            class="mb-4 space-y-2 max-h-40 overflow-y-auto"
          >
            <div
              v-for="school in selectedSchools"
              :key="school.npsn"
              class="p-2 bg-primary bg-opacity-10 border border-primary rounded-lg flex justify-between items-center"
            >
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm truncate">
                  {{ school.school_name }}
                </div>
                <div class="text-xs opacity-70">NPSN: {{ school.npsn }}</div>
              </div>
              <button
                @click="removeSchool(school.npsn)"
                class="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- School List -->
          <div
            class="border border-base-300 rounded-lg max-h-96 overflow-y-auto"
          >
            <div
              v-for="school in filteredSchools.slice(0, 100)"
              :key="school.npsn"
              class="p-3 border-b border-base-300 last:border-b-0 hover:bg-base-200 cursor-pointer flex items-start gap-3"
              @click="toggleSchool(school)"
            >
              <input
                type="checkbox"
                :checked="isSelected(school.npsn)"
                class="checkbox checkbox-primary mt-1"
                @click.stop="toggleSchool(school)"
              />
              <div class="flex-1">
                <div class="font-semibold">{{ school.school_name }}</div>
                <div class="text-sm text-gray-500">
                  NPSN: {{ school.npsn }} • {{ school.stage }} •
                  {{ school.district }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ school.street_name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Result -->
        <div v-if="step === 2 && recommendation">
          <div class="alert alert-success mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Lokasi optimal berhasil dihitung!</span>
          </div>

          <div class="card bg-base-200 mb-4">
            <div class="card-body">
              <h3 class="card-title text-lg">📍 Lokasi Rekomendasi</h3>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <div class="text-sm opacity-70">Latitude</div>
                  <div class="font-mono font-bold">
                    {{ recommendation.lat.toFixed(6) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm opacity-70">Longitude</div>
                  <div class="font-mono font-bold">
                    {{ recommendation.lng.toFixed(6) }}
                  </div>
                </div>
              </div>
              <div class="divider"></div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm opacity-70">Rata-rata Jarak</div>
                  <div class="font-bold text-primary">
                    {{ (recommendation.averageDistance / 1000).toFixed(2) }} km
                  </div>
                </div>
                <div>
                  <div class="text-sm opacity-70">Rata-rata Waktu Tempuh</div>
                  <div class="font-bold text-primary">
                    {{ Math.round(recommendation.averageDuration / 60) }} menit
                  </div>
                </div>
              </div>
              <div class="mt-2">
                <div class="text-sm opacity-70">Total Sekolah</div>
                <div class="font-bold">
                  {{ recommendation.schools.length }} sekolah
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-base-200">
            <div class="card-body">
              <h3 class="card-title text-sm">Sekolah yang Dilayani</h3>
              <div class="space-y-1 max-h-40 overflow-y-auto">
                <div
                  v-for="(school, index) in recommendation.schools"
                  :key="school.npsn"
                  class="text-sm"
                >
                  {{ index + 1 }}. {{ school.school_name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div
          v-if="isCalculating"
          class="flex flex-col items-center justify-center py-12"
        >
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="mt-4 text-sm">Menghitung lokasi optimal...</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-2 justify-end p-4 border-t border-base-300">
        <button v-if="step === 1" @click="emit('close')" class="btn btn-ghost">
          Batal
        </button>
        <button
          v-if="step === 1"
          @click="calculateRecommendation"
          :disabled="selectedSchools.length === 0 || isCalculating"
          class="btn btn-primary"
        >
          <span v-if="isCalculating" class="loading loading-spinner"></span>
          {{ isCalculating ? "Menghitung..." : "Hitung Lokasi Optimal" }}
        </button>
        <button v-if="step === 2" @click="step = 1" class="btn btn-ghost">
          Kembali
        </button>
        <button
          v-if="step === 2 && recommendation"
          @click="createDapur"
          class="btn btn-primary"
        >
          🍳 Buat Dapur
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { School } from "@/types/school";
import { useSchoolStore } from "@/stores/school";
import {
  useRecommendation,
  type RecommendationResult,
} from "@/composable/useRecommendation";

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  createDapur: [
    data: { lat: number; lng: number; selectedSchools: School[]; name: string },
  ];
}>();

const schoolStore = useSchoolStore();
const { calculateOptimalLocation } = useRecommendation();

const searchQuery = ref("");
const selectedSchools = ref<School[]>([]);
const step = ref(1);
const isCalculating = ref(false);
const recommendation = ref<RecommendationResult | null>(null);

const filteredSchools = computed(() => {
  const schools = schoolStore.schools;
  if (!searchQuery.value) return schools;
  const query = searchQuery.value.toLowerCase();
  return schools.filter(
    (school) =>
      school.school_name.toLowerCase().includes(query) ||
      school.npsn.includes(query) ||
      school.district.toLowerCase().includes(query)
  );
});

const isSelected = (npsn: string) =>
  selectedSchools.value.some((s) => s.npsn === npsn);

const toggleSchool = (school: School) => {
  const index = selectedSchools.value.findIndex((s) => s.npsn === school.npsn);
  if (index > -1) {
    selectedSchools.value.splice(index, 1);
  } else {
    selectedSchools.value.push(school);
  }
};

const removeSchool = (npsn: string) => {
  selectedSchools.value = selectedSchools.value.filter((s) => s.npsn !== npsn);
};

const clearAllSelections = () => {
  selectedSchools.value = [];
};

const calculateRecommendation = async () => {
  if (selectedSchools.value.length === 0) return;
  isCalculating.value = true;
  try {
    const result = await calculateOptimalLocation(selectedSchools.value);
    if (result) {
      recommendation.value = result;
      step.value = 2;
    } else {
      alert("Gagal menghitung lokasi optimal.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menghitung.");
  } finally {
    isCalculating.value = false;
  }
};

const createDapur = () => {
  if (!recommendation.value) return;

  // Generate default name
  const defaultName = `Dapur Rekomendasi ${new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  emit("createDapur", {
    lat: recommendation.value.lat,
    lng: recommendation.value.lng,
    selectedSchools: recommendation.value.schools,
    name: defaultName,
  });
};
</script>
