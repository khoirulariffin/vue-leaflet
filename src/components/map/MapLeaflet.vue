<template>
  <div class="fixed top-0 bottom-0 left-0 right-0">
    <LMap
      ref="map"
      v-model:zoom="mapConfig.zoom"
      :center="mapConfig.center"
      :options="mapConfig.options"
      @click="onMapClick"
    >
      <LTileLayer
        layer-type="base"
        name="OpenStreetMap"
        :url="mapConfig.tileLayer.url[getTheme() as 'light' | 'dark']"
      ></LTileLayer>

      <!-- Polygon Area -->
      <LPolygon
        v-for="polygon in polygons"
        :key="polygon.id"
        :lat-lngs="polygon.coordinates"
        :color="polygon.color"
        :fill-color="polygon.fillColor"
        :fill-opacity="polygon.fillOpacity"
      >
        <LPopup>
          <div class="p-2">
            <h3 class="font-bold text-lg">{{ polygon.name }}</h3>
            <p class="text-sm mt-1">Luas Area: {{ polygon.area }} km²</p>
            <p class="text-xs text-gray-600 mt-1">{{ polygon.description }}</p>
          </div>
        </LPopup>
      </LPolygon>

      <!-- Preview polyline/polygon untuk menghubungkan marker -->
      <LPolyline
        v-if="previewMarkers.length > 1"
        :lat-lngs="previewMarkers"
        color="#3b82f6"
        :weight="2"
        :dashArray="'5, 10'"
        :opacity="0.7"
      />

      <!-- Preview marker dari form input (circle marker) -->
      <LCircleMarker
        v-for="(marker, index) in previewMarkers"
        :key="`preview-${index}`"
        :lat-lng="marker"
        :radius="4"
        color="#3b82f6"
        :fillColor="'#3b82f6'"
        :fillOpacity="0.8"
        :weight="2"
      >
        <LTooltip>Titik {{ index + 1 }}</LTooltip>
      </LCircleMarker>
    </LMap>

    <!-- School Markers with Clustering -->
    <SchoolMarkers />

    <!-- Dapur Markers and Routes -->
    <DapurMarkers />

    <!-- Recommendation Form -->
    <RecommendationForm
      :is-open="showRecommendationForm"
      @close="showRecommendationForm = false"
      @create-dapur="handleRecommendationCreate"
    />

    <!-- Indicator saat mode klik aktif -->
    <div
      v-if="isClickModeActive"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[1001] bg-success text-success-content px-4 py-2 rounded-lg shadow-lg animate-pulse"
    >
      🗺️ Mode Klik Peta Aktif - Klik pada peta untuk menambah titik koordinat
    </div>

    <!-- Indicator mode tambah dapur -->
    <div
      v-if="isDapurMode"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[1001] bg-warning text-warning-content px-4 py-3 rounded-lg shadow-lg animate-pulse flex items-center gap-3"
    >
      <span
        >🍳 Mode Tambah Dapur - Klik pada peta untuk menentukan lokasi
        dapur</span
      >
      <button
        @click="cancelDapurMode"
        class="btn btn-sm btn-ghost hover:bg-warning-content hover:text-warning"
      >
        ✕ Batal
      </button>
    </div>

    <!-- Map Controls with Popover -->
    <div class="fixed top-2 right-2 z-[1000] flex flex-col gap-2">
      <MapControls
        @tambah-area="showForm = true"
        @tambah-dapur="isDapurMode = true"
        @rekomendasi-dapur="showRecommendationForm = true"
        @apply-filters="handleApplyFilters"
      />
      <MapSettings />
    </div>

    <!-- Polygon Form -->
    <PolygonForm v-if="showForm" @close="showForm = false" />

    <!-- Dapur Form Modal -->
    <DapurForm
      v-if="showDapurForm && dapurClickCoords"
      :lat="dapurClickCoords.lat"
      :lng="dapurClickCoords.lng"
      :pre-selected-schools="recommendedLocation?.schools"
      @close="closeDapurForm"
      @submit="handleDapurSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LPolygon,
  LPolyline,
  LPopup,
  LCircleMarker,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import { reactive, ref, watch, provide } from "vue";
import L from "leaflet";
import type { LeafletMapRef, MapClickEvent, MapConfig } from "./types";
import { useTheme } from "@/composable/useTheme";
import { usePolygonStore } from "@/stores/polygon";
import { storeToRefs } from "pinia";
import PolygonForm from "./PolygonForm.vue";
import SchoolMarkers from "./SchoolMarkers.vue";
import MapControls from "./MapControls.vue";
import MapSettings from "./MapSettings.vue";
import DapurForm from "@/components/dapur/DapurForm.vue";
import DapurMarkers from "@/components/dapur/DapurMarkers.vue";
import RecommendationForm from "@/components/dapur/RecommendationForm.vue";
import { useMapClick } from "@/composable/useMapClick";
import { useFormPreview } from "@/composable/useFormPreview";
import { useDapurStore } from "@/stores/dapur";
import { useRouting } from "@/composable/useRouting";
import type { School } from "@/types/school";
import type { Dapur } from "@/types/dapur";

