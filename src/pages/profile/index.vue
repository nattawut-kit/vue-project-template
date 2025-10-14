<template>
  <div class="container">This is Profile Page.</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.container {
  padding: 12px;
}
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/auth'
    title: 'test'
  main:
    image: false
  navbottom:
    active: true
    footer: true
    current: 'profile'
</route>
