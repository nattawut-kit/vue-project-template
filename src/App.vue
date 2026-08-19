<template>
  <RouterView v-slot="{ Component, route }">
    <component
      :is="Component"
      :key="route.path"
    />
  </RouterView>

  <Modal
    :model-value="isOpen"
    @update:model-value="handleCancel"
  >
    <h2
      v-if="options?.title"
      class="mb-2 text-lg font-semibold text-gray-900"
    >
      {{ options.title }}
    </h2>
    <p class="text-sm text-gray-600">{{ options?.message }}</p>
    <div class="mt-6 flex justify-end gap-3">
      <Button
        variant="secondary"
        @click="handleCancel"
      >
        {{ options?.cancelText || 'ยกเลิก' }}
      </Button>
      <Button @click="handleConfirm">
        {{ options?.confirmText || 'ตกลง' }}
      </Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  const { isOpen, options, handleConfirm, handleCancel } = useDialog()
</script>

<style scoped lang="scss"></style>
