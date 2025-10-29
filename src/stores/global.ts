import { defineStore } from "pinia";
import { reactive } from "vue";

export const useGlobalStore = defineStore("global", () => {
  interface GlobalStateInterface {
    loading: boolean;
    title: string;
  }

  const global = reactive<GlobalStateInterface>({
    loading: false,
    title: "",
  });

  const setLoading = (loading: boolean) => {
    global.loading = loading;
  };

  const setTitle = (title: string) => {
    global.title = title;
  };

  return {
    global,
    setLoading,
    setTitle,
  };
});
