<template>
  <div class="container">
    <div>Exmaple Page</div>

    <div class="mt-6 flex flex-col gap-2">
      <div class="text-12 font-light">text-12 / font-light — สวัสดีครับ</div>
      <div class="text-14 font-regular">text-14 / font-regular — สวัสดีครับ</div>
      <div class="text-16 font-regular">text-16 / font-regular — สวัสดีครับ</div>
      <div class="text-18 font-regular">text-18 / font-regular — สวัสดีครับ</div>
      <div class="text-20 font-bold">text-20 / font-bold — สวัสดีครับ</div>
      <div class="text-24 font-bold">text-24 / font-bold — สวัสดีครับ</div>
      <div class="text-28 font-bold">text-28 / font-bold — สวัสดีครับ</div>
    </div>
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
