# 📊 Cara Kerja Rekomendasi Dapur

## 🎯 Overview

Sistem rekomendasi dapur menggunakan **Centroid-Based Optimization** untuk menemukan lokasi optimal yang meminimalkan jarak dan waktu tempuh ke semua sekolah yang dipilih.

---

## 🔄 Flow Lengkap

```
User Input → Centroid Calculation → Route Calculation → Statistical Analysis → Recommendation
```

---

## 📐 Algoritma Detail

### **Step 1: User Selection**

User memilih multiple sekolah melalui interface:

```typescript
selectedSchools = [
  { npsn: "001", lat: -6.2, lng: 106.8, school_name: "SD Negeri 1" },
  { npsn: "002", lat: -6.3, lng: 106.9, school_name: "SD Negeri 2" },
  { npsn: "003", lat: -6.25, lng: 106.85, school_name: "SD Negeri 3" },
];
```

### **Step 2: Calculate Centroid (Geometric Center)**

**Formula:**

```
centroid.lat = (school1.lat + school2.lat + ... + schoolN.lat) / N
centroid.lng = (school1.lng + school2.lng + ... + schoolN.lng) / N
```

**Implementasi:**

```typescript
const calculateCentroid = (schools: School[]) => {
  const sumLat = schools.reduce((sum, school) => sum + school.lat, 0);
  const sumLng = schools.reduce((sum, school) => sum + school.long, 0);

  return {
    lat: sumLat / schools.length,
    lng: sumLng / schools.length,
  };
};
```

**Contoh Perhitungan:**

```
3 Sekolah:
- Sekolah A: lat -6.2, lng 106.8
- Sekolah B: lat -6.3, lng 106.9
- Sekolah C: lat -6.25, lng 106.85

Centroid:
lat = (-6.2 + -6.3 + -6.25) / 3 = -6.25
lng = (106.8 + 106.9 + 106.85) / 3 = 106.85

✅ Lokasi Rekomendasi: -6.25, 106.85
```

### **Step 3: Calculate Routes (OSRM)**

Untuk setiap sekolah, hitung rute dari centroid menggunakan **OSRM (Open Source Routing Machine)**:

```typescript
const calculateOptimalLocation = async (schools: School[]) => {
  const centroid = calculateCentroid(schools);

  let totalDistance = 0;
  let totalDuration = 0;
  let successCount = 0;

  // Loop setiap sekolah
  for (const school of schools) {
    const route = await calculateRoute(
      [centroid.lat, centroid.lng], // From: Centroid
      [school.lat, school.long] // To: School
    );

    if (route) {
      totalDistance += route.distance; // meters
      totalDuration += route.duration; // seconds
      successCount++;
    }
  }

  return {
    lat: centroid.lat,
    lng: centroid.lng,
    totalDistance,
    totalDuration,
    averageDistance: totalDistance / successCount,
    averageDuration: totalDuration / successCount,
    schools,
  };
};
```

**OSRM Route Calculation:**

- Menggunakan jaringan jalan nyata (OpenStreetMap)
- Menghitung jarak aktual (bukan straight line)
- Menghitung waktu tempuh berdasarkan kecepatan kendaraan
- Profile: `driving` (mobil)
- Service URL: `https://router.project-osrm.org/route/v1`

### **Step 4: Statistical Analysis**

```typescript
// Hasil untuk 3 sekolah:
Route 1: 2.5 km, 8 menit
Route 2: 3.2 km, 10 menit
Route 3: 1.8 km, 6 menit

// Statistik:
totalDistance = 2.5 + 3.2 + 1.8 = 7.5 km
totalDuration = 8 + 10 + 6 = 24 menit

averageDistance = 7.5 / 3 = 2.5 km
averageDuration = 24 / 3 = 8 menit
```

---

## 🧮 Kenapa Centroid?

### **Keuntungan:**

1. ✅ **Simple & Fast** - Hanya butuh rata-rata koordinat
2. ✅ **Fair Distribution** - Semua sekolah diperlakukan sama
3. ✅ **Optimal untuk Clustering** - Meminimalkan total jarak
4. ✅ **No Complex Computation** - Tidak perlu iterasi atau optimization loop
5. ✅ **Real-world Routing** - Menggunakan jaringan jalan nyata via OSRM

