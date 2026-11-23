import type { RouteLocationNormalized, Router } from 'vue-router'
import { useLoadingStore } from '@/stores/loading'

export const SHOW_DELAY_MS = 350

// Pages that show their own loading (a spinner in a button, a skeleton) and so never want the
// app-wide overlay on the way in or out. Add route names from typed-router.d.ts.
const SELF_MANAGED_ROUTE_NAMES = new Set<string>(['/(landing)'])

// Set by a button that spins while its own navigation loads, for that one navigation only.
let isNextNavigationSelfManaged = false

/** Call right before a `router.replace` whose button shows the loading itself, so the overlay stays out of it. */
export function manageNextNavigationLoading(): void {
  isNextNavigationSelfManaged = true
}

function isSelfManaged(route: RouteLocationNormalized): boolean {
  return typeof route.name === 'string' && SELF_MANAGED_ROUTE_NAMES.has(route.name)
}

export function installLoadingGuard(router: Router): void {
  let pendingTimer: ReturnType<typeof setTimeout> | undefined
  let hasShown = false

  function begin(): void {
    if (pendingTimer !== undefined || hasShown) return

    pendingTimer = setTimeout(() => {
      pendingTimer = undefined
      hasShown = true
      useLoadingStore().show()
    }, SHOW_DELAY_MS)
  }

  function end(): void {
    if (pendingTimer !== undefined) {
      clearTimeout(pendingTimer)
      pendingTimer = undefined
    }

    if (!hasShown) return

    hasShown = false
    useLoadingStore().hide()
  }

  router.beforeEach((to, from) => {
    if (isNextNavigationSelfManaged) {
      isNextNavigationSelfManaged = false
      return
    }
    if (isSelfManaged(to) || isSelfManaged(from)) return

    begin()
  })

  // A navigation that never reached beforeEach (the same route, an abort) must not leave the flag for the next one.
  router.afterEach(() => {
    isNextNavigationSelfManaged = false
    end()
  })
  router.onError(() => {
    isNextNavigationSelfManaged = false
    end()
  })
}
