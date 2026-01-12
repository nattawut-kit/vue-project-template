<template>
  <div class="container">
    <div class="button-container">
      <q-btn color="secondary" text-color="black" label="example Page" :ripple="false" style="width: 100%"
        @click="handleClik" />

      <q-btn color="secondary" text-color="black" label="Loading Test" :ripple="false" style="width: 100%"
        @click="testLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const loading = useLoadingStore()

const handleClik = () => {
  router.push('/examples')
}

const testLoading = () => {
  loading.show = true
  setTimeout(() => {
    loading.show = true
  }, 1500)
}
</script>

<style scoped lang="scss">
.container {
  padding: 12px;

  & .button-container {
    display: flex;
    flex-direction: column;
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
    back_to: ''
    title: ''
  main:
    image: true
  navbottom:
    active: true
    current: 'home'
</route>
