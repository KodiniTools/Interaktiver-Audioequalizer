<template>
  <header class="eq-page-header">
    <div class="eq-landing-wrap eq-page-header-inner">
      <nav class="eq-page-nav" :aria-label="labels.navigation">
        <a v-for="link in PAGE_NAV_LINKS" :key="link.id" class="eq-page-link" :href="`#${link.id}`">
          {{ labels[link.label] }}
        </a>
      </nav>

      <button
        class="eq-page-link eq-local-theme"
        type="button"
        :aria-pressed="theme.currentTheme === 'dark'"
        @click="theme.applyTheme(theme.currentTheme === 'dark' ? 'light' : 'dark')"
      >
        {{ labels.darkMode }}
      </button>
    </div>
  </header>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18nStore } from '../stores/i18n'
  import { useThemeStore } from '../stores/theme'
  import { PAGE_NAV_COPY, PAGE_NAV_LINKS } from '../config/pageNavigation'

  const i18n = useI18nStore()
  const theme = useThemeStore()
  const labels = computed(() => PAGE_NAV_COPY[i18n.currentLang] ?? PAGE_NAV_COPY.de)
</script>
