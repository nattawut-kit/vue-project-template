<script setup lang="ts">
import { ref } from 'vue'
import TextField from '@/components/input/TextField.vue'
import Svg from '@/components/ui/Svg.vue'

// The review page for TextField, one example per prop (see pages/examples/).
const textDefault = ref<string>('')
const textFilled = ref<string>('สมชาย ใจดี')
const textFloat = ref<string>('')
const textHelper = ref<string>('')
const textRequired = ref<string>('')
const textRule = ref<string>('abc')
const textClearable = ref<string>('พิมพ์แล้วกดล้างได้')
const textPhone = ref<string>('')
const textPassword = ref<string>('')
const textPrice = ref<string>('')
const textEmailIcon = ref<string>('')
const textDisabled = ref<string>('แก้ไขไม่ได้')
const textReadonly = ref<string>('อ่านอย่างเดียว')
const textOutlined = ref<string>('')
const textBorderless = ref<string>('')

const EMAIL_RULE = [
  { validator: (v: string) => /^\S+@\S+\.\S+$/.test(v), message: 'รูปแบบอีเมลไม่ถูกต้อง' },
]
</script>

<template>
  <div class="flex flex-col gap-8 px-5 pb-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">TextField</h2>

      <TextField v-model="textDefault" label="ชื่อ" placeholder="กรอกชื่อ" />
      <TextField v-model="textFilled" label="มีค่าอยู่แล้ว" />
      <TextField v-model="textFloat" label="Floating label" float-label />
      <TextField
        v-model="textHelper"
        label="มีข้อความช่วย"
        placeholder="เช่น ชื่อตามบัตรประชาชน"
        helper-text="ข้อความช่วยใต้ช่องกรอก"
      />
      <TextField
        v-model="textRequired"
        label="จำเป็นต้องกรอก"
        required
        required-message="กรุณากรอกข้อมูล"
      />
      <TextField
        v-model="textRule"
        label="Error จาก rule (อีเมล)"
        type="email"
        :rules="EMAIL_RULE"
      />
      <TextField v-model="textClearable" label="Clearable" clearable />
      <TextField
        v-model="textPhone"
        label="เบอร์โทรศัพท์ (mask)"
        type="tel"
        mask="###-###-####"
        placeholder="000-000-0000"
      />
      <TextField v-model="textPassword" label="รหัสผ่าน" type="password" />
      <TextField v-model="textPrice" label="Prefix / Suffix" prefix="฿" suffix="บาท" />
      <TextField
        v-model="textEmailIcon"
        label="Start icon (อีเมล)"
        type="email"
        placeholder="name@example.com"
        :rules="EMAIL_RULE"
      >
        <template #start-icon>
          <Svg src="common/mail" class="size-5" color="currentColor" />
        </template>
      </TextField>
      <TextField v-model="textDisabled" label="Disabled" disabled />
      <TextField v-model="textReadonly" label="Readonly" readonly />
      <TextField v-model="textOutlined" label="Outlined" outlined />
      <TextField v-model="textBorderless" label="Borderless" borderless />
    </section>
  </div>
</template>
