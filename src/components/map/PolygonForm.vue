<template>
  <div
    class="fixed top-4 right-4 w-96 bg-base-100 shadow-xl rounded-lg p-4 z-[1000] max-h-[90vh] overflow-y-auto"
  >
    <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Area' : 'Tambah Area Baru' }}</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nama Area -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Nama Area</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Contoh: Indonesia Bagian Utara"
          class="input input-bordered input-sm w-full"
          required
        />
      </div>

      <!-- Deskripsi -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Deskripsi</span>
        </label>
        <textarea
          v-model="form.description"
          placeholder="Deskripsi area..."
          class="textarea textarea-bordered textarea-sm w-full"
          rows="2"
          required
        ></textarea>
      </div>

      <!-- Koordinat -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Koordinat (Latitude, Longitude)</span>
        </label>

        <!-- Toggle Click Mode -->
        <div class="alert alert-info py-2 mb-2" v-if="isClickModeActive">
          <span class="text-xs">🗺️ Mode Klik Aktif - Klik pada peta untuk menambah titik</span>
        </div>

        <div class="flex gap-2 mb-2">
          <button
            type="button"
            @click="toggleClickMode"
            :class="['btn btn-sm flex-1', isClickModeActive ? 'btn-error' : 'btn-success']"
          >
            {{ isClickModeActive ? '🛑 Nonaktifkan Klik Peta' : '🗺️ Aktifkan Klik Peta' }}
          </button>
          <button
            v-if="isClickModeActive"
            type="button"
            @click="clearAllCoordinates"
            class="btn btn-sm btn-warning"
            title="Hapus semua koordinat"
          >
            🗑️
          </button>
        </div>

        <div class="space-y-2">
          <div v-for="(coord, index) in form.coordinates" :key="index" class="flex gap-2">
            <input
              v-model.number="coord[0]"
              type="number"
              step="0.0001"
              placeholder="Latitude"
              class="input input-bordered input-sm flex-1"
              required
            />
            <input
              v-model.number="coord[1]"
              type="number"
              step="0.0001"
              placeholder="Longitude"
              class="input input-bordered input-sm flex-1"
              required
            />
            <button
              type="button"
              @click="removeCoordinate(index)"
              class="btn btn-sm btn-error btn-square"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          type="button"
          @click="addCoordinate"
          class="btn btn-sm btn-outline btn-primary mt-2 w-full"
        >
          ➕ Tambah Titik Manual
        </button>
      </div>

      <!-- Warna -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Warna Border</span>
          </label>
          <input
            v-model="form.color"
            type="color"
            class="input input-bordered input-sm w-full h-10"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Warna Fill</span>
          </label>
          <input
            v-model="form.fillColor"
            type="color"
            class="input input-bordered input-sm w-full h-10"
          />
        </div>
      </div>

      <!-- Opacity -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">Opacity: {{ form.fillOpacity }}</span>
        </label>
        <input
          v-model.number="form.fillOpacity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          class="range range-sm range-primary"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-2">
        <button type="submit" class="btn btn-sm btn-primary flex-1">
          {{ isEditing ? 'Update' : 'Tambah' }} Area
        </button>
        <button type="button" @click="resetForm" class="btn btn-sm btn-ghost">Reset</button>
        <button type="button" @click="handleClose" class="btn btn-sm btn-error">Tutup</button>
      </div>
    </form>

    <!-- List Polygon -->
    <div class="divider">Area yang Ada</div>
    <div class="space-y-2 max-h-60 overflow-y-auto">
      <div v-for="polygon in polygons" :key="polygon.id" class="card bg-base-200 shadow-sm p-3">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-bold text-sm">{{ polygon.name }}</h3>
            <p class="text-xs text-gray-600">{{ polygon.description }}</p>
            <p class="text-xs mt-1">
              <span class="badge badge-sm" :style="{ backgroundColor: polygon.color }">
                {{ polygon.area }} km²
              </span>
            </p>
          </div>
          <div class="flex gap-1">
            <button @click="editPolygon(polygon)" class="btn btn-xs btn-ghost" title="Edit">
              ✏️
            </button>
            <button
              @click="handleDelete(polygon.id)"
              class="btn btn-xs btn-ghost text-error"
              title="Hapus"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, watch } from 'vue'
