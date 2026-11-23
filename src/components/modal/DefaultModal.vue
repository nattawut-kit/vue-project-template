<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import { getErrorDisplay } from '@/api/client'
import BaseModal from './BaseModal.vue'
import PopupHeader from './PopupHeader.vue'
import { useDialogComponent, type DialogComponentEmit } from './useDialogComponent'
import type { DialogType, IDialogButton } from './dialog'

const {
  type = 'success',
  title = '',
  content = '',
  error,
  buttons = [{ action: 'submit', text: 'ปิด' }],
} = defineProps<{
  type?: DialogType
  title?: string
  content?: string
  error?: unknown
  buttons?: IDialogButton[]
}>()

const emit = defineEmits<DialogComponentEmit>()

const { visible, onDialogOk, onDialogCancel } = useDialogComponent(emit)

const errorDisplay = computed(() => (error === undefined ? null : getErrorDisplay(error)))

const displayTitle = computed(
  () => title || errorDisplay.value?.title || (type === 'error' ? 'เกิดข้อผิดพลาด' : ''),
)

const displayContent = computed(
  () => content || errorDisplay.value?.message || (type === 'error' ? 'กรุณาลองใหม่อีกครั้ง' : ''),
)

const pendingIndex = ref<number | null>(null)

async function handleAction(button: IDialogButton, index: number): Promise<void> {
  if (button.onClick) {
    pendingIndex.value = index
    try {
      await button.onClick()
    } finally {
      pendingIndex.value = null
    }
  }

  if (button.action === 'submit') {
    onDialogOk()
  } else {
    onDialogCancel()
  }
}
</script>

<template>
  <BaseModal v-model="visible" :close-on-backdrop="false" :close-on-esc="false">
    <div class="flex flex-col items-center pt-8 pb-6">
      <PopupHeader :type />

      <div
        v-if="displayTitle || displayContent"
        class="flex w-full flex-col items-center gap-1.5 px-6 pt-4"
      >
        <div
          v-if="displayTitle"
          v-dompurify-html="displayTitle"
          class="text-center text-20 leading-7 font-bold text-content"
        ></div>

        <div
          v-if="displayContent"
          v-dompurify-html="displayContent"
          class="text-center text-16 leading-6 text-content-subtle"
        ></div>
      </div>

      <div v-if="buttons.length > 0" class="mt-6 flex w-full items-center gap-3 px-6">
        <Button
          v-for="(button, index) in buttons"
          :key="index"
          class="flex-1"
          :custom-size="{ width: 'full' }"
          :label="button.text"
          :variant="button.action === 'submit' ? 'primary' : 'secondary'"
          :loading="pendingIndex === index"
          :disabled="pendingIndex !== null && pendingIndex !== index"
          @click="handleAction(button, index)"
        />
      </div>
    </div>
  </BaseModal>
</template>
