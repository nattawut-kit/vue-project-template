<template>
  <div class="mt-4 flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-3 text-18">
    <div>
      <div class="mb-2 font-bold">Props</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="w-28 py-1 pr-2 font-bold">prop</th>
              <th class="w-40 py-1 pr-2 font-bold">type</th>
              <th class="w-16 py-1 pr-2 font-bold">default</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in propsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 font-bold wrap-break-word text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 wrap-break-word text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 pr-2 wrap-break-word text-gray-500">{{ row.default }}</td>
              <td class="py-1.5 leading-relaxed font-medium text-gray-900">
                {{ row.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">Events</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">event</th>
              <th class="py-1 pr-2 font-bold">payload</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in eventsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.payload }}</td>
              <td class="py-1.5 leading-relaxed font-medium text-gray-900">
                {{ row.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">defineExpose</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">method</th>
              <th class="w-40 py-1 pr-2 font-bold">type</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in exposedTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 wrap-break-word text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed font-medium text-gray-900">
                {{ row.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">ตัวอย่างการเขียนแต่ละ prop</div>
      <div class="flex flex-col gap-3">
        <div
          v-for="example in examples"
          :key="example.title"
        >
          <div class="mb-1 text-16 font-bold text-gray-500">{{ example.title }}</div>
          <pre
            class="overflow-x-auto rounded-md bg-gray-900 p-2 text-[10px] leading-relaxed text-white"
            >{{ example.code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface DocRow {
    name: string
    type: string
    default?: string
    payload?: string
    description: string
  }

  const propsTable: DocRow[] = [
    {
      name: 'v-model',
      type: 'string',
      default: "''",
      description: 'ค่า OTP ที่กรอกอยู่ (เฉพาะตัวเลข ยกเว้นเปิด allowString)',
    },
    {
      name: 'digitCount',
      type: 'number',
      default: '6',
      description: 'จำนวนช่องกรอก',
    },
    {
      name: 'allowString',
      type: 'boolean',
      default: 'false',
      description: 'false = กรองเหลือแต่ตัวเลข, true = รับตัวอักษร/สัญลักษณ์ได้ด้วย',
    },
    {
      name: 'forceFormat',
      type: "'uppercase' | 'lowercase'",
      default: 'undefined',
      description: 'บังคับรูปแบบตัวอักษรที่แสดงและค่าที่ยิงออกไป',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description: 'ปิดการพิมพ์ (ช่องยังโฟกัสได้ แต่แก้ค่าไม่ได้)',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description:
        'ทำให้ช่องที่กรอกแล้วเป็นสีแดง — ลบตัวใดตัวหนึ่งจะเคลียร์ค่าและสถานะนี้ทันที (ดู clear-invalid)',
    },
    {
      name: 'invalidMessage',
      type: 'string',
      default: "''",
      description:
        'ข้อความใต้ช่อง ตอน invalid = true (component นี้ไม่มีข้อความในตัวเอง ต้องส่งเข้ามาเอง)',
    },
    {
      name: 'expired',
      type: 'boolean',
      default: 'false',
      description: 'โชว์ expiredMessage แทน invalidMessage แม้ invalid ยังเป็น true อยู่',
    },
    {
      name: 'expiredMessage',
      type: 'string',
      default: "''",
      description: 'ข้อความใต้ช่อง ตอน expired = true',
    },
    {
      name: 'messageClass',
      type: 'string',
      default: "''",
      description:
        'ต่อท้าย/override class เดิม (mt-2 w-full text-center text-14 font-normal text-error-1) ของข้อความ invalid/expired',
    },
    {
      name: 'boxSize',
      type: 'number',
      default: '48',
      description: 'ขนาดกล่อง (px) — ใช้ค่าเดียวกันคำนวณตำแหน่ง caret ของ input ที่ซ่อนอยู่ด้วย',
    },
    {
      name: 'boxGap',
      type: 'number',
      default: '5',
      description: 'ระยะห่างระหว่างกล่อง (px)',
    },
    {
      name: 'fontSize',
      type: 'number',
      default: '24',
      description: 'ขนาดตัวเลขในกล่อง (px)',
    },
    {
      name: 'shape',
      type: "'square' | 'circle' | 'underline'",
      default: "'square'",
      description:
        'รูปทรงกล่อง คุมลักษณะ border (รอบด้าน/ล่างด้านเดียว) — มุมกลมคุมแยกด้วย rounded',
    },
    {
      name: 'rounded',
      type: "'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string",
      default: 'undefined',
      description:
        "มุมกล่อง ไม่ส่งมา = ใช้ default ของ shape (square = lg, circle = full, underline = none), ใส่ค่าอื่นได้ เช่น '12px'",
    },
    {
      name: 'borderColor',
      type: 'string',
      default: 'undefined',
      description: 'สีขอบกล่องตอนว่าง — ไม่ส่งมา = ใช้ --color-gray-200',
    },
    {
      name: 'dotColor',
      type: 'string',
      default: 'undefined',
      description: 'สีจุดตอนช่องว่าง — ไม่ส่งมา = ใช้ --color-gray-300',
    },
    {
      name: 'gradientStart / gradientEnd',
      type: 'string',
      default: 'undefined',
      description: 'สี gradient ของขอบ/ตัวเลขตอนกรอกครบ — ไม่ส่งมา = ใช้ --color-gray-900 (สีดำ)',
    },
    {
      name: 'emptyChar',
      type: 'string',
      default: "'•'",
      description: 'ตัวอักษรที่แสดงตอนช่องว่าง',
    },
    {
      name: 'emptyCharFontSize',
      type: 'number',
      default: 'undefined',
      description:
        'ขนาดตัวอักษรตอนช่องว่าง (px) แยกจาก fontSize — ไม่ส่งมา = ใช้ fontSize เดียวกัน',
    },
    {
      name: 'animate',
      type: 'boolean',
      default: 'true',
      description: 'เปิด/ปิด animation เด้งตอนกรอกตัวเลข',
    },
    {
      name: 'focusIndicator',
      type: 'boolean',
      default: 'false',
      description:
        'แสดงกรอบไฮไลต์สี main-1 ที่ช่องซึ่งกำลังจะรับตัวเลขถัดไป ตอน input ที่ซ่อนอยู่ได้ focus (เช่น ผู้ใช้กดที่กล่องเพื่อพิมพ์)',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'true',
      description:
        'focus input ที่ซ่อนอยู่อัตโนมัติตอน mount — ปิดถ้าหน้ามีหลาย OtpInput พร้อมกันแล้วไม่อยากให้ตัวใดตัวหนึ่งแย่ง focus ตอนโหลดหน้า',
    },
  ]

  const eventsTable: DocRow[] = [
    { name: 'update:modelValue', payload: '[value: string]', type: '', description: 'v-model' },
    {
      name: 'input',
      payload: '[]',
      type: '',
      description: 'ยิงทุกครั้งที่ความยาวค่าเพิ่มขึ้น หรือตอนวาง',
    },
    { name: 'enter', payload: '[]', type: '', description: 'ยิงตอนกด Enter และกรอกครบทุกช่องแล้ว' },
    { name: 'focus', payload: '[]', type: '', description: 'ยิงตอน input ซ่อนได้โฟกัส' },
    { name: 'blur', payload: '[]', type: '', description: 'ยิงตอน input ซ่อนเสีย focus' },
    {
      name: 'clear-invalid',
      payload: '[]',
      type: '',
      description: 'ยิงตอนลบตัวเลขขณะ invalid = true (ก่อนช่องถูกเคลียร์ทั้งหมด)',
    },
  ]

  const exposedTable: DocRow[] = [
    {
      name: 'reset()',
      type: '() => void',
      description: 'เคลียร์ทุกช่องและ v-model กลับเป็นค่าว่าง',
    },
    { name: 'focus()', type: '() => void', description: 'โฟกัสช่องแรก' },
  ]

  const examples = [
    {
      title: 'basic',
      code: `<OtpInput v-model="otp" />`,
    },
    {
      title: 'digitCount + allowString + forceFormat',
      code: `<OtpInput v-model="otp" :digit-count="4" allow-string force-format="uppercase" />`,
    },
    {
      title: 'invalid / expired (ข้อความมาจาก caller)',
      code: `<OtpInput
  v-model="otp"
  :invalid="hasError"
  invalid-message="รหัส OTP ไม่ถูกต้อง"
  :expired="isExpired"
  expired-message="รหัส OTP หมดอายุแล้ว"
  @clear-invalid="hasError = false"
/>`,
    },
    {
      title: 'reset() ผ่าน template ref',
      code: `<OtpInput ref="otpRef" v-model="otp" />
<Button label="Reset" @click="otpRef?.reset()" />`,
    },
    {
      title: 'messageClass (custom style ข้อความ invalid/expired)',
      code: `<OtpInput
  v-model="otp"
  :invalid="hasError"
  invalid-message="รหัส OTP ไม่ถูกต้อง"
  message-class="text-left text-16 text-red-600"
/>`,
    },
    {
      title: 'boxSize + boxGap + fontSize + shape (ปรับขนาด/รูปทรง)',
      code: `<OtpInput v-model="otp" :box-size="40" :box-gap="8" :font-size="20" shape="circle" />`,
    },
    {
      title: 'rounded (มุมกล่อง แยกอิสระจาก shape)',
      code: `<OtpInput v-model="otp" rounded="none" />
<OtpInput v-model="otp" shape="circle" rounded="lg" />
<OtpInput v-model="otp" rounded="12px" />`,
    },
    {
      title: 'borderColor + dotColor + gradientStart/End (ปรับสีแบบ per-instance)',
      code: `<OtpInput
  v-model="otp"
  border-color="#8b5cf6"
  dot-color="#c4b5fd"
  gradient-start="#8b5cf6"
  gradient-end="#3b82f6"
/>`,
    },
    {
      title: 'emptyChar + animate (ตัวอักษรตอนว่าง / ปิด animation)',
      code: `<OtpInput v-model="otp" empty-char="_" :animate="false" />`,
    },
    {
      title: 'emptyCharFontSize (แยกขนาดตัวอักษรตอนว่างจากตัวเลข)',
      code: `<OtpInput v-model="otp" empty-char="●" :empty-char-font-size="12" />`,
    },
    {
      title: 'focusIndicator (ไฮไลต์ช่องที่กำลังจะพิมพ์ตอน focus)',
      code: `<OtpInput v-model="otp" focus-indicator />`,
    },
    {
      title: 'autoFocus (ปิด auto-focus ตอน mount)',
      code: `<OtpInput v-model="otp" :auto-focus="false" />`,
    },
  ]
</script>
