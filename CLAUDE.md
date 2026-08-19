# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vue 3 + TypeScript + Vite starter template for ChocoCRM mobile-web loyalty apps (Thai-language UI, phone-width shell capped at 640px). It is a **template** — it gets forked into real projects, so prefer the smallest thing that works over speculative abstraction. Package manager is **yarn** (`yarn.lock`). Worked on from both Windows and macOS.

## Commands

```bash
yarn dev          # Vite dev server (host: true — LAN/tunnel accessible)
yarn build        # vue-tsc -b (typecheck) && vite build
yarn preview      # serve the production build
yarn lint         # eslint . — keep it clean
yarn lint:fix     # eslint . --fix
yarn type-check   # vue-tsc -b on its own, faster than a full build
yarn format       # prettier --write src/
yarn format:check # prettier --check src/
```

There is no test runner. `lint`, `type-check` and `build` are the full verification set — run at least lint and type-check after non-trivial changes.

### The generated-files gotcha (hits often — read this)

`unplugin-auto-import` / `unplugin-vue-components` generate `auto-imports.d.ts`, `components.d.ts` and `.eslintrc-auto-import.json` on dev/build. All three are committed, so they show up dirty in `git status` after adding an auto-imported name — that is expected; regenerate and commit them rather than leaving them stale (a stale commit breaks `yarn type-check` for anyone who has not run dev/build yet).

Two consequences:

- After adding a new auto-imported export (composable, store, util, api function) or a new component, run `yarn dev` or `yarn build` **once** before `yarn lint` / `yarn type-check`, or the new name won't resolve (`no-undef` in lint, `TS2304` in type-check).
- The plugins **merge into** those files and never prune. After *removing* or renaming an export, a normal rebuild leaves the dead entry behind. Delete all three files first, then rebuild:

  ```bash
  rm -f auto-imports.d.ts components.d.ts .eslintrc-auto-import.json && npx vite build
  ```

### ESLint

Flat config (`eslint.config.js`). ESLint 10 does not read `.eslintrc.*` at all, so don't add one. Two things matter if you touch it:

- It reads `.eslintrc-auto-import.json` at startup for the auto-import globals (see above).
- `skipFormatting` (`@vue/eslint-config-prettier`) must stay **last** in the config array — it turns off every rule Prettier owns. There are no formatting rules in `eslint.config.js`; Prettier is the sole formatting authority, and VS Code runs it on save.

Line endings are forced to LF via `.gitattributes` (`* text=auto eol=lf`), independent of any developer's `core.autocrlf`.

Dev server `allowedHosts` already permits `*.trycloudflare.com` and `*.coreblack.net` for tunnel-based mobile testing.

## Architecture

### File-based routing + layouts (no route table)

`src/routers/index.ts` is fully generated — it never lists routes. `vite-plugin-pages` turns `src/pages/**` into routes (`_components/` subfolders are excluded), then `vite-plugin-vue-layouts-next` wraps them per the `layout` meta key. Add a page by adding a file under `src/pages/`; never hand-edit the router to register it.

Every page ends with a `<route lang="yaml">` block that is its whole configuration contract. Copy an existing page (`src/pages/home/index.vue`) rather than inventing keys:

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

`src/types/router.d.ts` augments vue-router's `RouteMeta` with this exact shape, so the block above is type-checked — a misspelled key or wrong `current` value fails `yarn type-check`. Add new meta keys there too, or reads of them won't typecheck. All of `navtop`, `main` and `navbottom` are optional in the type (pages on the `blank` layout declare none of them), so read `route.meta.navtop?.foo`, never `route.meta.navtop.foo`.

### Layout chain

`src/layouts/default.vue` (async-imports) → `layouts/components/DefaultLayout.vue` → `HorizontalLayout.vue`, which renders `NavbarTopLayout` + scrollable slot + `NavbarBottomLayout` and reads `route.meta.navtop` / `route.meta.navbottom` directly. Layout behavior is driven by the page's `<route>` block, not by props passed down from the page. The app shell is capped at `max-width: 640px` across `HorizontalLayout`, `NavbarTopLayout` and `NavbarBottomLayout` — keep those three in sync if it ever changes.

