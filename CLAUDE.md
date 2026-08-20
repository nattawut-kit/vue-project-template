# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project

Vue 3 + TypeScript + Vite starter template for ChocoCRM mobile-web loyalty apps (Thai UI, phone shell capped at 640px). It is a **template** that gets forked into real projects — prefer the smallest thing that works over speculative abstraction. Package manager is **yarn**. Worked on from both Windows and macOS.

## Commands

```bash
yarn dev          # Vite dev server (host: true — LAN/tunnel accessible)
yarn build        # vue-tsc -b && vite build
yarn preview      # serve the production build
yarn lint         # eslint .   (lint:fix to autofix)
yarn type-check   # vue-tsc -b on its own, faster than a full build
yarn format       # prettier --write src/   (format:check to verify)
```

No test runner. `lint` + `type-check` (+ `build`) are the full verification set — run at least the first two after non-trivial changes.

### Generated files (hits often)

`unplugin-auto-import` / `unplugin-vue-components` regenerate `auto-imports.d.ts`, `components.d.ts` and `.eslintrc-auto-import.json` on dev/build. All three are committed, so they go dirty after adding an auto-imported name — regenerate and commit them, don't leave them stale (a stale commit breaks `yarn type-check` for anyone who hasn't run dev/build).

- After **adding** an auto-imported export or component, run `yarn dev`/`yarn build` once before lint/type-check, or the name won't resolve (`no-undef`, `TS2304`).
- The plugins merge and never prune, so after **removing/renaming** an export, delete all three first:

  ```bash
  rm -f auto-imports.d.ts components.d.ts .eslintrc-auto-import.json && npx vite build
  ```

### ESLint / misc

Flat config only (`eslint.config.js`); ESLint 10 ignores `.eslintrc.*`, so don't add one. It reads `.eslintrc-auto-import.json` at startup for the auto-import globals. `skipFormatting` (`@vue/eslint-config-prettier`) must stay **last** in the config array — Prettier is the sole formatting authority (runs on save in VS Code).

Line endings forced to LF via `.gitattributes`. Dev server `allowedHosts` already permits `*.trycloudflare.com` / `*.coreblack.net` for mobile tunnel testing.

## Architecture

### File-based routing + layouts (no route table)

`src/routers/index.ts` is fully generated and never lists routes: `vite-plugin-pages` maps `src/pages/**` (excluding `_components/`), then `vite-plugin-vue-layouts-next` wraps per the `layout` meta key. Add a page by adding a file; never hand-edit the router.

Each page ends with a `<route lang="yaml">` block — its whole configuration contract. Copy `src/pages/home/index.vue` rather than inventing keys:

```yaml
meta:
  layout: default        # -> src/layouts/default.vue | blank -> _blank.vue
  navtop:
    back_to: '/home'     # empty string = no back button
    title: 'ชื่อหน้า'     # may contain <br> (rendered via v-dompurify-html)
    show_point: false    # optional; with type_point: 'สิทธิ์สะสม' | 'คะแนนสะสม'
  main:
    image: true
  navbottom:
    active: true         # show bottom tab bar
    current: 'home'      # home | privilege | history | profile
```

`src/types/router.d.ts` augments `RouteMeta` with this exact shape, so a misspelled key fails `yarn type-check` — add new meta keys there too. `navtop`/`main`/`navbottom` are all optional (blank-layout pages declare none), so read `route.meta.navtop?.foo`.

### Layout chain

