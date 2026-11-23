import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'
import { hasReachedEnd, useReadToEnd } from '@/composables/useReadToEnd'

const ROOT_BOTTOM = 100

function rectWithBottom(bottom: number): DOMRect {
  return { bottom } as DOMRect
}

function element(html: string, bottom: number): { root: HTMLElement; content: HTMLElement } {
  const root = document.createElement('div')
  const content = document.createElement('div')
  content.innerHTML = html
  root.append(content)
  root.getBoundingClientRect = () => rectWithBottom(ROOT_BOTTOM)
  content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(bottom)
  return { root, content }
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('hasReachedEnd', () => {
  const root = { getBoundingClientRect: () => rectWithBottom(100) } as Element

  it('is false below the visible area', () => {
    const last = { getBoundingClientRect: () => rectWithBottom(160) } as Element
    expect(hasReachedEnd(last, root)).toBe(false)
  })

  it('is true once the bottom edge is inside', () => {
    const last = { getBoundingClientRect: () => rectWithBottom(80) } as Element
    expect(hasReachedEnd(last, root)).toBe(true)
  })

  it('forgives a sub-pixel gap', () => {
    const last = { getBoundingClientRect: () => rectWithBottom(101.5) } as Element
    expect(hasReachedEnd(last, root)).toBe(true)
  })

  it('is false without a last element or a root', () => {
    expect(hasReachedEnd(null, root)).toBe(false)
    expect(hasReachedEnd(root, undefined)).toBe(false)
  })
})

describe('useReadToEnd', () => {
  function setup(bottom: number, html = '<p>a</p><p>b</p>') {
    const { root, content } = element(html, bottom)
    const scope = effectScope()
    const result = scope.run(() => useReadToEnd(shallowRef(root), shallowRef(content)))!
    return { root, content, scope, ...result }
  }

  it('stays false while the last tag is below the fold', async () => {
    const { hasReadToEnd, scope } = setup(400)
    await settle()

    expect(hasReadToEnd.value).toBe(false)
    scope.stop()
  })

  it('is true straight away when the content fits without scrolling', async () => {
    const { hasReadToEnd, scope } = setup(60)
    await settle()

    expect(hasReadToEnd.value).toBe(true)
    scope.stop()
  })

  it('unlocks when scrolling brings the bottom of the last tag in', async () => {
    const { root, content, hasReadToEnd, scope } = setup(400)
    await settle()

    content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(220)
    root.dispatchEvent(new Event('scroll'))
    expect(hasReadToEnd.value).toBe(false)

    content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(99)
    root.dispatchEvent(new Event('scroll'))
    expect(hasReadToEnd.value).toBe(true)
    scope.stop()
  })

  it('does not count a long last tag as read when only its top is visible', async () => {
    const { root, hasReadToEnd, scope } = setup(900)
    await settle()

    root.dispatchEvent(new Event('scroll'))

    expect(hasReadToEnd.value).toBe(false)
    scope.stop()
  })

  it('stays true after scrolling back up', async () => {
    const { root, content, hasReadToEnd, scope } = setup(60)
    await settle()

    content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(500)
    root.dispatchEvent(new Event('scroll'))

    expect(hasReadToEnd.value).toBe(true)
    scope.stop()
  })

  it('re-checks when the content is replaced', async () => {
    const { content, hasReadToEnd, scope } = setup(400)
    await settle()

    content.innerHTML = '<p>short</p>'
    content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(40)
    await settle()

    expect(hasReadToEnd.value).toBe(true)
    scope.stop()
  })

  it('stays false when the content has no elements', async () => {
    const root = document.createElement('div')
    root.getBoundingClientRect = () => rectWithBottom(ROOT_BOTTOM)
    const content = document.createElement('div')
    const scope = effectScope()
    const { hasReadToEnd } = scope.run(() => useReadToEnd(shallowRef(root), shallowRef(content)))!
    await settle()

    expect(hasReadToEnd.value).toBe(false)
    scope.stop()
  })

  it('stops listening when the scope stops', async () => {
    const { root, content, scope, hasReadToEnd } = setup(400)
    await settle()

    scope.stop()
    content.lastElementChild!.getBoundingClientRect = () => rectWithBottom(10)
    root.dispatchEvent(new Event('scroll'))

    expect(hasReadToEnd.value).toBe(false)
  })

  it('waits for the elements to exist', async () => {
    const rootRef = shallowRef<HTMLElement | null>(null)
    const contentRef = shallowRef<HTMLElement | null>(null)
    const scope = effectScope()
    const { hasReadToEnd } = scope.run(() => useReadToEnd(rootRef, contentRef))!
    await settle()
    expect(hasReadToEnd.value).toBe(false)

    const { root, content } = element('<p>a</p>', 30)
    rootRef.value = root
    contentRef.value = content
    await settle()

    expect(hasReadToEnd.value).toBe(true)
    scope.stop()
  })
})
