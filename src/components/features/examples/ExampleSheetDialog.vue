<!-- A custom dialog for the popup example page: shows how a feature builds its own dialog on
     BaseBottomSheet (or BaseModal), opened through Dialog.create() like DefaultModal. -->
<script setup lang="ts">
import BaseBottomSheet from '@/components/modal/BaseBottomSheet.vue'
import { useDialogComponent, type DialogComponentEmit } from '@/components/modal/useDialogComponent'
import Button from '@/components/ui/Button.vue'

const { options } = defineProps<{ options: string[] }>()

const emit = defineEmits<DialogComponentEmit>()

const { visible, onDialogOk, onDialogCancel } = useDialogComponent(emit)
</script>

<template>
  <BaseBottomSheet v-model="visible">
    <div class="flex flex-col gap-3 p-6">
      <h2 class="text-18 font-bold text-content">เลือกตัวเลือก</h2>

      <Button
        v-for="option in options"
        :key="option"
        variant="outline"
        :label="option"
        :custom-size="{ width: 'full' }"
        @click="onDialogOk(option)"
      />

      <Button
        variant="secondary"
        label="ยกเลิก"
        :custom-size="{ width: 'full' }"
        @click="onDialogCancel({ reason: 'dismissed' })"
      />
    </div>
  </BaseBottomSheet>
</template>
