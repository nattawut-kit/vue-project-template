<template>
  <div class="container">
    <div>Exmaple Page</div>

    <div class="mt-6 flex flex-col gap-2">
      <div class="text-12 font-light">text-12 / font-light — สวัสดีครับ</div>
      <div class="text-14 font-regular">text-14 / font-regular — สวัสดีครับ</div>
      <div class="text-16 font-regular">text-16 / font-regular — สวัสดีครับ</div>
      <div class="text-18 font-regular">text-18 / font-regular — สวัสดีครับ</div>
      <div class="text-20 font-bold">text-20 / font-bold — สวัสดีครับ</div>
      <div class="text-24 font-bold">text-24 / font-bold — สวัสดีครับ</div>
      <div class="text-28 font-bold">text-28 / font-bold — สวัสดีครับ</div>
    </div>

    <div class="mt-8 flex flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">Button</div>
        <div class="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">Input</div>
        <div class="flex max-w-xs flex-col gap-3">
          <Input
            v-model="exampleValue"
            placeholder="ปกติ"
          />
          <Input
            v-model="exampleErrorValue"
            placeholder="error state"
            error
          />
          <Input
            placeholder="disabled"
            disabled
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">Modal (useDialog)</div>
        <Button @click="handleOpenDialog">เปิด Dialog</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const exampleValue = ref('')
  const exampleErrorValue = ref('')

  const handleOpenDialog = async () => {
    const confirmed = await useDialog().confirm({
      title: 'ตัวอย่าง Dialog',
      message: 'นี่คือตัวอย่างการเรียกใช้ useDialog().confirm() จากหน้าไหนก็ได้',
    })
    console.log('dialog result:', confirmed)
  }
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  # is_auth_route: true
  layout: default
  navtop:
    back_to: '/home'
    title: 'Exmaple Page'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
