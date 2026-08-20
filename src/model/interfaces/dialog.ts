/** ชนิดของ dialog — คุมสี/ไอคอนหัว popup ของ DefaultModal.vue */
export type DialogType = 'success' | 'question' | 'alert' | 'cancel'

/** 'submit' -> onOk(), 'cancel' -> onCancel() */
export type DialogButtonAction = 'submit' | 'cancel'

export interface IDialogButton {
  action: DialogButtonAction
  text: string
}
