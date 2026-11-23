/**
 * Locks page scroll while an overlay (modal/dialog) is open, and restores the original scroll
 * position on unlock.
 *
 * Uses position: fixed + top: -scrollY on #app (not body) because overflow: hidden alone doesn't
 * hold on iOS Safari (the app root falls out of flow, so the document has no height left to
 * scroll). It targets #app rather than body because BaseModal teleports to body — position: fixed
 * on an ancestor creates a new containing block, which would make the teleported modal's own
 * `fixed inset-0` resolve against that ancestor's box instead of the viewport, pinning it (and the
 * sticky top/bottom bars living next to #app) to the wrong place. #app is a sibling of the
 * teleported modal under body, so freezing it doesn't affect the modal at all.
 *
 * body also gets an explicit height while locked. #app going position: fixed takes it out of
 * normal flow, so body (its only child) collapses to 0 height. Safari then computes any
 * `position: sticky` descendant of #app (e.g. the bottom tab bar) against that collapsed 0-height
 * body as its scrollport, pinning it off-screen at the very top of the page — reproduced in
 * WebKit, not Chromium. Pinning body to the viewport height keeps that scrollport sane.
 *
 * Counts nested locks (lockCount) since more than one overlay can be open at once — only the last
 * one closing actually unlocks. A boolean flag would unlock as soon as the first one closes, while
 * another overlay is still open.
 */

import { ref, type Ref } from 'vue'

let lockCount = 0
let lockedScrollY = 0

let originalStyles: {
  bodyOverflow: string
  bodyHeight: string
  appPosition: string
  appTop: string
  appWidth: string
} | null = null

function getAppRoot(): HTMLElement | null {
  return document.getElementById('app')
}

const isLockedRef = ref(false)

/**
 * Reactive counterpart to isScrollLocked() — true while any lockScroll() is outstanding. #app going
 * position: fixed makes window.scrollY read 0 for as long as that lasts, so anything deriving state
 * from scroll position (e.g. LayoutMobileTopBar's background fade) should freeze on this instead of
 * reading that 0 as "scrolled to top".
 */
export const scrollLocked: Readonly<Ref<boolean>> = isLockedRef

export function lockScroll(): void {
  lockCount += 1
  isLockedRef.value = true

  if (lockCount > 1) return

  const { body } = document
  const app = getAppRoot()

  originalStyles = {
    bodyOverflow: body.style.overflow,
    bodyHeight: body.style.height,
    appPosition: app?.style.position ?? '',
    appTop: app?.style.top ?? '',
    appWidth: app?.style.width ?? '',
  }

  lockedScrollY = window.scrollY

  body.style.overflow = 'hidden'
  body.style.height = `${window.innerHeight}px`

  if (app) {
    app.style.position = 'fixed'
    app.style.top = `-${lockedScrollY}px`
    app.style.width = '100%'
  }
}

export function unlockScroll(): void {
  if (lockCount === 0) return

  lockCount -= 1
  isLockedRef.value = lockCount > 0

  if (lockCount > 0 || originalStyles === null) return

  const { body } = document
  const app = getAppRoot()

  body.style.overflow = originalStyles.bodyOverflow
  body.style.height = originalStyles.bodyHeight

  if (app) {
    app.style.position = originalStyles.appPosition
    app.style.top = originalStyles.appTop
    app.style.width = originalStyles.appWidth
  }

  originalStyles = null

  window.scrollTo(0, lockedScrollY)
}

export function isScrollLocked(): boolean {
  return lockCount > 0
}

/**
 * Drops the lock immediately without restoring lockedScrollY — for when the page underneath has
 * already navigated away while locked (e.g. DialogHost force-closing every open dialog on route
 * change). unlockScroll()'s normal `window.scrollTo(0, lockedScrollY)` would otherwise fire once
 * the modal's onUnmounted hook runs, re-scrolling the *new* route back to wherever the *old* one
 * was scrolled to.
 */
export function resetScrollLock(): void {
  if (lockCount === 0) return

  const { body } = document
  const app = getAppRoot()

  if (originalStyles) {
    body.style.overflow = originalStyles.bodyOverflow
    body.style.height = originalStyles.bodyHeight

    if (app) {
      app.style.position = originalStyles.appPosition
      app.style.top = originalStyles.appTop
      app.style.width = originalStyles.appWidth
    }
  }

  originalStyles = null
  lockCount = 0
  isLockedRef.value = false
}
