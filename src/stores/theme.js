import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
      // Dark theme with custom color scheme
      root.style.setProperty('--primary-bg', '#0C0C10')
      root.style.setProperty('--card-bg', '#1a1a1f')
      root.style.setProperty('--text-primary', '#f0f0f0')
      root.style.setProperty('--text-secondary', '#AEAFB7')
      root.style.setProperty('--glass-bg', 'rgba(94, 95, 105, 0.08)')
      root.style.setProperty('--glass-border', 'rgba(174, 175, 183, 0.2)')
      root.style.setProperty('--panel-highlight', 'rgba(242, 226, 142, 0.05)')
      root.style.setProperty('--dark-shadow-color', 'rgba(12, 12, 16, 0.6)')
      root.style.setProperty('--dark-progress-bg', 'rgba(174, 175, 183, 0.2)')
      root.style.setProperty('--dark-btn', '#5E5F69')
      root.style.setProperty('--dark-btn-hover', '#6e6f79')
      document.body.style.background = 'radial-gradient(1200px 600px at 80% -20%, #1f1f2a 0%, transparent 60%), #0C0C10'
    }
  }
  
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
  }
  
  // Initialize theme on store creation
  applyTheme(currentTheme.value)
  
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
    toggleTheme,
    applyTheme
  }
})
