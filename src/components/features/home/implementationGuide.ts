// The content of the guide on the home page: how to build on the template, one section per task.
// Plain data so the page stays a loop and a new section is one more entry here.

export interface GuideSection {
  id: string
  title: string
  /** One or two sentences on when this applies. */
  summary: string
  steps: string[]
  /** Path of the file the example belongs in, shown above the code. */
  file?: string
  code?: string
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'start',
    title: '1. เริ่มโปรเจคใหม่',
    summary: 'ทำครั้งเดียวตอนคัดลอก template ไปเป็นโปรเจคจริง',
    steps: [
      'เปลี่ยน name ใน package.json, <title> ใน index.html และ public/favicon.svg',
      'คัดลอก .env.example เป็น .env.development แล้วใส่ค่า ไม่ใช้ LINE login ให้ VITE_LIFF_ID ว่างไว้',
      'ตั้งสีใน src/assets/main.css (ชั้น --palette-* แล้วชี้ --app-* ไปหา) และใส่ฟอนต์ของโปรเจค',
      'เปลี่ยน LOGO ใน LayoutMobileTopBar.vue และแท็บใน mobileTabs.ts',
      'แก้ intro กับ Project Structure ใน CLAUDE.md และ docs/folder-structure.md ให้เป็นของโปรเจค',
    ],
  },
  {
    id: 'page',
    title: '2. เพิ่มหน้าใหม่',
    summary:
      'สร้างไฟล์ใน src/pages/ แล้วได้ route ทันที ชื่อ route ดูได้ใน typed-router.d.ts (รัน dev หรือ build หนึ่งครั้งหลังเพิ่มไฟล์)',
    steps: [
      'ตั้ง title, backTo, current และ requiresAuth ใน definePage()',
      'เปลี่ยนหน้าด้วย router.replace({ name }) เสมอ ห้ามใช้ router.push()',
      'หน้าที่ซ้อนกัน (orders/, orders/[orderId]) ใช้ไฟล์ orders.vue ที่มี <RouterView /> เป็น layout',
    ],
    file: 'src/pages/orders/[orderId].vue',
    code: `<script setup lang="ts">
import { useRoute } from 'vue-router'

definePage({
  meta: {
    title: 'รายละเอียดคำสั่งซื้อ',
    backTo: { name: '/orders/' },
    current: 'home',
    requiresAuth: true,
  },
})

const route = useRoute('/orders/[orderId]')
</script>

<template>
  <p class="px-5 text-content">คำสั่งซื้อ {{ route.params.orderId }}</p>
</template>`,
  },
  {
    id: 'query',
    title: '3. ดึงข้อมูลจาก API',
    summary:
      'ฟังก์ชันเรียก API อยู่ใน src/api/ (ไม่รู้จัก Vue) key และ options อยู่ใน src/queries/ หน้าเรียก useQuery() ด้วย getter',
    steps: [
      'src/api/orders.ts: ฟังก์ชันที่ใช้ apiGet/apiPost จาก client.ts ซึ่งแกะ envelope { status, data, error } ให้แล้ว',
      'src/queries/orders.ts: key factory + defineQueryOptions',
      'ในหน้า: แสดง loading, error, ข้อมูลว่าง และข้อมูล ครบทั้ง 4 สถานะ (ดู skill edge-cases)',
    ],
    file: 'src/api/orders.ts + src/queries/orders.ts + หน้า',
    code: `// src/api/orders.ts
import { apiGet } from '@/api/client'

export interface Order {
  id: string
  total: number
}

export function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>('/api/v1/internal/Order/List')
}

// src/queries/orders.ts
import { defineQueryOptions } from '@pinia/colada'
import { getOrders } from '@/api/orders'

export const ORDER_QUERY_KEYS = {
  root: ['orders'] as const,
  list: () => [...ORDER_QUERY_KEYS.root, 'list'] as const,
}

export const orderListQuery = defineQueryOptions(() => ({
  key: ORDER_QUERY_KEYS.list(),
  query: () => getOrders(),
}))

// ในหน้า
const { state, asyncStatus } = useQuery(() => orderListQuery())`,
  },
  {
    id: 'mutation',
    title: '4. ส่งข้อมูล (mutation)',
    summary:
      'การสร้าง แก้ หรือลบ ใช้ defineMutation ใน src/mutations/ สำเร็จแล้ว invalidate key ที่เกี่ยวข้อง',
    steps: [
      'ปุ่มที่ส่งข้อมูลต้อง :loading ระหว่างรอ กันกดซ้ำ',
      'ส่งไม่สำเร็จ ให้คงค่าในฟอร์มไว้ แล้วแจ้งด้วย showErrorDialog({ error })',
    ],
    file: 'src/mutations/orders.ts',
    code: `import { defineMutation, useMutation, useQueryCache } from '@pinia/colada'
import { createOrder } from '@/api/orders'
import { ORDER_QUERY_KEYS } from '@/queries/orders'

export const useCreateOrder = defineMutation(() => {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (productId: string) => createOrder(productId),
    onSettled: () => queryCache.invalidateQueries({ key: ORDER_QUERY_KEYS.root }),
  })
})`,
  },
  {
    id: 'form',
    title: '5. ฟอร์ม (TextField, Select)',
    summary: 'ช่องกรอกตรวจตัวเองตอน blur และมี validate() ให้เรียกตอนกดส่ง ข้อความ error ภาษาไทยมาให้แล้ว',
    steps: [
      'rules คือรายการ { validator, message } ข้อแรกที่ไม่ผ่านจะแสดง',
      'ก่อนส่งให้เรียก validate() ของทุกช่องผ่าน template ref แล้วเช็ค hasError',
      'ดูทุก prop ได้ที่ /examples/input และ /examples/select',
    ],
    file: 'หน้าที่มีฟอร์ม',
    code: `<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import TextField, { type TextFieldExposed } from '@/components/input/TextField.vue'
import Select from '@/components/input/Select.vue'

const name = ref<string>('')
const province = ref<string>('')
const nameField = useTemplateRef<TextFieldExposed>('nameField')

const PROVINCES = [{ label: 'กรุงเทพมหานคร', value: '10' }]
const NAME_RULES = [{ validator: (value: string) => value.length >= 2, message: 'ชื่อสั้นเกินไป' }]

function submit(): void {
  nameField.value?.validate()
  if (nameField.value?.hasError) return
  // ส่งข้อมูล
}
</script>

<template>
  <TextField ref="nameField" v-model="name" label="ชื่อ" required :rules="NAME_RULES" />
  <Select v-model="province" label="จังหวัด" :options="PROVINCES" required />
</template>`,
  },
  {
    id: 'dialog',
    title: '6. Popup (Dialog.create)',
    summary: 'เปิด popup จากที่ไหนก็ได้ ไม่ต้องวาง component ในหน้า DialogHost อยู่ใน App.vue แล้ว',
    steps: [
      'popup มาตรฐานใช้ DefaultModal: type คือ success, question, alert หรือ error',
      'popup ของตัวเอง: ใช้ useDialogComponent(emit) กับ BaseModal หรือ BaseBottomSheet (ดู ExampleSheetDialog.vue)',
      'error จาก API ใช้ showErrorDialog({ error }) ข้อความมาจาก backend',
      'ลองทุกแบบได้ที่ /examples/popup',
    ],
    file: 'ในหน้าหรือ composable',
    code: `import { Dialog } from '@/components/modal/dialog'
import DefaultModal from '@/components/modal/DefaultModal.vue'
import { showErrorDialog } from '@/components/modal/errorDialog'

Dialog.create({
  component: DefaultModal,
  componentProps: {
    type: 'question',
    title: 'ยืนยันการทำรายการ',
    content: 'ต้องการทำรายการนี้ใช่หรือไม่',
    buttons: [
      { action: 'cancel', text: 'ยกเลิก' },
      { action: 'submit', text: 'ยืนยัน' },
    ],
  },
}).onOk(() => {
  // ผู้ใช้กดยืนยัน
})

// error จาก API
try {
  await createOrder(productId)
} catch (error) {
  showErrorDialog({ error })
}`,
  },
  {
    id: 'tokens',
    title: '7. สีและธีม',
    summary: 'component ใช้ semantic token เท่านั้น เปลี่ยนสีทั้งแอปได้จาก src/assets/main.css ที่เดียว',
    steps: [
      'ใช้ bg-surface, text-content, text-content-subtle, border-border, bg-brand, text-danger',
      'ห้ามใช้เฉดสีดิบ (bg-blue-600) หรือ hex ใน component',
      'ไม่มี token ที่ต้องการ ให้เพิ่มใน main.css ครบ 3 ชั้น (ดู skill design-tokens)',
      'bg-page คือพื้นหลังนอกคอลัมน์แอป bg-canvas คือพื้นหลังของแอป',
    ],
    file: 'src/assets/main.css',
    code: `:root {
  --palette-brand-500: #e11d48; /* 1. สีดิบของแบรนด์ */
  --app-brand: var(--palette-brand-500); /* 2. ให้สีมีหน้าที่ */
}

@theme inline {
  --color-brand: var(--app-brand); /* 3. ได้ bg-brand, text-brand */
}`,
  },
  {
    id: 'tab',
    title: '8. เพิ่มแท็บด้านล่าง',
    summary: 'แท็บมาจาก mobileTabs.ts หน้าไหนอยู่แท็บไหนบอกด้วย meta.current',
    steps: [
      'เพิ่ม entry ใน MOBILE_TABS พร้อมไอคอนใน src/assets/icons/tab-bar/',
      'ตั้ง current ใน definePage() ของหน้านั้น (และหน้าลูก ถ้าอยากให้แท็บยังติดอยู่)',
    ],
    file: 'src/components/layout/mobileTabs.ts',
    code: `{
  key: 'orders',
  label: 'คำสั่งซื้อ',
  routeName: '/orders/',
  icon: 'tab-bar/orders-inactive',
  activeIcon: 'tab-bar/orders-active',
},`,
  },
  {
    id: 'done',
    title: '9. ก่อนส่งงาน',
    summary: 'ทุก util, composable, store และ components/ui/ ต้องมี spec วางข้างไฟล์',
    steps: [
      'ไล่ checklist ใน skill edge-cases (loading, error, ว่าง, ข้อความยาว)',
      'เปลี่ยนโครงสร้าง (เพิ่มหน้า โฟลเดอร์ แท็บ) ต้องแก้ CLAUDE.md และ docs/folder-structure.md ด้วย',
    ],
    code: `pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build`,
  },
]
