<template>
  <HorizontalLayout>
    <router-view v-slot="{ Component, route }">
      <component
        :is="Component"
        :key="route.path"
      />
    </router-view>
  </HorizontalLayout>
</template>

<script setup lang="ts">
  import HorizontalLayout from './HorizontalLayout.vue'
</script>
