import 'vue-router'

// The shape every page declares in its <route lang="yaml"> block.
// Keeping this in sync with the pages is what lets layouts read
// route.meta.* without falling back to `any`.
declare module 'vue-router' {
  interface NavtopMeta {
    back_to?: string
    title?: string
    show_point?: boolean
    type_point?: string
  }

  interface NavbottomMeta {
    active?: boolean
    current?: 'home' | 'privilege' | 'history' | 'profile'
  }

  interface RouteMeta {
    layout?: string
    navtop?: NavtopMeta
    main?: { image?: boolean }
    navbottom?: NavbottomMeta
  }
}

export {}
