# โครงสร้างโฟลเดอร์ (vue-project-template)

template ตั้งต้นของโปรเจค mobile web ของ ChocoCRM ใช้ Vue 3 + TypeScript + Vite (rolldown) + Tailwind CSS v4 + Pinia + Pinia Colada route สร้างจากไฟล์ใน `src/pages/` และมี type ให้ผ่าน `typed-router.d.ts`

โครงสร้างนำมาจากโปรเจค BCRM Ovaltine UHT โดยตัดฟีเจอร์และหน้าตาของโปรเจคนั้นออกทั้งหมด เหลือไว้แค่โครง โปรเจคใหม่คัดลอกไปแล้วตั้ง token สี ฟอนต์ และสร้างหน้าของตัวเองต่อ

## โครงสร้าง

```
vue-project-template/
├── .claude/                 # settings, launch.json, commands และ skills ของ Claude Code
├── .github/                 # PR template และ workflow PR Review
├── docs/                    # เอกสารนี้ และกฎเรื่อง secret (secrets.md)
├── public/                  # ไฟล์ static ที่ไม่ผ่าน Vite (favicon.svg)
├── src/
│   ├── api/                 # ฟังก์ชันเรียก API แยกเป็นไฟล์ละเรื่อง ไม่รู้จัก Vue
│   │   ├── client.ts        # axios instance, unwrap envelope { status, data, error }, ApiErrorResponse, TOKEN_STORAGE_KEY
│   │   └── auth.ts          # login: แลก LIFF access token เป็น token ของแอป
│   ├── assets/
│   │   ├── main.css         # Tailwind + design token (palette → --app-* → utility) + .html-content
│   │   └── icons/           # ไอคอน svg ที่ Svg.vue โหลดตาม path: common/, tab-bar/, dialog/
│   ├── components/
│   │   ├── ui/              # primitive รับข้อความผ่าน props/slot: Button, Svg, Spinner, Loading
│   │   ├── input/           # ช่องกรอกที่มีข้อความของตัวเอง: TextField, Select
│   │   ├── modal/           # BaseModal, BaseBottomSheet, DefaultModal, PopupHeader และ engine ของ Dialog.create()
│   │   ├── layout/          # LayoutMobile + top bar + tab bar, mobileTabs.ts คือรายการแท็บ
│   │   └── features/        # component ที่รู้จัก domain แยกโฟลเดอร์ตาม feature (examples/ คือเนื้อหาหน้าตัวอย่าง UI, guide/ คือเนื้อหาของหน้าคู่มือ)
│   ├── composables/         # useLineLogin (flow login LINE) และ helper ทั่วไป (useCountdown, useDebouncedRef, ...)
│   ├── mutations/           # defineMutation ของ Pinia Colada (auth.ts: useLogin)
│   ├── queries/             # key factory + defineQueryOptions (ยังว่างใน template)
│   ├── stores/              # state ทั้งแอป: auth (token), liff (init LIFF), loading (overlay กลาง)
│   ├── utils/               # ฟังก์ชัน pure (format.ts คือ formatter ตัวเลขและวันที่ทั้งหมด)
│   ├── pages/               # หน้าทั้งหมด (file-based routing)
│   ├── router/              # index.ts (guard), loadingGuard.ts, dynamicTitleGuard.ts, meta.d.ts
│   ├── App.vue              # LayoutMobile + RouterView + DialogHost + Loading
│   └── main.ts              # ลงทะเบียน Pinia, Pinia Colada, router, vue-dompurify-html
├── typed-router.d.ts        # สร้างอัตโนมัติจาก src/pages/ ห้ามแก้เอง
├── vite.config.ts           # plugin, alias @/, proxy /api, __APP_BUILD_TIME__
└── vitest.config.ts         # jsdom, spec อยู่ข้างไฟล์ที่ทดสอบ
```

## Route และ Layout

