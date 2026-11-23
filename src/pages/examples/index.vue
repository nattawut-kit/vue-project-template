<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'

definePage({
  meta: { title: 'UI Examples', backTo: { name: '/home' } },
})

const router = useRouter()

interface ExampleLink {
  label: string
  name: keyof RouteNamedMap
}

const EXAMPLES: ExampleLink[] = [
  { label: 'Button', name: '/examples/button' },
  { label: 'Input (TextField)', name: '/examples/input' },
  { label: 'Select', name: '/examples/select' },
  { label: 'Popup (Dialog.create)', name: '/examples/popup' },
]

function open(example: ExampleLink): void {
  void router.replace({ name: example.name })
}
</script>

<template>
  <ul class="flex flex-col gap-2 px-5 py-4">
    <li v-for="example in EXAMPLES" :key="example.name">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3 text-16 text-content ring-1 ring-border hover:bg-surface-active"
        @click="open(example)"
      >
        {{ example.label }}
        <span aria-hidden="true" class="text-content-subtle">›</span>
      </button>
    </li>
  </ul>
</template>
