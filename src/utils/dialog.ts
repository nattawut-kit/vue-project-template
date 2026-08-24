import DefaultModal from '@/components/modal/DefaultModal.vue'

/**
 * popup มาตรฐาน (DefaultModal) — สำหรับ call site ที่ไม่ต้องการ import component
 * และไม่ต้องเขียน Dialog.create เต็มรูป
 *
 * showDialog(
 *   'success',
 *   'อัปเดตข้อมูลสำเร็จ',
 *   'คุณได้ทำการอัปเดตข้อมูลเรียบร้อยแล้ว',
 *   [{ action: 'submit', text: 'ปิด' }],
 *   async () => {
 *     await customerStore.fetchCustomerInfo()
 *     router.push({ name: 'profile' })
 *   }
 * )
 *
 * ไม่ส่ง buttons = ปุ่ม 'ปิด' ปุ่มเดียว ซึ่งนับเป็น submit
 * คืน handle ของ Dialog.create เผื่อต้องต่อ .onDismiss()
 */
export const showDialog = (
  type: DialogType,
  title?: string,
  content?: string,
  buttons?: IDialogButton[],
  submit?: () => void,
  cancel?: () => void
): DialogHandle<void, void> =>
  Dialog.create<void, void>({
    component: DefaultModal,
    // ส่ง undefined ได้ Vue จะ fall back ไปใช้ default ของ prop นั้น
    componentProps: { type, title, content, buttons },
  })
    .onOk(() => submit?.())
    .onCancel(() => cancel?.())

/**
 * popup error ปุ่มเดียว — ไม่ส่ง title/content ก็ได้ DefaultModal มี copy default ให้
 *
 * const { title, message } = getErrorDisplay(e)
 * showDialogError(title, message)
 */
export const showDialogError = (
  title?: string,
  content?: string,
  submit?: () => void
): DialogHandle<void, void> => showDialog('cancel', title, content, undefined, submit)
