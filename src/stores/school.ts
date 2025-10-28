import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { School } from "@/types/school";

export const useSchoolStore = defineStore("school", () => {
  const schools = ref<School[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeFilters = ref({
    province: "" as number | string,
    city: "" as number | string,
    district: "" as number | string,
  });

  // Load schools data
  const loadSchools = async () => {
    if (schools.value.length > 0) return; // Already loaded

    isLoading.value = true;
    error.value = null;

    try {
      const baseURL = window.location.origin;
      const response = await fetch(`${baseURL}/#/school_data.json`);
      if (!response.ok) {
        throw new Error("Failed to load school data");
      }
      const data = await response.json();
      schools.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error loading school data:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Get unique provinces
  const provinces = computed(() => {
    const unique = new Map<number, { id: number; name: string }>();
    schools.value.forEach((school) => {
      if (!unique.has(school.province_id)) {
        unique.set(school.province_id, {
          id: school.province_id,
          name: school.province_name,
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  // Get cities by province
  const getCitiesByProvince = (provinceId: number | string) => {
    if (!provinceId) return [];

    const unique = new Map<number, { id: number; name: string }>();
    schools.value
      .filter((school) => school.province_id === Number(provinceId))
      .forEach((school) => {
        if (!unique.has(school.city_id)) {
          unique.set(school.city_id, {
            id: school.city_id,
            name: school.city_name,
          });
        }
      });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  // Get districts by city
  const getDistrictsByCity = (cityId: number | string) => {
    if (!cityId) return [];

    const unique = new Map<number, { id: number; name: string }>();
    schools.value
      .filter((school) => school.city_id === Number(cityId))
      .forEach((school) => {
        if (!unique.has(school.district_id)) {
          unique.set(school.district_id, {
            id: school.district_id,
            name: school.district,
          });
        }
      });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  // Filtered schools based on active filters
  const filteredSchools = computed(() => {
    let result = schools.value;

    if (activeFilters.value.province) {
      result = result.filter(
        (s) => s.province_id === Number(activeFilters.value.province)
      );
    }

    if (activeFilters.value.city) {
      result = result.filter(
        (s) => s.city_id === Number(activeFilters.value.city)
      );
    }

    if (activeFilters.value.district) {
      result = result.filter(
        (s) => s.district_id === Number(activeFilters.value.district)
      );
    }

    return result;
  });

  // Set filters
  const setFilters = (filters: {
    province: number | string;
    city: number | string;
    district: number | string;
  }) => {
    activeFilters.value = { ...filters };
  };

  // Reset filters
  const resetFilters = () => {
    activeFilters.value = {
      province: "",
      city: "",
      district: "",
    };
  };

  return {
    schools,
    isLoading,
    error,
    activeFilters,
    provinces,
    filteredSchools,
    loadSchools,
    getCitiesByProvince,
    getDistrictsByCity,
    setFilters,
    resetFilters,
  };
});
