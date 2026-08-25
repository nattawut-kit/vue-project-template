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
      <div class="mb-2 font-bold">spinner (field ย่อยตอนใส่เป็น object)</div>
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
              v-for="row in spinnerTable"
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
      name: 'src',
      type: 'string',
      description: 'URL รูปหลัก (required)',
    },
    {
      name: 'srcset',
      type: 'string | null',
      default: 'null',
      description:
        "native srcset — บอก browser ว่ามีรูปกี่ขนาดให้เลือก พร้อม width descriptor เช่น '400w' ใช้คู่กับ sizes, src ยังเป็น fallback เดิม",
    },
    {
      name: 'sizes',
      type: 'string | null',
      default: 'null',
      description:
        'native sizes — media condition บอกว่า viewport ขนาดไหนควรใช้รูปกว้างเท่าไหร่ ให้ browser เลือกไฟล์จาก srcset เอง',
    },
    {
      name: 'alt',
      type: 'string',
      default: "''",
      description: 'ข้อความอธิบายรูปเพื่อ accessibility/SEO',
    },
    {
      name: 'width / height',
      type: 'number | string | null',
      default: 'null',
      description:
        "ขนาด container — เลขล้วนตีความเป็น px, string ใส่ CSS value ตรงๆ ได้เลย (เช่น '120px')",
    },
    {
      name: 'aspectRatio',
      type: 'string | null',
      default: 'null',
      description:
        "CSS aspect-ratio เช่น '1/1', '16/9' — กันพื้นที่ไว้ก่อนรูปโหลดเสร็จ ตัด layout shift",
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'",
      default: "'cover'",
      description: 'เทียบเท่า CSS object-fit — map ไปเป็น Tailwind class object-* ที่มีอยู่แล้ว',
    },
    {
      name: 'position',
      type: "'center'|'top'|'bottom'|'left'|'right'|'left-top'|'left-bottom'|'right-top'|'right-bottom' | string",
      default: "'center'",
      description:
        "เทียบเท่า CSS object-position — keyword ใช้ Tailwind class object-*, ค่าอื่น (เช่น '50% 20%') fallback เป็น inline style",
    },
    {
      name: 'round',
      type: "'none'|'sm'|'md'|'lg'|'xl'|'full' | string",
      default: "'none'",
      description:
        "ความมนของขอบ container — keyword ใช้ Tailwind class ที่มีอยู่, ค่าอื่น (เช่น '10px') ใช้เป็น border-radius ตรงๆ",
    },
    {
      name: 'lazy',
      type: 'boolean',
      default: 'true',
      description: 'ตั้ง loading="lazy"/"eager" — false ให้โหลดทันทีไม่ต้องรอเข้า viewport',
    },
    {
      name: 'draggable',
      type: 'boolean',
      default: 'true',
      description:
        'native image drag ของ browser — ปิดได้ตอน false (เช่น รูปอยู่ใน carousel ที่ swipe ด้วยนิ้ว)',
    },
    {
      name: 'spinner',
      type: 'boolean | { color?: string; size?: string }',
      default: 'true',
      description:
        'true = spinner default, object ทับเฉพาะ field ที่ระบุ (ดูตารางด้านล่าง), false = ไม่มี spinner (กล่องเทาเปล่าๆ)',
    },
    {
      name: 'placeholderSrc',
      type: 'string | null',
      default: 'null',
      description:
        'รูป (มักเป็น base64/low-res) โชว์ทันทีระหว่างรอ src โหลด แทน spinner default — สลับเป็นรูปจริงอัตโนมัติตอนโหลดเสร็จ',
    },
    {
      name: 'fallbackSrc',
      type: 'string | null',
      default: 'null',
      description:
        'สลับไปโหลดรูปนี้อัตโนมัติถ้า src หลักพัง — ถ้ารูปนี้โหลดสำเร็จถือเป็นโหลดสำเร็จปกติ ไม่เข้า error state/ไม่ยิง error event',
    },
    {
      name: 'imgClass',
      type: 'string | array | object (เหมือน class ปกติ)',
      default: 'undefined',
      description:
        'class ที่ลงเฉพาะ <img> เอง (ไม่ใช่ container) — ต่อจาก class ของ fit/position เดิม ไม่ทับ ใช้เช่น grayscale/opacity-50',
    },
    {
      name: 'imgStyle',
      type: 'string | object (เหมือน style ปกติ)',
      default: 'undefined',
      description:
        "style ที่ลงเฉพาะ <img> เอง — ใช้ตอนไม่มี Tailwind class ตรงกับที่ต้องการ หรือเป็นค่า dynamic เช่น filter: 'blur(...)'",
    },
  ]

  const spinnerTable: DocRow[] = [
    {
      name: 'color',
      type: 'string',
      description: 'สีเส้น spinner (border-color) — ไม่ใส่ใช้ค่า default (เทา gray-400)',
    },
    {
      name: 'size',
      type: 'string',
      description:
        "ขนาด spinner เป็น CSS value ตรงๆ เช่น '28px' — ไม่ใส่ใช้ default (Tailwind size-5)",
    },
  ]

  const slotsTable: DocRow[] = [
    {
      name: 'default',
      type: '',
      description:
        'วางเนื้อหาทับรูป (caption/badge) เหมือน QImg — ไม่มี state loading/error ผูกมาด้วย ต้องจัดการเองถ้าต้องการซ่อนตอนโหลด',
    },
    {
      name: 'placeholder',
      type: '',
      description: 'ทับเนื้อหาที่โชว์ระหว่างโหลด — ไม่ใส่ = spinner default หรือ placeholderSrc',
    },
    {
      name: 'error',
      type: '',
      description: 'ทับเนื้อหาที่โชว์ตอนโหลดไม่สำเร็จจริง — ไม่ใส่ = กล่องเทาเปล่าๆ',
    },
  ]

  const eventsTable: DocRow[] = [
    {
      name: 'load',
      payload: '',
      type: '',
      description: 'ยิงตอนรูป (src ปัจจุบัน ไม่ว่าจะเป็น src หลักหรือ fallbackSrc) โหลดสำเร็จ',
    },
    {
      name: 'error',
      payload: 'Event',
      type: '',
      description:
        'ยิงตอนโหลดไม่สำเร็จจริง (fallbackSrc ก็พังด้วย หรือไม่มี fallbackSrc) — ไม่ยิงตอนแค่สลับไป fallbackSrc สำเร็จ',
    },
  ]

  interface ExampleRow {
    title: string
    code: string
    // id ของ section demo จริงในหน้านี้ที่คลิกแล้วจะ scroll ไปให้ — ต้องตรงกับ id ที่ตั้งไว้บน wrapper div ของแต่ละ section ใน img-demo.vue
    target: string
  }

  const examples: ExampleRow[] = [
    {
      title: 'basic (src / alt)',
      target: 'demo-basic',
      code: `<Img src="https://picsum.photos/..." alt="รูปตัวอย่าง" />`,
    },
    {
      title: 'width / height',
      target: 'demo-width-height',
      code: `<Img src="..." :width="80" :height="80" />
<Img src="..." width="120px" height="60px" />`,
    },
    {
      title: 'aspectRatio',
      target: 'demo-aspect-ratio',
      code: `<Img src="..." aspect-ratio="16/9" />
<Img src="..." aspect-ratio="1/1" />`,
    },
    {
      title: 'fit',
      target: 'demo-fit',
      code: `<Img src="..." fit="contain" />
<Img src="..." fit="cover" />`,
    },
    {
      title: 'position (คู่กับ fit="cover")',
      target: 'demo-position',
      code: `<Img src="..." fit="cover" position="top" />
<Img src="..." fit="cover" position="left-bottom" />`,
    },
    {
      title: 'round',
      target: 'demo-round',
      code: `<Img src="..." round="full" />
<Img src="..." round="10px" />`,
    },
    {
      title: 'imgClass / imgStyle',
      target: 'demo-img-class-style',
      code: `<Img src="..." img-class="grayscale" />
<Img src="..." :img-style="{ filter: 'blur(2px)' }" />`,
    },
    {
      title: 'loading: placeholder slot / placeholderSrc / spinner',
      target: 'demo-loading',
      code: `<Img src="..." />

<Img src="...">
  <template #placeholder>กำลังโหลด...</template>
</Img>

<Img src="..." placeholder-src="data:image/png;base64,..." />

<Img src="..." :spinner="{ color: '#0d6efd', size: '28px' }" />
<Img src="..." :spinner="false" />`,
    },
    {
      title: 'srcset / sizes (responsive)',
      target: 'demo-responsive',
      code: `<Img
  src="https://cdn/img-400.jpg"
  srcset="https://cdn/img-400.jpg 400w, https://cdn/img-800.jpg 800w"
  sizes="(max-width: 640px) 100vw, 400px"
/>`,
    },
    {
      title: 'fallbackSrc',
      target: 'demo-fallback',
      code: `<Img src="https://broken-url" fallback-src="https://backup-image" />`,
    },
    {
      title: 'error slot (ไม่มี fallbackSrc)',
      target: 'demo-error-slot',
      code: `<Img src="https://broken-url">
  <template #error>โหลดไม่สำเร็จ</template>
</Img>`,
    },
    {
      title: 'lazy',
      target: 'demo-lazy',
      code: `<Img src="..." :lazy="false" />`,
    },
    {
      title: 'draggable',
      target: 'demo-draggable',
      code: `<Img src="..." :draggable="false" />`,
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
