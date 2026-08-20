/**
 * Dialog engine — เปิด modal จากที่ไหนก็ได้ โดยไม่ต้องวาง component ไว้ในทุกหน้า
 *
 * Dialog.create() แค่ push component เข้า stack แล้ว <DialogHost /> (mount ครั้งเดียวใน App.vue)
 * เป็นคนเรนเดอร์ ตัว component ที่ถูกส่งเข้ามาคุยกลับด้วย emit 'ok'/'cancel' ผ่าน useDialogComponent()
 *
 * Dialog.create({
 *   component: DefaultModal,
 *   componentProps: { type: 'question', title: '...', content: '...', buttons: [...] },
 * })
 *   .onOk(payload => {})
 *   .onCancel(payload => {})
 *   .onDismiss((result, payload) => {})
 *
 * ปิดเองจากข้างใน modal (นับเวลาถอยหลังหมด ฯลฯ) ก็เรียก onDialogOk()/onDialogCancel() ได้เลย
 * ไม่ต้องรอให้ผู้ใช้กดปุ่ม — แนบ payload บอกสาเหตุไปให้ call site แยกเคสได้
 */

import DefaultModal from '@/components/modal/DefaultModal.vue'

export type DialogResult = 'ok' | 'cancel'

export type DialogOkCallback<TOk = unknown> = (payload?: TOk) => void

export type DialogCancelCallback<TCancel = unknown> = (payload?: TCancel) => void

/** ยิงทุกครั้งที่ dialog ปิด ไม่ว่าจะ ok หรือ cancel — ใช้เก็บกวาดของที่ต้องทำแน่ ๆ */
export type DialogDismissCallback<TCancel = unknown, TOk = unknown> = (
  result: DialogResult,
  payload?: TCancel | TOk
) => void

export interface DialogCreateOptions {
  /** component ของ dialog — ต้องเรียก useDialogComponent() ข้างใน (ดู DefaultModal.vue) */
  component: Component
  /** props ที่ส่งต่อให้ component ตรง ๆ */
  componentProps?: Record<string, unknown>
}

/**
 * ตัวที่ Dialog.create() คืนมา — ต่อ .onOk()/.onCancel()/.onDismiss() ได้เรื่อย ๆ
 *
 * generic เป็นชนิดของ payload ที่ modal ตัวนั้นส่งกลับมา ไม่ใส่ก็ได้ (unknown แล้วไป narrow เอง)
 * TCancel มาก่อน TOk เพราะ onCancel ต้องรู้สาเหตุบ่อยกว่า onOk เลยใส่ generic ตัวเดียวจบได้:
 * Dialog.create<{ reason: 'expired' | 'close' }>({ ... })
 * ถ้าต้องระบุทั้งคู่: Dialog.create<{ reason: 'expired' | 'close' }, { code: string }>({ ... })
 */
export interface DialogHandle<TCancel = unknown, TOk = unknown> {
  onOk: (callback: DialogOkCallback<TOk>) => DialogHandle<TCancel, TOk>
  onCancel: (callback: DialogCancelCallback<TCancel>) => DialogHandle<TCancel, TOk>
  onDismiss: (callback: DialogDismissCallback<TCancel, TOk>) => DialogHandle<TCancel, TOk>
}

export interface DialogInstance {
  id: number
  component: Component
  componentProps: Record<string, unknown>
  /** ปิด dialog: ยิง callback ที่ลงทะเบียนไว้ แล้วถอดตัวเองออกจาก stack */
  close: (result: DialogResult, payload?: unknown) => void
}

// transition ตอนปิดของ BaseModal.vue คือ 0.2s — เผื่ออีกหน่อยให้ animation จบก่อนถอด dialog ออกจาก stack
const LEAVE_DURATION = 250

// shallowRef กัน Vue ไป proxy ตัว component definition ที่เก็บอยู่ข้างใน
// (เลยต้อง assign array ใหม่ทุกครั้งที่เพิ่ม/ลบ ไม่ใช้ push/splice)
export const activeDialogs = shallowRef<DialogInstance[]>([])

let lastDialogId = 0

export const Dialog = {
  create: <TCancel = unknown, TOk = unknown>({
    component,
    componentProps = {},
  }: DialogCreateOptions): DialogHandle<TCancel, TOk> => {
    const id = ++lastDialogId
    const okCallbacks: DialogOkCallback<TOk>[] = []
    const cancelCallbacks: DialogCancelCallback<TCancel>[] = []
    const dismissCallbacks: DialogDismissCallback<TCancel, TOk>[] = []

    const instance: DialogInstance = {
      id,
      component,
      componentProps,
      close: (result, payload) => {
        // engine ไม่รู้ชนิด payload — ชนิดจริงมาจาก generic ที่ call site ประกาศไว้
        if (result === 'ok') {
          okCallbacks.forEach(callback => callback(payload as TOk))
        } else {
          cancelCallbacks.forEach(callback => callback(payload as TCancel))
        }

        dismissCallbacks.forEach(callback => callback(result, payload as TCancel | TOk))

        setTimeout(() => {
          activeDialogs.value = activeDialogs.value.filter(dialog => dialog.id !== id)
        }, LEAVE_DURATION)
      },
    }

    activeDialogs.value = [...activeDialogs.value, instance]

    // callback ลงทะเบียนหลัง create ได้ เพราะ dialog เพิ่งขึ้น — ยังไม่มีทางถูกปิดใน tick นี้
    const handle: DialogHandle<TCancel, TOk> = {
      onOk: callback => {
        okCallbacks.push(callback)

        return handle
      },
      onCancel: callback => {
        cancelCallbacks.push(callback)

        return handle
      },
      onDismiss: callback => {
        dismissCallbacks.push(callback)

        return handle
      },
    }

    return handle
  },
}

/**
 * ทิ้ง dialog ที่ค้างอยู่ทั้งหมดทันที โดย "ไม่" ยิง onOk/onCancel/onDismiss
 * ถือเป็นการรื้อของ ไม่ใช่ผลลัพธ์จากผู้ใช้ — DialogHost.vue เรียกตอนเปลี่ยนหน้า
 */
export const closeAllDialogs = () => {
  activeDialogs.value = []
}

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
