<template>
  <div class="container">
    <div>TextField Demo</div>

    <div class="mt-6 flex flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">Input</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="input แบบ label"
            @click="router.push('/example/text-field/input-label')"
          />
          <Button
            variant="secondary"
            label="input แบบ title"
            @click="router.push('/example/text-field/input-title')"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">Text Area</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="text area แบบ label"
            @click="router.push('/example/text-field/textarea-label')"
          />
          <Button
            variant="secondary"
            label="text area แบบ title"
            @click="router.push('/example/text-field/textarea-title')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()
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
    title: 'TextField Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
