import type { RouteLocationRaw } from 'vue-router'
import type { MobileTabKey } from '@/components/layout/mobileTabs'

declare module 'vue-router' {
  interface RouteMeta {
    /** No token sends the user to the landing page (with `?redirect=` back here). Inherited by nested pages. */
    requiresAuth?: boolean
    hideTabBar?: boolean
    /** The bottom tab this page belongs to, it drives the active tab. */
    current?: MobileTabKey
    hideTopBar?: boolean
    hideLogo?: boolean
    /** Pixels the page is pulled up under the bottom of the top bar, for a card that sits on the banner art. Unset = the layout default, 0 = none. */
    overlapTopBar?: number
    /** Keeps the title layout of a backTo page but draws no back button, for a page with nowhere to go back to. */
    hideBack?: boolean
    backTo?: RouteLocationRaw | '' | null
    title?: string
    subtitle?: string
  }
}