### **Visualisasi:**

```
     Sekolah A (-6.2, 106.8)
          ●
         /|\
        / | \
       /  |  \
      /   ●   \    ← Centroid (-6.25, 106.85)
     /  Dapur  \      LOKASI OPTIMAL
    /           \
   ●             ●
Sekolah B    Sekolah C
(-6.3, 106.9) (-6.25, 106.85)
```

---

## 📊 Output Rekomendasi

### **Data Structure:**

```typescript
interface RecommendationResult {
  lat: number; // Latitude lokasi optimal
  lng: number; // Longitude lokasi optimal
  totalDistance: number; // Total jarak ke semua sekolah (meters)
  totalDuration: number; // Total waktu ke semua sekolah (seconds)
  averageDistance: number; // Rata-rata jarak (meters)
  averageDuration: number; // Rata-rata waktu (seconds)
  schools: School[]; // Array sekolah yang dipilih
}
```

### **Contoh Output:**

```typescript
{
  lat: -6.244478,
  lng: 106.982653,
  totalDistance: 7500,      // 7.5 km total
  totalDuration: 1440,      // 24 menit total
  averageDistance: 2500,    // 2.5 km rata-rata
  averageDuration: 480,     // 8 menit rata-rata
  schools: [...]
}
```

### **Display ke User:**

```
📍 Lokasi Rekomendasi
Latitude: -6.244478
Longitude: 106.982653

Rata-rata Jarak: 2.50 km
Rata-rata Waktu Tempuh: 8 menit
Total Sekolah: 3 sekolah

Sekolah yang Dilayani:
1. SD Negeri 1
2. SD Negeri 2
3. SD Negeri 3
```

---

## 🔍 Alternatif Algoritma (Tidak Digunakan)

### **1. K-Means Clustering**

- **Pros:** Lebih akurat untuk multiple clusters
- **Cons:** Lebih kompleks, butuh iterasi, overkill untuk use case ini

### **2. Weighted Centroid**

- **Pros:** Bisa prioritaskan sekolah tertentu (misal: berdasarkan jumlah siswa)
- **Cons:** Butuh data tambahan, lebih kompleks
- **Contoh:** Sekolah dengan 500 siswa dapat bobot 2x dari sekolah dengan 250 siswa

### **3. Minimax (Minimize Maximum Distance)**

- **Pros:** Meminimalkan jarak terjauh, lebih adil untuk sekolah terluar
- **Cons:** Lebih kompleks, bisa menghasilkan lokasi yang tidak optimal untuk mayoritas

### **4. Fermat Point (Geometric Median)**

- **Pros:** Meminimalkan sum of distances (lebih optimal dari centroid)
- **Cons:** Butuh iterative computation, lebih lambat

---

## 🚀 Performance

### **Time Complexity:**

- Centroid calculation: `O(n)` - Linear
- Route calculation: `O(n)` - Linear (sequential API calls)
- **Total: `O(n)`** where n = jumlah sekolah

### **Benchmark:**

| Jumlah Sekolah | Waktu Estimasi | Network Calls |
| -------------- | -------------- | ------------- |
| 3 sekolah      | ~3-5 detik     | 3 API calls   |
| 5 sekolah      | ~5-8 detik     | 5 API calls   |
| 10 sekolah     | ~10-15 detik   | 10 API calls  |
| 20 sekolah     | ~20-30 detik   | 20 API calls  |

**Bottleneck:** OSRM API calls (network latency ~1-2 detik per call)

### **Optimization Opportunities:**

1. Parallel API calls (Promise.all) - bisa reduce waktu hingga 50%
2. Caching hasil routing untuk pasangan koordinat yang sama
3. Local OSRM server untuk menghilangkan network latency

---

## 💡 Use Case

### **Ideal untuk:**

- ✅ Menentukan lokasi dapur umum
- ✅ Distribusi makanan ke multiple sekolah
- ✅ Meminimalkan biaya transportasi
- ✅ Optimasi logistik
- ✅ Perencanaan infrastruktur publik

### **Contoh Real:**

**Scenario 1: Program Makan Siang Gratis**

