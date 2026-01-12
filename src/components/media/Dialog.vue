<!-- Dialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="dialog-container"
        @click="handleBackdropClick"
      >
        <!-- Dialog Content -->
        <Transition name="dialog">
          <div
            v-if="isOpen"
            class="dialog-wrapper"
            :class="{ 'bounce-shake': isBouncing }"
          >
            <div
              class="pointer-events-auto"
              @click.stop
            >
              <slot></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  interface Props {
    isOpen: boolean
    allowOutsideClick?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    allowOutsideClick: true,
  })

  const emit = defineEmits<{
    close: []
  }>()

  const isBouncing = ref<boolean>(false)

  let scrollY = 0

  const lockBodyScroll = () => {
    scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
  }

  const unlockBodyScroll = () => {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    window.scrollTo(0, scrollY)
  }

  // ฟังก์ชันลบ comment nodes
  const removeCommentNodes = () => {
    const body = document.body
    const iterator = document.createNodeIterator(body, NodeFilter.SHOW_COMMENT, null)

    const commentsToRemove: Comment[] = []
    let currentNode: Comment | null

    // console.log('currentNode : ', currentNode)

    while ((currentNode = iterator.nextNode() as Comment | null)) {
      console.log('currentNode : ', currentNode.textContent)

      if (currentNode.textContent?.trim() === 'v-if') {
        commentsToRemove.push(currentNode)
      }
    }

    commentsToRemove.forEach(comment => comment.remove())
  }

  // Watch for dialog open/close to manage body scroll
  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        lockBodyScroll()
      } else {
        unlockBodyScroll()
        // ลบ comment nodes หลังจาก transition เสร็จ
        setTimeout(removeCommentNodes, 400)
      }
    },
    { immediate: true }
  )

  // Setup MutationObserver เพื่อลบ comment nodes ที่เกิดขึ้นใหม่
  onMounted(() => {
    const observer = new MutationObserver(() => {
      removeCommentNodes()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // ลบ comment nodes ที่มีอยู่แล้ว
    removeCommentNodes()

    // Cleanup
    onUnmounted(() => {
      observer.disconnect()
      if (props.isOpen) {
        unlockBodyScroll()
      }
    })
  })

  // Methods
  const handleBackdropClick = () => {
    if (props.allowOutsideClick) {
      emit('close')
    } else {
      triggerBounceAnimation()
    }
  }

  const triggerBounceAnimation = () => {
    if (isBouncing.value) return

    isBouncing.value = true
    setTimeout(() => {
      isBouncing.value = false
    }, 500)
  }
</script>

<style scoped>
  .dialog-container {
    position: fixed;
    inset: 0;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .dialog-wrapper {
    /* flex items-center justify-center min-h-full */
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }
  /* Backdrop Transitions */
  .backdrop-enter-active,
  .backdrop-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .backdrop-enter-from,
  .backdrop-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  .backdrop-enter-to,
  .backdrop-leave-from {
    opacity: 1;
    backdrop-filter: blur(4px);
  }

  /* Dialog Transitions */
  .dialog-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dialog-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .dialog-enter-from,
  .dialog-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }

  .dialog-enter-to,
  .dialog-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* Bounce Animation */
  .bounce-shake {
    animation: bounceShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes bounceShake {
    0%,
    100% {
      transform: scale(1) translateY(0) rotate(0deg);
    }
    10% {
      transform: scale(1.02) translateY(-2px) rotate(-0.5deg);
    }
    20% {
      transform: scale(1.01) translateY(-1px) rotate(0.5deg);
    }
    30% {
      transform: scale(1.02) translateY(-3px) rotate(-0.5deg);
    }
    40% {
      transform: scale(1) translateY(0) rotate(0.3deg);
    }
    50% {
      transform: scale(1.01) translateY(-1px) rotate(-0.3deg);
    }
    60% {
      transform: scale(1) translateY(0) rotate(0.2deg);
    }
    70% {
      transform: scale(1.005) translateY(-0.5px) rotate(-0.1deg);
    }
    80% {
      transform: scale(1) translateY(0) rotate(0deg);
    }
  }
</style>
