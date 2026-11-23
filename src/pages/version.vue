<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Svg from '@/components/ui/Svg.vue'
import { formatDateTime } from '@/utils/format'

definePage({
  meta: { hideTabBar: true },
})

const router = useRouter()

function goHome(): void {
  void router.replace({ name: '/home' })
}

// A full reload, not router.replace: it is the way to pick up a newer deployed build.
function reload(): void {
  window.location.reload()
}

// A build made without the variable shows a dash, so support can tell it apart from a real version.
const EMPTY_VALUE = '-'

interface VersionRow {
  label: string
  value: string
}

const rows: VersionRow[] = [
  { label: 'Version', value: import.meta.env.VITE_APP_VERSION || EMPTY_VALUE },
  { label: 'Environment', value: import.meta.env.VITE_BUILD_MODE || import.meta.env.MODE },
  { label: 'Build Time', value: formatDateTime(new Date(__APP_BUILD_TIME__)) },
]
</script>

<template>
  <div class="flex min-h-[calc(100dvh-68px)] flex-col items-center gap-4 px-5 text-center">
    <h1 class="text-18 leading-[1.3] font-bold text-content">ข้อมูลแอป</h1>
    <dl class="w-full rounded-2xl bg-surface p-4 ring-1 ring-border">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-center justify-between gap-4 py-2 text-16 leading-[1.3]"
      >
        <dt class="text-content-subtle">{{ row.label }}</dt>
        <dd class="font-bold text-content" data-test="version-value">{{ row.value }}</dd>
      </div>
    </dl>
    <button
      type="button"
      class="flex cursor-pointer items-center gap-1 text-16 leading-[1.3] font-bold text-brand"
      data-test="reload-button"
      @click="reload"
    >
      <Svg src="common/exchange" class="size-5" color="currentColor" />
      โหลดหน้าใหม่
    </button>
    <Button
      label="กลับหน้าหลัก"
      round="32px"
      :custom-size="{ width: 'full' }"
      data-test="home-button"
      @click="goHome"
    />
  </div>
</template>
