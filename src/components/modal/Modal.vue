<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click="handleBackdropClick"
      >
        <div
          ref="panelRef"
          tabindex="-1"
          class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl outline-none"
          @click.stop
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: boolean
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    closeOnBackdrop: true,
    closeOnEsc: true,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const panelRef = ref<HTMLElement | null>(null)
  let previouslyFocused: HTMLElement | null = null

  const close = () => {
    emit('update:modelValue', false)
  }

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop) close()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.closeOnEsc) close()
  }

  watch(
    () => props.modelValue,
    async isOpen => {
      if (isOpen) {
        previouslyFocused = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', handleKeydown)
        await nextTick()
        panelRef.value?.focus()
      } else {
        document.removeEventListener('keydown', handleKeydown)
        previouslyFocused?.focus()
      }
    }
  )

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped lang="scss">
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;

    & > div {
      transition: transform 0.2s ease;
    }
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    & > div {
      transform: scale(0.95);
    }
  }
</style>
