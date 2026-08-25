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
      <div class="mb-2 font-bold">customSize (field ย่อยใน object)</div>
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
              v-for="row in customSizeTable"
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
      <div class="mb-2 font-bold">ripple (field ย่อยตอนใส่เป็น object)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">field</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rippleTable"
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
      name: 'label',
      type: 'string',
      default: "''",
      description: 'ข้อความปุ่ม — ถ้ามี slot เนื้อหาส่งมาด้วย slot จะทับ label',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline'",
      default: "'primary'",
      description:
        'รูปแบบสีปุ่ม — primary พื้นสี main-1, secondary กรอบ+ตัวอักษรสี main-1 พื้นขาว, outline กรอบเทา',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'lg'",
      description: 'ขนาดตัวอักษร/ความสูง/padding ของปุ่ม',
    },
    {
      name: 'round',
      type: "'none'|'sm'|'md'|'lg'|'xl'|'full'|'circle' | string",
      default: "'lg'",
      description:
        "ความมนของขอบ — ใส่ keyword ใช้ Tailwind class ที่มีอยู่, ใส่ค่าอื่น (เช่น '10px') ใช้เป็น border-radius ตรงๆ, 'circle' บังคับสัดส่วน 1:1 ไม่มี padding แนวนอน",
    },
    {
      name: 'customSize',
      type: 'object | null',
      default: 'null',
      description:
        'ปรับ width/height/padding/fontSize เองผ่าน object เดียว (ดูตารางด้านล่าง) — ทับเฉพาะ field ที่ระบุ',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'ปิดการใช้งานปุ่ม เปลี่ยนเป็นสีเทาและไม่รับ click/ripple',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'แสดง spinner ทับเนื้อหาปุ่ม (ตั้ง aria-busy ให้ด้วย) — ตัวปุ่มยังคลิกได้เว้นแต่ตั้ง disabled ควบคู่กัน',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: 'attribute type ของ <button> ใช้ submit/reset เมื่ออยู่ในฟอร์ม',
    },
    {
      name: 'color',
      type: 'string | null',
      default: 'null',
      description:
        'ทับสีเฉพาะจุด — primary ทับสีพื้นหลัง, secondary/outline ทับสีขอบ+ตัวอักษร (และ hover tint) — ไม่มีผลตอน disabled',
    },
    {
      name: 'textColor',
      type: 'string | null',
      default: 'null',
      description: 'ทับสีตัวอักษรแยกจาก color โดยเฉพาะ — ไม่มีผลตอน disabled',
    },
    {
      name: 'ripple',
      type: 'boolean | { center?: boolean; color?: string }',
      default: 'true',
      description:
        'เอฟเฟกต์คลื่นตอนคลิกแบบ Quasar — true ใช้ค่า default (จุดกำเนิดตามตำแหน่งคลิก), false ปิด, object ทับเฉพาะ field ที่ระบุ (ดูตารางด้านล่าง)',
    },
    {
      name: 'scaleOnPress',
      type: 'boolean',
      default: 'false',
      description: 'ย่อขนาดปุ่มเล็กน้อยตอนกดค้าง (active:scale-95)',
    },
  ]

  const customSizeTable: DocRow[] = [
    {
      name: 'width',
      type: "'full' | 'fit' | string",
      description:
        "ความกว้าง — keyword ใช้ Tailwind class เดิม ('full'/'fit'), ค่าอื่น (เช่น '120px') ใช้เป็น width ตรงๆ",
    },
    { name: 'height', type: 'string', description: "ความสูง เป็น CSS value ตรงๆ เช่น '32px'" },
    {
      name: 'padding',
      type: 'string',
      description: "padding เป็น CSS value ตรงๆ เช่น '4px 8px' — ทับ padding ตาม size เดิม",
    },
    {
      name: 'fontSize',
      type: 'string',
      description: "ขนาดตัวอักษร เป็น CSS value ตรงๆ เช่น '20px' — ทับขนาดตาม size เดิม",
    },
  ]

  const rippleTable: DocRow[] = [
    {
      name: 'center',
      type: 'boolean',
      description: 'true = เอฟเฟกต์คลื่นเริ่มจากกลางปุ่มเสมอ แทนตำแหน่งที่คลิก',
    },
    {
      name: 'color',
      type: 'string',
      description:
        'สีคลื่น — ไม่ใส่จะใช้ค่า default ตาม variant (ขาวโปร่งใสสำหรับ primary, ดำโปร่งใสสำหรับ secondary/outline)',
    },
  ]

  const slotsTable: DocRow[] = [
    { name: 'default', type: '', description: 'เนื้อหาปุ่ม ทับ label ถ้ามีเนื้อหาส่งมา' },
    { name: 'start-icon', type: '', description: 'icon ฝั่งซ้ายของเนื้อหา/label' },
    { name: 'end-icon', type: '', description: 'icon ฝั่งขวาของเนื้อหา/label' },
  ]

  const eventsTable: DocRow[] = [
    {
      name: 'click',
      payload: 'MouseEvent',
      type: '',
      description: 'ยิงตอนคลิกปุ่ม — ไม่ยิงถ้า disabled หรือ loading',
    },
  ]

  interface ExampleRow {
    title: string
    code: string
    // id ของ section demo จริงในหน้านี้ที่คลิกแล้วจะ scroll ไปให้ — ต้องตรงกับ id ที่ตั้งไว้บน wrapper div ของแต่ละ section ใน button-demo.vue
    target: string
  }

  const examples: ExampleRow[] = [
    {
      title: 'label (แทนการใส่ slot)',
      target: 'demo-label',
      code: `<Button label="กดฉัน" />
<Button label="มี slot ทับ label">มี slot ทับ label</Button>`,
    },
    {
      title: 'variant',
      target: 'demo-variant',
      code: `<Button variant="primary" label="primary" />
<Button variant="secondary" label="secondary" />
<Button variant="outline" label="outline" />`,
    },
    {
      title: 'size',
      target: 'demo-size',
      code: `<Button size="sm" label="sm" />
<Button size="md" label="md" />
<Button size="lg" label="lg" />`,
    },
    {
      title: 'round',
      target: 'demo-round',
      code: `<Button round="full" label="full" />
<Button round="circle">
  <Svg src="common/arrow-left" class="size-4" />
</Button>
<Button round="10px" label="10px" />`,
    },
    {
      title: 'customSize: width',
      target: 'demo-width',
      code: `<Button :custom-size="{ width: 'full' }" label="full" />
<Button :custom-size="{ width: '120px' }" label="120px" />`,
    },
    {
      title: 'customSize: height',
      target: 'demo-height',
      code: `<Button :custom-size="{ height: '32px' }" label="32px" />`,
    },
    {
      title: 'customSize: fontSize',
      target: 'demo-font-size',
      code: `<Button :custom-size="{ fontSize: '20px' }" label="20px" />`,
    },
    {
      title: 'customSize: padding',
      target: 'demo-padding',
      code: `<Button :custom-size="{ padding: '0 12px' }" label="0 12px" />`,
    },
    {
      title: 'disabled',
      target: 'demo-disabled',
      code: `<Button variant="primary" disabled label="primary" />`,
    },
    {
      title: 'loading',
      target: 'demo-loading',
      code: `<Button
  variant="primary"
  :loading="loading"
  :disabled="loading"
  label="กดเพื่อลอง loading"
  @click="handleClick"
/>`,
    },
    {
      title: 'type (submit / reset ในฟอร์ม)',
      target: 'demo-type',
      code: `<form @submit.prevent="handleSubmit" @reset="handleReset">
  <Button type="submit" label="submit" />
  <Button variant="secondary" type="reset" label="reset" />
</form>`,
    },
    {
      title: 'color / textColor',
      target: 'demo-color',
      code: `<Button color="#0d6efd" label="color (primary bg)" />
<Button color="#0d6efd" text-color="#111827" label="color + textColor" />`,
    },
    {
      title: 'slot: start-icon / end-icon',
      target: 'demo-icon-slot',
      code: `<Button label="ย้อนกลับ">
  <template #start-icon>
    <Svg src="common/arrow-left" class="size-4" />
  </template>
</Button>`,
    },
    {
      title: 'ripple (boolean | object)',
      target: 'demo-ripple',
      code: `<Button ripple label="ripple: true (default)" />
<Button :ripple="{ center: true }" label="ripple: { center: true }" />
<Button :ripple="{ color: '#00c2a8' }" label="ripple: { color }" />
<Button :ripple="false" label="ripple: false" />`,
    },
    {
      title: 'scaleOnPress',
      target: 'demo-scale-on-press',
      code: `<Button scale-on-press label="scaleOnPress" />`,
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
