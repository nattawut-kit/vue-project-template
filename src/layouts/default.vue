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
  import { defineAsyncComponent } from 'vue'

  const HorizontalLayout = defineAsyncComponent(() => import('./components/HorizontalLayout.vue'))
</script>
