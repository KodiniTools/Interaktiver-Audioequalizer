<template>
  <div class="app-controls">
    <button 
      id="themeToggle" 
      class="control-icon-btn" 
      :title="themeStore.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
      :aria-label="themeStore.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
      @click="themeStore.toggleTheme"
    >
      <i :class="themeStore.currentTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
    
    <button 
      id="languageToggle" 
      class="control-icon-btn" 
      :title="i18nStore.currentLang === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'"
      :aria-label="i18nStore.currentLang === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'"
      @click="i18nStore.toggleLanguage"
    >
      <span class="lang-flag">{{ i18nStore.currentLang === 'de' ? '🇬🇧' : '🇩🇪' }}</span>
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'

const themeStore = useThemeStore()
const i18nStore = useI18nStore()
</script>
