import { createApp } from 'vue'
import router from './routers/index'
import App from './App.vue'
import './style.css'
import VueDOMPurifyHTML from 'vue-dompurify-html'

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
