import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Drives the one app-wide `Loading` overlay, mounted once in `App.vue` — pages and plain modules
 * (api interceptors, router guards) just call `show()`/`hide()` instead of rendering their own.
 *
 * Counts pending loaders rather than holding a boolean: with two overlapping requests, the first
 * one finishing would otherwise flip the flag to false and tear the overlay down while the second
 * is still running. Same reason `utils/scrollLock.ts` counts its locks.
 */
export const useLoadingStore = defineStore('loading', () => {
  const pendingCount = ref(0)

  const isLoading = computed(() => pendingCount.value > 0)

  function show() {
    pendingCount.value += 1
  }

  function hide() {
    if (pendingCount.value === 0) return

    pendingCount.value -= 1
  }

  return { pendingCount, isLoading, show, hide }
})
