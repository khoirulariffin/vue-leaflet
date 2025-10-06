import { ref } from 'vue'
import { defineStore } from 'pinia'
import { area } from '@turf/area'
import { polygon as turfPolygon } from '@turf/helpers'

export interface PolygonData {
  id: string
  name: string
  description: string
  coordinates: [number, number][]
  color: string
  fillColor: string
  fillOpacity: number
  area: string
}

const calculateArea = (coords: [number, number][]): string => {
  if (coords.length < 3) return '0.00'

  // Pastikan polygon tertutup (titik pertama = titik terakhir)
  const closedCoords = [...coords]
  const first = closedCoords[0]!
  const last = closedCoords[closedCoords.length - 1]!

  if (first[0] !== last[0] || first[1] !== last[1]) {
    closedCoords.push([first[0], first[1]])
  }

  const geoJsonCoords = closedCoords.map((coord) => [coord[1], coord[0]])
  const poly = turfPolygon([geoJsonCoords])
  const areaInSquareMeters = area(poly)
  const areaInSquareKm = (areaInSquareMeters / 1_000_000).toFixed(2)
  return areaInSquareKm
}

export const usePolygonStore = defineStore('polygon', () => {
  const polygons = ref<PolygonData[]>([])

  // Calculate area untuk semua polygon saat init
  polygons.value.forEach((polygon) => {
    polygon.area = calculateArea(polygon.coordinates)
  })

  const addPolygon = (polygon: Omit<PolygonData, 'id' | 'area'>) => {
    const newPolygon: PolygonData = {
      ...polygon,
      id: Date.now().toString(),
      area: calculateArea(polygon.coordinates),
    }
    polygons.value.push(newPolygon)
  }

  const updatePolygon = (
    id: string,
    updates: {
      name?: string
      description?: string
      coordinates?: [number, number][]
      color?: string
      fillColor?: string
      fillOpacity?: number
    },
  ) => {
    const current = polygons.value.find((p) => p.id === id)
    if (!current) return

    if (updates.name !== undefined) current.name = updates.name
    if (updates.description !== undefined) current.description = updates.description
    if (updates.color !== undefined) current.color = updates.color
    if (updates.fillColor !== undefined) current.fillColor = updates.fillColor
    if (updates.fillOpacity !== undefined) current.fillOpacity = updates.fillOpacity
    if (updates.coordinates !== undefined) {
      current.coordinates = updates.coordinates
      current.area = calculateArea(updates.coordinates)
    }
  }

  const deletePolygon = (id: string) => {
    const index = polygons.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      polygons.value.splice(index, 1)
    }
  }

  return {
    polygons,
    addPolygon,
    updatePolygon,
    deletePolygon,
  }
})