`src/layouts/_blank.vue` is a bare `<RouterView>` (used by `src/pages/index.vue`, which just redirects to `/home`).

Both `App.vue` and `DefaultLayout.vue` render `<router-view>` with `:key="route.path"`. That keying is deliberate (commit f2852fb, fixing an `insertBefore` remount race) — don't remove it.

There is intentionally **no page-transition animation**. Fade and slide were both prototyped and rejected; don't reintroduce one unless asked.

### Dynamic header title

`src/composables/useHeaderTitle.ts` holds `dynamicTitle` / `titleLoading` as **module-level refs** — a singleton shared app-wide, not per-component state. A page that fetches its title calls `setHeaderTitle(...)` and toggles `titleLoading`; `NavbarTopLayout` resolves `dynamicTitle || metaNavtopInfo?.title || route.meta.navtop?.title`. `router.afterEach` calls `resetHeaderTitle()` on every navigation, so a page must set its title in `onMounted`/after its fetch, never before navigation settles. See `src/pages/header-demo.vue` for the reference pattern.

### Global dialog (`useDialog`) + Modal — UNSETTLED, pending redesign

> **The current Modal / `useDialog` pair is not what the project wants yet.** It is a placeholder awaiting a rework — treat it as provisional, not as settled API. Don't build new features on top of it, and don't invest in extending it (extra buttons, variants, new options); raise the redesign instead. Reading the notes below is still worth it, because the *reasons* behind the current split are what the rework has to preserve.

`src/composables/useDialog.ts` is the same module-level-singleton pattern as `useHeaderTitle`, not a Pinia store — this is ephemeral UI trigger state, not app data. `await useDialog().confirm({ title?, message, confirmText?, cancelText? })` works from anywhere with no import and resolves `true`/`false` based on which button the user pressed. One `<Modal>` instance is mounted globally in `App.vue`, wired to `useDialog()`'s state — the only place the dialog's title/message/buttons are rendered. It always renders two buttons, which is one of the known gaps (an error popup wants one).

`src/components/modal/Modal.vue` is a separate, reusable presentational shell (`v-model`, `Teleport to="body"`, ESC/backdrop close, basic focus in/out handling) with no dialog-specific logic — usable directly with its own slot content wherever a custom modal is needed, independent of `useDialog`. The previous "Dialog" feature was ripped out unfinished (commit 144a121) partly for baking too much into one component; whatever replaces the current pair should keep that separation, and should not become a global `showDialog()`-style API that renders arbitrary content — that's what plain `<Modal v-model="...">` is for.

### Pinia stores

`app.use(createPinia())` in `main.ts`. Stores are **setup-style** (`defineStore('id', () => {...})`, not options stores) to match the rest of the codebase being 100% `<script setup>`. `defineStore` itself needs an explicit `import { defineStore } from 'pinia'` in each store file — `pinia` is deliberately not in the auto-import list — but `./src/stores/**` is, so every exported `useXxxStore` is still ambient at call sites with no import line, same as `useHeaderTitle`. `src/stores/useCustomerInformationStore.ts` is the reference example (`name`, `age`, `setCustomerInformation`).

### Base UI components

Category folders under `src/components/`, chosen deliberately (not by component type alone) and meant to hold future additions too:

- `common/` — general-purpose, not tied to a specific usage (`Button.vue`)
- `form/` — user-input components (`Input.vue`; future `Checkbox`/`Radio`/`Select` land here)
- `modal/` — `Modal.vue` (see the caveat above)
- `media/`, `content/` — reserved for future components (images/SVGs; banners/cards) — don't exist yet, create them when the first real component in that category is built
- `icons/` — existing, unrelated to the above; see the convention comment atop `IconHouse.vue` (no hardcoded size — size via the parent's `w-*`/`h-*` classes; `currentColor` for fill/stroke so color follows `text-*`)

`unplugin-vue-components` registers nested subdirectories under `src/components/` flatly regardless of depth, so `src/components/common/Button.vue` resolves as `<Button>` — no `vite.config.ts` change needed when adding to an existing category folder.

Styling is Tailwind utility classes directly in the template (the default case); a scoped `<style lang="scss">` block is only an escape hatch for what Tailwind can't express as single utilities (see `Modal.vue`'s enter/leave transition classes). Variants use plain conditional class arrays via a local `computed` (see `Button.vue`) — no variant library (`cva` etc.) until there's a real case for it.

