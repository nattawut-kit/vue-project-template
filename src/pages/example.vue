<template>
  <div class="container">
    <div>Exmaple Page</div>
  </div>
</template>

<script setup lang="ts"></script>

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
