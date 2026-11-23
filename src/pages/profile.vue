<script setup lang="ts">
definePage({
  meta: { current: 'profile' },
})
</script>

<template>
  <div class="flex flex-col gap-4 px-5 py-6">
    <h1 class="text-22 font-bold text-content">โปรไฟล์</h1>
    <p class="text-16 text-content-subtle">
      หน้าตัวอย่างของแท็บที่สอง ใส่ <code>requiresAuth: true</code> ใน meta ถ้าหน้านี้ต้อง login
      ก่อน
    </p>
  </div>
</template>
