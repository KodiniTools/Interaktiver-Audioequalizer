<template>
  <header class="eq-page-header">
    <div class="eq-landing-wrap eq-page-header-inner">
      <nav class="eq-page-nav" :aria-label="labels.navigation">
        <a class="eq-page-link" :href="homeHref" :aria-current="workspace ? undefined : 'page'">
          {{ labels.overview }}
        </a>
        <a
          class="eq-page-link"
          :href="pageHref(workspacePath, i18n.currentLang)"
          :aria-current="workspace ? 'page' : undefined"
        >
          {{ labels.equalizer }}
        </a>
        <a class="eq-page-link" :href="`${homeHref}#${FAQ_ANCHOR_ID}`">{{ labels.faq }}</a>
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
  import { FAQ_ANCHOR_ID, PAGE_NAV_COPY } from '../config/pageNavigation'
  import { landingPath, pageHref, workspacePath } from '../utils/pageRoutes'

  /** workspace: true auf der Werkzeugseite, false auf der Landingpage. */
  defineProps({ workspace: Boolean })

  const i18n = useI18nStore()
  const theme = useThemeStore()
  const labels = computed(() => PAGE_NAV_COPY[i18n.currentLang] ?? PAGE_NAV_COPY.de)
  const homeHref = computed(() => pageHref(landingPath, i18n.currentLang))
</script>
