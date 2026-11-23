import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isScrollLocked, lockScroll, unlockScroll } from '@/utils/scrollLock'

beforeEach(() => {
  // lockScroll targets #app (see scrollLock.ts for why), so the DOM needs one to act on.
  const app = document.createElement('div')
  app.id = 'app'
  document.body.appendChild(app)

  // jsdom doesn't implement window.scrollTo — stub it so unlockScroll's restore-position call
  // doesn't log a "not implemented" warning for every test.
  vi.stubGlobal('scrollTo', () => {})
})

afterEach(() => {
  // Drain any lock left over by a failed assertion, so state doesn't leak into the next test.
  while (isScrollLocked()) unlockScroll()
  document.body.style.cssText = ''
  document.getElementById('app')?.remove()
  vi.unstubAllGlobals()
})

describe('lockScroll', () => {
  it('locks the app root and reports locked', () => {
    lockScroll()

    expect(isScrollLocked()).toBe(true)
    expect(document.getElementById('app')?.style.position).toBe('fixed')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not make body position: fixed, so a teleported modal still pins to the viewport', () => {
    lockScroll()

    expect(document.body.style.position).not.toBe('fixed')
  })

  it('pins body to the viewport height, so a sticky descendant of #app does not stick against a collapsed body', () => {
    lockScroll()

    expect(document.body.style.height).toBe(`${window.innerHeight}px`)
  })

  it('restores the original styles on unlock', () => {
    document.body.style.overflow = 'auto'
    document.body.style.height = '2000px'

    lockScroll()
    unlockScroll()

    expect(isScrollLocked()).toBe(false)
    expect(document.getElementById('app')?.style.position).toBe('')
    expect(document.body.style.overflow).toBe('auto')
    expect(document.body.style.height).toBe('2000px')
  })

  it('only unlocks once every nested lock has been released', () => {
    lockScroll()
    lockScroll()
    unlockScroll()

    expect(isScrollLocked()).toBe(true)

    unlockScroll()

    expect(isScrollLocked()).toBe(false)
  })

  it('does nothing when unlocking without a matching lock', () => {
    unlockScroll()

    expect(isScrollLocked()).toBe(false)
  })
})
