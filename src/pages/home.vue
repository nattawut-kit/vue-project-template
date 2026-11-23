<script setup lang="ts">
import { useRouter } from 'vue-router'
import HomeGuideSection from '@/components/features/home/HomeGuideSection.vue'
import { GUIDE_SECTIONS } from '@/components/features/home/implementationGuide'
import Button from '@/components/ui/Button.vue'

definePage({
  meta: { current: 'home' },
})

const router = useRouter()

// Same rule as the router guard: the example pages only exist in Vite mode development.
const showExamplesLink = import.meta.env.MODE === 'development'

function openExamples(): void {
  void router.replace({ name: '/examples/' })
}
</script>

<template>
  <!-- The template's own guide. A new project replaces this page with its real home page. -->
  <div class="flex flex-col gap-4 px-5 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-22 font-bold text-content">เริ่มต้นใช้ template</h1>
      <p class="text-14 leading-6 text-content-subtle">
        คู่มือสั้นๆ ว่าจะต่อยอดจาก template นี้อย่างไร พร้อมตัวอย่างโค้ด รายละเอียดเต็มอยู่ใน
        CLAUDE.md, docs/folder-structure.md และ skill ใน .claude/skills/
        เมื่อเริ่มโปรเจคจริงให้แทนหน้านี้ด้วยหน้าแรกของโปรเจค
      </p>
      <Button
        v-if="showExamplesLink"
        variant="outline"
        size="md"
        label="ดูตัวอย่าง component ทั้งหมด"
        :custom-size="{ width: 'full' }"
        @click="openExamples"
      />
    </header>

    <nav aria-label="หัวข้อในคู่มือ" class="flex flex-wrap gap-2">
      <a
        v-for="section in GUIDE_SECTIONS"
        :key="section.id"
        :href="`#${section.id}`"
        class="rounded-full bg-brand-subtle px-3 py-1 text-12 text-brand"
      >
        {{ section.title }}
      </a>
    </nav>

    <HomeGuideSection v-for="section in GUIDE_SECTIONS" :key="section.id" :section />
  </div>
</template>
