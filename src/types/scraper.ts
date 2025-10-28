export interface School {
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  rating?: number
  totalReviews?: number
  phone?: string
  website?: string
  placeId: string
  province: string
  regency: string
  district?: string
  village?: string
  scrapedAt: string
}

export interface WilayahProvince {
  code: string
  name: string
}

export interface WilayahRegency {
  code: string
  name: string
}

export interface WilayahDistrict {
  code: string
  name: string
}

export interface WilayahVillage {
  code: string
  name: string
}

export interface WilayahApiResponse<T> {
  data: T[]
  meta: {
    administrative_area_level: number
    updated_at: string
  }
}

export interface ScraperConfig {
  query: string
  location: string
  maxResults?: number
  province?: string
  regency?: string
  district?: string
  village?: string
}

export interface ScraperProgress {
  status: 'idle' | 'running' | 'completed' | 'error'
  current: number
  total: number
  message: string
}
