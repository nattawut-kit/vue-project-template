<template>
  <div class="container">
    <div>text area แบบ label</div>

    <div class="mt-6 flex max-w-xs flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">basic</div>
        <TextArea
          v-model="typeTextarea"
          label="ข้อความยาว"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">rows / autoResize / resizable</div>
        <div class="flex flex-col gap-3">
          <TextArea
            v-model="textareaRows"
            label="rows คงที่"
            :rows="3"
          />
          <TextArea
            v-model="textareaAutoResize"
            label="autoResize"
            auto-resize
          />
          <TextArea
            v-model="textareaResizable"
            label="resizable"
            resizable
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const typeTextarea = ref('')
  const textareaRows = ref('')
  const textareaAutoResize = ref('')
  const textareaResizable = ref('')
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
    title: 'text area แบบ label'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
