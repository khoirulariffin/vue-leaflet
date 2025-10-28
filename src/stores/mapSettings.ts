import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapSettingsStore = defineStore("mapSettings", () => {
  const showMarkers = ref(true);
  const showProvinceAreas = ref(false);
  const showCityAreas = ref(false);
  const showDistrictAreas = ref(false);

  const toggleMarkers = () => {
    showMarkers.value = !showMarkers.value;
  };

  const toggleProvinceAreas = () => {
    showProvinceAreas.value = !showProvinceAreas.value;
  };

  const toggleCityAreas = () => {
    showCityAreas.value = !showCityAreas.value;
  };

  const toggleDistrictAreas = () => {
    showDistrictAreas.value = !showDistrictAreas.value;
  };

  const resetSettings = () => {
    showMarkers.value = true;
    showProvinceAreas.value = false;
    showCityAreas.value = false;
    showDistrictAreas.value = false;
  };

  return {
    showMarkers,
    showProvinceAreas,
    showCityAreas,
    showDistrictAreas,
    toggleMarkers,
    toggleProvinceAreas,
    toggleCityAreas,
    toggleDistrictAreas,
    resetSettings,
  };
});
