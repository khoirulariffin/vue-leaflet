# 🏫 School Scraper Tool - Panduan Penggunaan

Tools untuk scraping data sekolah dari Google Maps dengan filter wilayah administratif Indonesia.

## 📋 Fitur

- ✅ Scraping data sekolah dari Google Maps
- ✅ Filter wilayah: Provinsi → Kabupaten/Kota → Kecamatan → Kelurahan/Desa
- ✅ Export data ke JSON dan CSV
- ✅ UI Control Panel yang user-friendly
- ✅ CLI tool untuk automation

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

## 💻 Cara Menggunakan

### Opsi 1: Menggunakan UI (Recommended)

1. Jalankan development server:
```bash
npm run dev
```

2. Buka browser dan navigasi ke `/scraper`

3. Pilih wilayah menggunakan filter cascading:
   - Pilih Provinsi
   - Pilih Kabupaten/Kota
   - (Opsional) Pilih Kecamatan
   - (Opsional) Pilih Kelurahan/Desa

4. Atur konfigurasi pencarian:
   - Query: kata kunci pencarian (default: "sekolah")
   - Maksimal Hasil: jumlah data yang akan di-scrape (1-100)

5. Klik tombol "Mulai Scraping" untuk mendapatkan command CLI

6. Copy command dan jalankan di terminal

### Opsi 2: Menggunakan CLI Langsung

```bash
npm run scrape -- --query "sekolah" --location "Jakarta Selatan" --max 20
```

#### Parameter CLI:

- `--query`: Kata kunci pencarian (default: "sekolah")
- `--location`: Lokasi pencarian (required)
- `--max`: Maksimal hasil (default: 20)
- `--province`: Nama provinsi
- `--regency`: Nama kabupaten/kota
- `--district`: Nama kecamatan
- `--village`: Nama kelurahan/desa

#### Contoh Penggunaan:

```bash
# Scrape sekolah di Jakarta Selatan
npm run scrape -- --query "sekolah" --location "Jakarta Selatan" --max 30

# Scrape SMA di Bandung
npm run scrape -- --query "SMA" --location "Bandung, Jawa Barat" --max 50

# Scrape dengan detail wilayah lengkap
npm run scrape -- \
  --query "sekolah dasar" \
  --location "Cilandak, Jakarta Selatan" \
  --province "DKI Jakarta" \
  --regency "Jakarta Selatan" \
  --district "Cilandak" \
  --max 25
```

## 📊 Output

Hasil scraping akan disimpan di folder `data/` dengan format:
- `schools_[timestamp].json`

### Struktur Data:

```json
[
  {
    "name": "SDN Cilandak 01",
    "address": "Jl. Cilandak Tengah No.1, Jakarta Selatan",
    "coordinates": {
      "lat": -6.2884,
      "lng": 106.8123
    },
    "rating": 4.5,
    "totalReviews": 120,
    "phone": "+62 21 1234567",
    "website": "https://example.com",
    "placeId": "ChIJ...",
    "province": "DKI Jakarta",
    "regency": "Jakarta Selatan",
    "district": "Cilandak",
    "village": "Cilandak Barat",
    "scrapedAt": "2025-10-28T02:45:00.000Z"
  }
]
```

## 🎨 UI Features

### Filter Wilayah
- Cascading dropdown yang otomatis load data berdasarkan pilihan sebelumnya
- Menampilkan ringkasan lokasi terpilih
- Loading state untuk setiap level filter

### Export Options
- **Export JSON**: Format untuk development/API
- **Export CSV**: Format untuk Excel/spreadsheet
- **Clear Data**: Hapus semua data hasil scraping

### Data Preview
- Tabel preview 10 data teratas
- Informasi lengkap: nama, alamat, rating, reviews, koordinat
- Counter total data yang berhasil di-scrape

## 🔧 Konfigurasi

### Headless Mode

Untuk production, edit `scripts/scraper.ts`:

```typescript
this.browser = await chromium.launch({
  headless: true, // Set true untuk production
  slowMo: 100,
})
```

### Rate Limiting

Scraper sudah dilengkapi dengan delay untuk menghindari rate limiting:
- Delay antar scroll: 1500ms
- Delay antar place: 2000ms

## 📝 API Wilayah

Data wilayah diambil dari [wilayah.id](https://wilayah.id):

- **Provinsi**: `https://wilayah.id/api/provinces.json`
- **Kabupaten/Kota**: `https://wilayah.id/api/regencies/[PROVINCE_CODE].json`
- **Kecamatan**: `https://wilayah.id/api/districts/[REGENCY_CODE].json`
- **Kelurahan/Desa**: `https://wilayah.id/api/villages/[DISTRICT_CODE].json`

## ⚠️ Catatan Penting

1. **Rate Limiting**: Google Maps memiliki rate limiting. Gunakan delay yang cukup.
2. **Headless Mode**: Untuk scraping dalam jumlah besar, gunakan headless mode.
3. **Legal**: Pastikan penggunaan scraper sesuai dengan Terms of Service Google Maps.
4. **Data Accuracy**: Beberapa data (phone, website) mungkin tidak tersedia untuk semua tempat.

## 🐛 Troubleshooting

### Browser tidak terbuka
```bash
npx playwright install
```

### Error "Cannot find module 'playwright'"
```bash
npm install
```

### Data tidak lengkap
- Beberapa tempat mungkin tidak memiliki semua informasi
- Coba kurangi `maxResults` untuk hasil yang lebih akurat

### Scraping terlalu lambat
- Kurangi delay di `slowMo` (tapi hati-hati dengan rate limiting)
- Gunakan headless mode

## 📚 Tech Stack

- **Vue 3** + Composition API
- **TypeScript**
- **Playwright** - Browser automation
- **Pinia** - State management
- **TailwindCSS** + DaisyUI - Styling
- **Vite** - Build tool

## 🤝 Contributing

Jika ingin menambahkan fitur atau memperbaiki bug, silakan buat pull request!

## 📄 License

MIT License
