<template>
  <div class="container">
    <div>text area แบบ title</div>

    <div class="mt-6 flex max-w-xs flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">title (หัวข้อนิ่งเหนือกล่อง แทน label ลอย)</div>
        <TextArea
          v-model="textareaTitleValue"
          title="รายละเอียดเพิ่มเติม"
          placeholder="กรอกรายละเอียดเพิ่มเติม"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const textareaTitleValue = ref('')
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example/text-field-demo'
    title: 'text area แบบ title'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
