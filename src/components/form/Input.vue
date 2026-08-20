<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="classes"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
  interface Props {
    modelValue?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    error?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    error: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const classes = computed(() => [
    'w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:ring-2',
    props.error
      ? 'border-error-1 focus:ring-error-2'
      : 'border-gray-300 focus:border-main-1 focus:ring-main-1/20',
    props.disabled && 'cursor-not-allowed bg-gray-100 opacity-60',
  ])

  const handleInput = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value)
  }
</script>
