import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Listen for the SSI nav's language-changed event to sync the Vue i18n store.
// The SSI nav handles clicks on .global-nav-lang-btn itself (translateNav + button states).
// We only react to its event to update the page content via the Vue i18n store.
import { useI18nStore } from './stores/i18n'

window.addEventListener('language-changed', (e) => {
  const lang = e.detail?.lang
  if (!lang) return

  const i18nStore = useI18nStore()
  if (lang !== i18nStore.currentLang) {
    i18nStore.setLanguage(lang)
  }
})
