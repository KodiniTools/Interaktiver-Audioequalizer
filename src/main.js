import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import './assets/kodini-layout-stage1.css'
import './assets/kodini-header-stage2.css'
import './assets/kodini-controls-stage3.css'
import './assets/kodini-workspace-stage4.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
