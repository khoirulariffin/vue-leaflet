import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { School, ScraperProgress } from '@/types/scraper'

export const useScraperStore = defineStore('scraper', () => {
  const schools = ref<School[]>([])
  const progress = ref<ScraperProgress>({
    status: 'idle',
    current: 0,
    total: 0,
    message: '',
  })
  const isScraperRunning = ref(false)

  const addSchool = (school: School) => {
    schools.value.push(school)
  }

  const setSchools = (newSchools: School[]) => {
    schools.value = newSchools
  }

  const clearSchools = () => {
    schools.value = []
  }

  const updateProgress = (newProgress: Partial<ScraperProgress>) => {
    progress.value = { ...progress.value, ...newProgress }
  }

  const resetProgress = () => {
    progress.value = {
      status: 'idle',
      current: 0,
      total: 0,
      message: '',
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(schools.value, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `schools_${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const exportToCSV = () => {
    if (schools.value.length === 0) return

    const headers = [
      'Name',
      'Address',
      'Latitude',
      'Longitude',
      'Rating',
      'Total Reviews',
      'Phone',
      'Website',
      'Place ID',
      'Province',
      'Regency',
      'District',
      'Village',
      'Scraped At',
    ]

    const rows = schools.value.map((school) => [
      school.name,
      school.address,
      school.coordinates.lat,
      school.coordinates.lng,
      school.rating || '',
      school.totalReviews || '',
      school.phone || '',
      school.website || '',
      school.placeId,
      school.province,
      school.regency,
      school.district || '',
      school.village || '',
      school.scrapedAt,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    const exportFileDefaultName = `schools_${new Date().toISOString().split('T')[0]}.csv`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return {
    schools,
    progress,
    isScraperRunning,
    addSchool,
    setSchools,
    clearSchools,
    updateProgress,
    resetProgress,
    exportToJSON,
    exportToCSV,
  }
})
