import { chromium, type Browser, type Page } from 'playwright'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface School {
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

interface ScraperConfig {
  query: string
  location: string
  maxResults?: number
  province?: string
  regency?: string
  district?: string
  village?: string
}

class GoogleMapsScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize() {
    console.log('🚀 Initializing browser...')
    this.browser = await chromium.launch({
      headless: false, // Set true untuk production
      slowMo: 100,
    })
    this.page = await this.browser.newPage()
    await this.page.setViewportSize({ width: 1280, height: 720 })
  }

  async scrapeSchools(config: ScraperConfig): Promise<School[]> {
    if (!this.page) throw new Error('Browser not initialized')

    const schools: School[] = []
    const searchQuery = `${config.query} ${config.location}`

    console.log(`🔍 Searching: ${searchQuery}`)

    // Navigate to Google Maps
    await this.page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' })
    await this.page.waitForTimeout(2000)

    // Search
    const searchBox = this.page.locator('input[id="searchboxinput"]')
    await searchBox.fill(searchQuery)
    await searchBox.press('Enter')

    // Wait for results
    await this.page.waitForTimeout(3000)

    // Scroll to load more results
    const maxResults = config.maxResults || 20
    await this.scrollResults(maxResults)

    // Get all place links
    const placeLinks = await this.page.locator('a[href*="/maps/place/"]').all()
    console.log(`📍 Found ${placeLinks.length} places`)

    // Limit results
    const linksToProcess = placeLinks.slice(0, maxResults)

    for (let i = 0; i < linksToProcess.length; i++) {
      try {
        console.log(`⏳ Processing ${i + 1}/${linksToProcess.length}...`)

        await linksToProcess[i].click()
        await this.page.waitForTimeout(2000)

        const schoolData = await this.extractSchoolData(config)
        if (schoolData) {
          schools.push(schoolData)
          console.log(`✅ Scraped: ${schoolData.name}`)
        }
      } catch (error) {
        console.error(`❌ Error processing place ${i + 1}:`, error)
      }
    }

    return schools
  }

  private async scrollResults(maxResults: number) {
    if (!this.page) return

    const scrollContainer = this.page.locator('div[role="feed"]').first()
    let previousHeight = 0
    let scrollAttempts = 0
    const maxScrollAttempts = Math.ceil(maxResults / 10)

    while (scrollAttempts < maxScrollAttempts) {
      try {
        await scrollContainer.evaluate((el: HTMLElement) => {
          el.scrollTop = el.scrollHeight
        })
        await this.page.waitForTimeout(1500)

        const currentHeight = await scrollContainer.evaluate((el: HTMLElement) => el.scrollHeight)
        if (currentHeight === previousHeight) break

        previousHeight = currentHeight
        scrollAttempts++
      } catch {
        break
      }
    }
  }

  private async extractSchoolData(config: ScraperConfig): Promise<School | null> {
    if (!this.page) return null

    try {
      // Extract name
      const nameElement = this.page.locator('h1').first()
      const name = await nameElement.textContent()
      if (!name) return null

      // Extract address
      const addressElement = this.page
        .locator('button[data-item-id="address"]')
        .locator('div.fontBodyMedium')
        .first()
      const address = (await addressElement.textContent()) || ''

      // Extract rating and reviews
      let rating: number | undefined
      let totalReviews: number | undefined

      try {
        const ratingElement = this.page.locator('div.F7nice span[aria-hidden="true"]').first()
        const ratingText = await ratingElement.textContent()
        if (ratingText) rating = parseFloat(ratingText)

        const reviewsElement = this.page.locator('div.F7nice span[aria-label*="reviews"]').first()
        const reviewsText = await reviewsElement.textContent()
        if (reviewsText) {
          const match = reviewsText.match(/[\d,]+/)
          if (match) totalReviews = parseInt(match[0].replace(/,/g, ''))
        }
      } catch {
        // Rating/reviews not available
      }

      // Extract phone
      let phone: string | undefined
      try {
        const phoneElement = this.page
          .locator('button[data-item-id*="phone"]')
          .locator('div.fontBodyMedium')
          .first()
        phone = (await phoneElement.textContent()) || undefined
      } catch {
        // Phone not available
      }

      // Extract website
      let website: string | undefined
      try {
        const websiteElement = this.page
          .locator('a[data-item-id="authority"]')
          .locator('div.fontBodyMedium')
          .first()
        website = (await websiteElement.textContent()) || undefined
      } catch {
        // Website not available
      }

      // Extract coordinates from URL
      const url = this.page.url()
      const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      const coordinates = coordsMatch
        ? { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) }
        : { lat: 0, lng: 0 }

      // Extract place ID
      const placeIdMatch = url.match(/!1s([^!]+)/)
      const placeId = placeIdMatch ? placeIdMatch[1] : ''

      return {
        name,
        address,
        coordinates,
        rating,
        totalReviews,
        phone,
        website,
        placeId,
        province: config.province || '',
        regency: config.regency || '',
        district: config.district,
        village: config.village,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error extracting school data:', error)
      return null
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      console.log('🔒 Browser closed')
    }
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
📚 Google Maps School Scraper

Usage:
  npm run scrape -- --query "sekolah" --location "Jakarta Selatan" --max 10

Options:
  --query       Search query (default: "sekolah")
  --location    Location to search
  --max         Maximum results (default: 20)
  --province    Province name
  --regency     Regency name
  --district    District name
  --village     Village name
  --output      Output filename (default: schools_[timestamp].json)
    `)
    process.exit(0)
  }

  const config: ScraperConfig = {
    query: 'sekolah',
    location: '',
    maxResults: 20,
  }

  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '')
    const value = args[i + 1]

    switch (key) {
      case 'query':
        config.query = value
        break
      case 'location':
        config.location = value
        break
      case 'max':
        config.maxResults = parseInt(value)
        break
      case 'province':
        config.province = value
        break
      case 'regency':
        config.regency = value
        break
      case 'district':
        config.district = value
        break
      case 'village':
        config.village = value
        break
    }
  }

  if (!config.location) {
    console.error('❌ Error: --location is required')
    process.exit(1)
  }

  const scraper = new GoogleMapsScraper()

  try {
    await scraper.initialize()
    const schools = await scraper.scrapeSchools(config)

    // Save to file
    const outputDir = join(process.cwd(), 'data')
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `schools_${timestamp}.json`
    const filepath = join(outputDir, filename)

    writeFileSync(filepath, JSON.stringify(schools, null, 2))

    console.log(`\n✅ Scraping completed!`)
    console.log(`📊 Total schools: ${schools.length}`)
    console.log(`💾 Saved to: ${filepath}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await scraper.close()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { GoogleMapsScraper, type School, type ScraperConfig }
