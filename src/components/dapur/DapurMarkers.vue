<template>
  <div v-if="mapObject">
    <!-- Markers dan routes akan di-render via Leaflet API -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, inject, type Ref } from "vue";
import L from "leaflet";
import { useDapurStore } from "@/stores/dapur";
import { storeToRefs } from "pinia";

const mapObject = inject<Ref<L.Map | null>>("mapObject");
const dapurStore = useDapurStore();
const { dapurs } = storeToRefs(dapurStore);

const markers: L.Marker[] = [];
const routeLines: L.Polyline[] = [];

// Create custom icon for dapur
const createDapurIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #ff6b6b;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
        ">🍳</span>
      </div>
    `,
    className: "dapur-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Create custom icon for target school
const createTargetIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>
      </div>
    `,
    className: "target-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Render markers and routes
const renderDapurs = () => {
  if (!mapObject?.value) return;

  const map = mapObject.value;

  // Clear existing markers and routes
  markers.forEach((marker) => {
    if (map.hasLayer(marker)) {
      map.removeLayer(marker);
    }
  });
  markers.length = 0;

  routeLines.forEach((line) => {
    if (map.hasLayer(line)) {
      map.removeLayer(line);
    }
  });
  routeLines.length = 0;

  // Render each dapur
  dapurs.value.forEach((dapur) => {
    // Dapur marker
    const dapurMarker = L.marker([dapur.lat, dapur.lng], {
      icon: createDapurIcon(),
    }).bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${dapur.name}</h3>
        ${dapur.address ? `<p class="text-sm text-gray-600 mb-2">${dapur.address}</p>` : ""}
        <div class="text-xs text-gray-500">
          <p>Koordinat: ${dapur.lat.toFixed(6)}, ${dapur.lng.toFixed(6)}</p>
          <p class="mt-1">Target: ${dapur.targetSchools.length} sekolah</p>
        </div>
      </div>
    `);

    dapurMarker.addTo(map);
    markers.push(dapurMarker);

    // Render target schools and routes
    dapur.targetSchools.forEach((school) => {
      // School marker
      const schoolMarker = L.marker([school.lat, school.lng], {
        icon: createTargetIcon(),
      }).bindPopup(`
        <div class="p-2">
          <h4 class="font-bold">${school.schoolName}</h4>
          <p class="text-sm text-gray-600">NPSN: ${school.npsn}</p>
          ${
            school.distance && school.duration
              ? `
            <div class="mt-2 p-2 bg-blue-50 rounded">
              <p class="text-sm"><strong>Jarak:</strong> ${formatDistance(school.distance)}</p>
              <p class="text-sm"><strong>Waktu:</strong> ${formatDuration(school.duration)}</p>
            </div>
          `
              : ""
          }
        </div>
      `);

      schoolMarker.addTo(map);
      markers.push(schoolMarker);

      // Route line
      if (school.route && school.route.length > 0) {
        const routeLine = L.polyline(school.route, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.7,
        }).bindPopup(`
          <div class="p-2">
            <h4 class="font-bold">Rute: ${dapur.name} → ${school.schoolName}</h4>
            <p class="text-sm mt-1"><strong>Jarak:</strong> ${formatDistance(school.distance!)}</p>
            <p class="text-sm"><strong>Waktu Tempuh:</strong> ${formatDuration(school.duration!)}</p>
          </div>
        `);

        routeLine.addTo(map);
        routeLines.push(routeLine);
      }
    });
  });
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
};

// Watch for changes
watch(
  () => dapurs.value.length,
  () => {
    renderDapurs();
  },
  { deep: true }
);

onMounted(() => {
  renderDapurs();
});

onUnmounted(() => {
  if (mapObject?.value) {
    const map = mapObject.value;

    markers.forEach((marker) => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    routeLines.forEach((line) => {
      if (map.hasLayer(line)) {
        map.removeLayer(line);
      }
    });
  }

  markers.length = 0;
  routeLines.length = 0;
});
</script>

<style scoped>
:deep(.dapur-marker),
:deep(.target-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