- ไฟล์ใน `src/pages/` จะกลายเป็น route อัตโนมัติ
  - `pages/(landing).vue` → `/` (ชื่อ route `'/(landing)'`) หน้าแรกที่เปิดแอป ถ้าตั้ง `VITE_LIFF_ID` จะ login ด้วย LINE แล้วไปต่อเอง ถ้าไม่ตั้งจะไป `/home` (หรือหน้าที่ฝากไว้ใน `?redirect=`)
  - `pages/home.vue` → `/home` แท็บแรก หน้าตัวอย่าง มีปุ่มไปคู่มือ (และปุ่มไป `/examples` เฉพาะ mode development)
  - `pages/guide.vue` → `/guide` คู่มือการต่อยอดจาก template พร้อมตัวอย่างโค้ด เปิดจากปุ่มในหน้าแรก (เนื้อหาอยู่ใน `components/features/guide/implementationGuide.ts`) เริ่มโปรเจคจริงให้ลบหน้านี้พร้อม `components/features/guide/`
  - `pages/profile.vue` → `/profile` แท็บที่สอง หน้าตัวอย่าง
  - `pages/unauthorized.vue` → `/unauthorized` ปลายทางของลิงก์ที่ไม่ตรงหน้าไหน ปุ่มล้าง session
  - `pages/version.vue` → `/version` เปิดได้ทุกคนโดยไม่ต้องมี token แสดงเวอร์ชัน (`VITE_APP_VERSION`) environment (`VITE_BUILD_MODE`) และเวลาที่ build (`__APP_BUILD_TIME__`) ให้ support อ่านจากมือถือลูกค้าได้
  - `pages/examples.vue` + `pages/examples/` → หน้าตัวอย่าง UI สำหรับรีวิว component: `/examples` (รายการ), `/examples/button`, `/examples/input`, `/examples/select`, `/examples/popup` เปิดได้เฉพาะ Vite mode `development` (local และเว็บ development) mode อื่น guard ส่งไป `/unauthorized`
- ชื่อ route เก็บวงเล็บของ group ไว้ด้วย เช่น `'/(landing)'` ดูชื่อทั้งหมดได้ใน `typed-router.d.ts`
- เปลี่ยนหน้าด้วย `router.replace({ name: '...' })` เสมอ ห้ามใช้ `router.push()`
- ตั้งค่าหน้าใน `definePage({ meta: { ... } })` field ของ `meta` ประกาศไว้ใน `src/router/meta.d.ts`
  - `title` ชื่อบน top bar, `backTo` route ของปุ่มย้อนกลับ (มีค่า = top bar แบบปุ่มย้อนกลับ + ชื่อ, ไม่มี = แบบ logo), `hideBack` ซ่อนแค่ปุ่ม
  - `current` แท็บที่หน้านี้อยู่ (`home` | `profile`), `hideTopBar`, `hideTabBar`, `hideLogo`, `overlapTopBar`
  - `requiresAuth` ต้องมี token ถ้าไม่มี guard ส่งไปหน้า landing พร้อม `?redirect=` กลับมาหน้านี้ ตั้งที่ layout route แล้วหน้าลูกได้ไปด้วย
- `LayoutMobile.vue` คือ shell เดียวของแอป คอลัมน์กว้างไม่เกิน 640px อยู่กลางจอ พื้นหลังของคอลัมน์คือ `bg-canvas` ส่วนพื้นที่ด้านข้างบนจอกว้างคือ `bg-page` (ตั้งที่ `<html>`) แยกสีกันได้
- เพิ่มแท็บใหม่ที่ `src/components/layout/mobileTabs.ts` แล้วตั้ง `meta.current` ของหน้านั้น

## Dialog

เรียก popup จากที่ไหนก็ได้ด้วย `Dialog.create()` ไม่ต้องวาง component ไว้ในหน้า (`<DialogHost />` อยู่ใน `App.vue` แล้ว)

