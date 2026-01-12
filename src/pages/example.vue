<template>
  <div class="container">
    <div>Exmaple Page</div>

    <div @click="handleClick('DialogDemo')">DialogDemo</div>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()

  const handleClick = (path: string) => {
    router.push(`/${path}`)
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
    back_to: '/home'
    title: 'Exmaple Page'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
