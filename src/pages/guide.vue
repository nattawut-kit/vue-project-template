<script setup lang="ts">
import GuideSection from '@/components/features/guide/GuideSection.vue'
import { GUIDE_SECTIONS } from '@/components/features/guide/implementationGuide'

definePage({
  meta: { title: 'เริ่มต้นใช้ template', backTo: { name: '/home' }, current: 'home' },
})
</script>

<template>
  <!-- The template's own guide, opened from the home page. A new project deletes it with components/features/guide/. -->
  <div class="flex flex-col gap-4 px-5 py-6">
    <p class="text-14 leading-6 text-content-subtle">
      คู่มือสั้นๆ ว่าจะต่อยอดจาก template นี้อย่างไร พร้อมตัวอย่างโค้ด รายละเอียดเต็มอยู่ใน
      CLAUDE.md, docs/folder-structure.md และ skill ใน .claude/skills/
    </p>

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

    <GuideSection v-for="section in GUIDE_SECTIONS" :key="section.id" :section />
  </div>
</template>
