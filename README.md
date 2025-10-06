# Vue Leaflet Polygon Manager

Aplikasi web interaktif untuk membuat, mengedit, dan mengelola area polygon pada peta menggunakan Vue 3, Leaflet, dan Turf.js. Aplikasi ini memungkinkan pengguna untuk menambahkan koordinat secara manual atau dengan klik pada peta, dengan preview real-time dan perhitungan luas area otomatis.

## 🚀 Fitur Utama

- ✅ **Interactive Map** - Peta interaktif dengan OpenStreetMap dan dark mode support
- ✅ **Polygon Management** - Buat, edit, dan hapus area polygon
- ✅ **Dual Input Mode** - Input koordinat manual atau klik langsung pada peta
- ✅ **Real-time Preview** - Preview marker dan polyline saat menambah koordinat
- ✅ **Auto Area Calculation** - Perhitungan luas area otomatis menggunakan Turf.js
- ✅ **State Management** - Pinia store untuk manajemen data polygon
- ✅ **Responsive UI** - Form yang user-friendly dengan DaisyUI
- ✅ **TypeScript** - Full type-safety untuk development yang lebih aman

---

## 📁 Struktur Proyek

```
src/
├── components/
│   └── map/
│       ├── MapLeaflet.vue      # Komponen utama peta
│       ├── PolygonForm.vue     # Form input polygon
│       └── types.ts            # TypeScript types untuk map
├── composable/
│   ├── useFormPreview.ts       # State management preview markers
│   ├── useMapClick.ts          # State management mode klik peta
│   └── useTheme.ts             # Theme management (light/dark)
├── stores/
│   └── polygon.ts              # Pinia store untuk polygon data
└── views/
    └── HomeView.vue            # Main view
```

---

## 🏗️ Arsitektur Aplikasi

### 1. **State Management Flow**

```
User Action
    ↓
┌─────────────────────────────────────┐
│  PolygonForm.vue                    │
│  - Input koordinat manual           │
│  - Toggle mode klik peta            │
│  - Form validation                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Composables (Reactive State)       │
│  - useFormPreview: Preview markers  │
│  - useMapClick: Click mode state    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  MapLeaflet.vue                     │
│  - Render peta                      │
│  - Render preview markers/polyline  │
│  - Handle map click events          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Pinia Store (polygon.ts)           │
│  - CRUD operations                  │
│  - Area calculation (Turf.js)       │
│  - Persistent state                 │
└─────────────────────────────────────┘
```

### 2. **Composables Pattern**

Aplikasi menggunakan Vue Composables untuk shared state antar komponen:

#### **useFormPreview.ts**

```typescript
// Mengelola preview markers dari form input
const previewMarkers = ref<[number, number][]>([])

export const useFormPreview = () => {
  const updatePreviewMarkers = (coordinates) => { ... }
  const clearPreviewMarkers = () => { ... }

  return { previewMarkers, updatePreviewMarkers, clearPreviewMarkers }
}
```

#### **useMapClick.ts**

```typescript
// Mengelola mode klik peta
const isClickModeActive = ref(false)
const clickCallback = ref<Function | null>(null)

export const useMapClick = () => {
  const enableClickMode = (callback) => { ... }
  const disableClickMode = () => { ... }
  const handleMapClick = (lat, lng) => { ... }

  return { isClickModeActive, enableClickMode, disableClickMode, handleMapClick }
}
```

### 3. **Data Flow Diagram**

```
┌──────────────────────────────────────────────────────────┐
│                    User Interaction                       │
└──────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌───────────────────┐              ┌──────────────────────┐
│  Manual Input     │              │   Click on Map       │
│  - Type lat/lng   │              │   - Enable mode      │
│  - Add coordinate │              │   - Click location   │
└───────────────────┘              └──────────────────────┘
        ↓                                      ↓
        └──────────────────┬──────────────────┘
                           ↓
              ┌────────────────────────┐
              │  form.coordinates[]    │
              │  (Reactive Array)      │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │  watch() trigger       │
              │  { deep: true }        │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │  updatePreviewMarkers()│
              │  - Filter valid coords │
              │  - Update state        │
              └────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌───────────────────┐              ┌──────────────────────┐
│  LCircleMarker    │              │   LPolyline          │
│  - Show dots      │              │   - Connect dots     │
│  - Blue color     │              │   - Dashed line      │
└───────────────────┘              └──────────────────────┘
```

