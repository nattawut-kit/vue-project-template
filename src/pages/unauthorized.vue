<script setup lang="ts">
import { clearSessionAndRestart } from '@/components/modal/errorDialog'
import Button from '@/components/ui/Button.vue'

definePage({
  meta: { hideTabBar: true },
})
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-68px)] flex-col items-center justify-center gap-4 px-5 text-center"
  >
    <h1 class="text-18 leading-[1.3] font-bold text-content">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
    <p class="text-16 leading-[1.3] text-content">หรือเซสชันของคุณหมดอายุแล้ว</p>
    <Button
      label="ย้อนกลับ"
      round="32px"
      :custom-size="{ width: 'full' }"
      @click="clearSessionAndRestart"
    />
  </div>
</template>
