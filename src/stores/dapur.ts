import { defineStore } from "pinia";
import { ref } from "vue";
import type { Dapur } from "@/types/dapur";

export const useDapurStore = defineStore("dapur", () => {
  const dapurs = ref<Dapur[]>([]);
  const isCalculating = ref(false);

  const addDapur = (dapur: Dapur) => {
    dapurs.value.push(dapur);
  };

  const removeDapur = (id: string) => {
    const index = dapurs.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      dapurs.value.splice(index, 1);
    }
  };

  const updateDapurRoute = (
    dapurId: string,
    schoolNpsn: string,
    routeData: {
      distance: number;
      duration: number;
      route: [number, number][];
    }
  ) => {
    const dapur = dapurs.value.find((d) => d.id === dapurId);
    if (dapur) {
      const school = dapur.targetSchools.find((s) => s.npsn === schoolNpsn);
      if (school) {
        school.distance = routeData.distance;
        school.duration = routeData.duration;
        school.route = routeData.route;
      }
    }
  };

  const clearAll = () => {
    dapurs.value = [];
  };

  return {
    dapurs,
    isCalculating,
    addDapur,
    removeDapur,
    updateDapurRoute,
    clearAll,
  };
});
