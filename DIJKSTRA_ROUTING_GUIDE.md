# Dijkstra's Algorithm Routing Implementation

Implementasi algoritma Dijkstra untuk mencari rute terpendek dari dapur ke sekolah menggunakan OSM (OpenStreetMap) network, berdasarkan artikel: https://medium.com/data-science/dijkstras-algorithm-weighted-by-travel-time-in-osm-networks-792aa92e03af

## 🎯 Fitur

### 1. **Tambah Dapur (Kitchen)**

- User dapat menambahkan lokasi dapur dengan klik langsung pada peta
- Form input untuk data dapur:
  - Nama Dapur
  - Koordinat (otomatis dari klik)
  - Alamat (opsional)
  - Sekolah Tujuan (dropdown dengan search)

### 2. **Routing dengan Dijkstra's Algorithm**

- Menggunakan OSRM (Open Source Routing Machine)
- OSRM mengimplementasikan Dijkstra's algorithm untuk mencari rute terpendek
- Weighted by travel time (waktu tempuh)
- Mendukung berbagai mode: driving, walking, cycling

### 3. **Visualisasi Rute**

- Marker dapur (🍳) dengan custom icon
- Marker sekolah tujuan (🏫)
- Polyline rute dengan warna biru
- Popup info dengan jarak dan waktu tempuh

## 📦 Dependencies

```json
{
  "leaflet-routing-machine": "^3.2.12",
  "@types/leaflet-routing-machine": "^3.2.9"
}
```

## 🏗️ Arsitektur

### 1. **Types** (`src/types/dapur.ts`)

```typescript
export interface Dapur {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  targetSchools: TargetSchool[];
  createdAt: Date;
}

export interface TargetSchool {
  npsn: string;
  schoolName: string;
  lat: number;
  lng: number;
  distance?: number; // in meters
  duration?: number; // in seconds
  route?: [number, number][]; // route coordinates
}
```

### 2. **Store** (`src/stores/dapur.ts`)

Pinia store untuk manage state dapur:

```typescript
const dapurs = ref<Dapur[]>([]);
const isCalculating = ref(false);

// Methods
- addDapur(dapur: Dapur)
- removeDapur(id: string)
- updateDapurRoute(dapurId, schoolNpsn, routeData)
- clearAll()
```

### 3. **Composable** (`src/composable/useRouting.ts`)

Utility untuk routing calculation:

```typescript
const calculateRoute = async (
  from: [number, number],
  to: [number, number]
): Promise<RouteResult | null>

const formatDistance = (meters: number): string
const formatDuration = (seconds: number): string
```

**Cara Kerja:**

1. Membuat temporary map (tidak terlihat)
2. Menggunakan `L.Routing.control` dengan OSRM service
3. OSRM service URL: `https://router.project-osrm.org/route/v1`
4. Profile: `driving` (bisa diganti: walking, cycling)
5. Event `routesfound` mengembalikan hasil routing
6. Cleanup temporary map setelah selesai

### 4. **Components**

#### **DapurForm.vue**

Form modal untuk input data dapur:

- Input nama dapur
- Display koordinat (readonly)
- Textarea alamat (optional)
- Searchable dropdown sekolah
- Load data dari `data_jabar.json`

#### **DapurMarkers.vue**

Render markers dan routes:

- Custom icon untuk dapur (🍳 merah)
- Custom icon untuk sekolah (🏫 biru)
- Polyline untuk rute
- Popup dengan info jarak & waktu

## 🔄 Flow Penggunaan

### Step 1: Aktifkan Mode Tambah Dapur

```
User → Klik "☰ Menu" → Klik "🍳 Tambah Dapur"
```

### Step 2: Klik Lokasi Dapur di Peta

```
Mode aktif → Indicator muncul → Klik peta → Form terbuka
```

### Step 3: Isi Form

```
- Nama Dapur: "Dapur Umum Bandung"
- Koordinat: (otomatis terisi)
- Alamat: "Jl. Raya Bandung No. 123" (optional)
- Sekolah Tujuan: Search "SD NEGERI 1" → Select
```

### Step 4: Submit & Calculate Route

```
Klik "Simpan & Hitung Rute" →
  1. Call OSRM API
  2. Dijkstra's algorithm executed
  3. Route calculated
  4. Display result
```

### Step 5: Lihat Hasil

```
- Marker dapur muncul di peta
- Marker sekolah muncul
- Rute (polyline) ditampilkan
- Popup menampilkan:
  * Jarak: 5.23 km
  * Waktu Tempuh: 15 menit
```

