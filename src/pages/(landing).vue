<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clearSessionAndRestart, showErrorDialog } from '@/components/modal/errorDialog'
import Loading from '@/components/ui/Loading.vue'
import { captureRedirectPath, consumeRedirectPath, useLineLogin } from '@/composables/useLineLogin'
import { isLiffEnabled, useLiffStore } from '@/stores/liff'

definePage({
  meta: { hideTabBar: true, hideTopBar: true },
})

const router = useRouter()
const liffStore = useLiffStore()
const { loginWithLine } = useLineLogin()

// The entry page. With LINE login on (VITE_LIFF_ID set) it logs in and moves on by itself; with it
// off it goes straight to the home page, replace this with the project's own login when it has one.
const liffEnabled = isLiffEnabled()

watch(
  () => liffStore.error,
  (error) => {
    // liff.ready never settles after a failed init, so the page cannot go on: the dialog is the only way out.
    if (error) {
      showErrorDialog({
        content: error,
        buttons: [{ action: 'submit', text: 'ลองใหม่อีกครั้งภายหลัง' }],
        onSubmit: clearSessionAndRestart,
      })
    }
  },
  { immediate: true },
)

captureRedirectPath()

onMounted(() => {
  if (liffEnabled) {
    void loginWithLine()
    return
  }

  void router.replace(consumeRedirectPath() ?? { name: '/home' })
})
</script>

<template>
  <!-- Same overlay the route loading uses, so the first screen and the page changes look alike. It steps aside for the error popup. -->
  <div class="min-h-dvh">
    <Loading :show="!liffStore.error" />
  </div>
</template>
