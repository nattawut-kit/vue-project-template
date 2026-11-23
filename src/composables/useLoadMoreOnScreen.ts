import { nextTick, toValue, watch, type MaybeRefOrGetter, type Ref, type WatchSource } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export interface UseLoadMoreOnScreenOptions {
  hasNextPage: MaybeRefOrGetter<boolean>
  loadNextPage: () => Promise<unknown>
  /** Re-checks after the list changes, e.g. the flattened items. Read after every load: a load that leaves it unchanged stops the loop. */
  items: WatchSource
}

/** True while any part of the element is inside the viewport. */
export function isOnScreen(element: Element | null | undefined): boolean {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

// Infinite scroll for the sentinel pattern: an observer on a sentinel after the list, plus a plain
// on-screen check that keeps loading while the sentinel is still visible, because a small page on a tall
// screen can leave it on screen after a load without the observer ever firing again.
export function useLoadMoreOnScreen(
  sentinel: Ref<HTMLElement | null>,
  { hasNextPage, loadNextPage, items }: UseLoadMoreOnScreenOptions,
) {
  let isLoading = false

  async function loadMoreWhileOnScreen(): Promise<void> {
    if (isLoading) return
    isLoading = true

    try {
      while (toValue(hasNextPage) && isOnScreen(sentinel.value)) {
        const before = toValue(items)
        await loadNextPage()
        await nextTick()

        // A load that adds nothing (it failed, or the fetch has not landed yet) would ask again at once,
        // forever. The `items` watcher below starts the loop again as soon as the list does change.
        if (toValue(items) === before) break
      }
    } catch {
      // A failed load is shown by the caller's own error state, it must not escape as an unhandled rejection.
    } finally {
      isLoading = false
    }
  }

  useIntersectionObserver(sentinel, ([entry]) => {
    if (entry?.isIntersecting) void loadMoreWhileOnScreen()
  })

  watch(items, () => void loadMoreWhileOnScreen())

  return { loadMoreWhileOnScreen }
}
