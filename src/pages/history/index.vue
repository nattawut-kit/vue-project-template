<template>
  <div class="container">This is History Page.</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.container {
  padding: 12px;
}
</style>

<route lang="yaml">
meta:
  is_auth_route: true
  layout: default
  navtop:
    is_background: false
    back_to: ''
    title: ''
  main:
    image: false
  navbottom:
    active: true
    current: 'history'
</route>