---

## 🎨 Customization Guide

### **1. Mengubah Warna Preview**

**File:** `src/components/map/MapLeaflet.vue`

```vue
<!-- Polyline Preview -->
<LPolyline
  color="#3b82f6"        <!-- Ubah warna garis -->
  :weight="2"            <!-- Ubah ketebalan -->
  :dashArray="'5, 10'"   <!-- Ubah pola dash -->
  :opacity="0.7"         <!-- Ubah transparansi -->
/>

<!-- Circle Marker Preview -->
<LCircleMarker
  :radius="8"            <!-- Ubah ukuran titik -->
  color="#3b82f6"        <!-- Ubah warna border -->
  :fillColor="'#3b82f6'" <!-- Ubah warna fill -->
  :fillOpacity="0.8"     <!-- Ubah transparansi -->
/>
```

### **2. Mengubah Default Map Center & Zoom**

**File:** `src/components/map/MapLeaflet.vue`

```typescript
const mapConfig = reactive<MapConfig>({
  center: [-2.5, 118.0] as [number, number], // [lat, lng]
  zoom: 5, // Level zoom (1-18)
  // ...
})
```

### **3. Menambah Tile Layer Baru**

**File:** `src/components/map/MapLeaflet.vue`

```typescript
const mapConfig = reactive<MapConfig>({
  // ...
  tileLayer: {
    url: {
      light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
      satellite:
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Tambah baru
    },
  },
})
```

### **4. Mengubah Validasi Koordinat**

**File:** `src/composable/useFormPreview.ts`

```typescript
const updatePreviewMarkers = (coordinates: [number, number][]) => {
  previewMarkers.value = coordinates.filter((coord) => {
    const lat = Number(coord[0])
    const lng = Number(coord[1])

    // Tambah validasi custom
    const isValidRange = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    const isNotZero = lat !== 0 && lng !== 0

    return !isNaN(lat) && !isNaN(lng) && isValidRange && isNotZero
  })
}
```

### **5. Mengubah Perhitungan Area**

**File:** `src/stores/polygon.ts`

```typescript
const calculateArea = (coords: [number, number][]): string => {
  if (coords.length < 3) return '0.00'

  // ... existing code ...

  const areaInSquareMeters = area(poly)

  // Ubah satuan output
  const areaInSquareKm = (areaInSquareMeters / 1_000_000).toFixed(2) // km²
  // const areaInHectares = (areaInSquareMeters / 10_000).toFixed(2) // hektar
  // const areaInAcres = (areaInSquareMeters / 4046.86).toFixed(2)   // acre

  return areaInSquareKm
}
```

### **6. Menambah Field Baru di Form**

**File:** `src/stores/polygon.ts`

```typescript
export interface PolygonData {
  id: string
  name: string
  description: string
  coordinates: [number, number][]
  color: string
  fillColor: string
  fillOpacity: number
  area: string
  // Tambah field baru
  category?: string
  createdAt?: string
  tags?: string[]
}
```

**File:** `src/components/map/PolygonForm.vue`

```vue
<!-- Tambah input baru di form -->
<div class="form-control">
  <label class="label">
    <span class="label-text font-semibold">Kategori</span>
  </label>
  <select v-model="form.category" class="select select-bordered select-sm">
    <option value="residential">Residential</option>
    <option value="commercial">Commercial</option>
    <option value="industrial">Industrial</option>
  </select>
</div>
```

### **7. Disable Dragging Saat Mode Klik**

Sudah diimplementasikan dengan watch:

**File:** `src/components/map/MapLeaflet.vue`

```typescript
watch(
  () => isClickModeActive.value,
  (newValue) => {
    if (map.value?.leafletObject) {
      if (newValue) {
        map.value.leafletObject.dragging.disable()
      } else {
        map.value.leafletObject.dragging.enable()
      }
    }
  },
)
```

### **8. Export/Import Polygon Data**

Tambahkan fungsi di `src/stores/polygon.ts`:

```typescript
export const usePolygonStore = defineStore('polygon', () => {
  // ... existing code ...

  const exportToJSON = () => {
    const data = JSON.stringify(polygons.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'polygons.json'
    a.click()
  }

  const importFromJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string)
      polygons.value = data
    }
    reader.readAsText(file)
  }

  return {
    // ... existing returns ...
    exportToJSON,
    importFromJSON,
  }
})
```

