<template>
  <div class="container">
    <div>This is Home Page</div>
    <br />
    <Button @click="handleClick">Go to Example Page</Button>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()

  const handleClick = () => {
    router.push('/example')
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
