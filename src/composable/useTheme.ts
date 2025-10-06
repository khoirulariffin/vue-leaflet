import { ref, onMounted } from 'vue'

interface Theme {
  label: string
  value: string
}

const THEME_STORAGE_KEY = 'theme-preference'

const themes: Theme[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const currentTheme = ref<string>('')

const getDeviceTheme = (): string => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setTheme = (theme: string) => {
  currentTheme.value = theme
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

const getTheme = (): string => {
  return currentTheme.value
}

const getSavedTheme = (): string | null => {
  return localStorage.getItem(THEME_STORAGE_KEY)
}

const initTheme = () => {
  const savedTheme = getSavedTheme()
  const theme = savedTheme || getDeviceTheme()
  setTheme(theme)
}

const getThemes = (): Theme[] => {
  return themes
}

export const useTheme = () => {
  onMounted(() => {
    if (!currentTheme.value) {
      initTheme()

      // Listen untuk perubahan tema device
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!getSavedTheme()) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  })

  return {
    currentTheme,
    themes: getThemes(),
    setTheme,
    getTheme,
    getDeviceTheme,
    initTheme,
  }
}
