import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Intercept global navigation language buttons to prevent page reload.
// The Vue app handles language switching reactively via the i18n store.
import { useI18nStore } from './stores/i18n'

document.querySelectorAll('.global-nav-lang-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopImmediatePropagation()

    const targetLang = btn.getAttribute('data-lang')
    const i18nStore = useI18nStore()

    if (targetLang === i18nStore.currentLang) return

    i18nStore.setLanguage(targetLang)

    // Update nav button active states
    document.querySelectorAll('.global-nav-lang-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === targetLang)
    })

    // Notify SSI navigation to translate itself
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: targetLang } }))
  }, true) // capture phase: runs before the nav's bubble phase handler
})
