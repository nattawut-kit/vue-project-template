# Composables Best Practices

A composable is a named function that owns a slice of reactive logic. It is the default place for logic that
a component should not carry.

## Naming and Shape

- ALWAYS name the file and the function `useThing.ts` / `useThing()`, camelCase, one composable per file
- ALWAYS use a named export, one `export function useThing()`, never a default export
- Helpers that need no reactivity go NEXT TO the composable as plain exported functions, they are the part
  that is cheap to unit test
- ALWAYS return a plain object of refs and functions, NEVER `reactive()`, so the caller can destructure
- Return `computed` for derived values, never a raw `.value` snapshot, it would stop updating
- Keep the returned surface small, do not re-export everything the composable happens to hold

## Arguments

- Accept `MaybeRefOrGetter<T>` and read it with `toValue()` when an input may be reactive
- NEVER destructure a reactive argument at the top of a composable, it breaks the link
- Give every optional argument a default in the signature: `useDebouncedRef(source, delay = 300)`

```ts
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useInitials(fullName: MaybeRefOrGetter<string>) {
  return computed(() => formatInitials(toValue(fullName)))
}
```

## Lifecycle and Cleanup

- ALWAYS clean up what you create: `clearTimeout`, `removeEventListener`, `disconnect()`
- Use `onScopeDispose()` for cleanup, NOT `onUnmounted()`, so the composable also works inside a store,
  an `effectScope()` or a route guard
- Use `onWatcherCleanup()` inside a watcher to cancel the previous run
- NEVER run side effects at module scope, the work belongs inside the function so tests can control it
- Composables that touch `window`, `document` or `localStorage` MUST guard for absence (`typeof window !== 'undefined'`)

## Boundaries

- DO NOT fetch data in a composable, fetch functions go in `src/api/`, queries in `src/queries/`
- DO NOT put global shared state in a composable, that is a Pinia store in `src/stores/`
  - A composable called twice creates TWO independent states, a store does not
- DO NOT wrap a single `computed` in a composable used in one place, inline it
- DO NOT import a component into a composable, a composable owns logic, not rendering

## Testing

Every composable MUST have a spec next to it. Composables that use `onScopeDispose` or `watch` need a scope:

```ts
const scope = effectScope()
const result = scope.run(() => useDebouncedRef(source, 300))!
// assertions
scope.stop()
```

Composables that call `useRoute()` or a store need that plugin installed, mount a tiny host
component instead of calling the composable bare. See the `testing` skill.

## Edge Cases to Cover

- Zero, one and many for anything list shaped
- Empty string, whitespace only and very long input for anything text shaped
- The source changing twice before a timer fires, only the last value may win
- Cleanup actually running, assert the timer or listener is gone after `scope.stop()`
- An unsupported or unknown input falling back to a default instead of throwing
