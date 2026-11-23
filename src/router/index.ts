import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import { installDynamicTitleGuard } from '@/router/dynamicTitleGuard'
import { installLoadingGuard } from '@/router/loadingGuard'
import { useAuthStore } from '@/stores/auth'

const LANDING_ROUTE_NAME = '/(landing)'
const UNAUTHORIZED_ROUTE_NAME = '/unauthorized'
const VERSION_ROUTE_NAME = '/version'
const EXAMPLES_ROUTE_PREFIX = '/examples'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    // Last so every real page wins; a link that matches nothing is treated like a page the user
    // has no right to (the guard below still sends a visitor with no token to landing first).
    { path: '/:pathMatch(.*)*', redirect: { name: UNAUTHORIZED_ROUTE_NAME } },
  ],

  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

// Vite's mode, not DEV: a deployed development site is a production build made with
// `--mode development`, so DEV is false there while the mode is still 'development'.
function isExamplesEnabled(): boolean {
  return import.meta.env.MODE === 'development'
}

function isExamplesRoute(route: RouteLocationNormalized): boolean {
  return route.path === EXAMPLES_ROUTE_PREFIX || route.path.startsWith(`${EXAMPLES_ROUTE_PREFIX}/`)
}

router.beforeEach((to) => {
  // The UI example pages are a review aid for local and the development site, closed everywhere else.
  if (isExamplesRoute(to) && !isExamplesEnabled()) return { name: UNAUTHORIZED_ROUTE_NAME }

  // Open to anyone, signed in or not, so support can read the build off a user's phone even when
  // the login itself is what is broken.
  if (to.name === VERSION_ROUTE_NAME) return true

  // `matched` so a layout route's meta covers every page nested under it.
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !useAuthStore().isAuthenticated) {
    // Kept in ?redirect= so the landing page can send the user back here after the login.
    return { name: LANDING_ROUTE_NAME, query: { redirect: to.fullPath } }
  }

  return true
})

installLoadingGuard(router)
installDynamicTitleGuard(router)

if (import.meta.hot) {
  handleHotUpdate(router)
}
