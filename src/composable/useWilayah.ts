import { ref, computed } from "vue";
import type {
  WilayahProvince,
  WilayahRegency,
  WilayahDistrict,
  WilayahVillage,
  WilayahApiResponse,
} from "@/types/scraper";

const BASE_URL = "https://wilayah.id/api";

export const useWilayah = () => {
  const provinces = ref<WilayahProvince[]>([]);
  const regencies = ref<WilayahRegency[]>([]);
  const districts = ref<WilayahDistrict[]>([]);
  const villages = ref<WilayahVillage[]>([]);

  const selectedProvince = ref<string>("");
  const selectedRegency = ref<string>("");
  const selectedDistrict = ref<string>("");
  const selectedVillage = ref<string>("");

  const isLoadingProvinces = ref(false);
  const isLoadingRegencies = ref(false);
  const isLoadingDistricts = ref(false);
  const isLoadingVillages = ref(false);

  const error = ref<string | null>(null);

  // Computed untuk mendapatkan nama lengkap
  const selectedProvinceName = computed(() => {
    return (
      provinces.value.find((p) => p.code === selectedProvince.value)?.name || ""
    );
  });

  const selectedRegencyName = computed(() => {
    return (
      regencies.value.find((r) => r.code === selectedRegency.value)?.name || ""
    );
  });

  const selectedDistrictName = computed(() => {
    return (
      districts.value.find((d) => d.code === selectedDistrict.value)?.name || ""
    );
  });

  const selectedVillageName = computed(() => {
    return (
      villages.value.find((v) => v.code === selectedVillage.value)?.name || ""
    );
  });

  const fullLocationName = computed(() => {
    const parts = [];
    if (selectedVillageName.value) parts.push(selectedVillageName.value);
    if (selectedDistrictName.value) parts.push(selectedDistrictName.value);
    if (selectedRegencyName.value) parts.push(selectedRegencyName.value);
    if (selectedProvinceName.value) parts.push(selectedProvinceName.value);
    return parts.join(", ");
  });

  // Fetch Provinces
  const fetchProvinces = async () => {
    isLoadingProvinces.value = true;
    error.value = null;

    try {
      const response = await fetch(`${BASE_URL}/provinces.json`);
      if (!response.ok) throw new Error("Failed to fetch provinces");

      const data: WilayahApiResponse<WilayahProvince> = await response.json();
      provinces.value = data.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching provinces:", err);
    } finally {
      isLoadingProvinces.value = false;
    }
  };

  // Fetch Regencies
  const fetchRegencies = async (provinceCode: string) => {
    if (!provinceCode) {
      regencies.value = [];
      return;
    }

    isLoadingRegencies.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/regencies/${provinceCode}.json`
      );
      if (!response.ok) throw new Error("Failed to fetch regencies");

      const data: WilayahApiResponse<WilayahRegency> = await response.json();
      regencies.value = data.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching regencies:", err);
    } finally {
      isLoadingRegencies.value = false;
    }
  };

  // Fetch Districts
  const fetchDistricts = async (regencyCode: string) => {
    if (!regencyCode) {
      districts.value = [];
      return;
    }

    isLoadingDistricts.value = true;
    error.value = null;

    try {
      const response = await fetch(`${BASE_URL}/districts/${regencyCode}.json`);
      if (!response.ok) throw new Error("Failed to fetch districts");

      const data: WilayahApiResponse<WilayahDistrict> = await response.json();
      districts.value = data.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching districts:", err);
    } finally {
      isLoadingDistricts.value = false;
    }
  };

  // Fetch Villages
  const fetchVillages = async (districtCode: string) => {
    if (!districtCode) {
      villages.value = [];
      return;
    }

    isLoadingVillages.value = true;
    error.value = null;

    try {
      const response = await fetch(`${BASE_URL}/villages/${districtCode}.json`);
      if (!response.ok) throw new Error("Failed to fetch villages");

      const data: WilayahApiResponse<WilayahVillage> = await response.json();
      villages.value = data.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching villages:", err);
    } finally {
      isLoadingVillages.value = false;
    }
  };

  // Reset functions
  const resetRegencies = () => {
    regencies.value = [];
    selectedRegency.value = "";
    resetDistricts();
  };

  const resetDistricts = () => {
    districts.value = [];
    selectedDistrict.value = "";
    resetVillages();
  };

  const resetVillages = () => {
    villages.value = [];
    selectedVillage.value = "";
  };

  const resetAll = () => {
    selectedProvince.value = "";
    resetRegencies();
  };

  return {
    // State
    provinces,
    regencies,
    districts,
    villages,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    isLoadingProvinces,
    isLoadingRegencies,
    isLoadingDistricts,
    isLoadingVillages,
    error,

    // Computed
    selectedProvinceName,
    selectedRegencyName,
    selectedDistrictName,
    selectedVillageName,
    fullLocationName,

    // Methods
    fetchProvinces,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
    resetRegencies,
    resetDistricts,
    resetVillages,
    resetAll,
  };
};