---

## 🔧 Tech Stack

- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Pinia** - State management
- **Vue Router** - Routing
- **Leaflet** - Interactive maps
- **@vue-leaflet/vue-leaflet** - Vue 3 wrapper for Leaflet
- **Turf.js** - Geospatial analysis (area calculation)
- **TailwindCSS** - Utility-first CSS
- **DaisyUI** - Component library

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@turf/area": "^7.2.1",
    "@turf/helpers": "^7.2.1",
    "@vue-leaflet/vue-leaflet": "^0.10.1",
    "leaflet": "^1.9.4",
    "pinia": "^2.3.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0"
  }
}
```

---

## 🎯 Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## 🌐 Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

---

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
bun lint
```

---

## 🐛 Troubleshooting

### **Marker tidak muncul setelah input koordinat**

**Penyebab:** Koordinat `[0, 0]` di-filter sebagai invalid.

**Solusi:** Edit `src/composable/useFormPreview.ts` dan ubah kondisi filter:

```typescript
// Jika ingin menampilkan [0, 0]
return !isNaN(lat) && !isNaN(lng)

// Jika ingin filter [0, 0]
return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
```

### **Map dragging tidak disable saat mode klik aktif**

**Penyebab:** Leaflet instance belum ter-initialize saat watch trigger.

**Solusi:** Pastikan `map.value?.leafletObject` sudah ada sebelum memanggil method:

```typescript
watch(
  () => isClickModeActive.value,
  (newValue) => {
    if (map.value?.leafletObject) {
      // Safe to call Leaflet methods
    }
  },
)
```

### **Preview polyline tidak muncul**

**Penyebab:** Koordinat kurang dari 2 titik atau `LPolyline` tidak ter-import.

**Solusi:**

1. Pastikan minimal 2 koordinat valid
2. Import `LPolyline` dari `@vue-leaflet/vue-leaflet`

---

## 📝 Best Practices

### **1. Composables untuk Shared State**

Gunakan composables untuk state yang perlu di-share antar komponen:

```typescript
// ✅ Good - Shared state
const previewMarkers = ref<[number, number][]>([])

export const useFormPreview = () => {
  return { previewMarkers, ... }
}

// ❌ Bad - Local state di setiap komponen
// Akan menyebabkan state tidak sinkron
```

### **2. Deep Watch untuk Nested Reactive**

Gunakan `{ deep: true }` untuk watch array/object:

```typescript
watch(
  () => form.coordinates,
  (newCoords) => {
    updatePreviewMarkers(newCoords)
  },
  { deep: true }, // ✅ Detect perubahan nested
)
```

### **3. Type-Safe dengan TypeScript**

Selalu define interface untuk data structure:

```typescript
export interface PolygonData {
  id: string
  name: string
  coordinates: [number, number][]
  // ... other fields
}
```

### **4. Cleanup di onUnmounted**

Selalu cleanup state saat komponen di-unmount:

```typescript
onUnmounted(() => {
  if (isClickModeActive.value) {
    disableClickMode()
  }
  clearPreviewMarkers()
})
```

---

## 🚀 Future Enhancements

Beberapa fitur yang bisa ditambahkan:

- [ ] **Undo/Redo** - History management untuk perubahan polygon
- [ ] **Search Location** - Geocoding untuk cari lokasi by nama
- [ ] **Drawing Tools** - Tools untuk draw rectangle, circle, dll
- [ ] **Measurement Tools** - Measure distance, bearing, dll
- [ ] **Layer Control** - Toggle visibility polygon by category
- [ ] **Export to GeoJSON** - Export polygon ke format GeoJSON
- [ ] **Import from KML/GPX** - Import dari file GPS
- [ ] **Clustering** - Cluster markers jika terlalu banyak
- [ ] **Heatmap** - Visualisasi density polygon
- [ ] **Offline Support** - PWA dengan offline tile caching

---

## 📄 License

MIT License - Feel free to use this project for learning or production.

---

## 👨‍💻 Author

Built with ❤️ using Vue 3, Leaflet, and modern web technologies.

---

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Leaflet](https://leafletjs.com/) - Open-source JavaScript library for mobile-friendly interactive maps
- [Turf.js](https://turfjs.org/) - Advanced geospatial analysis for browsers and Node.js
- [OpenStreetMap](https://www.openstreetmap.org/) - Free, editable map of the whole world
