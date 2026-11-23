import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import liff from '@line/liff'

/** LINE LIFF is opt-in: a project that leaves `VITE_LIFF_ID` empty never loads it. */
export function isLiffEnabled(): boolean {
  return Boolean(import.meta.env.VITE_LIFF_ID)
}

export const useLiffStore = defineStore('liff', () => {
  const isReady = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isLoggedIn = computed(() => isReady.value && liff.isLoggedIn())

  async function init() {
    if (isReady.value || error.value !== null) return

    const liffId = import.meta.env.VITE_LIFF_ID

    // Not an error: the project simply does not use LINE login.
    if (!liffId) return

    try {
      await liff.init({ liffId })

      if (liff.isLoggedIn() && import.meta.env.DEV) {
        console.info('[LIFF] - Init and Login Success')
      }
      isReady.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'ไม่สามารถเชื่อมต่อ LINE ได้'
    }
  }

  return { isReady, isLoggedIn, error, init }
})