```ts
Dialog.create({
  component: DefaultModal,
  componentProps: {
    type: 'question', // 'success' | 'question' | 'alert' | 'error'
    title: 'ยืนยันการทำรายการ',
    content: 'ต้องการทำรายการนี้ใช่หรือไม่',
    buttons: [
      { action: 'cancel', text: 'ยกเลิก' },
      { action: 'submit', text: 'ยืนยัน' },
    ],
  },
})
  .onOk(() => {})
  .onCancel(() => {})
```

- popup ของตัวเอง: ประกาศ `defineEmits<DialogComponentEmit>()` เรียก `useDialogComponent(emit)` แล้วผูก `visible` กับ `<BaseModal v-model>` หรือ `<BaseBottomSheet v-model>` ดูตัวอย่างที่ `components/features/examples/ExampleSheetDialog.vue`
- error จาก API ใช้ `showErrorDialog({ error })` ข้อความมาจาก backend เอง ถ้าเป็น 401 ปิด popup แล้วจะล้าง session และโหลดหน้าใหม่

## Convention

- ใช้ Composition API + `<script setup lang="ts">` ห้าม Options API
- ระบุ type ของ `ref` ทุกครั้ง เช่น `ref<number>(0)`
- ใช้ `interface` แทน `type` และวาง type ไว้ข้างโค้ดที่ใช้
- ใช้ Tailwind class เป็นหลัก และใช้ semantic token (`bg-surface`, `text-content`, `bg-brand`) ห้ามใช้เฉดสีดิบ ดู token ทั้งหมดใน `src/assets/main.css` และ skill `design-tokens`
- ข้อความที่ผู้ใช้เห็นเป็นภาษาไทยเขียนตรงใน template ไม่มี i18n
- ใช้ named export, ฟังก์ชันตั้งชื่อด้วย `function`, arrow function เฉพาะ callback
- ตัวเลข/วันที่ผ่าน `src/utils/format.ts`
- util, composable, store และ `components/ui/` ทุกตัวต้องมี spec วางข้างไฟล์ (`Button.vue` + `Button.spec.ts`)
- จัด format ด้วย `pnpm run format` (oxfmt) และตรวจด้วย `pnpm run lint`

## Path alias

`@/` ชี้ไปที่ `src/` เช่น `import Svg from '@/components/ui/Svg.vue'` ตั้งค่าไว้ทั้งใน `vite.config.ts` (`resolve.alias`) และ `tsconfig.app.json` (`paths`) ถ้าจะแก้ต้องแก้สองที่ด้วยกัน

import ที่ออกนอกโฟลเดอร์ปัจจุบันต้องใช้ `@/` เสมอ (`../` ผิดกฎ lint) import ในโฟลเดอร์เดียวกันใช้ `./`

## คำสั่งที่ใช้บ่อย

| คำสั่ง                              | ทำอะไร                      |
| ----------------------------------- | --------------------------- |
| `pnpm dev`                          | เปิด dev server             |
| `pnpm run build`                    | type-check แล้ว build       |
| `pnpm run type-check`               | `vue-tsc` ตรวจ type ทั้งหมด |
| `pnpm run test`                     | รัน Vitest ทั้งหมด          |
| `pnpm run lint` / `pnpm run format` | oxlint + eslint / oxfmt     |

เพิ่มหรือเปลี่ยนชื่อหน้าแล้วให้รัน `pnpm dev` หรือ `pnpm run build` ก่อน `type-check` หนึ่งครั้ง เพื่อให้ `typed-router.d.ts` มีชื่อ route ใหม่

## Package หลัก

| ใช้อะไร        | package                                     |
| -------------- | ------------------------------------------- |
| UI / routing   | vue, vue-router (file-based routing ในตัว)  |
| state          | pinia (global), @pinia/colada (async/query) |
| style          | tailwindcss v4 (`@tailwindcss/vite`)        |
| ยูทิลิตี้      | @vueuse/core, dayjs, axios                  |
| LINE / เนื้อหา | @line/liff, vue-dompurify-html              |
| ทดสอบ          | vitest, @vue/test-utils, jsdom              |
