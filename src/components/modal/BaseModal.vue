<!-- โครงกลางของทุก modal: backdrop / กล่องกลางจอ / transition / ESC / focus / ล็อก scroll
     ไม่มี padding และไม่รู้เรื่อง dialog logic — เนื้อหาทั้งหมดมาจาก slot
     อยาก custom UI ใหม่ ให้ครอบ BaseModal แล้วเขียนข้างในเอง (ดู DefaultModal.vue) -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click="handleBackdropClick"
      >
        <div
          ref="panelRef"
          tabindex="-1"
          class="w-full max-w-81.75 overflow-hidden rounded-2xl bg-white shadow-xl outline-none"
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

<script setup lang="ts">
  interface Props {
    modelValue: boolean
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    closeOnBackdrop: true,
    closeOnEsc: true,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const panelRef = ref<HTMLElement | null>(null)
  const isShaking = ref(false)
  let previouslyFocused: HTMLElement | null = null

  // ถือ lock ได้ทีละ 1 ต่อ instance — ทั้ง watch และ onUnmounted เรียกได้โดยไม่นับเกิน
  let hasScrollLock = false

  const acquireScrollLock = () => {
    if (hasScrollLock) return

    hasScrollLock = true
    lockScroll()
  }

  const releaseScrollLock = () => {
    if (!hasScrollLock) return

    hasScrollLock = false
    unlockScroll()
  }

  const close = () => {
    emit('update:modelValue', false)
  }

  // ปิดไม่ได้ (closeOnBackdrop/closeOnEsc = false) ก็สั่นบอกแทน ว่ากดยังไงก็ไม่ปิด
  const shake = () => {
    isShaking.value = false
    requestAnimationFrame(() => {
      isShaking.value = true
    })
  }

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
      close()
    } else {
      shake()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return

    if (props.closeOnEsc) {
      close()
    } else {
      shake()
    }
  }

  watch(
    () => props.modelValue,
    async isOpen => {
      if (isOpen) {
        acquireScrollLock()
        previouslyFocused = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', handleKeydown)
        await nextTick()
        panelRef.value?.focus()
      } else {
        releaseScrollLock()
        document.removeEventListener('keydown', handleKeydown)
        // preventScroll: คืนโฟกัสให้ปุ่มเดิมได้ แต่ห้าม browser เลื่อน scroll container ไปหามันเอง
        previouslyFocused?.focus({ preventScroll: true })
      }
    }
  )

  onUnmounted(() => {
    // ถูก unmount ทั้งที่ยังเปิดอยู่ (เช่น closeAllDialogs ตอนเปลี่ยนหน้า) ต้องคืน lock ด้วย
    releaseScrollLock()
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped lang="scss">
  /* 0.2s ต้องตรงกับ LEAVE_DURATION ใน src/utils/dialog.ts */
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
