<template>
  <div class="container">
    <div>This is Home Page</div>
    <br />
    <div @click="handleClick">Go to Example Page</div>
    <div @click="handleClickHeaderDemo">Go to Dynamic Header Demo</div>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()

  const handleClick = () => {
    router.push('/example')
  }

  const handleClickHeaderDemo = () => {
    router.push('/header-demo')
  }
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
    back_to: ''
    title: ''
  main:
    image: true
  navbottom:
    active: true
    current: 'home'
</route>
