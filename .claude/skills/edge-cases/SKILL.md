---
name: edge-cases
description: >
  Checklist to walk before calling a Vue feature done: async states, empty and boundary data, races,
  Thai copy, accessibility and responsive behaviour.
  TRIGGER when: finishing a component, page or composable, reviewing a diff, a bug slipped through,
  or deciding what to test next.
---

# Edge Cases

Walk this list before saying a feature works. Anything that applies and is NOT handled is a bug, not a
follow up. Fix it, then add the test that would have caught it.

## Async State

Every `useQuery()` render MUST answer four questions:

| State              | Requirement                                                        |
| ------------------ | ------------------------------------------------------------------ |
| First load         | A loading indicator, gated on `asyncStatus === 'loading' && !data` |
| Background refresh | Keep showing the old data, DO NOT flash a spinner over it          |
| Error              | Render `state.error.message`, never an empty screen                |
| Success but empty  | An explicit empty message, never a bare empty list                 |

- Check `state.status === 'error'` BEFORE checking data, an error with stale data must still surface
- A mutation in flight MUST disable its submit control, `:loading` on `Button` does both
- A failed mutation MUST leave the form filled, never clear the user's input

## Data

- Zero, one, many: a count reads right for each, and a list with one item still looks like a list
- Numbers: zero, negative, and a value large enough to break the layout
- Text: empty, whitespace only, and long enough to overflow, use `truncate` with `min-w-0` on the flex child
- Optional fields: render nothing, not `undefined` or an empty label
- Dates: an invalid or missing ISO string must not render `Invalid Date`
- Ids from the route are STRINGS, never assume a number
- A route param that matches nothing MUST show the not found path, not a blank card

## Reactivity and Races

- Debounced input: typing twice before the timer fires must resolve to the LAST value only
- A query key MUST contain every variable the query function reads, otherwise a stale response wins
- Switching route params fast must not render the previous record's data, key the query on the param
- Cleanup: every timer, listener and observer released in `onScopeDispose`
- A prop that changes after mount must update derived state, `watch` the source, do not copy it once

## Thai Copy

- This project is Thai only, user facing text is plain Thai in the template, there is no locale file
- Numbers and dates go through `src/utils/format.ts`, never a hand formatted string or `toLocaleString()` scattered in a page
- A พ.ศ. year comes from the formatter, never `getFullYear()` printed as is
- Thai renders taller than Latin, check a mobile viewport after adding a label

## Accessibility

- Every input has a `<label>`, `TextField` already pairs them, do not hand roll a bare `<input>`
- Focus MUST stay visible, keep `focus:ring-focus`, never `outline-none` alone
- An icon only control needs an accessible name, use `sr-only` text
- A control that is not a link is a `<button type="button">`, never a clickable `<div>`
- Colour is never the only signal, a status badge carries text as well as a tone

## Responsive

- Verify the mobile layout, `LayoutMobile` is the only shell, a 640px column on every screen
- Long content must scroll inside its container, the page body must never scroll sideways
- Touch targets stay at least 44px tall in the mobile layout

## Before You Stop

1. `pnpm run type-check`
2. `pnpm test`
3. `pnpm run lint`
4. Open the page, exercise the happy path AND one failure path, read the JS console
5. Grep the diff for a raw palette class (`bg-blue-600`, `#hex`), every colour is a token
