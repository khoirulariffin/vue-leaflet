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

    <!-- Indicator saat mode klik aktif -->
    <div
      v-if="isClickModeActive"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[1001] bg-success text-success-content px-4 py-2 rounded-lg shadow-lg animate-pulse"
    >
      🗺️ Mode Klik Peta Aktif - Klik pada peta untuk menambah titik koordinat
    </div>

    <!-- Map Controls with Popover -->
    <div class="fixed top-2 right-2 z-[1000] flex flex-col gap-2">
      <MapControls
        @tambah-area="showForm = true"
        @apply-filters="handleApplyFilters"
      />
      <MapSettings />
    </div>

    <!-- Polygon Form -->
    <PolygonForm v-if="showForm" @close="showForm = false" />
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
import { useMapClick } from "@/composable/useMapClick";
import { useFormPreview } from "@/composable/useFormPreview";

const { getTheme } = useTheme();
const polygonStore = usePolygonStore();
const { polygons } = storeToRefs(polygonStore);
const { handleMapClick, isClickModeActive } = useMapClick();
const { previewMarkers } = useFormPreview();

const showForm = ref(false);

const onMapClick = (event: MapClickEvent) => {
  const { lat, lng } = event.latlng;
  handleMapClick(lat, lng);
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
      dark: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
  },
  options: {
    scrollWheelZoom: false,
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
