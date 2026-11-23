---
name: design-tokens
description: >
  The semantic colour tokens of this project: where they live, which utility to use for which job,
  and how to add one or re-theme the app for a new project.
  TRIGGER when: styling a component, picking a colour class, seeing a raw palette shade (`bg-blue-600`,
  a hex value) in a component, adding a variant prop, or theming the template for a new brand.
---

# Design Tokens

Every colour a component uses is a semantic token defined once in `src/assets/main.css`. A component
never names a palette shade or a hex value, so a new project re-themes the whole app by editing one
file.

## The Three Layers

| Layer | Where                        | Holds                                                            |
| ----- | ---------------------------- | ---------------------------------------------------------------- |
| 1     | `:root`, `--palette-*`       | The raw brand colours, the ONLY place a hex value lives          |
| 2     | `:root`, `--app-*`           | A job for each colour: `--app-brand: var(--palette-blue-600)`    |
| 3     | `@theme inline`, `--color-*` | Exposes each job as a Tailwind utility: `bg-brand`, `text-brand` |

A new brand edits layer 1, and layer 2 when a job should point at another palette colour. Layer 3
only changes when a token is added or removed.

## Token Table

| Job                       | Utilities                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page and card backgrounds | `bg-canvas`, `bg-surface`, `bg-surface-active` (hover, pressed)                                                                                                               |
| Lines                     | `border-border`, `border-border-strong`, `ring-border`                                                                                                                        |
| Text                      | `text-content`, `text-content-strong`, `text-content-subtle`, `text-content-disabled`, `text-content-inverted`                                                                |
| Brand                     | `bg-brand`, `bg-brand-hover`, `bg-brand-subtle`, `text-brand`, `border-brand`                                                                                                 |
| Focus ring                | `ring-focus`                                                                                                                                                                  |
| Status                    | `text-danger`, `bg-danger-surface`, `text-success`, `text-warning`                                                                                                            |
| Form controls             | `border-border-input`, `border-border-focus-input`, `bg-input-disabled`, `text-content-input`, `text-content-placeholder`, `text-content-disabled-input`, `text-danger-input` |
| Select options            | `bg-select-option-hover`, `bg-select-option-selected`                                                                                                                         |
| Disabled button           | `bg-btn-disabled`, `text-btn-disabled-text`                                                                                                                                   |
| Overlays                  | `bg-overlay`, `bg-popup-backdrop`                                                                                                                                             |
| Shadows                   | `shadow-popup`, `shadow-top-bar-scrolled`                                                                                                                                     |

A `<style>` block reads the same values as CSS variables: `var(--color-border-input)`.

## Rules

- NEVER use a raw palette shade (`slate-50`, `blue-600`) or a hex value in a component, only inside `main.css`
- A colour with no token is a MISSING token, add it to `main.css` (all three layers) rather than a one-off value
- Name a token for its job (`danger-surface`), never for its colour (`red-light`), so a re-theme keeps the name true
- Opacity modifiers are fine on a token: `bg-brand/10`
- The template is light only. A project that needs dark mode adds a `@media (prefers-color-scheme: dark)` block
  that redefines layer 2, components need no `dark:` variants

## Variant Props

Map a variant prop to classes through a `Record<Union, string>` at module scope, so adding a variant
fails to compile until it is styled:

```ts
type BadgeTone = 'neutral' | 'success' | 'danger'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-active text-content',
  success: 'text-success',
  danger: 'bg-danger-surface text-danger',
}
```

`Button.vue` (`VARIANT_BASE_CLASSES`) and `PopupHeader.vue` (`TONES`) follow this pattern.

## Adding a Token

1. Add the raw colour to layer 1 if the palette lacks it: `--palette-teal-500: #14b8a6;`
2. Give it a job in layer 2: `--app-info: var(--palette-teal-500);`
3. Expose it in layer 3: `--color-info: var(--app-info);`
4. Use it: `text-info`, and add it to the table above

## Theming a New Project

1. Replace the `--palette-*` values with the brand colours
2. Point the `--app-*` jobs at them, `--app-brand` first
3. Put the project font in `src/assets/fonts/`, declare it with `@font-face` and put it first in `--font-sans`
4. Restyle components only where the design differs in shape (radius, size), the colours follow the tokens
