# Vue Project Template

The ChocoCRM starter for a new mobile web project. The structure, conventions and Claude Code setup come from a shipped project (BCRM Ovaltine UHT) with its features and its look taken out: a new project copies this, sets its colours and builds its own pages.

## Stack

| Concern         | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
| Framework       | Vue 3, Composition API, `<script setup>`                    |
| Language        | TypeScript, strict, `noUncheckedIndexedAccess`              |
| Build           | Vite 8 (rolldown)                                           |
| Routing         | Vue Router 5, file-based typed routes via `vue-router/vite` |
| Global state    | Pinia                                                       |
| Async state     | Pinia Colada (+ devtools in dev only)                       |
| Styling         | TailwindCSS v4 via `@tailwindcss/vite`, semantic tokens     |
| Tests           | Vitest, `@vue/test-utils`, jsdom, specs colocated           |
| Lint and format | oxlint, ESLint (vue + ts), oxfmt                            |
| Package manager | pnpm                                                        |

## What Is Included

- `TextField` and `Select` (`src/components/input/`) with validation, masks, search, multiple and chips
- The modal system (`src/components/modal/`): `Dialog.create({ component, componentProps }).onOk().onCancel()`, `DefaultModal`, `BaseModal`, `BaseBottomSheet` and `showErrorDialog()`
- `Button`, `Svg`, `Spinner`, `Loading` (`src/components/ui/`)
- The mobile shell: a top bar driven by route meta and a bottom tab bar
- The api client for the ChocoCRM `{ status, data, error }` envelope, a token store, a `requiresAuth` route guard and an opt-in LINE LIFF login
- A guide with code examples at `/guide` (a button on the home page) and UI example pages at `/examples` (development mode only)

## Getting Started

```bash
pnpm install
cp .env.example .env.development
pnpm run dev
```

## Starting a New Project

1. Copy the repo, rename `name` in `package.json` and `<title>` in `index.html`, replace `public/favicon.svg`
2. Fill in `.env.development`, leave `VITE_LIFF_ID` empty if the project has no LINE login
3. Set the palette and the `--app-*` jobs in `src/assets/main.css`, add the font (see `.claude/skills/design-tokens`)
4. Replace the logo placeholder in `LayoutMobileTopBar.vue` and the tabs in `mobileTabs.ts`
5. Replace `pages/home.vue` and `pages/profile.vue` with the real pages, delete the guide (`pages/guide.vue`, `components/features/guide/`)
6. Rewrite the intro and Project Structure of `CLAUDE.md`, and `docs/folder-structure.md`, for the project

## Commands

| Command               | What it does                      |
| --------------------- | --------------------------------- |
| `pnpm run dev`        | Dev server on port 5173           |
| `pnpm run build`      | Type-check, then bundle           |
| `pnpm run type-check` | `vue-tsc` over every config       |
| `pnpm run test`       | Every spec once                   |
| `pnpm run lint`       | oxlint, then eslint, with `--fix` |
| `pnpm run format`     | oxfmt over the repo               |

## Agent Setup

- `CLAUDE.md` (root) plus `AGENTS.md` pointing to it for non-Claude agents
- `src/components/CLAUDE.md` for component conventions, `src/composables/CLAUDE.md` for composable conventions
- `.claude/skills/{pages,pinia-colada,writing}` from Vue RuleKit: routing, async state, prose
- `.claude/skills/{design-tokens,imports,testing,edge-cases}` project rules: token usage, the `@/` alias, spec patterns, the checklist to walk before calling a feature done
- `.claude/commands/` for the `new-command` and `optimize-images` slash commands
- `.claude/settings.json` for shared permissions and an oxfmt-on-write hook (needs `jq`)

Vue RuleKit skills are licensed material, see `.claude/skills/LICENSE.txt`.

Read `docs/folder-structure.md` (Thai) for the full tour and `docs/secrets.md` (Thai) before adding any environment variable.
