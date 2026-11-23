<!-- A modal panel anchored to the bottom edge instead of centered — same backdrop, Esc/focus/
     scroll-lock handling as BaseModal.vue, but the panel slides up from the bottom, spans the full
     width, and only its top corners are rounded. No padding and no dialog-specific logic, all
     content comes through the slot, same as BaseModal. -->
<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'
import { isTopDialog, popDialog, pushDialog, trapFocus } from '@/components/modal/dialog'

const { closeOnBackdrop = true, closeOnEsc = true } = defineProps<{
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}>()

const open = defineModel<boolean>({ required: true })

const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null
const dialogId = Symbol('BaseBottomSheet')

// Holds at most one lock per instance — safe to call from both the watcher and onUnmounted without
// double-counting.
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

function close(): void {
  open.value = false
}

function handleBackdropClick(): void {
  if (closeOnBackdrop) close()
}

function handleKeydown(event: KeyboardEvent): void {
  // Only the topmost open dialog reacts — every open instance keeps its own listener, so without
  // this a single Escape would close every stacked modal/bottom-sheet at once.
  if (!isTopDialog(dialogId)) return

  if (event.key === 'Escape') {
    if (closeOnEsc) close()
    return
  }

  if (panelRef.value) trapFocus(event, panelRef.value)
}

watch(open, async (isOpen) => {
  if (isOpen) {
    pushDialog(dialogId)
    acquireScrollLock()
    previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    panelRef.value?.focus()
  } else {
    popDialog(dialogId)
    releaseScrollLock()
    document.removeEventListener('keydown', handleKeydown)
    // preventScroll lets focus return to the trigger without the browser scrolling to find it.
    previouslyFocused?.focus({ preventScroll: true })
  }
})

onUnmounted(() => {
  // Can be unmounted while still open (e.g. its route changes out from under it) — release the lock
  // and stack slot either way.
  popDialog(dialogId)
  releaseScrollLock()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-popup-backdrop backdrop-blur-[2px]"
        @click="handleBackdropClick"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="w-full max-w-160 overflow-hidden rounded-t-2xl bg-surface shadow-popup outline-none"
          @click.stop
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 0.2s must match any close-delay logic built on top of this component. */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;

  & > div {
    transition: transform 0.2s ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  & > div {
    transform: translateY(100%);
  }
}
</style>
