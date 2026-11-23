<script setup lang="ts">
import Svg from '@/components/ui/Svg.vue'
import type { DialogType } from './dialog'

const { type = 'success' } = defineProps<{ type?: DialogType }>()

// Typed as Records so a new DialogType fails to compile until it has an icon and a colour.
const ICONS: Record<DialogType, string> = {
  success: 'dialog/success',
  question: 'dialog/question',
  alert: 'dialog/alert',
  error: 'dialog/error',
}

const TONES: Record<DialogType, string> = {
  success: 'text-success',
  question: 'text-brand',
  alert: 'text-warning',
  error: 'text-danger',
}
</script>

<template>
  <div class="flex w-full shrink-0 justify-center" :class="TONES[type]">
    <Svg :src="ICONS[type]" class="size-14" aria-hidden="true" />
  </div>
</template>