const { getTheme } = useTheme();
const polygonStore = usePolygonStore();
const dapurStore = useDapurStore();
const { polygons } = storeToRefs(polygonStore);
const { handleMapClick, isClickModeActive } = useMapClick();
const { previewMarkers } = useFormPreview();
const { calculateRoute } = useRouting();

const showForm = ref(false);
const isDapurMode = ref(false);
const showDapurForm = ref(false);
const dapurClickCoords = ref<{ lat: number; lng: number } | null>(null);
const showRecommendationForm = ref(false);
const recommendedLocation = ref<{
  lat: number;
  lng: number;
  schools: School[];
} | null>(null);

const onMapClick = (event: MapClickEvent) => {
  // Handle dapur mode
  if (isDapurMode.value) {
    dapurClickCoords.value = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };
    showDapurForm.value = true;
    isDapurMode.value = false;
    return;
  }

  // Handle polygon mode
  const { lat, lng } = event.latlng;
  handleMapClick(lat, lng);
};

const closeDapurForm = () => {
  showDapurForm.value = false;
  dapurClickCoords.value = null;
  recommendedLocation.value = null;
};

const cancelDapurMode = () => {
  isDapurMode.value = false;
};

const handleRecommendationCreate = async (data: {
  lat: number;
  lng: number;
  selectedSchools: School[];
  name: string;
}) => {
  // Close recommendation form
  showRecommendationForm.value = false;

  // Directly create dapur without opening form
  await handleDapurSubmit({
    name: data.name,
    lat: data.lat,
    lng: data.lng,
    address: undefined,
    selectedSchools: data.selectedSchools,
  });
};

const handleDapurSubmit = async (data: {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  selectedSchools: School[];
}) => {
  try {
    dapurStore.isCalculating = true;

    // Calculate routes for all selected schools
    const targetSchools = [];

    for (const school of data.selectedSchools) {
      const route = await calculateRoute(
        [data.lat, data.lng],
        [school.lat, school.long]
      );

      if (route) {
        targetSchools.push({
          npsn: school.npsn,
          schoolName: school.school_name,
          lat: school.lat,
          lng: school.long,
          distance: route.distance,
          duration: route.duration,
          route: route.route,
        });
      } else {
        console.warn(`Failed to calculate route to ${school.school_name}`);
      }
    }

    if (targetSchools.length === 0) {
      alert("Gagal menghitung rute untuk semua sekolah. Silakan coba lagi.");
      dapurStore.isCalculating = false;
      return;
    }

    // Create dapur object
    const dapur: Dapur = {
      id: `dapur-${Date.now()}`,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      targetSchools,
      createdAt: new Date(),
    };

    // Add to store
    dapurStore.addDapur(dapur);

    // Close form
    closeDapurForm();

    dapurStore.isCalculating = false;

    // Show success message
    // alert(
    //   `Dapur "${data.name}" berhasil ditambahkan!\n\n${targetSchools.length} rute berhasil dihitung.`
    // );
  } catch (error) {
    console.error("Error creating dapur:", error);
    dapurStore.isCalculating = false;
    alert("Terjadi kesalahan saat membuat dapur.");
  }
};

const handleApplyFilters = (filters: {
  province: number | string;
  city: number | string;
  district: number | string;
}) => {
  console.log("Filters applied:", filters);
  // TODO: Implement filter logic untuk SchoolMarkers
};

// Fix icon default Leaflet untuk Vite
type IconDefault = L.Icon.Default & {
  _getIconUrl?: string;
};

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const map = ref<LeafletMapRef | null>(null);
const mapObject = ref<L.Map | null>(null);

const mapConfig = reactive<MapConfig>({
  center: [-2.5, 118.0] as [number, number],
  zoom: 5,
  tileLayer: {
    url: {
      light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      dark: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    },
  },
  options: {
    scrollWheelZoom: true,
    zoomControl: true,
  },
});

// Provide map object untuk child components
provide("mapObject", mapObject);

// Watch map ref untuk update mapObject
watch(
  () => map.value?.leafletObject,
  (newMap) => {
    if (newMap) {
      mapObject.value = newMap;
    }
  },
  { immediate: true }
);

// Watch untuk enable/disable dragging saat mode klik aktif
watch(
  () => isClickModeActive.value,
  (newValue) => {
    if (map.value?.leafletObject) {
      if (newValue) {
        // Disable dragging saat mode klik aktif
        map.value.leafletObject.dragging.disable();
      } else {
        // Enable dragging saat mode klik nonaktif
        map.value.leafletObject.dragging.enable();
      }
    }
  }
);
</script>
