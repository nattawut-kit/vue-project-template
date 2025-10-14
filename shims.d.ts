declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'virtual:generated-layouts' {
  export const setupLayouts: any
}

declare module '~pages' {
  const generatedRoutes: any
  export default generatedRoutes
}

declare module 'vue-dompurify-html' {
  import type { Plugin } from 'vue'
  const VueDOMPurifyHTML: Plugin
  export default VueDOMPurifyHTML
}
