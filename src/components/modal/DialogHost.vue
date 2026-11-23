<!-- Renders every dialog opened via Dialog.create() — mounted once in App.vue (which is why no
     other page needs to place a dialog component itself). A dialog's component talks back through
     'ok'/'cancel' emits, which useDialogComponent() fires. -->
<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { resetScrollLock } from '@/utils/scrollLock'
import DefaultModal from './DefaultModal.vue'
import { activeDialogs, closeAllDialogs } from './dialog'

const route = useRoute()

// Dialogs live outside <RouterView>, so they aren't destroyed on navigation — without this they'd
// stay open over the next page.
watch(
  () => route.path,
  () => {
    // Force-clearing activeDialogs unmounts any open BaseModal without its normal close flow, so
    // its onUnmounted hook is what actually releases the scroll lock — and unlockScroll() would
    // restore the *old* page's scroll position onto the page we just navigated to. Reset the lock
    // first so that never happens; the new route's own scroll position (see router/index.ts's
    // scrollBehavior) is what should stand.
    resetScrollLock()
    closeAllDialogs()
  },
)

// A repeat failure on the same route (retrying an action, a dev-server reload re-running
// onMounted) can open a new error dialog before the previous one was dismissed — without this
// they'd stack on top of each other. Only the most recent 'error'-type DefaultModal survives.
watch(activeDialogs, (dialogs) => {
  const errorDialogs = dialogs.filter(
    (dialog) => dialog.component === DefaultModal && dialog.componentProps.type === 'error',
  )
  if (errorDialogs.length <= 1) return

  const keepId = errorDialogs[errorDialogs.length - 1]!.id
  activeDialogs.value = dialogs.filter(
    (dialog) =>
      dialog.component !== DefaultModal ||
      dialog.componentProps.type !== 'error' ||
      dialog.id === keepId,
  )
})
</script>

<template>
  <component
    v-for="dialog in activeDialogs"
    :is="dialog.component"
    :key="dialog.id"
    v-bind="dialog.componentProps"
    @ok="dialog.close('ok', $event)"
    @cancel="dialog.close('cancel', $event)"
  />
</template>
