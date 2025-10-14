<template>
  <div class="container">
    <div class="text-center">Example Page</div>
    <div class="button-container">
      <q-btn
        color="secondary"
        label="Button"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('button')"
      />
      <q-btn
        color="secondary"
        label="Checkbox"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('checkbox')"
      />
    </div>

    <div class="button-container">
      <q-btn
        color="secondary"
        label="Input"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('input')"
      />
      <q-btn
        color="secondary"
        label="select"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('select')"
      />
    </div>

    <div class="button-container">
      <q-btn
        color="secondary"
        label="Dialogs"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('dialog')"
      />
      <q-btn
        color="secondary"
        label="Carousel"
        :ripple="false"
        style="width: 100%"
        @click="handleClik('carousel')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const handleClik = (path: string) => {
  router.push(`/examples/${path}`)
}
</script>

<style scoped lang="scss">
.container {
  padding: 12px;

  & .button-container {
    margin-top: 12px;
    display: flex;
    gap: 16px;
  }
}
</style>

<route lang="yaml">
meta:
  is_auth_route: true
  layout: default
  navtop:
    is_background: true
    back_to: '/home'
    title: 'Exaple Page'
  main:
    image: true
  navbottom:
    active: false
    current: 'examples'
</route>
