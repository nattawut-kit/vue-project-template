<template>
  <DefaultLayout />
</template>

<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue'

  const DefaultLayout = defineAsyncComponent(() => import('./components/DefaultLayout.vue'))
</script>