### HTTP client

`src/api/index.ts` wraps one axios instance (`baseURL` from `VITE_API_BASE_URL`, 30s timeout). Plain exported functions, no class — same shape as `dayjs.ts` — so `apiGet`/`apiPost`/`apiPut`/`apiPatch`/`apiDelete`, `isApiError`/`isTimeoutError`/`isCanceledError`/`getErrorDisplay`, and the types are all ambient via the `./src/api/**` auto-import entry.

**Envelope.** The ChocoCRM backend answers `{ request_id?, status: 'success' | 'fail', data, error }`, typed as `ApiEnvelope<T>` (a discriminated union on `status`). The verb helpers unwrap it, so the `<T>` you pass is the type of `data`, not of the whole body:

```ts
const res = await apiGet<IStoreListResult>('/api/v1/Privilege/GetStoreList', {
  params: { start, limit: 6 },
})
// res is the payload itself — no `.data` hop
```

**One error shape.** Every failure path — HTTP 4xx/5xx, network error, timeout, cancel, and a `status: 'fail'` body that arrived with HTTP 200 — rejects with the same `ApiErrorResponse`, so a call site needs exactly one `catch`. Since TS types `catch` as `unknown`, narrow with `isApiError(err)` before reading fields; `isTimeoutError(err)` / `isCanceledError(err)` are the shorthands.

`ApiErrorResponse` mirrors the backend contract: `{ code, subcode, http_status, system, message, locale, validate }`. Two things are easy to get wrong:

- **`code` is `number | string`.** The backend sends a *number* (`1000400`); the string codes (`'TIMEOUT'`, `'ERR_NETWORK'`, `'ERR_CANCELED'`, or a raw axios code) are synthesized client-side for failures the backend never saw. Both `e.code === 1000400` and `e.code === 'TIMEOUT'` typecheck — just don't assume one or the other.
- **`locale` carries the user-facing copy** (`{ 'th-th': { title, message }, 'en-us': {...} }`). Top-level `message` is the technical English reason and is *not* for display. Always render through `getErrorDisplay(err)`, which resolves exact locale → same language → `en-us` → first available → `{ system, message }`. Client-synthesized errors are built with their own `locale` block filled in, so `getErrorDisplay` has a single code path regardless of where the failure came from — the one place Thai copy legitimately lives in the transport layer, because there is no backend response to take it from.

```ts
try {
  const cards = await apiGet<ICard[]>('/api/v1/Customer/GetLinkedCards')
} catch (e) {
  const { title, message } = getErrorDisplay(e)   // 'ข้อมูลไม่ถูกต้อง' / 'ไม่พบข้อมูลบัตรสมาชิก...'
}
```

`validate` is typed `unknown` (field-level validation detail, endpoint-specific) — narrow it where you consume it rather than guessing a shape here.

**Call sites.** `src/api/` holds the client only. Pages call `apiGet`/`apiPost`/… **directly inside their own fetch function, with the URL inline** — deliberately, not as a stopgap: at one call site per endpoint a resource-module indirection buys nothing. Pull an endpoint into a sibling module (`src/api/banner.ts`) only once it is genuinely called from more than one page; those files are covered by the same auto-import entry, so the extraction is a move, not a rewrite. Same rule for response interfaces: declare them in `<script setup>` when a single page owns them, promote to `src/model/interfaces/` when a second page needs them.

FormData is handled automatically (the `Content-Type` default is stripped so the browser can set the multipart boundary) — just pass a `FormData` as the body. Deliberately absent: retry, caching, and auth-token injection — there is no auth in the template yet, so add a request interceptor when real auth exists rather than guessing a token header now.

