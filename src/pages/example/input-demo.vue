<template>
  <div class="container">
    <div>Input Demo</div>

    <div class="mt-6 flex max-w-xs flex-col gap-3">
      <Input
        v-model="exampleValue"
        placeholder="ปกติ"
      />
      <Input
        v-model="exampleErrorValue"
        placeholder="error state"
        error
      />
      <Input
        placeholder="disabled"
        disabled
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  const exampleValue = ref('')
  const exampleErrorValue = ref('')
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
    back_to: '/example'
    title: 'Input Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
