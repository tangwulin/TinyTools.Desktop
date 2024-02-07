import VueLuckyCanvas from '@lucky-canvas/vue'
import * as Sentry from '@sentry/electron'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/style.css'
import router from './router'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744'
  })
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(VueLuckyCanvas)
app.mount('#app')
