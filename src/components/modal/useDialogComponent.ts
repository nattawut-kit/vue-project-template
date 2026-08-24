import type { DialogResult } from './dialog'

/**
 * emit ที่ component ของ dialog ต้องประกาศไว้ แล้วส่งเข้า useDialogComponent():
 * defineEmits<{ ok: [payload?: unknown]; cancel: [payload?: unknown] }>()
 *
 * เขียนเป็น overload ให้ตรงกับที่ defineEmits generate ออกมา (union ธรรมดาจะ assign ไม่ผ่าน)
 */
export type DialogComponentEmit = {
  (event: 'ok', payload?: unknown): void
  (event: 'cancel', payload?: unknown): void
}

/**
 * ใช้ใน component ที่ถูกเปิดด้วย Dialog.create() — คืน visible สำหรับ v-model ของ BaseModal
 * และ handler สำหรับปิด dialog พร้อมบอกผลกลับไปที่ .onOk()/.onCancel()
 *
 * ปิดด้วย backdrop/ESC (visible กลายเป็น false เอง) นับเป็น cancel
 *
 * ปิดเองได้ทุกเมื่อ ไม่ต้องรอผู้ใช้กดปุ่ม — เช่นนับเวลาถอยหลังหมดแล้วเรียก
 * onDialogCancel({ reason: 'expired' }) ให้ call site แยกจากการกดปิดเองได้
 * (ดู src/pages/_components/ExampleCouponModal.vue)
 */
export const useDialogComponent = (emit: DialogComponentEmit) => {
  // เริ่มที่ false แล้วเปิดหลัง mount เพื่อให้ transition ตอนเข้าเล่นด้วย
  const visible = ref(false)

  let isSettled = false

  const settle = (result: DialogResult, payload?: unknown) => {
    if (isSettled) return

    isSettled = true
    visible.value = false

    // แยก branch เพราะเรียก overload ด้วยตัวแปร union ตรง ๆ ไม่ได้
    if (result === 'ok') {
      emit('ok', payload)
    } else {
      emit('cancel', payload)
    }
  }

  onMounted(() => {
    visible.value = true
  })

  watch(visible, value => {
    if (!value) settle('cancel')
  })

  return {
    visible,
    onDialogOk: (payload?: unknown) => settle('ok', payload),
    onDialogCancel: (payload?: unknown) => settle('cancel', payload),
  }
}
