<template>
  <button
    :class="classes"
    :disabled="disabled"
    :type="type"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  type Variant = 'primary' | 'secondary'

  interface Props {
    variant?: Variant
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    disabled: false,
    type: 'button',
  })

  const classes = computed(() => [
    'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition',
    props.variant === 'primary' && 'bg-brand-primary text-white hover:opacity-90',
    props.variant === 'secondary' && 'border border-brand-primary bg-white text-brand-primary',
    props.disabled && 'pointer-events-none opacity-50',
  ])
</script>