```
Pemerintah ingin membangun 1 dapur umum untuk melayani 5 SD di kecamatan X.
Sistem akan merekomendasikan lokasi yang:
- Dekat dengan semua sekolah
- Waktu tempuh rata-rata minimal
- Biaya distribusi optimal
```

**Scenario 2: Optimasi Logistik**

```
Perusahaan catering ingin menentukan lokasi warehouse untuk melayani 10 sekolah.
Sistem memberikan:
- Lokasi optimal warehouse
- Estimasi waktu pengiriman ke setiap sekolah
- Total jarak yang harus ditempuh
```

---

## 🎯 Flow User Experience

### **1. Pilih Sekolah**

```
User → Klik "🎯 Rekomendasi Dapur"
     → Search & pilih multiple sekolah (checkbox)
     → Lihat counter "Sekolah Terpilih: X"
```

### **2. Hitung Lokasi**

```
User → Klik "Hitung Lokasi Optimal"
     → Loading state (3-10 detik)
     → Sistem calculate centroid
     → Sistem calculate routes via OSRM
     → Sistem calculate statistics
```

### **3. Lihat Hasil**

```
System → Tampilkan hasil rekomendasi:
         - Koordinat (lat/lng)
         - Rata-rata jarak & waktu
         - List sekolah yang dilayani
```

### **4. Create Dapur**

```
User → Klik "🍳 Buat Dapur"
     → Sistem auto-generate nama
     → Sistem create dapur di lokasi rekomendasi
     → Sistem calculate routes untuk semua sekolah
     → Sistem tampilkan marker & routes di peta
     → Auto zoom ke lokasi dapur
```

---

## 📈 Future Improvements

### **1. Weighted Optimization**

```typescript
// Prioritaskan sekolah dengan lebih banyak siswa
const weightedCentroid = (schools: School[]) => {
  const totalWeight = schools.reduce((sum, s) => sum + s.studentCount, 0);
  const weightedLat = schools.reduce(
    (sum, s) => sum + s.lat * s.studentCount,
    0
  );
  const weightedLng = schools.reduce(
    (sum, s) => sum + s.long * s.studentCount,
    0
  );

  return {
    lat: weightedLat / totalWeight,
    lng: weightedLng / totalWeight,
  };
};
```

### **2. Multi-Objective Optimization**

- Minimize distance
- Minimize time
- Minimize cost
- Maximize coverage

### **3. Constraint-Based**

- Batasan area (hanya dalam kecamatan tertentu)
- Batasan jarak maksimal
- Batasan waktu tempuh maksimal

### **4. Machine Learning**

- Prediksi traffic patterns
- Seasonal adjustments
- Historical data analysis

---

## 🔧 Technical Implementation

### **File Structure:**

```
/src/composable/useRecommendation.ts  - Core algorithm
/src/composable/useRouting.ts         - OSRM integration
/src/components/dapur/RecommendationForm.vue - UI
/src/stores/dapur.ts                  - State management
```

### **Key Functions:**

**1. calculateCentroid()**

```typescript
Input: School[]
Output: { lat: number, lng: number }
Purpose: Calculate geometric center
```

**2. calculateOptimalLocation()**

```typescript
Input: School[]
Output: RecommendationResult
Purpose: Main recommendation algorithm
```

**3. calculateRoute()**

```typescript
Input: [lat, lng], [lat, lng]
Output: { distance, duration, route }
Purpose: OSRM routing
```

---

## 📝 Summary

| Aspect         | Detail                        |
| -------------- | ----------------------------- |
| **Algorithm**  | Centroid-based optimization   |
| **Routing**    | OSRM (OpenStreetMap)          |
| **Complexity** | O(n) - Linear                 |
| **Accuracy**   | High (real-world routing)     |
| **Speed**      | ~1-2 seconds per school       |
| **Use Case**   | Kitchen location optimization |
| **Output**     | Coordinates + statistics      |

**Kesimpulan:**
Sistem rekomendasi dapur menggunakan pendekatan sederhana namun efektif dengan menghitung centroid (titik tengah geometris) dari semua sekolah yang dipilih, kemudian memvalidasi lokasi tersebut dengan menghitung rute nyata menggunakan OSRM. Hasilnya adalah lokasi optimal yang meminimalkan jarak dan waktu tempuh rata-rata ke semua sekolah target.
