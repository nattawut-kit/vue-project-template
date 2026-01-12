// useDialogDom.ts
import { watch, onUnmounted, nextTick, type Ref } from 'vue'

export function useDialogDom(isOpen: Ref<boolean>) {
  let observer: MutationObserver | null = null
  let cleanupTimer: number | null = null

  const removeCommentNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT)
    const toRemove: Comment[] = []
    let node = walker.nextNode()
    while (node) {
      const comment = (node as Comment).textContent?.trim()
      if (comment?.startsWith('v-if') || comment?.includes('Backdrop')) {
        toRemove.push(node as Comment)
      }
      node = walker.nextNode()
    }
    toRemove.forEach(node => node.remove())
  }

  const startObserver = () => {
    observer = new MutationObserver(() => removeCommentNodes())
    observer.observe(document.body, { childList: true, subtree: true })
  }

  const stopObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  watch(
    isOpen,
    async newVal => {
      if (!newVal) {
        // 🕒 รอให้ Vue ปิด Teleport/Transition เสร็จ
        await nextTick()
        setTimeout(() => {
          startObserver()
          removeCommentNodes()
          setTimeout(() => {
            stopObserver()
          }, 400)
        }, 400) // หน่วงเพิ่มอีก 400ms หลังปิด
      } else {
        stopObserver()
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    stopObserver()
    if (cleanupTimer) clearInterval(cleanupTimer)
  })
}
