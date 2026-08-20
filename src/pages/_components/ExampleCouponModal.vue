<!-- ตัวอย่าง custom modal ที่ต่อจาก BaseModal และ "ปิดตัวเอง" เมื่อนับเวลาถอยหลังหมด
     ไม่ต้องมี API เพิ่มจาก engine — แค่เรียก onDialogCancel() พร้อมบอกสาเหตุไปใน payload -->
<template>
  <BaseModal
    v-model="visible"
    :close-on-backdrop="false"
    :close-on-esc="false"
  >
    <div class="flex flex-col items-center px-4 py-6">
      <div class="text-20 font-bold text-gray-900">โค้ดส่วนลดของคุณ</div>

      <div
        class="mt-3 w-full rounded-xl border border-dashed border-main-1 py-4 text-center text-24 font-bold text-main-1"
      >
        {{ couponDataList.code }}
      </div>

      <div class="mt-3 text-gray-600">
        โค้ดจะหมดอายุใน
        <span class="font-bold text-main-1">{{ remainingDisplay }}</span>
      </div>

      <div class="mt-5 flex w-full gap-2.5">
        <Button
          class="w-full"
          variant="secondary"
          @click="onDialogCancel({ reason: 'close' })"
        >
          ปิด
        </Button>
        <Button
          class="w-full"
          @click="onDialogOk({ reason: 'used' })"
        >
          ใช้โค้ดนี้
        </Button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  interface ICouponData {
    code: string
    exp: number
  }

  interface Props {
    couponDataList: ICouponData
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    ok: [payload?: unknown]
    cancel: [payload?: unknown]
  }>()

  const { visible, onDialogOk, onDialogCancel } = useDialogComponent(emit)

  const remaining = ref(props.couponDataList.exp)

  const remainingDisplay = computed(() => {
    const minutes = Math.floor(remaining.value / 60)
    const seconds = remaining.value % 60

    return `${minutes}:${String(seconds).padStart(2, '0')}`
  })

  const timer = setInterval(() => {
    remaining.value -= 1

    if (remaining.value > 0) return

    clearInterval(timer)
    onDialogCancel({ reason: 'expired' })
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
</script>
