# Vue Project Template

The ChocoCRM starter for a new mobile web project: rolldown-powered Vite, TypeScript, file-based typed routing, Pinia for global state, Pinia Colada for async state, TailwindCSS v4, and Vitest. The structure comes from a shipped project (BCRM Ovaltine UHT), with every product feature and the product look taken out. A new project copies it, sets its tokens and builds its own pages.

The product is Thai only, no locale switching. There is no i18n layer: user-facing text is plain Thai written directly in templates and script blocks. Do not add a locale switcher, a message-key catalog or `vue-i18n`.

## Standards

MUST FOLLOW THESE RULES, NO EXCEPTIONS

- Stack: Vue.js, TypeScript, TailwindCSS v4, Vue Router, Pinia, Pinia Colada
- Patterns: ALWAYS use Composition API + `<script setup>`, NEVER use Options API
- ALWAYS Keep types alongside your code, use TypeScript for type safety, prefer `interface` over `type` for defining types
- ALWAYS write `ref<T>(...)` with an explicit type argument, even when TypeScript could infer it
- Keep unit and integration tests alongside the file they test: `src/components/ui/Button.vue` + `src/components/ui/Button.spec.ts`
- EVERY util, composable, store and `components/ui/` component MUST have a spec, see the `testing` skill
- ALWAYS use TailwindCSS classes rather than manual CSS
- NEVER use a raw Tailwind palette shade in a component, use the semantic design tokens (`bg-surface`, `text-content-subtle`, `ring-border`), see the `design-tokens` skill
- ONLY add meaningful comments that explain why something is done, not what it does
- The dev server usually runs on `http://localhost:5173` with HMR enabled. Do not launch a second one
- ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- ALWAYS prefer named exports over default exports
- ALWAYS import from the `@/` alias, it maps to `src/`, a parent relative `../` import is a lint error, see the `imports` skill
- User-facing text is plain Thai written directly in templates and script blocks, there is no message-key catalog
- ALWAYS update `docs/folder-structure.md` AND the Project Structure section below in the same change whenever the structure changes: a folder, page or route added, moved, renamed or removed, a new route `meta` field, a new layout or tab, or a new top-level package. A structure change without the docs update is not done
- ALWAYS walk the `edge-cases` skill checklist before calling a feature done, an unhandled empty, error or boundary case is a bug

## Starting a New Project From the Template

1. Copy the repo, rename `name` in `package.json` and `<title>` in `index.html`, replace `public/favicon.svg`
2. Copy `.env.example` to `.env.development` and fill it in. Leave `VITE_LIFF_ID` empty if the project has no LINE login
3. Theme it: the palette and the `--app-*` jobs in `src/assets/main.css`, the font, see the `design-tokens` skill
4. Replace the logo placeholder in `LayoutMobileTopBar.vue` and the tabs in `mobileTabs.ts`
5. Replace `pages/home.vue` and `pages/profile.vue` with the real pages, add `requiresAuth: true` where a login is needed, and delete the guide (`pages/guide.vue` with `components/features/guide/`)
6. Rewrite this file's intro and Project Structure, and `docs/folder-structure.md`, for the project

## Project Structure

Keep this section up to date with the project structure, and mirror every change in `docs/folder-structure.md` (the longer Thai guide). Use it as a reference to find files and directories.

