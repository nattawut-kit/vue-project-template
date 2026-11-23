import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { isOnScreen, useLoadMoreOnScreen } from './useLoadMoreOnScreen'

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  )
})

enableAutoUnmount(afterEach)

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function rectAt(top: number, bottom: number): DOMRect {
  return { top, bottom } as DOMRect
}

describe('isOnScreen', () => {
  it('is false without an element', () => {
    expect(isOnScreen(null)).toBe(false)
  })

  it('is true while any part is inside the viewport', () => {
    const element = document.createElement('div')
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
      rectAt(window.innerHeight - 10, window.innerHeight + 40),
    )

    expect(isOnScreen(element)).toBe(true)
  })

  it('is false below the fold and above the top', () => {
    const element = document.createElement('div')
    const spy = vi.spyOn(element, 'getBoundingClientRect')

    spy.mockReturnValue(rectAt(window.innerHeight + 1, window.innerHeight + 50))
    expect(isOnScreen(element)).toBe(false)

    spy.mockReturnValue(rectAt(-50, 0))
    expect(isOnScreen(element)).toBe(false)
  })
})

function mountHarness(options: { pages: number; onScreen: boolean }) {
  const loadNextPage = vi.fn<() => Promise<void>>()
  const items = ref<number[]>([1])
  const hasNextPage = ref<boolean>(options.pages > 0)
  let loop: () => Promise<void> = () => Promise.resolve()

  loadNextPage.mockImplementation(async () => {
    items.value = [...items.value, items.value.length + 1]
    if (items.value.length > options.pages) hasNextPage.value = false
  })

  const Harness = defineComponent({
    setup() {
      const sentinel = ref<HTMLElement | null>(null)
      const { loadMoreWhileOnScreen } = useLoadMoreOnScreen(sentinel, {
        hasNextPage,
        loadNextPage,
        items: () => items.value.length,
      })
      loop = loadMoreWhileOnScreen
      return () =>
        h('div', {
          ref: (element) => {
            sentinel.value = element as HTMLElement | null
            if (element) {
              vi.spyOn(element as Element, 'getBoundingClientRect').mockReturnValue(
                options.onScreen ? rectAt(0, 10) : rectAt(5000, 5010),
              )
            }
          },
          onClick: () => void loadMoreWhileOnScreen(),
        })
    },
  })

  return {
    wrapper: mount(Harness),
    loadNextPage,
    items,
    hasNextPage,
    loadMoreWhileOnScreen: () => loop(),
  }
}

describe('useLoadMoreOnScreen', () => {
  it('keeps loading while the sentinel stays on screen and a next page exists', async () => {
    const { wrapper, loadNextPage } = mountHarness({ pages: 2, onScreen: true })

    await wrapper.trigger('click')
    await flushPromises()

    expect(loadNextPage).toHaveBeenCalledTimes(2)
  })

  it('does not load while the sentinel is off screen', async () => {
    const { wrapper, loadNextPage } = mountHarness({ pages: 2, onScreen: false })

    await wrapper.trigger('click')
    await flushPromises()

    expect(loadNextPage).not.toHaveBeenCalled()
  })

  it('does not load when there is no next page', async () => {
    const { wrapper, loadNextPage } = mountHarness({ pages: 0, onScreen: true })

    await wrapper.trigger('click')
    await flushPromises()

    expect(loadNextPage).not.toHaveBeenCalled()
  })

  it('checks again when the items change', async () => {
    const { loadNextPage, items } = mountHarness({ pages: 1, onScreen: true })

    items.value = [1, 2]
    await nextTick()
    await flushPromises()

    expect(loadNextPage).toHaveBeenCalled()
  })

  it('never runs two loops at once', async () => {
    const { wrapper, loadNextPage } = mountHarness({ pages: 1, onScreen: true })

    await Promise.all([wrapper.trigger('click'), wrapper.trigger('click')])
    await flushPromises()

    expect(loadNextPage).toHaveBeenCalledTimes(1)
  })

  it('stops after a load that adds nothing, instead of asking again and again', async () => {
    const { wrapper, loadNextPage } = mountHarness({ pages: 2, onScreen: true })
    // The page failed to load: the call resolves, nothing is appended and a next page still exists.
    loadNextPage.mockImplementation(() => Promise.resolve())

    await wrapper.trigger('click')
    await flushPromises()

    expect(loadNextPage).toHaveBeenCalledTimes(1)
  })

  it('tries again once the items change after a load that added nothing', async () => {
    const { wrapper, loadNextPage, items } = mountHarness({ pages: 5, onScreen: true })
    loadNextPage.mockImplementationOnce(() => Promise.resolve())

    await wrapper.trigger('click')
    await flushPromises()
    expect(loadNextPage).toHaveBeenCalledTimes(1)

    items.value = [...items.value, 99]
    await flushPromises()

    expect(loadNextPage.mock.calls.length).toBeGreaterThan(1)
  })

  it('swallows a failing load, the caller shows the error state', async () => {
    const { loadNextPage, loadMoreWhileOnScreen } = mountHarness({ pages: 2, onScreen: true })
    loadNextPage.mockRejectedValue(new Error('boom'))

    await expect(loadMoreWhileOnScreen()).resolves.toBeUndefined()
    expect(loadNextPage).toHaveBeenCalledTimes(1)
  })

  it('can load again after a failed load', async () => {
    const { loadNextPage, loadMoreWhileOnScreen } = mountHarness({ pages: 3, onScreen: true })
    loadNextPage.mockRejectedValueOnce(new Error('boom'))

    await loadMoreWhileOnScreen()
    await loadMoreWhileOnScreen()

    expect(loadNextPage.mock.calls.length).toBeGreaterThan(1)
  })
})
