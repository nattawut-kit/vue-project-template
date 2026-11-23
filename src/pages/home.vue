<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'

definePage({
  meta: { current: 'home' },
})

const router = useRouter()

// Same rule as the router guard: the example pages only exist in Vite mode development.
const showExamplesLink = import.meta.env.MODE === 'development'

function openGuide(): void {
  void router.replace({ name: '/guide' })
}

function openExamples(): void {
  void router.replace({ name: '/examples/' })
}
</script>

<template>
  <!-- A placeholder: a new project replaces this page with its real home page. -->
  <div class="flex flex-col gap-4 px-5 py-6">
    <h1 class="text-22 font-bold text-content">หน้าแรก</h1>
    <p class="text-14 leading-6 text-content-subtle">
      หน้าตัวอย่างของ template เริ่มจากอ่านคู่มือว่าจะต่อยอดอย่างไร
      แล้วแทนหน้านี้ด้วยหน้าแรกของโปรเจค
    </p>

    <Button
      label="คู่มือเริ่มต้นใช้ template"
      :custom-size="{ width: 'full' }"
      data-test="guide-button"
      @click="openGuide"
    />
    <Button
      v-if="showExamplesLink"
      variant="outline"
      label="ดูตัวอย่าง component ทั้งหมด"
      :custom-size="{ width: 'full' }"
      data-test="examples-button"
      @click="openExamples"
    />
  </div>
</template>