```
public/ # Public static files (favicon, robots.txt, static images, etc.)
src/
├── api/ # MUST export individual functions that fetch data (client.ts holds the shared request helper, the ApiErrorResponse shape and TOKEN_STORAGE_KEY; auth.ts the LIFF token login)
├── components/
│   ├── ui/ # Base UI components that take their text through props and slots (Button, Svg, Spinner, Loading)
│   ├── modal/ # BaseModal, BaseBottomSheet, DefaultModal, PopupHeader (the type icon) + the Dialog.create() engine (dialog.ts, DialogHost, useDialogComponent) and showErrorDialog (errorDialog.ts)
│   ├── input/ # Composed form controls that own their own copy (TextField, Select)
│   ├── layout/ # The app shell (LayoutMobile + its top and tab bars, mobileTabs.ts lists the tabs)
│   └── features/ # Feature-specific components, one folder per feature (examples/ holds the UI example pages' content and ExampleSheetDialog, a custom dialog opened through Dialog.create; guide/ holds the guide page's GuideSection and its content in implementationGuide.ts)
├── composables/ # Composition functions, see composables/CLAUDE.md (useLineLogin is the LINE login flow, the rest are generic helpers)
├── stores/ # Pinia stores for global state (NOT data fetching): auth (the token), liff (LIFF init, opt-in through VITE_LIFF_ID), loading (the app-wide overlay)
├── queries/ # Pinia Colada key factories + defineQueryOptions (empty in the template, see the pinia-colada skill)
├── mutations/ # Pinia Colada defineMutation (auth.ts: useLogin)
├── pages/ # Page components (Vue Router file-based routing)
│   ├── (landing).vue # renders at /, the entry: runs the LINE login when VITE_LIFF_ID is set, otherwise goes to /home (or the parked ?redirect=)
│   ├── home.vue # renders at /home, the first bottom tab, a placeholder with a button to the guide (and one to /examples in development mode)
│   ├── guide.vue # renders at /guide, opened from the home page: the template's own guide, how to build on it with code examples (components/features/guide/implementationGuide.ts holds the content), delete it in a real project
│   ├── profile.vue # renders at /profile, the second bottom tab, a placeholder
│   ├── unauthorized.vue # renders at /unauthorized, the catch-all for a link that matches no page, its button clears the session
│   ├── version.vue # renders at /version, open to anyone: the app version (`VITE_APP_VERSION`), the environment (`VITE_BUILD_MODE`) and the build time (`__APP_BUILD_TIME__`, set in `vite.config.ts`), for support to read off a phone
│   ├── examples.vue # layout for the examples/ folder, holds a <RouterView />
│   └── examples/ # UI example pages for reviewing components: index.vue (/examples, the list), button.vue, input.vue, select.vue, popup.vue, open only in Vite mode `development`, the guard in `router/index.ts` sends them to `/unauthorized` otherwise
├── utils/ # Global utility pure functions (format.ts holds every number and date formatter)
├── assets/ # Static assets processed by Vite (main.css holds Tailwind + the design tokens; icons/ the svg icons Svg.vue loads by path: common/, tab-bar/, dialog/)
├── main.ts # Entry point, registers Pinia, Pinia Colada, the router and vue-dompurify-html
├── App.vue # Root component, mounts the layout, DialogHost, the Loading overlay and the Colada devtools in dev
└── router/
    ├── index.ts # Router setup, consumes the generated routes and holds the guard (requiresAuth, examples gate, catch-all)
    ├── loadingGuard.ts # Shows the app-wide overlay on a slow navigation, `manageNextNavigationLoading()` keeps it out of one
    ├── dynamicTitleGuard.ts # `?title=` overrides `meta.title`
    └── meta.d.ts # RouteMeta augmentation (title, backTo, current, requiresAuth, ...)
```

## Layout

`LayoutMobile.vue` is the only shell, `App.vue` wraps every page in it.

- Mobile first column capped at `max-w-160` (640px) and centered on every screen, no desktop variant. The column is `bg-canvas`, the area beside it on a wide screen is `bg-page` (set on `<html>`), two tokens so a project can tell them apart
- Sticky top bar (`LayoutMobileTopBar.vue`): two looks. A page with `meta.backTo` shows the back button (`meta.hideBack` hides just the button) and `meta.title`, every other page shows the logo placeholder. Both the title and the logo sit in the middle. `meta.hideTopBar` hides the bar
- Sticky bottom tab bar (`LayoutMobileTabBar.vue`), entries live in `src/components/layout/mobileTabs.ts`, the active tab follows `meta.current`. `meta.hideTabBar` hides the bar
- Adding a top level destination means adding a tab there

## Routing

File-based routing ships with Vue Router 5 itself. `vue-router/vite` is registered in `vite.config.ts` and generates `typed-router.d.ts` at the project root.

- ALWAYS read `typed-router.d.ts` to find route names and params
- Route names keep the group parentheses: the name of `pages/(landing).vue` is `'/(landing)'`
- ALWAYS navigate by name: `router.replace({ name: '/home' })`
- ALWAYS use `router.replace()`, NEVER `router.push()`: every navigation replaces the current history entry
- Pass the route name to `useRoute('/users/[userId]')` for stricter param types
- The guard in `src/router/index.ts` sends a visitor with no token from a page with `meta.requiresAuth` to the landing page, with `?redirect=` back to that page. `requiresAuth` is inherited by every page nested under a layout route that sets it
- A link that matches no page is caught by the last route in `src/router/index.ts` and redirected to `/unauthorized`
- Use `definePage()` inside a page to set `meta`, `alias`, and other route properties
- See the `pages` skill for the full file naming reference

