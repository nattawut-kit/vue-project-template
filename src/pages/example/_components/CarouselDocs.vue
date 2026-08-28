<template>
  <div class="mt-4 flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-3 text-18">
    <div>
      <div class="mb-2 font-bold">Props</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="w-24 py-1 pr-2 font-bold">prop</th>
              <th class="w-28 py-1 pr-2 font-bold">type</th>
              <th class="w-20 py-1 pr-2 font-bold">default</th>
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
      <div class="mb-2 font-bold">indicatorsInside (field ย่อยตอนใส่เป็น object)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="w-20 py-1 pr-2 font-bold">field</th>
              <th class="w-28 py-1 pr-2 font-bold">default</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in indicatorsInsideTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 font-bold wrap-break-word text-main-1">{{ row.name }}</td>
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
      <div class="mb-2 font-bold">Slots</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">slot</th>
              <th class="w-40 py-1 pr-2 font-bold">scope</th>
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
      type: 'number',
      default: '0',
      description:
        'index สไลด์ปัจจุบัน — อ่านออกไปข้างนอกได้ (ยิงตอนลาก/กดจุด/autoplay เปลี่ยนสไลด์) และสั่งเข้ามาจากข้างนอกก็ได้, ไม่ผูก v-model ก็ยังทำงานปกติทุกอย่าง',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: "'สไลด์รูปภาพ'",
      description: 'คำอธิบายตัว carousel ให้ screen reader อ่าน (ไม่โชว์บนจอ)',
    },
    {
      name: 'items',
      type: 'T[]',
      default: '[]',
      description: 'array ของสไลด์ (required) — generic type ตามข้อมูลที่ส่งเข้ามา',
    },
    {
      name: 'autoplay',
      type: 'boolean',
      default: 'false',
      description: 'เลื่อนสไลด์อัตโนมัติ (หยุด/รีเซ็ตทุกครั้งที่ผู้ใช้ปัด/ลาก/กด indicator)',
    },
    {
      name: 'duration',
      type: 'number',
      default: '3000',
      description: 'ระยะเวลา (ms) ต่อสไลด์ตอน autoplay',
    },
    {
      name: 'aspectRatio',
      type: 'string',
      default: "'16/9'",
      description: "CSS aspect-ratio ของพื้นที่สไลด์ เช่น '2/1' สำหรับ banner",
    },
    {
      name: 'peek',
      type: 'boolean',
      default: 'true',
      description:
        'เปิด/ปิด peek effect — false = สไลด์เต็มความกว้าง ไม่เห็นสไลด์ข้างๆ (peekAmount ไม่มีผล), มีสไลด์เดียวจะปิดให้อัตโนมัติ',
    },
    {
      name: 'peekAmount',
      type: 'number',
      default: '16',
      description:
        'ระยะ (px) ที่โผล่ให้เห็นสไลด์ถัดไป/ก่อนหน้า — ตอนอยู่สไลด์แรก/สุดท้าย ทั้งระยะเว้นขอบและระยะที่สไลด์ข้างๆ โผล่จะเท่ากับค่านี้พอดี ส่วนสไลด์กลางๆ โผล่เท่ากันสองข้างที่ peekAmount - gap/2',
    },
    {
      name: 'peekScale',
      type: 'number',
      default: '1',
      description:
        'ย่อสไลด์ที่ยังไม่ active ให้เล็กกว่าใบที่ focus (เช่น 0.85) แล้วค่อยๆ ขยายเต็มตอนเลื่อนมาถึง, 1 = ทุกใบขนาดเท่ากัน. ระยะ peek ที่โผล่ยังเท่า peekAmount เหมือนเดิมเป๊ะ เพราะตรึงขอบด้านที่หันเข้าหาใบที่ focus ไว้ (ใบซ้ายตรึงขอบขวา ใบขวาตรึงขอบซ้าย) เปลี่ยนแค่ขนาดใบ',
    },
    {
      name: 'gap',
      type: 'number',
      default: '8',
      description: 'ระยะห่าง (px) ระหว่างสไลด์',
    },
    {
      name: 'round',
      type: "'none'|'sm'|'md'|'lg'|'xl'|'full' | string",
      default: "'16px'",
      description:
        "ความมนของขอบแต่ละสไลด์ — keyword ใช้ Tailwind class เหมือน Img/Button, ค่าอื่น (เช่น '16px') ใช้เป็น border-radius ตรงๆ",
    },
    {
      name: 'infinity',
      type: 'boolean',
      default: 'true',
      description:
        'true = วนไม่สุด เลยใบสุดท้ายแล้วเลื่อนต่อไปข้างหน้าเป็นใบแรกเลย ไม่ใช่รูดย้อนกลับ (ใช้ clone ใบหัว/ท้ายขนาบ แล้วเทเลพอร์ตกลับใบจริงตอน transition จบ — ผู้ใช้ไม่เห็น) ไม่มีแรงหน่วง, false = ตันที่ใบหัว/ท้าย ต้องลากย้อนกลับเท่านั้น — การตัน/แรงหน่วงมีผลกับการลาก/ปัดเท่านั้น autoplay ยังวนต่อเสมอ',
    },
    {
      name: 'dragFollow',
      type: 'boolean',
      default: 'false',
      description:
        'false = ระหว่างลาก track อยู่นิ่ง รอปล่อยแล้วค่อยเลื่อนทีเดียว, true = ขยับตามเมาส์/นิ้วแบบ real-time (มีแรงหน่วงตอนสุดทางถ้า infinity = false) — ทั้งสองแบบยังลากเปลี่ยนสไลด์ได้เหมือนกัน',
    },
    {
      name: 'slideClass',
      type: 'string | array | object (เหมือน class ปกติ)',
      default: 'undefined',
      description:
        'class เพิ่มเติมของกล่องสไลด์ เช่น border-2 border-main-1 shadow-lg — ต่อท้าย class เดิม ไม่ได้ทับ ถ้าจะทับ utility ที่ชนกัน (เช่น rounded-* จาก round) ต้องเติม ! เช่น rounded-none!',
    },
    {
      name: 'slideStyle',
      type: 'string | object (เหมือน style ปกติ)',
      default: 'undefined',
      description:
        'style เพิ่มเติมของกล่องสไลด์ ใช้แทน slideClass ตอนที่ต้องทับค่าที่ชนกัน เพราะ inline style ชนะ class อยู่แล้วไม่ต้องเติม ! (ใส่ borderRadius มาเองก็ทับ round ได้). ข้อควรรู้เรื่องเงา: root ของ carousel ต้อง overflow hidden ไว้บังสไลด์ที่อยู่นอกจอ เงาที่ล้นออกนอกกรอบเลยโดนตัด — ด้านบนไม่มีที่ว่างเลย (โดนตัดหมด) ด้านล่างเหลือเท่าความสูงแถว indicator ถ้าอยากได้เงาเต็มๆ ให้ใส่ที่ container ข้างนอกแทน',
    },
    {
      name: 'showIndicators',
      type: 'boolean',
      default: 'true',
      description: 'โชว์จุด indicator ด้านล่าง (จะไม่โชว์อัตโนมัติถ้ามีสไลด์เดียว)',
    },
    {
      name: 'indicatorsInside',
      type: "boolean | { position?: 'bottom'|'top'; offset?: string; align?: 'center'|'left'|'right' }",
      default: 'false',
      description:
        'ย้าย indicator ไปลอยทับบนรูปแทนที่จะอยู่ใต้รูป — true = ขอบล่างกึ่งกลาง, object = ทับเฉพาะ field ที่ระบุ (ดูตารางด้านล่าง). จุดที่ยังไม่ active เปลี่ยนเป็นขาวโปร่งให้เองกันจมไปกับภาพ, มีผลกับเนื้อหาใน slot indicators ด้วย',
    },
    {
      name: 'clickable',
      type: 'boolean',
      default: 'true',
      description:
        'cursor pointer + ยิง event click ตอนกดสไลด์ (ปิดได้ถ้าใช้แค่โชว์ ไม่ต้องการ interaction)',
    },
  ]

  const indicatorsInsideTable: DocRow[] = [
    {
      name: 'position',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description:
        'เกาะขอบไหนของรูป — top/bottom จุดเรียงแนวนอน, left/right เรียงแนวตั้ง (ตัว active ยืดสูงแทนยืดกว้าง)',
    },
    {
      name: 'offset',
      type: 'string',
      default: "'12px'",
      description:
        "ระยะห่างจากขอบนั้น ใส่ CSS value ตรงๆ ได้เลย เช่น '24px', '1rem' — ตอน peek = true จะบวก peekAmount ให้อัตโนมัติ เพื่อให้วัดจากขอบรูปจริง ไม่ใช่ขอบ container ที่มีสไลด์ข้างๆ โผล่อยู่",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description:
        'ตำแหน่งตามแนวของขอบนั้น — ขอบบน/ล่าง = ซ้าย/กลาง/ขวา, ขอบซ้าย/ขวา = บน/กลาง/ล่าง. ลงที่ตัว wrapper เลยมีผลกับ slot indicators ด้วย',
    },
  ]

  const slotsTable: DocRow[] = [
    {
      name: 'default',
      type: '{ item: T; index: number; active: boolean }',
      description:
        'เนื้อหาของแต่ละสไลด์ — ต้องส่งมาเอง (เช่น <Img> หรือ card ใดๆ), active = true ตอนเป็นสไลด์ที่กำลังโฟกัสอยู่',
    },
    {
      name: 'indicators',
      type: '{ current: number; count: number; select: (i) => void; next: () => void; prev: () => void; first: boolean; last: boolean }',
      description:
        'ทับตัว navigate ทั้งก้อนรวม wrapper (จัด layout เองได้เต็มที่) — ไม่ใส่ = จุด indicator แบบ default, ยังถูกซ่อนตาม showIndicators และตอนมีสไลด์เดียวเหมือนเดิม. next/prev เป็นชุดเดียวกับที่การลากใช้ เลยตัน/วนตาม infinity ให้อัตโนมัติ, first/last ไว้ disable ปุ่มตอนสุดทาง',
    },
  ]

  const eventsTable: DocRow[] = [
    {
      name: 'click',
      payload: '[item: T, index: number]',
      type: '',
      description:
        'ยิงตอนกดสไลด์ (ไม่ยิงถ้าเพิ่งลาก/ปัดจบ หรือ clickable = false) — ลากบน desktop และปัดบนมือถือ track จะขยับตามแบบ real-time และหน่วงเมื่อสุดทางที่สไลด์หัว/ท้าย',
    },
  ]

  interface ExampleRow {
    title: string
    code: string
    target: string
  }

  const examples: ExampleRow[] = [
    {
      title: 'basic (items + default slot)',
      target: 'demo-basic',
      code: `<Carousel :items="banners" aspect-ratio="2/1">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'autoplay + duration',
      target: 'demo-autoplay',
      code: `<Carousel :items="banners" autoplay :duration="2000">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'v-model (อ่าน/สั่ง index สไลด์จากข้างนอก)',
      target: 'demo-v-model',
      code: `<Carousel
  v-model="slide"
  :items="banners"
/>
<Button @click="slide = 2">ไปสไลด์ที่ 3</Button>
<div>ตอนนี้อยู่สไลด์ที่ {{ slide + 1 }}</div>`,
    },
    {
      title: 'dragFollow (ปิดการขยับตามมือ)',
      target: 'demo-drag-follow',
      code: `<Carousel :items="banners" :drag-follow="false">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'infinity (ลากวนไม่สุด)',
      target: 'demo-infinity',
      code: `<Carousel :items="banners" infinity>
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'peekScale (ใบข้างๆ เล็กกว่า แล้วขยายตอนเลื่อนมา)',
      target: 'demo-peek-scale',
      code: `<Carousel :items="banners" :peek-scale="0.85">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'peekAmount (เว้นขอบหัว/ท้ายเท่าค่านี้)',
      target: 'demo-peek-amount',
      code: `<Carousel :items="banners" :peek-amount="14">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'peek = false (ไม่มี peek)',
      target: 'demo-no-peek',
      code: `<Carousel :items="banners" :peek="false">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'click event',
      target: 'demo-click',
      code: `<Carousel :items="banners" @click="(item, index) => onBannerClick(item, index)">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'slideClass / slideStyle (border / shadow / อะไรก็ได้)',
      target: 'demo-slide-style',
      code: `<!-- class ปกติ -->
<Carousel :items="banners" slide-class="border-2 border-main-1 shadow-lg" />

<!-- style ตอนต้องทับค่าที่ชนกัน (ไม่ต้องเติม !) -->
<Carousel
  :items="banners"
  :slide-style="{
    border: '2px solid var(--color-main-1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  }"
/>`,
    },
    {
      title: 'round',
      target: 'demo-round',
      code: `<Carousel :items="banners" round="full" />
<Carousel :items="banners" round="8px" />`,
    },
    {
      title: 'indicatorsInside (จุดทับบนรูป)',
      target: 'demo-indicators-inside',
      code: `<Carousel :items="banners" indicators-inside>
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>
</Carousel>`,
    },
    {
      title: 'indicatorsInside แบบ object (ปรับตำแหน่งเอง)',
      target: 'demo-indicators-inside-custom',
      code: `<Carousel :items="banners" :indicators-inside="{ offset: '24px' }" />
<Carousel :items="banners" :indicators-inside="{ position: 'top', align: 'end' }" />
<Carousel :items="banners" :indicators-inside="{ align: 'start' }" />`,
    },
    {
      title: 'position left / right (จุดแนวตั้ง)',
      target: 'demo-indicators-vertical',
      code: `<Carousel :items="banners" :indicators-inside="{ position: 'right' }" />
<Carousel :items="banners" :indicators-inside="{ position: 'left', align: 'end' }" />`,
    },
    {
      title: 'slot #indicators (custom navigate)',
      target: 'demo-indicators-slot',
      code: `<Carousel :items="banners">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>

  <template #indicators="{ current, count, prev, next, first, last }">
    <div class="mt-3 flex items-center justify-center gap-4">
      <Button label="‹" :disabled="first" @click="prev" />
      <span>{{ current + 1 }} / {{ count }}</span>
      <Button label="›" :disabled="last" @click="next" />
    </div>
  </template>
</Carousel>`,
    },
    {
      title: 'indicatorsInside + slot #indicators (custom nav ทับบนรูป)',
      target: 'demo-indicators-inside-slot',
      code: `<Carousel :items="banners" :indicators-inside="{ align: 'end', offset: '10px' }">
  <template #default="{ item }">
    <Img :src="item.image" />
  </template>

  <template #indicators="{ current, count }">
    <div class="mr-3 rounded-full bg-black/50 px-3 py-1 text-white">
      {{ current + 1 }} / {{ count }}
    </div>
  </template>
</Carousel>`,
    },
    {
      title: 'showIndicators / clickable',
      target: 'demo-flags',
      code: `<Carousel :items="banners" :show-indicators="false" />
<Carousel :items="banners" :clickable="false" />`,
    },
  ]

  const scrollToDemo = (targetId: string): void => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<style scoped lang="scss">
  button {
    cursor: pointer;
  }
</style>
