import { ref } from 'vue'
const previewMarkers = ref<[number, number][]>([])

export const useFormPreview = () => {
  const updatePreviewMarkers = (coordinates: [number, number][]) => {
    // Filter hanya koordinat yang valid (tidak NaN dan bukan 0,0)
    previewMarkers.value = coordinates.filter((coord) => {
      const lat = Number(coord[0])
      const lng = Number(coord[1])
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })
  }

  const clearPreviewMarkers = () => {
    previewMarkers.value = []
  }

  return {
    previewMarkers,
    updatePreviewMarkers,
    clearPreviewMarkers,
  }
}
