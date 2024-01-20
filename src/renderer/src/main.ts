import * as Sentry from '@sentry/electron'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import router from './router'

Sentry.init({
  dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744'
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
createApp(App).use(router).use(pinia).mount('#app')
