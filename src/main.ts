import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import VueDompurifyHTML, { type DirectiveConfig } from 'vue-dompurify-html'

import '@/assets/main.css'
import App from '@/App.vue'
import { router } from '@/router'
import { isLiffEnabled, useLiffStore } from '@/stores/liff'

const app = createApp(App)

app.use(createPinia())
if (isLiffEnabled()) void useLiffStore().init()
app.use(PiniaColada, {
  queryOptions: {
    staleTime: 10_000,
  },
})
// YouTube only, Quill's video format can also emit a Vimeo embed, deliberately not allowed here.
const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'youtube.com']

const dompurifyConfig: DirectiveConfig = {
  default: {
    // DOMPurify strips target="_blank" by default; backend content already sends rel=noopener.
    // <iframe> is blocked by default too, allowed only for Quill's ql-video embeds, src
    // domain locked down by the hook below.
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'frameborder', 'allowfullscreen'],
  },
  hooks: {
    uponSanitizeAttribute(node, event) {
      if (node.tagName !== 'IFRAME' || event.attrName !== 'src') return

      try {
        if (!ALLOWED_IFRAME_HOSTS.includes(new URL(event.attrValue).hostname)) {
          event.keepAttr = false
        }
      } catch {
        event.keepAttr = false
      }
    },
  },
  namedConfigurations: {
    svg: {
      USE_PROFILES: { svg: true, svgFilters: true },
    },
  },
}

app.use(router)
app.use(VueDompurifyHTML, dompurifyConfig)
app.mount('#app')
