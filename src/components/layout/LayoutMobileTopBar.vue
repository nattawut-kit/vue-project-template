<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import Svg from '@/components/ui/Svg.vue'

const route = useRoute()
const router = useRouter()

function onBack(): void {
  if (route.meta.backTo) {
    void router.replace(route.meta.backTo)
  }
}

// Two looks: a page reached from another (backTo set) gets the back button and the title, every
// other page gets the brand logo. A titled page with no back button (`hideBack`) keeps the logo
// too, nothing else sits in its corner.
const showBack = computed(() => route.meta.backTo !== undefined && route.meta.backTo !== null)
const showLogo = computed(() => (!showBack.value || !!route.meta.hideBack) && !route.meta.hideLogo)
const title = computed(() => route.meta.title ?? '')

// A little scroll is enough to say the page has moved under the bar, it then casts a shadow.
const SCROLLED_AFTER_PX = 8
const { y: scrollY } = useWindowScroll()
const isScrolled = computed<boolean>(() => scrollY.value > SCROLLED_AFTER_PX)
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-14 items-center gap-3 bg-surface px-4 transition-shadow duration-200"
    :class="isScrolled ? 'shadow-top-bar-scrolled' : ''"
  >
    <!-- Both sides are the same width so the title stays centered -->
    <div class="flex w-10 shrink-0 justify-start">
      <button
        v-if="showBack && !route.meta.hideBack"
        type="button"
        class="flex size-10 cursor-pointer items-center justify-center rounded-full text-content hover:bg-surface-active disabled:cursor-not-allowed disabled:text-content-disabled"
        :disabled="!route.meta.backTo"
        aria-label="ย้อนกลับ"
        @click="onBack"
      >
        <Svg src="common/arrow-left-01" class="size-6" />
      </button>
      <!-- Replace with the project logo (an <img> from src/assets/images/) -->
      <span v-else-if="showLogo" class="text-18 font-bold text-brand">LOGO</span>
    </div>

    <div class="flex min-w-0 flex-1 justify-center">
      <p v-if="showBack" class="max-w-full truncate px-1 text-18 font-bold text-content">
        {{ title }}
      </p>
    </div>

    <div class="w-10 shrink-0" aria-hidden="true" />
  </header>
</template>
