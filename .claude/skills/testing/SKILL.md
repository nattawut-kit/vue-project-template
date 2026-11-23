---
name: testing
description: >
  Write Vitest specs for this project: components with @vue/test-utils, composables with effectScope,
  stores, queries and mutations with Pinia Colada, and assertions on the Thai copy a user sees.
  TRIGGER when: writing or fixing a `*.spec.ts`, adding tests for a component, composable, store or util,
  a test fails, coverage is discussed, or a feature is finished and needs proof it works.
---

# Testing

## Rules

- Specs live NEXT TO the file they cover: `Button.vue` + `Button.spec.ts`
- Test BEHAVIOUR through the public surface: rendered output, emitted events, returned values
- NEVER assert on internal state, private refs, or the class list of a token driven element
- ALWAYS use `mount()`, never `shallowMount()`, the child components are part of the behaviour
- One `describe` per exported symbol, the `it` text says what the code does, not what the test does
- ALWAYS use `await` on anything that changes the DOM: `setValue`, `trigger`, `nextTick`, `flushPromises`
- Reset shared globals in `afterEach`, stubbed env, storage and fake timers leak across files otherwise
- Run one file with `pnpm vitest run <path>`, add `--coverage` to find gaps

## What Deserves a Test

| Code                          | Test it                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `src/utils/*`                 | ALWAYS, pure functions are the cheapest tests in the project   |
| `src/composables/*`           | ALWAYS, including cleanup                                      |
| `src/components/ui/*`         | ALWAYS, props in, rendered output and emits out                |
| `src/stores/*`                | ALWAYS, actions and derived state                              |
| Plain helpers beside a module | ALWAYS, extract logic out of a component to make it testable   |
| `src/api/*`                   | Only the filtering and error branches, not the mock transport  |
| `src/pages/*`                 | Cover the page through its components, not by mounting a route |

If something is hard to test, that is a design signal: pull the logic into a util or a composable first.

## Components

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('emits click when enabled', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

- Assert `v-model` through `emitted('update:modelValue')`, NOT through `props('modelValue')`, a bare mount
  has no parent to write the prop back
- Query with `wrapper.get()` for something that must exist, `find()` only when asserting absence

## Composables

```ts
const scope = effectScope()
const debounced = scope.run(() => useDebouncedRef(source, 300))!
// assertions
scope.stop()
```

- `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`, `vi.advanceTimersByTime()` to move on
- A composable that needs `useRoute()` or a store: mount a host component with the plugins
  and read the result off the instance, do not stub the composable

## Pinia and Pinia Colada

- `setActivePinia(createPinia())` in `beforeEach` for a store spec
- Give a component spec the plugins it actually needs: `mount(C, { global: { plugins: [pinia, PiniaColada] } })`
- A component that renders `v-dompurify-html` (Svg, DefaultModal) needs the `VueDompurifyHTML` plugin with its `svg` named configuration
- Await the query, `flushPromises()` once is not always enough for a query plus its cache write

## Copy

- Assert on the Thai message a user sees, the project has no locale layer to go through
- A date or number in the output comes from `src/utils/format.ts`, assert the formatted string

## Edge Cases

Every feature spec MUST cover, where it applies:

- Empty: zero rows, empty string, `undefined` optional prop
- Boundary: one item, the first and the last, zero and negative numbers
- Failure: the api rejecting, `state.status === 'error'` rendering the message
- Loading: the pending state rendering, and NOT flashing when cached data exists
- Race: two rapid inputs, only the last result may win
- Unknown input: an unknown status or type falling back to a default

See the `edge-cases` skill for the full checklist to walk before calling a feature done.