## Auth

- The token lives in sessionStorage under `TOKEN_STORAGE_KEY` (`src/api/client.ts`), `useAuthStore()` reads and writes it and `client.ts` sends it as the bearer token
- `useAuthStore().scope` is the `scope` claim of the JWT when the backend issues scoped tokens, a project with onboarding steps (consent, register) routes on it
- LINE login is opt-in: with `VITE_LIFF_ID` set, `main.ts` inits LIFF and the landing page runs `useLineLogin()`, which swaps the LIFF access token for the app token through `api/auth.ts`
- A 401 shown through `showErrorDialog()` clears the session and reloads when the user closes it

## Dialogs

Programmatic modals, nothing to mount per page: `<DialogHost />` sits once in `App.vue`.

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

- A custom dialog declares `defineEmits<DialogComponentEmit>()`, calls `useDialogComponent(emit)` and binds `visible` to `<BaseModal v-model>` or `<BaseBottomSheet v-model>`, see `components/features/examples/ExampleSheetDialog.vue`
- `onDialogOk(payload)` / `onDialogCancel(payload)` close it from inside and hand the payload to `.onOk()` / `.onCancel()`
- A route change closes every open dialog without firing their callbacks
- `showErrorDialog({ error })` is the one way to report an api error, DefaultModal reads the backend's copy from it

## Design Tokens

Colors are semantic tokens defined once in `src/assets/main.css`, never palette shades in components.

- Components use the token utilities: `bg-page`, `bg-canvas`, `bg-surface`, `text-content`, `text-content-subtle`, `ring-border`, `bg-brand`, `text-danger`, `bg-danger-surface`
- A color with no token is a MISSING token, add it to `main.css` (palette, job and utility layers)
- Palette shades (`slate-50`, `indigo-600`) and hex values may appear ONLY inside `main.css`
- Light mode only. A project that needs dark mode adds a `prefers-color-scheme` block that redefines the `--app-*` jobs
- Map a variant prop to classes through a `Record<Union, string>` at module scope, so a new variant fails to compile until styled
- Read the `design-tokens` skill for the full token table and how to add one

## Rendering Backend HTML

Any element bound with `v-dompurify-html` (consent text, CMS content, ...) MUST also carry the `html-content` class from `src/assets/main.css`.

- Tailwind's preflight strips default styling from `p`/`h2`/`h3`/`a`/`ol`/`li`, so raw HTML from the API renders as unstyled, unstyled-link, bulletless text without it
- `html-content` also matches the real markup Quill v2 emits (`<ol><li data-list="bullet|ordered">`, `.ql-ui` marker spans, `.ql-align-*`, `.ql-indent-1/2/3` from Tab-to-indent, `<iframe class="ql-video">`)
- These rules are scoped under `.html-content` on purpose, never made global, so a plain `<p>`/`<a>` written directly in a component template is never affected
- A new tag/attribute showing up unstyled from a fresh API response is a MISSING rule, add it under `.html-content` in `main.css`, not as a one-off class on the page
- `<iframe>` is blocked by DOMPurify by default: the `dompurifyConfig` in `src/main.ts` allows it only for Quill's `class="ql-video"` embeds, and a `uponSanitizeAttribute` hook there strips `src` unless the host is YouTube. Extend that allowlist, not the tag/attr list alone, if another embed source is ever needed

## Imports

