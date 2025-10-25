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
      root.style.setProperty('--primary-bg', '#f5f5f5')
      root.style.setProperty('--card-bg', '#ffffff')
      root.style.setProperty('--text-primary', '#1a1a1a')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)')
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--panel-highlight', 'rgba(0, 0, 0, 0.05)')
      root.style.setProperty('--dark-shadow-color', 'rgba(0, 0, 0, 0.15)')
      root.style.setProperty('--dark-progress-bg', 'rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--dark-body-gradient', 'linear-gradient(135deg, #e0e7ff 0%, #f5f5f5 100%)')
      root.style.setProperty('--dark-btn', '#e5e5e5')
      root.style.setProperty('--dark-btn-hover', '#d4d4d4')
      document.body.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #f5f5f5 100%)'
    } else {
      root.style.setProperty('--primary-bg', '#0a0a0a')
      root.style.setProperty('--card-bg', '#161616')
      root.style.setProperty('--text-primary', '#f0f0f0')
      root.style.setProperty('--text-secondary', '#888888')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.03)')
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.15)')
      root.style.setProperty('--panel-highlight', 'rgba(255, 255, 255, 0.06)')
      root.style.setProperty('--dark-shadow-color', 'rgba(0, 0, 0, 0.5)')
      root.style.setProperty('--dark-progress-bg', 'rgba(255, 255, 255, 0.15)')
      root.style.setProperty('--dark-btn', '#222222')
      root.style.setProperty('--dark-btn-hover', '#333333')
      document.body.style.background = 'radial-gradient(1200px 600px at 80% -20%, #1b2452 0%, transparent 60%), #0a0a0a'
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