import { usePolygonStore } from '@/stores/polygon'
import { storeToRefs } from 'pinia'
import { useMapClick } from '@/composable/useMapClick'
import { useFormPreview } from '@/composable/useFormPreview'

const emit = defineEmits<{
  close: []
}>()

const polygonStore = usePolygonStore()
const { polygons } = storeToRefs(polygonStore)
const { isClickModeActive, enableClickMode, disableClickMode } = useMapClick()
const { updatePreviewMarkers, clearPreviewMarkers } = useFormPreview()

const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  coordinates: [] as [number, number][],
  color: '#3b82f6',
  fillColor: '#3b82f6',
  fillOpacity: 0.25,
})

const addCoordinate = () => {
  form.coordinates.push([0, 0])
}

const addCoordinateFromMap = (lat: number, lng: number) => {
  // Round ke 4 desimal untuk koordinat yang lebih bersih
  const roundedLat = Math.round(lat * 10000) / 10000
  const roundedLng = Math.round(lng * 10000) / 10000
  form.coordinates.push([roundedLat, roundedLng])
}

const toggleClickMode = () => {
  if (isClickModeActive.value) {
    disableClickMode()
  } else {
    enableClickMode(addCoordinateFromMap)
  }
}

const clearAllCoordinates = () => {
  form.coordinates = []
  clearPreviewMarkers()
}

// Watch perubahan koordinat untuk update preview markers
watch(
  () => form.coordinates,
  (newCoords) => {
    updatePreviewMarkers(newCoords)
  },
  { deep: true },
)

// Cleanup saat komponen di-unmount
onUnmounted(() => {
  if (isClickModeActive.value) {
    disableClickMode()
  }
  clearPreviewMarkers()
})

const removeCoordinate = (index: number) => {
  form.coordinates.splice(index, 1)
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.coordinates = []
  form.color = '#3b82f6'
  form.fillColor = '#3b82f6'
  form.fillOpacity = 0.25
  isEditing.value = false
  editingId.value = null
  clearPreviewMarkers()
}

const editPolygon = (polygon: (typeof polygons.value)[0]) => {
  isEditing.value = true
  editingId.value = polygon.id
  form.name = polygon.name
  form.description = polygon.description
  form.coordinates = JSON.parse(JSON.stringify(polygon.coordinates))
  form.color = polygon.color
  form.fillColor = polygon.fillColor
  form.fillOpacity = polygon.fillOpacity
  // Update preview markers untuk koordinat yang di-edit
  updatePreviewMarkers(form.coordinates)
}

const handleSubmit = () => {
  if (isEditing.value && editingId.value) {
    polygonStore.updatePolygon(editingId.value, {
      name: form.name,
      description: form.description,
      coordinates: form.coordinates,
      color: form.color,
      fillColor: form.fillColor,
      fillOpacity: form.fillOpacity,
    })
  } else {
    polygonStore.addPolygon({
      name: form.name,
      description: form.description,
      coordinates: form.coordinates,
      color: form.color,
      fillColor: form.fillColor,
      fillOpacity: form.fillOpacity,
    })
  }
  // Disable click mode dan clear markers setelah submit
  if (isClickModeActive.value) {
    disableClickMode()
  }
  resetForm()
}

const handleDelete = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus area ini?')) {
    polygonStore.deletePolygon(id)
    if (editingId.value === id) {
      resetForm()
    }
  }
}

const handleClose = () => {
  clearPreviewMarkers()
  if (isClickModeActive.value) {
    disableClickMode()
  }
  emit('close')
}
</script>

<style scoped></style>
