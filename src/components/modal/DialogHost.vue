<!-- เรนเดอร์ dialog ทุกตัวที่เปิดด้วย Dialog.create() — mount ครั้งเดียวใน App.vue
     (นี่คือเหตุผลที่หน้าอื่นไม่ต้องวาง component ของ modal เอง)
     component ของ dialog คุยกลับมาด้วย emit 'ok'/'cancel' ซึ่ง useDialogComponent() ยิงให้ -->
<template>
  <component
    v-for="dialog in activeDialogs"
    :is="dialog.component"
    :key="dialog.id"
    v-bind="dialog.componentProps"
    @ok="dialog.close('ok', $event)"
    @cancel="dialog.close('cancel', $event)"
  />
</template>

<script setup lang="ts">
  const route = useRoute()

  // dialog อยู่นอก RouterView เลยไม่ถูก destroy ตอนเปลี่ยนหน้า ถ้าไม่เก็บเองจะค้างทับหน้าใหม่
  // (path เดียวกับ key ของ <router-view> ใน App.vue — dialog ตายพร้อมหน้าที่เปิดมันขึ้นมา)
  watch(
    () => route.path,
    () => {
      closeAllDialogs()
    }
  )
</script>
