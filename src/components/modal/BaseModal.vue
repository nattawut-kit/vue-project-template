<!-- The core reusable modal: backdrop, centered panel, transition, Esc/focus/scroll-lock handling.
     No padding and no dialog-specific logic, all content comes through the slot. To build a new
     preset UI, wrap BaseModal and write the content yourself (see DefaultModal.vue). -->
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
const isShaking = ref(false)
let previouslyFocused: HTMLElement | null = null
const dialogId = Symbol('BaseModal')

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

// Shakes the panel instead of closing, to signal that backdrop/Esc won't close it right now.
function shake(): void {
  isShaking.value = false
  requestAnimationFrame(() => {
    isShaking.value = true
  })
}

function handleBackdropClick(): void {
  if (closeOnBackdrop) {
    close()
  } else {
    shake()
  }
}

function handleKeydown(event: KeyboardEvent): void {
  // Only the topmost open dialog reacts — every open instance keeps its own listener, so without
  // this a single Escape would close every stacked modal/bottom-sheet at once.
  if (!isTopDialog(dialogId)) return

  if (event.key === 'Escape') {
    if (closeOnEsc) {
      close()
    } else {
      shake()
    }
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
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-popup-backdrop p-6 backdrop-blur-[2px]"
        @click="handleBackdropClick"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-popup outline-none"
          :class="{ shake: isShaking }"
          @click.stop
          @animationend="isShaking = false"
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 0.2s must match any close-delay logic built on top of this component. */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;

  & > div {
    transition: transform 0.2s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  & > div {
    transform: scale(0.95);
  }
}

@keyframes modal-shake {
  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}

.shake {
  animation: modal-shake 0.4s ease-in-out;
}
</style>
