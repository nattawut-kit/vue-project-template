<template>
  <!-- <HorizontalLayout> -->
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route" />
  </RouterView>
  <!-- </HorizontalLayout> -->
</template>

<script setup>
// import HorizontalLayout from './HorizontalLayout.vue'
</script>
