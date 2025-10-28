<script setup lang="ts">
import { ref, computed } from 'vue'
import WilayahFilter from '@/components/WilayahFilter.vue'
import { useScraperStore } from '@/stores/scraper'

const scraperStore = useScraperStore()

const selectedLocation = ref('')
const searchQuery = ref('sekolah')
const maxResults = ref(20)

const handleLocationChange = (location: string) => {
  selectedLocation.value = location
}

const canStartScraping = computed(() => {
  return selectedLocation.value.length > 0 && !scraperStore.isScraperRunning
})

const startScraping = () => {
  if (!canStartScraping.value) return

  alert(
    '⚠️ Scraping akan dijalankan via CLI.\n\n' +
      'Buka terminal dan jalankan:\n\n' +
      `npm run scrape -- --query "${searchQuery.value}" --location "${selectedLocation.value}" --max ${maxResults.value}\n\n` +
      'Pastikan sudah install dependencies terlebih dahulu:\n' +
      'npm install && npx playwright install',
  )
}

const handleExportJSON = () => {
  if (scraperStore.schools.length === 0) {
    alert('Tidak ada data untuk di-export')
    return
  }
  scraperStore.exportToJSON()
}

const handleExportCSV = () => {
  if (scraperStore.schools.length === 0) {
    alert('Tidak ada data untuk di-export')
    return
  }
  scraperStore.exportToCSV()
}

const handleClearData = () => {
  if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
    scraperStore.clearSchools()
    scraperStore.resetProgress()
  }
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">🏫 School Scraper Tool</h1>
      <p class="text-base-content/70">
        Tools untuk scraping data sekolah dari Google Maps dengan filter wilayah Indonesia
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Panel - Filters -->
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <WilayahFilter @location-change="handleLocationChange" />

            <div class="divider"></div>

            <!-- Search Configuration -->
            <div class="space-y-4">
              <div class="text-lg font-semibold">Konfigurasi Pencarian</div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">Query Pencarian</span>
                </label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="sekolah"
                  class="input input-bordered w-full"
                />
                <label class="label">
                  <span class="label-text-alt">Kata kunci untuk pencarian</span>
                </label>
              </div>

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">Maksimal Hasil</span>
                </label>
                <input
                  v-model.number="maxResults"
                  type="number"
                  min="1"
                  max="100"
                  class="input input-bordered w-full"
                />
                <label class="label">
                  <span class="label-text-alt">Jumlah maksimal data yang akan di-scrape</span>
                </label>
              </div>

              <button
                class="btn btn-primary w-full"
                :disabled="!canStartScraping"
                @click="startScraping"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Mulai Scraping
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Results & Actions -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Stats -->
        <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-8 h-8 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <div class="stat-title">Total Sekolah</div>
            <div class="stat-value text-primary">{{ scraperStore.schools.length }}</div>
            <div class="stat-desc">Data yang berhasil di-scrape</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-8 h-8 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div class="stat-title">Status</div>
            <div class="stat-value text-secondary">
              {{ scraperStore.progress.status === 'idle' ? 'Siap' : scraperStore.progress.status }}
            </div>
            <div class="stat-desc">{{ scraperStore.progress.message || 'Menunggu...' }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Export Data</h2>
            <p class="text-sm text-base-content/70">
              Download hasil scraping dalam format JSON atau CSV
            </p>

            <div class="card-actions justify-end mt-4">
              <button
                class="btn btn-outline btn-success"
                :disabled="scraperStore.schools.length === 0"
                @click="handleExportJSON"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export JSON
              </button>

              <button
                class="btn btn-outline btn-info"
                :disabled="scraperStore.schools.length === 0"
                @click="handleExportCSV"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </button>

              <button
                class="btn btn-outline btn-error"
                :disabled="scraperStore.schools.length === 0"
                @click="handleClearData"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Data
              </button>
            </div>
          </div>
        </div>

        <!-- Data Preview -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Preview Data</h2>

            <div v-if="scraperStore.schools.length === 0" class="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mx-auto text-base-content/30 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p class="text-base-content/50">Belum ada data. Mulai scraping untuk melihat hasil.</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Sekolah</th>
                    <th>Alamat</th>
                    <th>Rating</th>
                    <th>Reviews</th>
                    <th>Koordinat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(school, index) in scraperStore.schools.slice(0, 10)" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td class="font-medium">{{ school.name }}</td>
                    <td class="max-w-xs truncate">{{ school.address }}</td>
                    <td>
                      <span v-if="school.rating" class="badge badge-success">
                        ⭐ {{ school.rating }}
                      </span>
                      <span v-else class="text-base-content/50">-</span>
                    </td>
                    <td>{{ school.totalReviews || '-' }}</td>
                    <td class="text-xs">
                      {{ school.coordinates.lat.toFixed(6) }},
                      {{ school.coordinates.lng.toFixed(6) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="scraperStore.schools.length > 10" class="text-center mt-4 text-sm">
                Menampilkan 10 dari {{ scraperStore.schools.length }} data
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="alert alert-warning">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 class="font-bold">Cara Menggunakan Scraper</h3>
            <div class="text-sm mt-2 space-y-1">
              <p>1. Pilih wilayah menggunakan filter di sebelah kiri</p>
              <p>2. Atur query pencarian dan maksimal hasil</p>
              <p>3. Klik "Mulai Scraping" untuk mendapatkan command CLI</p>
              <p>4. Jalankan command di terminal</p>
              <p>5. Hasil akan tersimpan di folder <code class="bg-base-300 px-1">data/</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
