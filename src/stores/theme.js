import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem('theme') || 'dark')

  const applyTheme = (theme) => {
    currentTheme.value = theme
    document.body.setAttribute('data-theme', theme)
    updateThemeColors(theme)
    localStorage.setItem('theme', theme)
  }

  const updateThemeColors = (theme) => {
    const root = document.documentElement

    if (theme === 'light') {
      // Light theme with blue/gold color scheme
      root.style.setProperty('--primary-bg', '#F5F4D6')
      root.style.setProperty('--card-bg', '#ffffff')
      root.style.setProperty('--text-primary', '#003971')
      root.style.setProperty('--text-secondary', '#014f99')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.88)')
      root.style.setProperty('--glass-border', 'rgba(1, 79, 153, 0.18)')
      root.style.setProperty('--panel-highlight', 'rgba(201, 152, 77, 0.08)')
      root.style.setProperty('--dark-shadow-color', 'rgba(0, 57, 113, 0.15)')
      root.style.setProperty('--dark-progress-bg', 'rgba(1, 79, 153, 0.12)')
      root.style.setProperty('--dark-body-gradient', 'linear-gradient(135deg, #F5F4D6 0%, #f9f2d5 100%)')
      root.style.setProperty('--dark-btn', '#014f99')
      root.style.setProperty('--dark-btn-hover', '#003971')
      document.body.style.background = 'linear-gradient(135deg, #F5F4D6 0%, #f9f2d5 100%)'
    } else {
      // Dark theme with navy/gold color scheme
      root.style.setProperty('--primary-bg', '#091428')
      root.style.setProperty('--card-bg', '#142640')
      root.style.setProperty('--text-primary', '#f9f2d5')
      root.style.setProperty('--text-secondary', '#7A8DA0')
      root.style.setProperty('--glass-bg', 'rgba(1, 79, 153, 0.08)')
      root.style.setProperty('--glass-border', 'rgba(1, 79, 153, 0.2)')
      root.style.setProperty('--panel-highlight', 'rgba(201, 152, 77, 0.05)')
      root.style.setProperty('--dark-shadow-color', 'rgba(9, 20, 40, 0.6)')
      root.style.setProperty('--dark-progress-bg', 'rgba(122, 141, 160, 0.2)')
      root.style.setProperty('--dark-btn', '#0E1C32')
      root.style.setProperty('--dark-btn-hover', '#142640')
      document.body.style.background = 'radial-gradient(1200px 600px at 80% -20%, #0E1C32 0%, transparent 60%), #091428'
    }
  }

  // Initialize theme on store creation
  applyTheme(currentTheme.value)

  // Listen for theme changes from global navigation
  window.addEventListener('theme-changed', (e) => {
    const theme = e.detail?.theme
    if (theme && theme !== currentTheme.value) {
      applyTheme(theme)
    }
  })

  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    currentTheme,
    applyTheme
  }
})
