<template>
  <div class="container">
    <div>Dialog Demo (Dialog.create)</div>

    <div class="mt-6 flex flex-wrap gap-3">
      <Button @click="handleOpenConfirm">ยืนยัน</Button>
      <Button @click="handleOpenSuccess">สำเร็จ</Button>
      <Button
        variant="secondary"
        @click="handleOpenAlert"
      >
        เตือน
      </Button>
      <Button
        variant="secondary"
        @click="handleOpenError"
      >
        ผิดพลาด
      </Button>
      <Button
        variant="secondary"
        @click="handleOpenCoupon"
        :disabled="!!getRawResult"
      >
        คูปองนับถอยหลัง
      </Button>
    </div>
    <div
      v-if="dialogResult"
      class="mt-3 text-14 text-gray-600"
    >
      ผลล่าสุด: {{ dialogResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import ExampleCouponModal from '../_components/ExampleCouponModal.vue'

  const dialogResult = ref('')
  const getRawResult = ref<string>()

  const couponDataList = ref({
    code: 'testtt',
    exp: 5,
  })

  const callGetRaw = async () => {
    try {
      const shows = await apiRaw<{ yearsAired: string }[]>({
        method: 'GET',
        url: 'https://api.sampleapis.com/futurama/info',
      })

      getRawResult.value = shows[0].yearsAired
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      showDialogError(title, message)
    }
  }

  // 2 ปุ่ม: 'submit' -> submit callback, 'cancel' -> cancel callback
  const handleOpenConfirm = () => {
    showDialog(
      'question',
      'ยืนยันการทำรายการ',
      'ต้องการบันทึกข้อมูลนี้หรือไม่',
      [
        { action: 'cancel', text: 'ยกเลิก' },
        { action: 'submit', text: 'ยืนยัน' },
      ],
      () => {
        dialogResult.value = 'กดยืนยัน (submit)'
      },
      () => {
        dialogResult.value = 'กดยกเลิก (cancel)'
      }
    )
  }

  const handleOpenSuccess = () => {
    showDialog(
      'success',
      'บันทึกข้อมูลสำเร็จ',
      'ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว',
      [{ action: 'submit', text: 'ปิด' }],
      () => {
        dialogResult.value = 'ปิด popup สำเร็จ (submit)'
      }
    )
  }

  // content ผ่าน v-dompurify-html — ใส่ <br> ได้
  const handleOpenAlert = () => {
    showDialog('alert', 'สิทธิ์ใกล้หมดอายุ', 'สิทธิ์ของคุณจะหมดอายุ<br />ในวันที่ 31 ธ.ค. 2568')
  }

  // ไม่ส่ง title/content ก็ได้ — มี copy default ให้
  const handleOpenError = () => {
    showDialogError()
  }

  // componentProps ส่ง "ค่า" ไม่ใช่ ref — props ไม่ถูก unwrap ให้ (couponDataList.value ไม่ใช่ couponDataList)
  // generic ตัวแรกของ Dialog.create คือ payload ของ onCancel (TCancel มาก่อน TOk เพราะเจอบ่อยกว่า)
  // ใส่แค่ตัวเดียวก็พอสำหรับเคสนี้ — onOk ไม่ต้องรู้ payload เพราะข้อมูลอยู่ในหน้านี้แล้ว
  const handleOpenCoupon = () => {
    Dialog.create<{ reason: 'expired' | 'close' }>({
      component: ExampleCouponModal,
      componentProps: { couponDataList: couponDataList.value },
    })
      .onOk(payload => {
        console.log(payload)
        // เปิด dialog ต่อจาก onOk ได้เลย — ตัวเก่าถูกถอดออกจาก stack หลัง transition ปิดจบ
        showDialog('alert', 'สิทธิ์ใกล้หมดอายุ', `ใช้โค้ด ${couponDataList.value.code}`)
      })
      // ใช้ onCancel + reason ไม่ใช่ onDismiss เพราะ onDismiss ยิงทุกทางปิด (รวมกด 'ใช้โค้ดนี้')
      // payload เป็น optional เสมอ (ปิดโดยไม่ส่ง payload ก็ได้) เลยต้อง ?.
      .onCancel(payload => {
        console.log(payload)

        if (payload?.reason === 'expired') {
          callGetRaw()
        } else if (payload?.reason === 'close') {
          dialogResult.value = 'กดปิด (onCancel + reason: close)'
        }
      })
  }
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example'
    title: 'Dialog Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
