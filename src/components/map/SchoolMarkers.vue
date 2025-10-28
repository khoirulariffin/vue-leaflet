<template>
  <div v-if="mapObject">
    <!-- Markers akan di-render via Leaflet API langsung -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, inject, nextTick, type Ref } from "vue";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useSchoolStore } from "@/stores/school";
import { useMapSettingsStore } from "@/stores/mapSettings";
import { useAreaBoundaries } from "@/composable/useAreaBoundaries";
import { storeToRefs } from "pinia";
import type { School } from "@/types/school";

const mapObject = inject<Ref<L.Map | null>>("mapObject");
const schoolStore = useSchoolStore();
const settingsStore = useMapSettingsStore();
const { filteredSchools } = storeToRefs(schoolStore);
const { showMarkers, showProvinceAreas, showCityAreas, showDistrictAreas } =
  storeToRefs(settingsStore);
const {
  generateProvinceBoundaries,
  generateCityBoundaries,
  generateDistrictBoundaries,
} = useAreaBoundaries();

let markerClusterGroup: L.MarkerClusterGroup | null = null;
const areaLayers: L.Polygon[] = [];

const createMarkerIcon = (stage: string) => {
  const colors: Record<string, string> = {
    SD: "#3b82f6", // blue
    SMP: "#10b981", // green
    SMA: "#f59e0b", // amber
    SMK: "#8b5cf6", // purple
    SLB: "#ec4899", // pink
  };

  const color = colors[stage] || "#6b7280"; // default gray

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    className: "custom-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const createPopupContent = (school: School) => {
  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-bold text-base mb-2">${school.school_name}</h3>
      <div class="text-sm space-y-1">
        <p><span class="font-semibold">NPSN:</span> ${school.npsn}</p>
        <p><span class="font-semibold">Jenjang:</span> ${school.stage}</p>
        <p><span class="font-semibold">Status:</span> ${school.status === "N" ? "Negeri" : "Swasta"}</p>
        <p><span class="font-semibold">Alamat:</span> ${school.street_name}</p>
        <p><span class="font-semibold">Kecamatan:</span> ${school.district}</p>
        <p><span class="font-semibold">Kab/Kota:</span> ${school.city_name}</p>
        <p><span class="font-semibold">Provinsi:</span> ${school.province_name}</p>
        <p class="text-xs text-gray-500 mt-2">Koordinat: ${school.lat.toFixed(6)}, ${school.long.toFixed(6)}</p>
      </div>
    </div>
  `;
};

const initializeMarkers = () => {
  if (!mapObject?.value) return;

  const map = mapObject.value;

  // Remove existing cluster group if any
  if (markerClusterGroup && map.hasLayer(markerClusterGroup)) {
    map.removeLayer(markerClusterGroup);
    markerClusterGroup = null;
  }

  // Jika tidak ada data, hanya remove cluster dan return
  if (filteredSchools.value.length === 0) return;

  // Create new marker cluster group
  markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    chunkedLoading: true,
    chunkInterval: 200,
    chunkDelay: 50,
  });

  // Add markers to cluster group
  filteredSchools.value.forEach((school) => {
    if (school.lat && school.long) {
      const marker = L.marker([school.lat, school.long], {
        icon: createMarkerIcon(school.stage),
      });

      marker.bindPopup(createPopupContent(school));
      markerClusterGroup?.addLayer(marker);
    }
  });

  // Add cluster group to map only if map is ready
  if (map && markerClusterGroup) {
    // Ensure map is fully initialized before adding layer
    try {
      map.addLayer(markerClusterGroup);
    } catch (error) {
      console.error("Error adding marker cluster to map:", error);
      // Retry after a short delay
      setTimeout(() => {
        if (map && markerClusterGroup && !map.hasLayer(markerClusterGroup)) {
          try {
            map.addLayer(markerClusterGroup);
          } catch (retryError) {
            console.error("Retry failed:", retryError);
          }
        }
      }, 100);
    }
  }
};

const renderAreaBoundaries = () => {
  if (!mapObject?.value) return;

  const map = mapObject.value;

  // Remove existing area layers
  areaLayers.forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  areaLayers.length = 0;

  console.log("Rendering areas:", {
    showProvinceAreas: showProvinceAreas.value,
    showCityAreas: showCityAreas.value,
    showDistrictAreas: showDistrictAreas.value,
    schoolsCount: filteredSchools.value.length,
  });

  // Render province areas
  if (showProvinceAreas.value && filteredSchools.value.length > 0) {
    const boundaries = generateProvinceBoundaries(filteredSchools.value);
    console.log("Province boundaries:", boundaries.length);
    boundaries.forEach((boundary) => {
      const polygon = L.polygon(boundary.coordinates, {
        color: boundary.color,
        fillColor: boundary.color,
        fillOpacity: 0.1,
        weight: 2,
      }).bindPopup(`
        <div class="p-2">
          <h4 class="font-bold">${boundary.name}</h4>
          <p class="text-sm">${boundary.schools.length} sekolah</p>
        </div>
      `);
      polygon.addTo(map);
      areaLayers.push(polygon);
    });
  }

  // Render city areas
  if (showCityAreas.value && filteredSchools.value.length > 0) {
    const boundaries = generateCityBoundaries(filteredSchools.value);
    console.log("City boundaries:", boundaries.length);
    boundaries.forEach((boundary) => {
      const polygon = L.polygon(boundary.coordinates, {
        color: boundary.color,
        fillColor: boundary.color,
        fillOpacity: 0.15,
        weight: 2,
      }).bindPopup(`
        <div class="p-2">
          <h4 class="font-bold">${boundary.name}</h4>
          <p class="text-sm">${boundary.schools.length} sekolah</p>
        </div>
      `);
      polygon.addTo(map);
      areaLayers.push(polygon);
    });
  }

  // Render district areas
  if (showDistrictAreas.value && filteredSchools.value.length > 0) {
    const boundaries = generateDistrictBoundaries(filteredSchools.value);
    console.log("District boundaries:", boundaries.length);
    boundaries.forEach((boundary, index) => {
      console.log(
        `District ${index}:`,
        boundary.name,
        "coords:",
        boundary.coordinates.length
      );
      try {
        const polygon = L.polygon(boundary.coordinates, {
          color: boundary.color,
          fillColor: boundary.color,
          fillOpacity: 0.2,
          weight: 1.5,
        }).bindPopup(`
          <div class="p-2">
            <h4 class="font-bold">${boundary.name}</h4>
            <p class="text-sm">${boundary.schools.length} sekolah</p>
          </div>
        `);
        polygon.addTo(map);
        areaLayers.push(polygon);
        console.log(`District ${index} added to map`);
      } catch (error) {
        console.error(`Error adding district ${index}:`, error);
      }
    });
    console.log("Total area layers:", areaLayers.length);
  }
};

onMounted(async () => {
  await schoolStore.loadSchools();
  // Initial render setelah data loaded
  nextTick(() => {
    if (showMarkers.value) {
      initializeMarkers();
    }
    renderAreaBoundaries();
  });
});

// Watch for changes in active filters (single watch untuk avoid double trigger)
watch(
  () => schoolStore.activeFilters,
  () => {
    // Use nextTick to ensure DOM and map are ready
    nextTick(() => {
      if (showMarkers.value) {
        initializeMarkers();
      }
      renderAreaBoundaries();
    });
  },
  { deep: true, flush: "post" }
);

// Watch for data changes (not initial load, handled in onMounted)
watch(
  () => filteredSchools.value.length,
  (newLength, oldLength) => {
    // Skip initial load (0 to N), only handle subsequent changes
    if (oldLength > 0 && newLength !== oldLength) {
      nextTick(() => {
        if (showMarkers.value) {
          initializeMarkers();
        }
        renderAreaBoundaries();
      });
    }
  }
);

// Watch settings changes
watch(
  [showMarkers, showProvinceAreas, showCityAreas, showDistrictAreas],
  () => {
    nextTick(() => {
      if (showMarkers.value) {
        initializeMarkers();
      } else if (markerClusterGroup && mapObject?.value) {
        const map = mapObject.value;
        if (map.hasLayer(markerClusterGroup)) {
          map.removeLayer(markerClusterGroup);
        }
      }
      renderAreaBoundaries();
    });
  }
);

onUnmounted(() => {
  if (mapObject?.value) {
    const map = mapObject.value;

    // Remove markers
    if (markerClusterGroup && map.hasLayer(markerClusterGroup)) {
      map.removeLayer(markerClusterGroup);
    }
    markerClusterGroup = null;

    // Remove area layers
    areaLayers.forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    areaLayers.length = 0;
  }
});
</script>

<style scoped>
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
