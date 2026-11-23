<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, type DialogType, type IDialogButton } from '@/components/modal/dialog'
import DefaultModal from '@/components/modal/DefaultModal.vue'
import { showErrorDialog } from '@/components/modal/errorDialog'
import Button from '@/components/ui/Button.vue'
import ExampleSheetDialog from './ExampleSheetDialog.vue'

interface PopupExample {
  label: string
  type: DialogType
  title: string
  content: string
  buttons: IDialogButton[]
}

const ONE_BUTTON: IDialogButton[] = [{ action: 'submit', text: 'ตกลง' }]
const TWO_BUTTONS: IDialogButton[] = [
  { action: 'cancel', text: 'ยกเลิก' },
  { action: 'submit', text: 'ยืนยัน' },
]

const EXAMPLES: PopupExample[] = [
  {
    label: 'Success',
    type: 'success',
    title: 'ทำรายการสำเร็จ',
    content: 'ระบบบันทึกข้อมูลของคุณเรียบร้อยแล้ว',
    buttons: ONE_BUTTON,
  },
  {
    label: 'Question (2 ปุ่ม)',
    type: 'question',
    title: 'ยืนยันการแลกรางวัล',
    content: 'คุณต้องการแลกรางวัลนี้ใช่หรือไม่',
    buttons: TWO_BUTTONS,
  },
  {
    label: 'Alert',
    type: 'alert',
    title: 'กรุณาตรวจสอบข้อมูล',
    content: 'ข้อมูลที่กรอกยังไม่ครบถ้วน',
    buttons: ONE_BUTTON,
  },
  {
    label: 'Error',
    type: 'error',
    title: '',
    content: '',
    buttons: ONE_BUTTON,
  },
  {
    label: 'ข้อความยาว',
    type: 'alert',
    title: 'เงื่อนไขการใช้งานของรางวัล',
    content:
      'ของรางวัลนี้ใช้ได้ภายใน 30 วันนับจากวันที่แลก ไม่สามารถเปลี่ยนเป็นเงินสดหรือโอนสิทธิ์ให้ผู้อื่นได้ และไม่สามารถใช้ร่วมกับโปรโมชันอื่นได้ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า',
    buttons: TWO_BUTTONS,
  },
  {
    label: 'ไม่มีหัวข้อ',
    type: 'success',
    title: '',
    content: 'ส่งข้อมูลเรียบร้อย',
    buttons: ONE_BUTTON,
  },
  {
    label: 'ปุ่ม async (loading)',
    type: 'question',
    title: 'กำลังบันทึก',
    content: 'กดยืนยันเพื่อจำลองการรอ 1.5 วินาที',
    buttons: [
      { action: 'cancel', text: 'ยกเลิก' },
      {
        action: 'submit',
        text: 'ยืนยัน',
        onClick: () => new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      },
    ],
  },
]

const lastResult = ref<string>('ยังไม่ได้เปิด popup')

function openSheet(): void {
  Dialog.create<{ reason: string }, string>({
    component: ExampleSheetDialog,
    componentProps: { options: ['ตัวเลือก A', 'ตัวเลือก B'] },
  })
    .onOk((choice) => {
      lastResult.value = `Bottom sheet: เลือก ${choice} (ok)`
    })
    .onCancel((payload) => {
      lastResult.value = `Bottom sheet: ปิด (${JSON.stringify(payload ?? {})})`
    })
}

function openApiError(): void {
  showErrorDialog({
    error: {
      code: 400,
      subcode: null,
      http_status: 400,
      system: 'Bad Request',
      message: 'ข้อความจาก backend เมื่อไม่มี locale',
      validate: null,
    },
  }).onDismiss((result) => {
    lastResult.value = `showErrorDialog: ปิด (${result})`
  })
}

function openPopup(example: PopupExample): void {
  Dialog.create({
    component: DefaultModal,
    componentProps: {
      type: example.type,
      title: example.title,
      content: example.content,
      buttons: example.buttons,
      // The error example leaves title/content empty to show the built-in error copy.
      ...(example.type === 'error' && !example.title ? { error: new Error('example') } : {}),
    },
  })
    .onOk(() => {
      lastResult.value = `${example.label}: กดปุ่มยืนยัน (ok)`
    })
    .onCancel(() => {
      lastResult.value = `${example.label}: กดยกเลิก (cancel)`
    })
}
</script>

<template>
  <div class="flex flex-col gap-6 px-5 pb-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">DefaultModal</h2>

      <div class="flex flex-wrap gap-3">
        <Button
          v-for="example in EXAMPLES"
          :key="example.label"
          size="md"
          :label="example.label"
          @click="openPopup(example)"
        />
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Component ของตัวเอง / errorDialog</h2>

      <div class="flex flex-wrap gap-3">
        <Button size="md" variant="outline" label="Bottom sheet" @click="openSheet" />
        <Button size="md" variant="outline" label="API error" @click="openApiError" />
      </div>

      <p class="text-14 font-light text-content-subtle">ผลล่าสุด: {{ lastResult }}</p>
    </section>
  </div>
</template>
