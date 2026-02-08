import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Intercept global navigation language buttons to sync with Vue i18n store.
// preventDefault() stops the default browser action (e.g. link navigation/reload)
// but lets the SSI nav's own click handler run so it can call translateNav().
import { useI18nStore } from './stores/i18n'

document.querySelectorAll('.global-nav-lang-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault()

    const targetLang = btn.getAttribute('data-lang')
    const i18nStore = useI18nStore()

    if (targetLang === i18nStore.currentLang) return

    i18nStore.setLanguage(targetLang)
  })
})
