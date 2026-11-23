<!-- eslint-disable vue/multi-word-component-names -- kept as `Loading` by request, like `Button` -->
<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import Spinner from '@/components/ui/Spinner.vue'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'

const { show } = defineProps<{
  /** Controlled by the caller — e.g. a router `beforeEach`/`afterEach` pair toggling a ref while
   * the next route resolves. */
  show: boolean
}>()

// Holds at most one lock per instance — safe to call from both the watcher and onUnmounted without
// double-counting, same guard BaseModal uses.
let hasScrollLock = false

function acquireScrollLock(): void {
  if (hasScrollLock) return

  hasScrollLock = true
  lockScroll()
}

function releaseScrollLock(): void {
  if (!hasScrollLock) return

  hasScrollLock = false
  unlockScroll()
}

watch(
  () => show,
  (isShown) => {
    if (isShown) {
      acquireScrollLock()
    } else {
      releaseScrollLock()
    }
  },
  { immediate: true },
)

// The caller can unmount this while it is still showing (e.g. navigating away mid-load).
onUnmounted(releaseScrollLock)
</script>

<template>
  <Teleport to="body">
    <Transition name="loading">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-popup-backdrop backdrop-blur-sm"
        role="status"
        aria-label="กำลังโหลด"
      >
        <div class="flex flex-col items-center gap-3 rounded-lg px-4 py-3">
          <Spinner :size="48" color="var(--app-brand)" type="oval" :thickness="4" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.2s ease;

  & > div {
    transition: transform 0.2s ease;
  }
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;

  & > div {
    transform: scale(0.95);
  }
}
</style>