`src/layouts/default.vue` → `layouts/components/DefaultLayout.vue` → `HorizontalLayout.vue` (renders `NavbarTopLayout` + scrollable slot + `NavbarBottomLayout`, reading `route.meta` directly — layout behavior comes from the page's `<route>` block, not from props). The 640px `max-width` lives in those three layout components — keep them in sync. `src/layouts/_blank.vue` is a bare `<RouterView>` (used by `src/pages/index.vue`, which redirects to `/home`).

Two deliberate things not to undo: `<router-view :key="route.path">` in both `App.vue` and `DefaultLayout.vue` (commit f2852fb, fixes an `insertBefore` remount race), and the absence of page transitions (fade and slide were both prototyped and rejected).

### Dynamic header title

`src/composables/useHeaderTitle.ts` keeps `dynamicTitle` / `titleLoading` as **module-level refs** — an app-wide singleton, not per-component state. A page calls `setHeaderTitle(...)` after its fetch; `NavbarTopLayout` resolves `dynamicTitle || metaNavtopInfo?.title || route.meta.navtop?.title`. `router.afterEach` calls `resetHeaderTitle()` on every navigation, so set the title in `onMounted`/after the fetch, never before navigation settles. Reference: `src/pages/header-demo.vue`.

### Global dialog (`Dialog.create`)

Programmatic modals — nothing to mount per page. `src/utils/dialog.ts` is the engine: `Dialog.create({ component, componentProps? })` pushes an entry onto a module-level stack and returns a chainable handle.

```ts
import DefaultModal from '@/components/modal/DefaultModal.vue'

Dialog.create({
  component: DefaultModal,
  componentProps: {
    type: 'question', // success | question | alert | cancel
    title: 'ยืนยันการทำรายการ',
    content: 'ต้องการบันทึกข้อมูลนี้หรือไม่', // ผ่าน v-dompurify-html — ใส่ <br> ได้
    buttons: [
      { action: 'cancel', text: 'ยกเลิก' },
      { action: 'submit', text: 'ยืนยัน' },
    ],
  },
})
  .onOk(() => {})
  .onCancel(() => {})
```

Three hooks, all chainable and all optional: `onOk`, `onCancel`, and `onDismiss((result, payload) => …)` which fires on *every* close (cleanup that must run either way). Both outcomes carry an optional payload, and `Dialog.create<TCancel, TOk>()` types it so call sites don't cast — **`TCancel` comes first** because the cancel path is the one that usually needs a reason, so one type argument is normally enough:

```ts
Dialog.create<{ reason: 'expired' | 'close' }>({ component: CouponModal })
  .onCancel(payload => payload?.reason === 'expired')
```

Skipping the generics is fine too: `payload` is then `unknown` and you narrow at the point of use, the same way `validate` is handled in the api layer. Often you need neither — the data the caller wants is already in its own scope (see `handleOpenCoupon` in `src/pages/example.vue`, whose `onOk` reads the page's own `couponDataList`).

**Closing without user interaction** needs nothing extra from the engine — a modal calls `onDialogOk()`/`onDialogCancel()` whenever it likes (countdown expiry, a websocket event, a watcher) and puts the reason in the payload so the caller can tell it apart from a button press. `src/pages/_components/ExampleCouponModal.vue` is that case end to end: a coupon code with a countdown that closes itself with `{ reason: 'expired' }`. Clear your own timers in `onUnmounted` — the component stays alive for `LEAVE_DURATION` after closing.

The dialog component is imported **explicitly** — auto-registration only covers templates, and `componentProps` is `Record<string, unknown>` (typed by the component itself).

**Shortcut for the standard popup.** `showDialog` / `showDialogError` (same file) hardwire `DefaultModal`, so a page needs no component import and no `componentProps` nesting. Positional args are deliberate — they match the signature used in the chua-hah-seng project so pages port over unchanged:

```ts
showDialog(
  'success',
  'อัปเดตข้อมูลสำเร็จ',
  'คุณได้ทำการอัปเดตข้อมูลเรียบร้อยแล้ว',
  [{ action: 'submit', text: 'ปิด' }],
  async () => {
    await customerStore.fetchCustomerInfo()
    router.push({ name: 'profile' })
  }
)

const { title, message } = getErrorDisplay(e)
showDialogError(title, message) // type 'cancel', one button — or call it with no args at all
```

Both return the `Dialog.create` handle, so `.onDismiss()` still chains. Two things to know: passing `submit` while leaving `buttons` out needs an `undefined` hole (the cost of positional args), and these only ever render `DefaultModal` — a custom modal always goes through `Dialog.create` directly. Because of them `src/utils/dialog.ts` imports `DefaultModal.vue`, which is why the dialog UI now sits in the main chunk instead of a lazy one.

Three pieces:

- `src/utils/dialog.ts` — `Dialog.create`, `closeAllDialogs`, the `activeDialogs` stack (`shallowRef` + array reassignment, so component definitions never get proxied), and `LEAVE_DURATION` (250ms — must stay above `BaseModal`'s 0.2s close transition; the entry leaves the stack that long after closing).
- `src/components/modal/DialogHost.vue` — mounted once in `App.vue`, renders the stack and listens for each dialog's `ok`/`cancel` emit. Multiple dialogs may be open at once; later ones paint on top by DOM order.
- `src/composables/useDialogComponent.ts` — what a dialog component calls, passing its own `emit` in: `useDialogComponent(emit)` returns `{ visible, onDialogOk, onDialogCancel }` (both handlers take an optional payload). `visible` starts `false` and flips `true` on mount so the enter transition plays; closing settles once (later calls are ignored), emits immediately, then unmounts after the transition. `visible` going `false` on its own (backdrop/ESC) counts as **cancel**.

The `emit` hand-off is why every dialog component declares `defineEmits<{ ok: [payload?: unknown]; cancel: [payload?: unknown] }>()` — three lines of boilerplate that buy a single host component (`provide`/`inject` would need a wrapper component per dialog, since `provide` runs once per instance and can't vary across a `v-for`). `DialogComponentEmit` is written as overloads to match what `defineEmits` generates; a plain union signature won't assign.

**Navigation closes everything.** `DialogHost` watches `route.path` and calls `closeAllDialogs()` — dialogs live outside `RouterView`, so without it a modal left open would sit on top of the next page (browser back on a coupon popup, for one). That teardown fires **no** callbacks: not `onCancel`, not `onDismiss` — it isn't a user outcome. Consequence to know: opening a dialog and navigating in the same tick kills the dialog. (Quasar behaves differently here — `Dialog.create` renders outside the app tree and survives route changes; what it hooks instead is the browser history, so back closes the top overlay rather than leaving the page. Worth revisiting if that's the UX you want.)

UI side, `src/components/modal/BaseModal.vue` is the shared shell — backdrop, centered 327px panel (`max-w-81.75`), `Teleport to="body"`, ESC/backdrop close (a shake animation instead when both are off), focus handling — with **no padding and no dialog logic**; everything visible comes from the slot. `DefaultModal.vue` is the standard popup (icon band per `type`, title, content, 1–2 buttons) built on it, and any custom modal (`SelectAddressModal`, …) is the same shape:

```vue
<template>
  <BaseModal v-model="visible">
    <!-- custom UI -->
  </BaseModal>
</template>

<script setup lang="ts">
  const emit = defineEmits<{
    ok: [payload?: unknown]
    cancel: [payload?: unknown]
  }>()

  const { visible, onDialogOk, onDialogCancel } = useDialogComponent(emit)
</script>
```

Two `DefaultModal` decisions worth keeping: backdrop/ESC close are **off** (a `success` popup whose `onOk` navigates must not be dismissable in a way that skips the callback — so `buttons: []` makes it unclosable), and `type: 'cancel'` defaults its copy to `เกิดข้อผิดพลาด` / `กรุณาลองใหม่อีกครั้ง` so error popups can pass none. Shared UI types (`DialogType`, `DialogButtonAction`, `IDialogButton`) live in `src/model/interfaces/dialog.ts`, engine types stay in `src/utils/dialog.ts`; both are auto-imported.

The old `useDialog().confirm()` singleton (two buttons, one global `<Modal>`) is gone — this replaced it.

### Pinia stores

`app.use(createPinia())` in `main.ts`. Stores are **setup-style** (`defineStore('id', () => {...})`) to match the 100% `<script setup>` codebase. Each store file needs an explicit `import { defineStore } from 'pinia'` (pinia is deliberately not auto-imported), but `src/stores/**` is auto-imported, so `useXxxStore` is ambient at call sites. Reference: `src/stores/useCustomerInformationStore.ts`.

### Base UI components

Category folders under `src/components/` (chosen by usage, not component type, and meant to hold future additions):

- `common/` — general-purpose (`Button.vue`)
- `form/` — user input (`Input.vue`; future `Checkbox`/`Radio`/`Select`)
- `modal/` — the dialog system: `BaseModal.vue`, `DefaultModal.vue`, `DialogHost.vue` (see above)
- `media/`, `content/` — reserved (images/SVGs; banners/cards); create when the first real component lands
- `icons/` — see the convention comment atop `IconHouse.vue`: no hardcoded size (size via parent `w-*`/`h-*`), `currentColor` for fill/stroke

Nested folders register flatly, so `common/Button.vue` is `<Button>` — no `vite.config.ts` change when adding to an existing folder.

Style with Tailwind utilities in the template; a scoped `<style lang="scss">` block is only an escape hatch for what utilities can't express (see `BaseModal.vue`'s transition classes). Variants are conditional class arrays in a local `computed` (see `Button.vue`) — no `cva`-style library until there's a real case.

### HTTP client

`src/api/index.ts` wraps one axios instance (`baseURL` from `VITE_API_BASE_URL`, 30s timeout). Plain exported functions, no class: `apiGet`/`apiPost`/`apiPut`/`apiPatch`/`apiDelete`, `isApiError`/`isTimeoutError`/`isCanceledError`/`getErrorDisplay`, plus the types — all ambient via the `./src/api/**` auto-import entry.

**Envelope.** The backend answers `{ request_id?, status: 'success' | 'fail', data, error }` (`ApiEnvelope<T>`, discriminated on `status`). The verb helpers unwrap it, so `<T>` is the type of `data`:

```ts
const res = await apiGet<IStoreListResult>('/api/v1/Privilege/GetStoreList', {
  params: { start, limit: 6 },
})
// res is the payload itself — no `.data` hop
```

**One error shape.** Every failure — 4xx/5xx, network, timeout, cancel, and a `status: 'fail'` body under HTTP 200 — rejects with `ApiErrorResponse`, so one `catch` per call site. Narrow with `isApiError(err)` (`isTimeoutError`/`isCanceledError` are shorthands) since `catch` is `unknown`.

`ApiErrorResponse` is `{ code, subcode, http_status, system, message, locale, validate }`. Two traps:

- **`code` is `number | string`** — the backend sends numbers (`1000400`); string codes (`'TIMEOUT'`, `'ERR_NETWORK'`, `'ERR_CANCELED'`, raw axios codes) are synthesized client-side. Don't assume either.
- **`locale` holds the user-facing copy** (`{ 'th-th': { title, message }, 'en-us': {...} }`); top-level `message` is technical English, not for display. Always render via `getErrorDisplay(err)` (resolves exact locale → same language → `en-us` → first available → `{ system, message }`). Client-synthesized errors carry their own `locale`, which keeps `getErrorDisplay` single-path — the one place Thai copy legitimately lives in the transport layer.

```ts
try {
  const cards = await apiGet<ICard[]>('/api/v1/Customer/GetLinkedCards')
} catch (e) {
  const { title, message } = getErrorDisplay(e)   // 'ข้อมูลไม่ถูกต้อง' / 'ไม่พบข้อมูลบัตรสมาชิก...'
}
```

`validate` is `unknown` (endpoint-specific field errors) — narrow it where consumed.

**Call sites.** `src/api/` holds the client only. Pages call the verb helpers **inside their own fetch function with the URL inline** — deliberate, since one call site per endpoint makes a resource module pure indirection. Extract to a sibling module (`src/api/banner.ts`, same auto-import entry — a move, not a rewrite) only once a second page calls it. Same rule for response interfaces: declare in `<script setup>`, promote to `src/model/interfaces/` when a second page needs them.

FormData works as-is (the `Content-Type` default is stripped so the browser sets the boundary). Deliberately absent: retry, caching, auth-token injection — add a request interceptor when real auth exists.

### Environment variables

`env.d.ts` (repo root) types `import.meta.env.VITE_API_BASE_URL` — add new `VITE_*` vars there or they won't typecheck. Only `VITE_`-prefixed vars reach client code. `.env` is gitignored and there is intentionally no `.env.example` (ask before adding one).

### Auto-imports — don't write import statements for these

`unplugin-auto-import` injects `vue` + `vue-router` APIs and everything exported from `src/composables/**`, `src/model/interfaces/**`, `src/utils/**`, `src/stores/**`, `src/api/**` — exported **types** included (`src/constants/**` is commented out in `vite.config.ts`; uncomment if that dir appears). `unplugin-vue-components` registers every SFC under `src/components/` and `src/views/`. So `ref`, `useRoute`, `useHeaderTitle`, `formatDate`, `apiGet`, `ApiErrorResponse`, `<Button />` etc. are used bare.

`@vueuse/core` and `pinia` are installed but **deliberately not** auto-imported — import them explicitly. `@` aliases to `src/`.

## Styling and design tokens

Defined in `src/style.css` via Tailwind v4's CSS-first `@theme` (no `tailwind.config.js` — v4 doesn't use one). That block is the source of truth; don't hardcode the values elsewhere.

- **Colors** — `main-1..4`, `error-1/2`, `gray-50..900` (the grays *override* Tailwind's built-in scale, so every `gray-*` utility already uses the project palette). No `brand-*` naming — deliberately removed.
- **Font** — `DBHeavent` (`--font-sans`) from `src/assets/fonts/`, weights 300/400/700 as `font-light`/`font-regular`/`font-bold`.
- **Type scale** — `text-12`..`text-28` with `body { line-height: 100% }` (line-height = font-size). Tailwind's own named sizes are untouched; prefer the numeric scale for new UI text.

## Conventions

- **Formatting** (Prettier, on save): no semicolons, single quotes, 100 cols, 2-space indent, `vueIndentScriptAndStyle: true`, `singleAttributePerLine: true`, `arrowParens: 'avoid'`.
- **SFC block order**: `<template>` → `<script setup lang="ts">` → `<style scoped lang="scss">` (`vue/block-order`); `<script>` always needs `lang="ts"` (`vue/block-lang`).
- Template attributes hyphenated (`:meta-navtop-info`), props camelCase (`vue/attribute-hyphenation`). `defineProps` first in `<script setup>` (`vue/define-macros-order`); every prop needs a default (`vue/require-default-prop`).
- **Avoid `any`** — use `unknown` and narrow. `useRoute()`/`useRouter()` and route meta are fully typed, so never cast them.
- **HTML from data** goes through `v-dompurify-html` (registered in `main.ts` with `svg`/`mathml` configs), not `v-html`.
- **Dates**: `formatDate` in `src/utils/dayjs.ts` defaults to Thai locale and **adds 543 years** (Buddhist era); pass `'en'` for Gregorian.
- **Rich text**: `li[data-list='ordered'|'bullet'|'unchecked']` and `.ql-align-*` in `style.css` style Quill.js-authored HTML only.
- UI copy and comments are often Thai; keep new user-facing strings in Thai.
