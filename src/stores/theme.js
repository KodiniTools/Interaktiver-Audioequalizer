import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Theme handling as in Equalizer 19 (src/composables/useTheme.js):
 * the theme is only the `data-theme` attribute; every colour comes from the
 * design tokens in assets/main.css (:root = dark, [data-theme='light'] = light).
 * No inline custom properties: they would override the token stylesheet.
 */
const isTheme = (value) => value === 'dark' || value === 'light'

function detectSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme')
  const currentTheme = ref(isTheme(stored) ? stored : detectSystemTheme())

  let applyingTheme = false

  const applyTheme = (theme) => {
    if (!isTheme(theme)) return
    applyingTheme = true
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    applyingTheme = false
  }

  applyTheme(currentTheme.value)

  // The SSI nav sets data-theme on <html> when toggled
  const observer = new MutationObserver((mutations) => {
    if (applyingTheme) return
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        const htmlTheme = document.documentElement.getAttribute('data-theme')
        if (htmlTheme && htmlTheme !== currentTheme.value) applyTheme(htmlTheme)
      }
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // The SSI nav also dispatches a theme-changed event (Equalizer 19 listens to it)
  window.addEventListener('theme-changed', (e) => {
    const theme = e.detail?.theme
    if (isTheme(theme) && theme !== currentTheme.value) applyTheme(theme)
  })

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light')
    })
  }

  return {
    currentTheme,
    applyTheme,
  }
})
