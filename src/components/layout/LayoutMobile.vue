<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LayoutMobileTabBar from '@/components/layout/LayoutMobileTabBar.vue'
import LayoutMobileTopBar from '@/components/layout/LayoutMobileTopBar.vue'

const route = useRoute()

// Before the router resolves its first navigation, route.meta is always `{}` — gating on
// route.matched keeps both bars hidden instead of flashing visible on hide-bar pages.
const isRouteResolved = computed(() => route.matched.length > 0)
const showTabBar = computed(() => isRouteResolved.value && !route.meta.hideTabBar)
const showTopBar = computed(() => isRouteResolved.value && !route.meta.hideTopBar)

// A page may sit this far up under the top bar with its own `overlapTopBar`, for a card that
// overlaps a banner. The default is none.
const DEFAULT_OVERLAP_PX = 0

const mainStyle = computed(() => {
  // Nothing to sit under when the page has no top bar, the pull would only push its top edge off screen.
  if (!showTopBar.value) return undefined

  const overlap = route.meta.overlapTopBar ?? DEFAULT_OVERLAP_PX
  return overlap > 0 ? { marginTop: `-${overlap}px` } : undefined
})
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-160 flex-col bg-canvas">
    <LayoutMobileTopBar v-if="showTopBar" />

    <!-- No z-index on purpose: the top bar (z-20) stays on top of a page that sits up under it -->
    <main class="flex-1" :style="mainStyle">
      <slot />
    </main>

    <LayoutMobileTabBar v-if="showTabBar" />
  </div>
</template>
