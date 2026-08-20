import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routers/index'
import App from './App.vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'

import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueDOMPurifyHTML, {
  namedConfigurations: {
    svg: {
      USE_PROFILES: { svg: true },
    },
    mathml: {
      USE_PROFILES: { mathMl: true },
    },
  },
})
app.mount('#app')
