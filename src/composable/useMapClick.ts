import { ref } from 'vue'

const isClickModeActive = ref(false)
const clickCallback = ref<((lat: number, lng: number) => void) | null>(null)

export const useMapClick = () => {
  const enableClickMode = (callback: (lat: number, lng: number) => void) => {
    isClickModeActive.value = true
    clickCallback.value = callback
  }

  const disableClickMode = () => {
    isClickModeActive.value = false
    clickCallback.value = null
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (isClickModeActive.value && clickCallback.value) {
      clickCallback.value(lat, lng)
    }
  }

  return {
    isClickModeActive,
    enableClickMode,
    disableClickMode,
    handleMapClick,
  }
}
