<!-- popup มาตรฐาน (สำเร็จ / ยืนยัน / เตือน / ผิดพลาด) สำหรับเปิดด้วย Dialog.create()
     เป็นตัวอย่างของ modal ที่ต่อยอดจาก BaseModal — custom modal ตัวอื่นก็ทำโครงเดียวกันนี้ -->
<template>
  <BaseModal
    v-model="visible"
    :close-on-backdrop="false"
    :close-on-esc="false"
  >
    <div class="flex justify-center py-6">
      <div
        :class="['flex size-18.5 items-center justify-center rounded-full text-white', tone.circle]"
      >
        <IconCheck
          v-if="type === 'success'"
          class="size-9"
        />
        <IconQuestion
          v-else-if="type === 'question'"
          class="size-9"
        />
        <IconExclamation
          v-else-if="type === 'alert'"
          class="size-9"
        />
        <IconCross
          v-else
          class="size-9"
        />
      </div>
    </div>

    <div class="px-4 pb-4">
      <div
        v-if="displayTitle"
        class="pt-4 text-center text-20 font-bold text-gray-900"
      >
        {{ displayTitle }}
      </div>

      <div
        v-if="displayContent"
        v-dompurify-html="displayContent"
        class="pt-2 text-center leading-5.5 text-gray-800"
      ></div>

      <div
        v-if="buttons.length > 0"
        class="flex items-center gap-2.5 pt-5"
      >
        <Button
          v-for="(button, index) in buttons"
          :key="index"
          class="w-full"
          :variant="button.action === 'submit' ? 'primary' : 'secondary'"
          @click="handleAction(button.action)"
        >
          {{ button.text }}
        </Button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  interface Props {
    type?: DialogType
    title?: string
    content?: string
    buttons?: IDialogButton[]
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'success',
    title: '',
    content: '',
    buttons: () => [{ action: 'submit', text: 'ปิด' }],
  })

  const emit = defineEmits<{
    ok: [payload?: unknown]
    cancel: [payload?: unknown]
  }>()

  const { visible, onDialogOk, onDialogCancel } = useDialogComponent(emit)

  // type 'cancel' มี copy default ให้ เพราะส่วนใหญ่ถูกเรียกจาก error ที่ไม่ได้ส่งข้อความมา
  const displayTitle = computed(() => {
    if (props.title) return props.title

    return props.type === 'cancel' ? 'เกิดข้อผิดพลาด' : ''
  })

  const displayContent = computed(() => {
    if (props.content) return props.content

    return props.type === 'cancel' ? 'กรุณาลองใหม่อีกครั้ง' : ''
  })

  const tone = computed(() => {
    switch (props.type) {
      case 'question':
        return { band: 'bg-main-4/10', circle: 'bg-main-4' }
      case 'alert':
        return { band: 'bg-main-2/10', circle: 'bg-main-2' }
      case 'cancel':
        return { band: 'bg-error-2', circle: 'bg-error-1' }
      default:
        return { band: 'bg-main-1/10', circle: 'bg-main-1' }
    }
  })

  const handleAction = (action: DialogButtonAction) => {
    if (action === 'submit') {
      onDialogOk()
    } else {
      onDialogCancel()
    }
  }
</script>
