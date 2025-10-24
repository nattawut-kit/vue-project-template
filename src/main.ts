import { createApp } from 'vue'
import router from './routers/index'
import App from './App.vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'

// Import icon libraries
import '@fortawesome/fontawesome-pro/css/fontawesome.css'
import '@fortawesome/fontawesome-pro/css/light.css'
import '@fortawesome/fontawesome-pro/css/thin.css'
import '@fortawesome/fontawesome-pro/css/duotone.css'
import '@fortawesome/fontawesome-pro/css/brands.css'
import '@fortawesome/fontawesome-pro/css/solid.css'
import '@fortawesome/fontawesome-pro/css/regular.css'

import './style.css'

const app = createApp(App)

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
