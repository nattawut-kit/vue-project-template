<script setup lang="ts">
import Button, {
  type ButtonRound,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/Button.vue'
import Svg from '@/components/ui/Svg.vue'

// One section per prop, the review page for the Button component (see pages/examples/).
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline']
const SIZES: ButtonSize[] = ['lg', 'md', 'sm']
const ROUNDS: ButtonRound[] = ['none', 'sm', 'md', 'lg', 'xl', 'full']
</script>

<template>
  <div class="flex flex-col gap-8 px-5 pb-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Variant</h2>

      <div v-for="variant in VARIANTS" :key="variant" class="flex flex-col gap-2">
        <p class="text-16 text-content-strong">{{ variant }}</p>
        <Button :variant="variant" label="ยืนยัน" :custom-size="{ width: 'full' }" />
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Size</h2>

      <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
        <p class="text-16 text-content-strong">{{ size }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="variant in VARIANTS" :key="variant" :variant :size label="ปุ่ม" />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Round</h2>

      <div class="flex flex-wrap items-center gap-3">
        <Button v-for="round in ROUNDS" :key="round" size="md" :round :label="round" />
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">State</h2>

      <div v-for="variant in VARIANTS" :key="variant" class="flex flex-col gap-2">
        <p class="text-16 text-content-strong">{{ variant }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <Button :variant label="Disabled" disabled />
          <Button :variant label="Loading" loading />
          <Button :variant label="Press me" />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Icon</h2>

      <div class="flex flex-wrap items-center gap-3">
        <Button label="Start icon">
          <template #start-icon>
            <Svg src="common/tick" class="size-5" color="currentColor" />
          </template>
        </Button>
        <Button label="End icon" variant="outline">
          <template #end-icon>
            <Svg src="common/arrow-right-01" class="size-5" color="currentColor" />
          </template>
        </Button>
        <Button round="circle" size="md" aria-label="ปิด">
          <template #start-icon>
            <Svg src="common/x-close" class="size-4" color="currentColor" />
          </template>
        </Button>
      </div>
    </section>
  </div>
</template>
