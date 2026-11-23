<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import DialogHost from '@/components/modal/DialogHost.vue'
import LayoutMobile from '@/components/layout/LayoutMobile.vue'
import Loading from '@/components/ui/Loading.vue'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

const PiniaColadaDevtools = import.meta.env.DEV
  ? defineAsyncComponent(() =>
      import('@pinia/colada-devtools').then((module) => module.PiniaColadaDevtools),
    )
  : undefined
</script>

<template>
  <LayoutMobile>
    <RouterView />
  </LayoutMobile>

  <component :is="PiniaColadaDevtools" v-if="PiniaColadaDevtools" />

  <DialogHost />

  <Loading :show="loadingStore.isLoading" />
</template>
