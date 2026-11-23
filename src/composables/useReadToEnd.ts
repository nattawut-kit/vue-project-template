import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

// Sub-pixel layout and zoom leave the last line a fraction short of the edge, without a margin a
// reader who really is at the bottom would never unlock.
const END_TOLERANCE_PX = 2

/** True once the bottom edge of `last` has scrolled into the visible area of `root`. */
export function hasReachedEnd(
  last: Element | null | undefined,
  root: Element | null | undefined,
  tolerance = END_TOLERANCE_PX,
): boolean {
  if (!last || !root) return false

  return last.getBoundingClientRect().bottom <= root.getBoundingClientRect().bottom + tolerance
}

/**
 * Latches `hasReadToEnd` once the last element inside `content` has been scrolled fully into view
 * in `root`. Checks the element's bottom edge, not whether it is merely visible, so a long final
 * block is not counted as read the moment its first line appears.
 */
export function useReadToEnd(
  root: MaybeRefOrGetter<HTMLElement | null | undefined>,
  content: MaybeRefOrGetter<HTMLElement | null | undefined>,
) {
  const hasReadToEnd = ref<boolean>(false)
  let stopWatching: (() => void) | null = null

  function release(): void {
    stopWatching?.()
    stopWatching = null
  }

  function check(): void {
    if (hasReadToEnd.value) return

    if (hasReachedEnd(toValue(content)?.lastElementChild, toValue(root))) {
      hasReadToEnd.value = true
      release()
    }
  }

  watch(
    [() => toValue(root), () => toValue(content)],
    ([rootElement, contentElement]) => {
      release()
      if (!rootElement || !contentElement || hasReadToEnd.value) return

      rootElement.addEventListener('scroll', check, { passive: true })
      // Content that fits without scrolling, or a late font or image changing its height, never
      // fires a scroll event, so layout changes re-check too.
      const resizeObserver =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check)
      resizeObserver?.observe(rootElement)
      const mutationObserver = new MutationObserver(check)
      mutationObserver.observe(contentElement, { childList: true, subtree: true })

      stopWatching = () => {
        rootElement.removeEventListener('scroll', check)
        resizeObserver?.disconnect()
        mutationObserver.disconnect()
      }

      check()
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(release)

  return { hasReadToEnd }
}