## 🧮 Algoritma Dijkstra

### Konsep

Dijkstra's algorithm mencari **shortest path** (jalur terpendek) dalam weighted graph.

### Implementasi di OSRM

1. **Graph**: OSM road network
2. **Nodes**: Intersection/junction
3. **Edges**: Road segments
4. **Weight**: Travel time (waktu tempuh)

### Proses

```
1. Start node: Lokasi dapur
2. End node: Lokasi sekolah
3. OSRM builds graph dari OSM data
4. Dijkstra finds shortest path
5. Return: route coordinates + distance + duration
```

### Weighted by Travel Time

```typescript
// OSRM menggunakan speed limits dan road types
weight = distance / speed;

// Contoh:
// Highway: 80 km/h → weight rendah (cepat)
// Residential: 30 km/h → weight tinggi (lambat)
```

## 📊 Data Flow

```
User Click Map
    ↓
Set Coordinates
    ↓
Open DapurForm
    ↓
User Fill Form + Select School
    ↓
Submit
    ↓
calculateRoute(dapurCoords, schoolCoords)
    ↓
OSRM API Call
    ↓
Dijkstra's Algorithm Execution
    ↓
Route Result (distance, duration, coordinates)
    ↓
Create Dapur Object
    ↓
Add to Store
    ↓
DapurMarkers Render
    ↓
Display on Map
```

## 🎨 Visualisasi

### Marker Dapur

```typescript
// Custom icon: 🍳 dengan background merah
background-color: #ff6b6b
border-radius: 50% 50% 50% 0 (teardrop shape)
transform: rotate(-45deg)
```

### Marker Sekolah

```typescript
// Custom icon: 🏫 dengan background biru
background-color: #4ecdc4
border-radius: 50% (circle)
```

### Route Line

```typescript
color: #3b82f6 (blue)
weight: 4
opacity: 0.7
```

## 🔧 Konfigurasi OSRM

### Service URL

```typescript
serviceUrl: "https://router.project-osrm.org/route/v1";
```

### Profile Options

```typescript
profile: "driving"; // Default
// Alternatives:
// - "walking"
// - "cycling"
```

### Custom OSRM Server

Jika ingin menggunakan OSRM server sendiri:

```typescript
router: L.Routing.osrmv1({
  serviceUrl: "http://your-osrm-server.com/route/v1",
  profile: "driving",
});
```

## 📈 Performance

### Optimization

1. **Temporary Map**: Dibuat hanya untuk calculation, langsung dihapus
2. **Async Calculation**: Tidak blocking UI
3. **Error Handling**: Graceful fallback jika routing gagal

### Limitations

- OSRM public server ada rate limit
- Untuk production, gunakan OSRM server sendiri
- Route calculation bisa lambat untuk jarak jauh

## 🧪 Testing

### Test Case 1: Dapur ke Sekolah Dekat

```
Dapur: (-6.9175, 107.6191) // Bandung
Sekolah: (-6.9147, 107.6098) // 1 km
Expected: ~3 menit driving
```

### Test Case 2: Dapur ke Sekolah Jauh

```
Dapur: (-6.9175, 107.6191) // Bandung
Sekolah: (-7.2575, 107.7486) // 50 km
Expected: ~1 jam driving
```

### Test Case 3: No Route Available

```
Dapur: Island A
Sekolah: Island B (tidak terhubung jalan)
Expected: Error message, route = null
```

## 🚀 Future Enhancements

1. **Multiple Schools**: Satu dapur ke banyak sekolah
2. **Optimize Route**: TSP (Traveling Salesman Problem)
3. **Alternative Routes**: Tampilkan 2-3 rute alternatif
4. **Real-time Traffic**: Integrasi traffic data
5. **Export Route**: Download GPX/KML
6. **Route Instructions**: Turn-by-turn directions

## 📚 References

- [Dijkstra's Algorithm Article](https://medium.com/data-science/dijkstras-algorithm-weighted-by-travel-time-in-osm-networks-792aa92e03af)
- [OSRM Documentation](http://project-osrm.org/)
- [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## 🎉 Kesimpulan

Implementasi ini menggunakan:

- ✅ Dijkstra's algorithm (via OSRM)
- ✅ OSM network data
- ✅ Weighted by travel time
- ✅ Interactive UI
- ✅ Real-time calculation
- ✅ Visual route display

Tidak perlu Python! Semua berjalan di browser dengan JavaScript/TypeScript.
