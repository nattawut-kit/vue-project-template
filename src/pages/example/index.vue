<template>
  <div class="container">
    <div>Exmaple Page</div>

    <div class="mt-6 flex flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">Components</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="Button Demo"
            @click="router.push('/example/button-demo')"
          />
          <Button
            variant="secondary"
            label="TextField Demo"
            @click="router.push('/example/text-field-demo')"
          />
          <Button
            variant="secondary"
            label="Dialog Demo"
            @click="router.push('/example/dialog-demo')"
          />
          <Button
            variant="secondary"
            label="Img Demo"
            @click="router.push('/example/img-demo')"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">Typography</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="Text Demo"
            @click="router.push('/example/text-demo')"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">Layout</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="Header Title Demo"
            @click="router.push('/example/header-demo')"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">API</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            label="API Call Examples"
            @click="router.push('/example/api-demo')"
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
  # is_auth_route: true
  layout: default
  navtop:
    back_to: '/home'
    title: 'Exmaple Page'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
