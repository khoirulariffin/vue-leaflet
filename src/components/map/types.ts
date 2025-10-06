export interface MapConfig {
  center: [number, number]
  zoom: number
  tileLayer: {
    url: {
      light: string
      dark: string
    }
  }
  options: {
    scrollWheelZoom: boolean
    zoomControl: boolean
  }
}

export interface MapClickEvent {
  latlng: {
    lat: number
    lng: number
  }
}

export interface LeafletMapRef {
  leafletObject: L.Map
}
