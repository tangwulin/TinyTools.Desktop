import VueLuckyCanvas from '@lucky-canvas/vue'
import { init } from '@sentry/electron/renderer'
import * as Sentry from '@sentry/vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/style.css'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(VueLuckyCanvas)

if (import.meta.env.PROD) {
  init({
    dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744'
  })

  Sentry.init({
    app,
    dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744',
    integrations: [Sentry.browserTracingIntegration({ router })]
  })
}

app.mount('#app')