`@/` maps to `src/`, configured in `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`compilerOptions.paths`), both must be edited together.

- Any import that leaves the current directory uses `@/`, `../` is blocked by the `app/imports` rule in `eslint.config.ts`
- A same directory import stays relative, `./LayoutMobileTopBar.vue`, and a spec imports its subject the same way
- `vitest.config.ts` merges `vite.config.ts` and `tsconfig.vitest.json` extends `tsconfig.app.json`, so tests need no extra alias wiring
- Read the `imports` skill before adding a new alias

## Components

- Read `src/components/CLAUDE.md` before writing a component
- `components/ui/` holds generic primitives, they take text through props and slots
- `components/modal/` and `components/input/` hold composed, domain free controls that DO own their own copy, a primitive that needs its own hardcoded Thai text belongs here, not in `ui/`
- `components/features/<feature>/` holds anything that knows about a domain type
- `components/layout/` holds the app shell and its bars
- Name from the general to the specific: `LayoutMobileTabBar.vue`, `ExampleSheetDialog.vue`

## Composables

- Read `src/composables/CLAUDE.md` before writing a composable
- One composable per file, named `useThing()`, named export, returns a plain object of refs and functions
- Accept `MaybeRefOrGetter` and read with `toValue()` when an input may be reactive
- Clean up with `onScopeDispose()`, NOT `onUnmounted()`
- Keep the pure part as a plain exported function next to the composable so it is trivially testable
- Shared global state is a Pinia store, NOT a composable, data fetching is a query, NOT a composable

## Text, Numbers and Dates

This project is Thai only and has no i18n layer. User-facing text is plain Thai written directly in templates and script blocks, there is no message-key catalog, no `useI18n()`, no `$t`/`$n`/`$d`.

- Numbers and dates go through the formatters in `src/utils/format.ts` (`formatCurrency`, `formatDecimal`, `formatShortDate`, `formatDateTime`), the locale is set once there
- Set a page's on-screen title with `definePage({ meta: { title: '…' } })`, `LayoutMobileTopBar` reads it. The `<title>` tag itself is static (`index.html`), not route-reactive

## Data Fetching

- Fetch functions live in `src/api/`, they know nothing about Vue, and go through the helpers in `api/client.ts` (`apiGet`, `apiPost`, ...), which unwrap the ChocoCRM `{ status, data, error }` envelope
- Query keys and options live in `src/queries/` as key factories + `defineQueryOptions`
- Mutations live in `src/mutations/` as `defineMutation`, and invalidate through `useQueryCache()`
- Components call `useQuery(() => someQuery(param))` with a getter, never a plain value
- See the `pinia-colada` skill before touching queries or mutations, including its Infinite Scroll section before building any paginated/infinite list

## Project Commands

Frequently used commands:

- `pnpm run dev`: starts the dev server on port 5173
- `pnpm run build`: type-checks and bundles the project for production
- `pnpm run test`: runs all tests
- `pnpm vitest run <test-files>`: runs one or multiple specific test files
  - add `--coverage` to check missing test coverage
- `pnpm run type-check`: runs `vue-tsc` over app, node and test configs
- `pnpm run lint`: runs oxlint then eslint with `--fix`
- `pnpm run format`: formats the repository with oxfmt

`typed-router.d.ts` is generated by the dev server and by `vite build`. After adding or renaming a page, run one of them before `type-check`, or the new route name will not resolve.

## Development Workflow

ALWAYS follow the workflow when implementing a new feature or fixing a bug. This ensures consistency, quality, and maintainability of the codebase.

1. Plan your tasks, review them with user. Include tests when possible
2. Write code, following the [project structure](#project-structure) and [conventions](#standards)
3. **ALWAYS test implementations work**:
   - Write tests for logic and components
   - Use the browser to test like a real user
4. Stage your changes with `git add` once a feature works
5. Review changes and analyze the need of refactoring

## Testing Workflow

### Unit and Integration Tests

- Read the `testing` skill before writing a spec
- Specs live next to the file they cover and are named `*.spec.ts`
- Test behaviour through the public surface: rendered output, emitted events, returned values
- ALWAYS `mount()`, never `shallowMount()`
- Assert `v-model` through `emitted('update:modelValue')`, not through `props()`
- If something is hard to test, extract the logic into a util or composable first
- Reset shared globals in `afterEach`, fake timers leak between files

### Browser Testing

1. Navigate to the relevant page
2. Wait for content to load completely
3. Test primary user interactions
4. Test secondary functionality (error states, edge cases)
5. Check the JS console for errors or warnings
   - If you see errors, investigate and fix them immediately
   - If you see warnings, document them and consider fixing if they affect user experience
6. Document any bugs found and fix them immediately

## Research & Documentation

- **NEVER hallucinate or guess URLs**
- ALWAYS try accessing the `llms.txt` file first to find relevant documentation. EXAMPLE: `https://pinia-colada.esm.dev/llms.txt`
  - If it exists, it will contain other links to the documentation for the LLMs used in this project
- ALWAYS follow existing links in table of contents or documentation indices
- Verify examples and patterns from documentation before using
