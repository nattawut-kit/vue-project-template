<template>
  <div class="mt-4 flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-3 text-18">
    <div>
      <div class="mb-2 font-bold">Props</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">prop</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 pr-2 font-bold">default</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in propsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.default }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">customStyle (field ย่อยใน object)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">field</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in customStyleTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">Slots</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">slot</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in slotsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
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
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">defineExpose (เรียกผ่าน template ref)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">member</th>
              <th class="py-1 pr-2 font-bold">type</th>
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
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
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
          <button
            type="button"
            class="mb-1 flex items-center gap-1 text-16 font-bold text-gray-500 hover:text-main-1"
            @click="scrollToDemo(example.target)"
          >
            {{ example.title }}
            <Svg
              src="common/arrow-right"
              class="size-3 rotate-90"
            />
          </button>
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
      type: 'string | number',
      default: '-',
      description: 'ค่าปัจจุบันของ input (จำเป็นต้องใส่)',
    },
    { name: 'label', type: 'string', default: "''", description: 'ข้อความ label ของ field' },
    {
      name: 'floatLabel',
      type: 'boolean',
      default: 'false',
      description:
        'false = label อยู่นิ่งด้านบนเสมอ (ไม่ลอย), true = label ลอยซ้อนเป็น placeholder ตอนว่าง แล้วลอยขึ้นเป็นตัวอักษรเล็กตอน focus/มีค่า',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description:
        'ข้อความ placeholder — ตอน floatLabel=true จะซ่อนไว้จนกว่าจะ focus เพราะ label ทำหน้าที่ placeholder แทนอยู่แล้ว',
    },
    {
      name: 'helperText',
      type: 'string',
      default: "''",
      description: 'ข้อความช่วยเหลือใต้ input แสดงเมื่อไม่มี error',
    },
    {
      name: 'type',
      type: "'text' | 'email' | 'number' | 'tel' | 'password' | 'currency'",
      default: "'text'",
      description:
        'ชนิด input พร้อม format ให้อัตโนมัติ — number/tel กรองเฉพาะตัวเลข, currency ใส่ comma คั่นหลักพันให้',
    },
    {
      name: 'rules',
      type: 'IValidationRule[]',
      default: '[]',
      description: 'validator ตรวจตอน blur เรียงตามลำดับ หยุดที่ตัวแรกที่ไม่ผ่านแล้วขึ้น error',
    },
    {
      name: 'maxLength',
      type: 'number',
      default: 'undefined',
      description: 'จำกัดจำนวนตัวอักษรสูงสุด',
    },
    {
      name: 'formatFunc',
      type: '(value: string) => string',
      default: '(v) => v',
      description: 'แปลงค่าที่พิมพ์ก่อนเซ็ตลง v-model (เช่นแปลงเป็นตัวพิมพ์ใหญ่)',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'ปิดการใช้งาน field ทั้งหมด',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description: 'อ่านได้อย่างเดียว แก้ไขไม่ได้ แต่ยัง focus/copy ได้',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: 'ตรวจตอน blur ว่ามีค่าหรือไม่ ถ้าไม่มีขึ้น error "กรุณากรอก{label}"',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description: 'แสดงปุ่ม x ลบค่าทั้งหมดเมื่อมีค่าอยู่ (ซ่อนไปถ้ามี end-icon slot อยู่แล้ว)',
    },
    {
      name: 'prefix',
      type: 'string',
      default: "''",
      description: 'ข้อความคงที่ชิดขอบซ้าย เช่น "$" — ใส่คู่กับ start-icon slot ได้เลย',
    },
    {
      name: 'suffix',
      type: 'string',
      default: "''",
      description: 'ข้อความคงที่ชิดขอบขวา เช่น "บาท" — ใส่คู่กับ end-icon slot ได้เลย',
    },
    {
      name: 'mask',
      type: 'string',
      default: "''",
      description:
        "รูปแบบ mask แบบ QInput ของ Quasar: '#' ตัวเลข, 'S' ตัวอักษร, 'N' ตัวอักษร+ตัวเลข, 'A'/'a' ตัวอักษรบังคับพิมพ์ใหญ่/เล็ก, 'X'/'x' ตัวอักษร+ตัวเลขบังคับพิมพ์ใหญ่/เล็ก ตัวอื่นเป็นตัวคั่นคงที่",
    },
    {
      name: 'fillMask',
      type: 'boolean | string',
      default: 'false',
      description:
        "เติมตำแหน่งที่ยังไม่ถึงด้วยอักขระ fill (default '_') ให้เห็นรูปแบบเต็มตั้งแต่ยังไม่พิมพ์",
    },
    {
      name: 'reverseFillMask',
      type: 'boolean',
      default: 'false',
      description:
        'เติม fillMask จากขวาไปซ้าย ใช้คู่กับ fillMask เหมาะกับตัวเลขที่พิมพ์ไล่จากหลักท้าย',
    },
    {
      name: 'unmaskedValue',
      type: 'boolean',
      default: 'false',
      description: 'true = v-model เป็นเนื้อหาล้วนไม่มีตัวคั่นของ mask',
    },
    {
      name: 'customStyle',
      type: 'object',
      default: '{}',
      description:
        'ปรับสี/ความมนของขอบแบบ custom ผ่าน object เดียว (ดูตารางด้านล่าง) — ไม่มีผลตอน disabled/error',
    },
    {
      name: 'outlined',
      type: 'boolean',
      default: 'false',
      description: 'พื้นหลังโปร่งใส — ไม่มีผลตอน disabled/error',
    },
    {
      name: 'borderless',
      type: 'boolean',
      default: 'false',
      description: 'ไม่มีกรอบและไม่มีพื้นหลังเลย — ไม่มีผลตอน disabled/error',
    },
  ]

  const customStyleTable: DocRow[] = [
    {
      name: 'rounded',
      type: "'none'|'sm'|'md'|'lg'|'full' | string | { tl?, tr?, br?, bl? }",
      description:
        "ความมนของขอบ — ไม่ใส่ = rounded-lg เดิม ใส่ CSS value ดิบเองก็ได้ (เช่น '12px') หรือใส่ object คุมทีละมุมได้ มุมที่ไม่ระบุจะเป็น 'none'",
    },
    {
      name: 'bgColor',
      type: 'string',
      description: 'สีพื้นหลัง ใส่ CSS color ใดๆ ก็ได้ (hex/rgb/ชื่อสี)',
    },
    {
      name: 'labelColor',
      type: 'string',
      description: 'สีตัวอักษร label ทั้งแบบ stack และแบบ float',
    },
    { name: 'textColor', type: 'string', description: 'สีตัวอักษรที่พิมพ์ใน input' },
    { name: 'borderColor', type: 'string', description: 'สีกรอบตอนปกติ/hover' },
    {
      name: 'focusColor',
      type: 'string',
      description: 'สีกรอบตอน focus — ไม่ใส่จะใช้ borderColor ต่อถ้ามี',
    },
  ]

  const slotsTable: DocRow[] = [
    {
      name: 'start-icon',
      type: '',
      description: 'icon ฝั่งซ้าย ใส่คู่กับ prefix ได้ (icon อยู่ริมขอบ ข้อความอยู่ถัดเข้ามา)',
    },
    {
      name: 'start-icon-error',
      type: '',
      description: 'แทน start-icon ตอน error — ถ้าไม่ใส่จะใช้ start-icon เดิมต่อ',
    },
    {
      name: 'end-icon',
      type: '',
      description: 'icon ฝั่งขวา มีสิทธิ์เหนือปุ่ม clear ถ้าใส่มาด้วยกัน',
    },
    {
      name: 'end-icon-error',
      type: '',
      description: 'แทน end-icon ตอน error — ถ้าไม่ใส่จะใช้ end-icon เดิมต่อ',
    },
  ]

  const eventsTable: DocRow[] = [
    {
      name: 'error',
      payload: '{ hasError: boolean; message: string }',
      description: 'ยิงทุกครั้งที่สถานะ error เปลี่ยน (ทั้งตอนพิมพ์และตอน validate)',
      type: '',
    },
    {
      name: 'blur',
      payload: 'FocusEvent',
      description: 'ยิงหลัง validate() ทำงานเสร็จตอน blur',
      type: '',
    },
  ]

  const exposedTable: DocRow[] = [
    { name: 'hasError', type: 'boolean', description: 'มี error อยู่ตอนนี้ไหม' },
    { name: 'errorMessage', type: 'string', description: 'ข้อความ error ปัจจุบัน' },
    {
      name: 'validate()',
      type: '() => void',
      description: 'สั่งตรวจสอบค่าด้วยตนเอง (ปกติ component เรียกให้อัตโนมัติตอน blur อยู่แล้ว)',
    },
  ]

  interface ExampleRow {
    title: string
    code: string
    // id ของ section demo จริงในหน้านี้ที่คลิกแล้วจะ scroll ไปให้ — ต้องตรงกับ id ที่ตั้งไว้บน wrapper div ของแต่ละ section ใน input-title.vue/input-label.vue (ทั้งสองไฟล์ใช้ id เดียวกันเพื่อให้ component นี้ใช้ร่วมกันได้)
    target: string
  }

  const examples: ExampleRow[] = [
    {
      title: 'label + v-model (พื้นฐาน)',
      target: 'demo-basic',
      code: `<TextField
  v-model="value"
  label="ชื่อ-นามสกุล"
/>`,
    },
    {
      title: 'floatLabel',
      target: 'demo-basic',
      code: `<TextField
  v-model="value"
  label="อีเมล"
  float-label
/>`,
    },
    {
      title: 'placeholder',
      target: 'demo-basic',
      code: `<TextField
  v-model="value"
  label="ชื่อ"
  placeholder="กรอกชื่อ-นามสกุล"
/>`,
    },
    {
      title: 'helperText',
      target: 'demo-helper-text',
      code: `<TextField
  v-model="value"
  label="ชื่อผู้ใช้"
  helper-text="ใช้ตัวอักษรและตัวเลขเท่านั้น"
/>`,
    },
    {
      title: 'type',
      target: 'demo-type',
      code: `<TextField v-model="value" type="email" label="อีเมล" />
<TextField v-model="value" type="tel" label="เบอร์โทร" />
<TextField v-model="value" type="currency" label="จำนวนเงิน" />`,
    },
    {
      title: 'rules + required',
      target: 'demo-rules',
      code: `const emailRules = [
  {
    validator: (v) => !v || /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v),
    message: 'รูปแบบอีเมลไม่ถูกต้อง',
  },
]

<TextField
  v-model="value"
  label="อีเมล"
  required
  :rules="emailRules"
/>`,
    },
    {
      title: 'maxLength',
      target: 'demo-max-length',
      code: `<TextField
  v-model="value"
  label="โค้ด (สูงสุด 6 ตัว)"
  :max-length="6"
/>`,
    },
    {
      title: 'formatFunc',
      target: 'demo-format-func',
      code: `<TextField
  v-model="value"
  label="รหัสคูปอง"
  :format-func="(v) => v.toUpperCase()"
/>`,
    },
    {
      title: 'disabled / readonly',
      target: 'demo-disabled-readonly',
      code: `<TextField v-model="value" label="disabled" disabled />
<TextField v-model="value" label="readonly" readonly />`,
    },
    {
      title: 'clearable',
      target: 'demo-clearable',
      code: `<TextField
  v-model="value"
  label="ค้นหา"
  clearable
/>`,
    },
    {
      title: 'prefix / suffix',
      target: 'demo-prefix-suffix',
      code: `<TextField v-model="value" type="number" label="ราคา" prefix="฿" />
<TextField v-model="value" type="number" label="น้ำหนัก" suffix="กก." />`,
    },
    {
      title: 'mask (+ fillMask / reverseFillMask / unmaskedValue)',
      target: 'demo-mask',
      code: `<TextField v-model="value" label="เบอร์โทร" mask="###-###-####" />
<TextField v-model="value" label="วันเกิด" mask="##/##/####" fill-mask />
<TextField
  v-model="value"
  label="จำนวนเงิน"
  mask="#,###,###.##"
  fill-mask
  reverse-fill-mask
/>
<TextField
  v-model="value"
  label="รหัสคูปอง"
  mask="AAA-####"
  unmasked-value
/>`,
    },
    {
      title: 'customStyle',
      target: 'demo-custom-style',
      code: `<TextField
  v-model="value"
  label="กำหนดเอง"
  :custom-style="{
    rounded: 'full',
    bgColor: '#fef3c7',
    labelColor: '#b45309',
    textColor: '#78350f',
    borderColor: '#a855f7',
    focusColor: '#7c3aed',
  }"
/>`,
    },
    {
      title: 'outlined / borderless',
      target: 'demo-custom-style',
      code: `<TextField v-model="value" label="outlined" outlined />
<TextField v-model="value" label="borderless" borderless />`,
    },
    {
      title: 'slot: start-icon / end-icon (+ error variant)',
      target: 'demo-icon-slot',
      code: `<TextField v-model="value" label="ค้นหา" required>
  <template #start-icon>
    <Svg src="navbar/user" class="size-4" />
  </template>
  <template #end-icon>
    <Svg src="common/arrow-right" class="size-4" />
  </template>
  <template #end-icon-error>
    <Svg src="common/info-circle" class="size-4" />
  </template>
</TextField>`,
    },
    {
      title: 'ตรวจสอบทั้งฟอร์มผ่าน ref + defineExpose',
      target: 'demo-form',
      code: `<TextField ref="fieldRef" v-model="value" label="ชื่อ" required />

const fieldRef = ref()
fieldRef.value?.validate()
if (fieldRef.value?.hasError) {
  // ...
}`,
    },
  ]

  // ตั้งใจไม่ใส่ behavior: 'smooth' — scrollIntoView แบบ smooth ไม่ทำงานกับ .main-container-wrapper (overflow: scroll ทั้งสองแกน) ของ layout นี้ ค้างเงียบๆไม่ scroll เลย ต้องใช้ default (เท่ากับ 'auto' คือ jump ทันที) ซึ่งทำงานแน่นอนกว่า
  const scrollToDemo = (targetId: string): void => {
    document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
  }
</script>

<style scoped lang="scss">
  button {
    cursor: pointer;
  }
</style>
