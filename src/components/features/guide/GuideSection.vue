<script setup lang="ts">
import type { GuideTopic } from './implementationGuide'

const { section } = defineProps<{ section: GuideTopic }>()
</script>

<template>
  <section
    :id="section.id"
    class="flex scroll-mt-18 flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border"
  >
    <h2 class="text-18 font-bold text-content">{{ section.title }}</h2>
    <p class="text-14 leading-6 text-content-subtle">{{ section.summary }}</p>

    <ul class="flex list-disc flex-col gap-1 pl-5 text-14 leading-6 text-content">
      <li v-for="step in section.steps" :key="step">{{ step }}</li>
    </ul>

    <div v-if="section.code" class="flex flex-col gap-1">
      <p v-if="section.file" class="text-12 font-medium text-content-subtle">{{ section.file }}</p>
      <pre
        class="overflow-x-auto rounded-xl bg-surface-active p-3 text-12 leading-5 text-content-strong"
      ><code>{{ section.code }}</code></pre>
    </div>
  </section>
</template>
