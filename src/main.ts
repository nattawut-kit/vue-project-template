import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog } from 'quasar'
import iconSet from 'quasar/icon-set/fontawesome-v6-pro'

import App from './App.vue'
import router from './router'

// Import icon libraries
import '@fortawesome/fontawesome-pro/css/fontawesome.css'
import '@fortawesome/fontawesome-pro/css/light.css'
import '@fortawesome/fontawesome-pro/css/thin.css'
import '@fortawesome/fontawesome-pro/css/duotone.css'
import '@fortawesome/fontawesome-pro/css/brands.css'
import '@fortawesome/fontawesome-pro/css/solid.css'
import '@fortawesome/fontawesome-pro/css/regular.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// import Style
import './styles/style.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
    plugins: { Dialog },
    iconSet: iconSet
  })

app.mount('#app')
