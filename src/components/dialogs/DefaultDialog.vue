<!-- DefaultDialog.vue -->
<template>
  <Dialog
    :is-open="dialogOpen"
    :allow-outside-click="allowOutsideClick"
    @close="closeDialog"
  >
    <div class="dialog-container">
      <div class="dialog-wrapper">555555</div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  interface ButtonConfig {
    action: 'submit' | 'close' | 'cancel'
    text: string
    disabled?: boolean
  }

  interface Props {
    modelValue?: boolean
    // type?: keyof typeof iconMap
    title?: string
    content?: string
    allowOutsideClick?: boolean
    buttons?: ButtonConfig[]
  }

  // import liff from '@line/liff'

  //   import Alert from '@/assets/images/dialog/icons/icon-alert.png'
  //   import Call from '@/assets/images/dialog/icons/icon-call.png'
  //   import Complete from '@/assets/images/dialog/icons/icon-complete.png'
  //   import Gift from '@/assets/images/dialog/icons/icon-gift.png'
  //   import Mistake from '@/assets/images/dialog/icons/icon-mistake.png'
  //   import OTP from '@/assets/images/dialog/icons/icon-OTP.png'
  //   import Question from '@/assets/images/dialog/icons/icon-question.png'
  //   import Signout from '@/assets/images/dialog/icons/icon-signout.png'
  //   import Waiting from '@/assets/images/dialog/icons/icon-waiting.png'

  const router = useRouter()

  //   const iconMap = {
  //     alert: Alert,
  //     call: Call,
  //     success: Complete,
  //     gift: Gift,
  //     mistake: Mistake,
  //     otp: OTP,
  //     question: Question,
  //     signout: Signout,
  //     waiting: Waiting,
  //   } as const

  const props = withDefaults(defineProps<Props>(), {
    allowOutsideClick: false,
    buttons: () => [
      {
        action: 'submit',
        text: 'ปิด',
      },
    ],
    type: 'success',
    modelValue: false,
  })

  const instance = getCurrentInstance()

  const emit = defineEmits<{
    close: []
    submit: []
    cancel: []
    'update:modelValue': [value: boolean]
  }>()

  //   const iconSrc = computed(() => iconMap[props.type] || iconMap.success)

  const dialogOpen = computed(() => props.modelValue ?? false)

  const titleDefault = computed(() => {
    // if (props.type === 'alert') {
    if (props.title) {
      return props.title
    } else {
      return 'เกิดข้อผิดพลาด'
    }
    // } else {
    //   return props.title
    // }
  })

  const descriptionDefault = computed(() => {
    // if (props.type === 'alert') {
    if (props.content) {
      return props.content
    } else {
      return 'กรุณาลองใหม่อีกครั้ง'
    }
    // } else {
    //   return props.content
    // }
  })

  const getButtonVariant = (action: ButtonConfig['action']) => {
    switch (action) {
      case 'submit':
        return 'primary'
      case 'cancel':
      case 'close':
        return 'outlined'
      default:
        return 'outlined'
    }
  }

  const handleButtonClick = (action: ButtonConfig['action']) => {
    switch (action) {
      case 'cancel':
        handleCancel()
        break
      case 'submit':
        handleSubmit()
        break
      case 'close':
        handleClose()
        break
      default:
        handleClose()
        break
    }
  }

  const handleCancel = () => {
    const cancelCallback = instance?.vnode.props?.onCancel as (() => void) | undefined

    // ถ้ามี callback ให้เรียก emit('cancel') ก่อน
    if (cancelCallback) {
      emit('cancel')
    }

    // ปิด dialog อัตโนมัติ
    closeDialog()
  }

  const handleClose = () => {
    // ปิด dialog อัตโนมัติ
    closeDialog()
  }

  const closeDialog = async () => {
    // รองรับทั้งสองแบบ
    if (props.modelValue !== undefined) {
      emit('update:modelValue', false)
    }

    emit('close')
  }

  const handleSubmit = async () => {
    // ถ้ามี listener 'submit' ให้ emit submit
    if (instance?.vnode.props?.onSubmit) {
      emit('submit')
    }
    //กรณีที่ 401 ให้ปิด liff clear ทุกอย่าง เพื่อ login ใหม่
    else if (props.title === 'ไม่มีสิทธิ์ในการทำรายการ' || props.title === 'Verification Failed') {
      localStorage.clear()
      sessionStorage.clear()
      // liff.closeWindow()
      router.replace('/')
    }

    // ปิด dialog อัตโนมัติ
    await closeDialog()

    await nextTick()
  }
</script>

<style scoped>
  .dialog-container {
    max-width: 343px;
  }

  .dialog-wrapper {
    background-color: white;
    height: 120px;
  }
</style>