### Environment variables

`env.d.ts` (repo root) types `import.meta.env.VITE_API_BASE_URL` — add new `VITE_*` vars there or they won't typecheck. `.env` is gitignored; there is no `.env.example` (intentionally — ask before adding one). Vite only exposes vars prefixed `VITE_` to client code.

### Auto-imports — don't write import statements for these

`unplugin-auto-import` injects `vue` and `vue-router` APIs, plus everything exported from `src/composables/**`, `src/model/interfaces/**`, `src/utils/**`, `src/stores/**`, and `src/api/**` (`src/constants/**` is commented out in `vite.config.ts` — uncomment there if that dir gets added). Exported **types** are ambient too, not just values. `unplugin-vue-components` auto-registers every SFC under `src/components/` and `src/views/`.

So `ref`, `computed`, `useRoute`, `useHeaderTitle`, `useDialog`, `formatDate`, `apiGet`, `ApiErrorResponse`, `<Button />`, `<IconHouse />` etc. are used bare, with no import.

`@vueuse/core` and `pinia` are installed as regular dependencies but **deliberately not** in the auto-import `imports` array — import them explicitly (`import { onClickOutside } from '@vueuse/core'`, `import { defineStore } from 'pinia'`) when you reach for them.

`@` aliases to `src/`.

## Styling and design tokens

Defined in `src/style.css` via Tailwind v4's CSS-first `@theme` (no `tailwind.config.js` — v4 doesn't use one; see the `@theme` block for the actual source of truth, don't hardcode these values elsewhere):

- **Colors** — `main-1..4`, `error-1/2`, and `gray-50..900` (the last one *overrides* Tailwind's built-in `gray` scale project-wide, so any `gray-*` utility anywhere already gets the project's grays for free). No `brand-*` naming — deliberately removed in favor of the actual project palette.
- **Font** — `DBHeavent` (`--font-sans`), loaded via `@font-face` from `src/assets/fonts/`, weights 300/400/700 exposed as `font-light`/`font-regular`/`font-bold`.
- **Type scale** — `text-12` through `text-28`, with `body { line-height: 100% }` making line-height equal font-size (tighter than Tailwind's own named scale, which is untouched — `text-sm`/`text-lg` etc. still use Tailwind's default ratios). Prefer the numeric scale for new UI text.

## Conventions

- **Formatting** (Prettier, enforced on save): no semicolons, single quotes, 100 cols, 2-space indent, `vueIndentScriptAndStyle: true` (script/style bodies indented one level inside their tags), `singleAttributePerLine: true`, `arrowParens: 'avoid'`.
- **SFC block order**: `<template>` → `<script setup lang="ts">` → `<style scoped lang="scss">`, enforced by `vue/block-order`. `<script>` always needs `lang="ts"` (`vue/block-lang`).
- Template attributes are hyphenated (`:meta-navtop-info`, not `:metaNavtopInfo`) while props stay camelCase (`vue/attribute-hyphenation`). `defineProps` must be the first statement in `<script setup>` (`vue/define-macros-order`), and every prop needs a default (`vue/require-default-prop`).
- **Avoid `any`** — use `unknown` and narrow. `useRoute()`/`useRouter()` are correctly typed and route meta is typed (see above), so casting to `any` is never needed for them.
- **HTML from data** goes through `v-dompurify-html` (registered in `main.ts` with `svg`/`mathml` named configs), not `v-html`.
- **Dates**: `formatDate` in `src/utils/dayjs.ts` defaults to Thai locale and **adds 543 years** (Buddhist era); pass `'en'` as the locale arg for Gregorian.
- **Rich text**: `li[data-list='ordered'|'bullet'|'unchecked']` and `.ql-align-*` classes in `style.css` exist to style Quill.js-authored HTML — only relevant where Quill output gets rendered.
- UI copy and code comments are frequently in Thai; keep new user-facing strings in Thai to match.
