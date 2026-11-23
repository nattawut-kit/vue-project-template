<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Svg from '@/components/ui/Svg.vue'
import { MOBILE_TABS, type MobileTab } from '@/components/layout/mobileTabs'

const route = useRoute()
const router = useRouter()

const activeKey = computed(() => route.meta.current)

function goToTab(tab: MobileTab): void {
  if (activeKey.value === tab.key) return

  void router.replace({ name: tab.routeName })
}
</script>

<template>
  <nav
    class="sticky bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    aria-label="เมนูหลัก"
  >
    <div class="flex h-16">
      <button
        v-for="tab in MOBILE_TABS"
        :key="tab.key"
        type="button"
        class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 transition-colors duration-200"
        :class="tab.key === activeKey ? 'text-brand' : 'text-content-subtle'"
        :aria-current="tab.key === activeKey ? 'page' : undefined"
        @click="goToTab(tab)"
      >
        <Svg
          :key="tab.key === activeKey ? tab.activeIcon : tab.icon"
          :src="tab.key === activeKey ? tab.activeIcon : tab.icon"
          class="size-6"
          aria-hidden="true"
        />
        <span class="text-14 leading-none">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
