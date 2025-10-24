<template>
  <HorizontalLayout>
    <router-view v-slot="{ Component, route }">
      <component
        :is="Component"
        :key="route"
      />
    </router-view>
  </HorizontalLayout>
</template>

<script setup>
  import HorizontalLayout from './HorizontalLayout.vue'
</script>
