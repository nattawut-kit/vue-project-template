<template>
  <div class="container">
    <div>This is Privilege Page</div>
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
    back_to: ''
    title: ''
  main:
    image: true
  navbottom:
    active: true
    current: 'privilege'
</route>
