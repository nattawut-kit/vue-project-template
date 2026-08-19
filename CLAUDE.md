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

### Global dialog (`useDialog`) + Modal — UNSETTLED, pending redesign

> Provisional placeholder, not settled API. Don't build features on it or extend it (extra buttons, variants, options) — raise the redesign instead. The *split* below is what a rework must preserve.

`useDialog.ts` is the same module-level singleton pattern as `useHeaderTitle` (ephemeral UI trigger state, not app data — hence not Pinia). `await useDialog().confirm({ title?, message, confirmText?, cancelText? })` works anywhere and resolves `true`/`false`. One `<Modal>` mounted globally in `App.vue` renders it — always two buttons, a known gap (error popups want one).

`src/components/modal/Modal.vue` is a separate presentational shell (`v-model`, `Teleport to="body"`, ESC/backdrop close, focus handling) with no dialog logic — use it directly with slot content for custom modals. The previous Dialog feature was ripped out unfinished (commit 144a121) partly for baking too much into one component; a replacement must not become a global `showDialog()` that renders arbitrary content.

### Pinia stores

`app.use(createPinia())` in `main.ts`. Stores are **setup-style** (`defineStore('id', () => {...})`) to match the 100% `<script setup>` codebase. Each store file needs an explicit `import { defineStore } from 'pinia'` (pinia is deliberately not auto-imported), but `src/stores/**` is auto-imported, so `useXxxStore` is ambient at call sites. Reference: `src/stores/useCustomerInformationStore.ts`.

### Base UI components

Category folders under `src/components/` (chosen by usage, not component type, and meant to hold future additions):

- `common/` — general-purpose (`Button.vue`)
- `form/` — user input (`Input.vue`; future `Checkbox`/`Radio`/`Select`)
- `modal/` — `Modal.vue` (see caveat above)
- `media/`, `content/` — reserved (images/SVGs; banners/cards); create when the first real component lands
- `icons/` — see the convention comment atop `IconHouse.vue`: no hardcoded size (size via parent `w-*`/`h-*`), `currentColor` for fill/stroke

Nested folders register flatly, so `common/Button.vue` is `<Button>` — no `vite.config.ts` change when adding to an existing folder.

Style with Tailwind utilities in the template; a scoped `<style lang="scss">` block is only an escape hatch for what utilities can't express (see `Modal.vue`'s transition classes). Variants are conditional class arrays in a local `computed` (see `Button.vue`) — no `cva`-style library until there's a real case.

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
