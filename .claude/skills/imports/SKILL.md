---
name: imports
description: Module import rules for this project, the `@/` path alias, where it is configured and when a relative path is still allowed. TRIGGER when adding or moving an import, creating a file that other modules import, renaming or relocating a directory, seeing a `no-restricted-imports` lint error, or wiring a new alias.
metadata:
  version: '1.0.0'
license: Proprietary - see repository LICENSE.txt
---

# Imports and the `@/` alias

`@/` maps to `src/`. Every cross directory import inside `src/` goes through it.

```ts
import { fetchCustomers } from '@/api/customers'
import Button from '@/components/ui/Button.vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
```

## Rules

- ALWAYS use `@/` for any import that leaves the current directory. `../` is a lint error.
- A same directory import stays relative: `./CustomerCard.vue`, `./mobileTabs`. It survives a folder move untouched, so the alias buys nothing there.
- A spec imports its subject relatively, because it sits next to it: `import { formatName } from './formatName'`.
- The alias resolves `.ts`, `.vue`, `.json` and anything else Vite handles. Keep the extension on `.vue` and `.json`, drop it on `.ts`.
- NEVER alias into `node_modules` or `public/`. Package imports use the bare package name, `public/` files are referenced by URL path (`/favicon.ico`).
- Assets that Vite should process live in `src/assets/` and are imported through the alias so the hashed URL is emitted: `import logo from '@/assets/logo.svg'`.

## Where the alias is configured

Three places must agree, a new alias means editing all three.

| File                                          | What it feeds                                             |
| --------------------------------------------- | --------------------------------------------------------- |
| `vite.config.ts` (`resolve.alias`)            | The dev server and the production bundle                  |
| `tsconfig.app.json` (`compilerOptions.paths`) | `vue-tsc`, the editor and `pnpm run type-check`           |
| `tsconfig.vitest.json`                        | Inherits `paths` from `tsconfig.app.json`, nothing to add |

`vitest.config.ts` merges `vite.config.ts`, so tests resolve the alias for free. `tsconfig.node.json` has no `paths` on purpose, config files at the repository root are outside `src/`.

## Adding an alias

Prefer a subpath of the existing alias (`@/features/billing`) over a new top level one. When a second alias is genuinely warranted:

1. Add it to `resolve.alias` in `vite.config.ts` with `fileURLToPath(new URL('./path', import.meta.url))`.
2. Add the matching `paths` entry in `tsconfig.app.json`.
3. Run `pnpm run type-check` to confirm both halves resolve.

An alias that exists in one file only fails at build time or at type-check time, never both, which makes it slow to diagnose.

## Enforcement

The `app/imports` block in `eslint.config.ts` turns a parent relative import into an error. `pnpm run lint` catches it, so does the editor.

```bash
pnpm run lint
```
