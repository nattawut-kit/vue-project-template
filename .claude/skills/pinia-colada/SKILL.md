---
name: pinia-colada
description: >
  Write correct @pinia/colada code (async state management for Vue/Nuxt).
  TRIGGER when: code imports `@pinia/colada`, uses useQuery/useMutation/defineQuery/defineQueryOptions/useQueryCache,
  async data fetching in Vue projects, query keys, query cache, optimistic updates,
  infinite queries, or pinia colada plugins. Also when setting up a new Vue project that needs async state management.
---

# Pinia Colada

## Rules

- ALWAYS use key factories + `defineQueryOptions`. Never inline keys in real projects
- Organize queries in `queries/` folder, mutations in `mutations/` folder
- Install `@pinia/colada-devtools` as **dev dep**. Place `<PiniaColadaDevtools />` at end of root template (`app.vue`)
- Do NOT enable devtools in production unless explicitly requested
- Keys MUST depend on ALL variables used in the `query` function
- Dynamic keys → always use a getter function, never a plain value
- Use `as const` on key factory return types
- Prefer `refresh()` over `refetch()`: it reuses loading requests and respects `staleTime`

## Setup

```bash
pnpm i @pinia/colada
pnpm i -D @pinia/colada-devtools
```

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

const app = createApp(App)
app.use(createPinia())
app.use(PiniaColada, {
  // queryOptions: { staleTime: 0 },
  // mutationOptions: {},
  // plugins: [],
})
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
</script>

<template>
  <RouterView />

  <PiniaColadaDevtools />
</template>
```

## Key Factories

Centralize keys in the query file. Reuse parent keys to keep hierarchy consistent:

```ts
// queries/products.ts
export const PRODUCT_QUERY_KEYS = {
  root: ['products'] as const,
  byId: (id: string) => [...PRODUCT_QUERY_KEYS.root, id] as const,
  byIdWithReviews: (id: string) => [...PRODUCT_QUERY_KEYS.byId(id), { reviews: true }] as const,
}
```

Invalidating `PRODUCT_QUERY_KEYS.root` invalidates ALL product queries (hierarchical matching).

## defineQueryOptions

Combine key factories with `defineQueryOptions` for type-safe, reusable query definitions.

**Static** (no params):

```ts
// queries/products.ts
import { defineQueryOptions } from '@pinia/colada'

export const productListQuery = defineQueryOptions({
  key: PRODUCT_QUERY_KEYS.root,
  query: () => getProducts(),
})
```

**Dynamic** (with params):

```ts
export const productByIdQuery = defineQueryOptions((id: string) => ({
  key: PRODUCT_QUERY_KEYS.byId(id),
  query: () => getProductById(id),
}))
```

**Multiple params** — use object destructuring:

```ts
export const productByIdQuery = defineQueryOptions(
  ({ id, withReviews = false }: { id: string; withReviews?: boolean }) => ({
    key: PRODUCT_QUERY_KEYS.byIdWithReviews(id),
    query: () => getProductById(id, { withReviews }),
  }),
)
```

## useQuery

Pass dynamic options as a getter function:

```vue
<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { useRoute } from 'vue-router'
import { productByIdQuery } from '@/queries/products'

const route = useRoute()
const { state, asyncStatus } = useQuery(() => productByIdQuery(route.params.id))
</script>

<template>
  <div v-if="asyncStatus === 'loading'">Loading...</div>
  <div v-if="state.status === 'error'">{{ state.error.message }}</div>
  <div v-else-if="state.data">{{ state.data.name }}</div>
</template>
```

### Passing extra options

Spread defined options and override per-usage:

```ts
const enabled = ref(false)
useQuery(() => ({
  ...productByIdQuery('24'),
  enabled: enabled.value,
}))
```

### Pausing queries

Use `enabled` to prevent queries from running when required data is missing:

```ts
const selecetdDeckId = ref<null | number>(null)
useQuery({
  key: () => ['decks', selecetdDeckId.value],
  query: () => getDeck(selecetdDeckId.value!),
  enabled: () => selecetdDeckId.value != null,
})
```

## Mutations

```ts
import { useMutation, useQueryCache } from '@pinia/colada'
import { PRODUCT_QUERY_KEYS } from '@/queries/products'

const queryCache = useQueryCache()
const { mutate: updateProduct, asyncStatus } = useMutation({
  mutation: (product: Product) => patchProduct(product),
  onSettled(_data, _error, product) {
    queryCache.invalidateQueries({ key: PRODUCT_QUERY_KEYS.byId(product.id) })
    queryCache.invalidateQueries({ key: PRODUCT_QUERY_KEYS.root, exact: true })
  },
})
```

- `mutate()`: fire-and-forget, catches errors
- `mutateAsync()`: returns promise, re-throws errors
- `variables`: last args passed to mutation (useful for optimistic UI)

### Reusable mutations (defineMutation)

```ts
// mutations/products.ts
import { defineMutation } from '@pinia/colada'

export const useDeleteProduct = defineMutation({
  mutation: (id: string) => fetch(`/api/products/${id}`, { method: 'DELETE' }),
})
```

For shared state across components, use the function form:

```ts
export const useCreateProduct = defineMutation(() => {
  const name = ref('')
  const { mutate, ...rest } = useMutation({
    mutation: (text: string) => createProduct(text),
  })
  return { ...rest, createProduct: () => mutate(name.value), name }
})
```

## defineQuery (shared composable state)

When you need to share reactive state (e.g. a search ref) across components that use the same query, wrap with `defineQuery`. Without it, each component gets its own ref copy.

```ts
// queries/todos.ts
import { defineQuery, useQuery } from '@pinia/colada'
import { ref } from 'vue'

export const useFilteredTodos = defineQuery(() => {
  const search = ref('')
  const { state, ...rest } = useQuery({
    key: () => ['todos', { search: search.value }],
    query: () => fetch(`/api/todos?filter=${search.value}`).then((r) => r.json()),
  })
  return { ...rest, todoList: state, search }
})
```

## State & Status

| Property                  | Values                                 | Purpose                             |
| ------------------------- | -------------------------------------- | ----------------------------------- |
| `state.status` / `status` | `'pending'` → `'success'` \| `'error'` | Data status (has it ever resolved?) |
| `asyncStatus`             | `'idle'` \| `'loading'`                | Is the query currently fetching?    |

Use `state` (not destructured `data`/`error`) for TypeScript narrowing:

```ts
if (state.value.status === 'error') {
  state.value.error // Error, not null
}
```

`refresh()` vs `refetch()`:

- `refresh()` — reuses in-flight requests, skips if data is fresh
- `refetch()` — always triggers a new fetch

## Folder Structure

```
src/
├── api/              # fetch functions
│   ├── products.ts
│   └── contacts.ts
├── queries/          # key factories + defineQueryOptions
│   ├── products.ts
│   └── contacts.ts
├── mutations/        # defineMutation
│   ├── products.ts
│   └── contacts.ts
└── pages/
    └── products/[id].vue
```

## Infinite Scroll (this project's convention)

Established in `src/pages/articles/(article-list).vue` — follow this shape for any other
infinite-scroll list rather than reinventing it.

- Use `defineInfiniteQueryOptions` (not raw `useInfiniteQuery({...})` inline) for the same
  key-factory + type-safety reasons as `defineQueryOptions`
- **Confirm what the backend's pagination params actually mean before wiring `getNextPageParam`.**
  A field named `start` can be a 1-based **record offset** (SQL `OFFSET`-style), not a page number
  — confirmed the hard way on `Article/ListCategoryId`: feeding back the response's own
  `currentpage + 1` as the next `start` re-requested a record already shown (the backend
  recomputes `currentpage` from the offset, so an off-by-one `start` can even make it recompute the
  _same_ `currentpage` forever — an infinite duplicate-loading loop, not just a skipped page).
  Compute the next offset from `lastPageParam + pageSize`, capped at the response's own
  `totalrecord`, not from a `currentpage`/`totalpage` pair unless you've verified those really are
  page numbers for that specific endpoint
- Trigger loading via a sentinel `<div ref="sentinel">` after the list, observed with
  `useIntersectionObserver` from `@vueuse/core` — but **the observer alone is not enough.** It only
  fires when the sentinel crosses in/out of view; a small page size on a tall viewport can leave it
  sitting on-screen after a load without ever actually leaving, so the observer never fires again
  and pagination silently stalls. Pair it with a plain `getBoundingClientRect()` re-check (see
  `isSentinelOnScreen()`/`loadMoreWhileOnScreen()` in the reference page) that keeps loading pages
  in a loop — guarded against re-entry — for as long as the sentinel is still visible, so a short
  first page still fills the screen (or exhausts the data) before waiting on the user to scroll
- Use `Spinner` with `type="dots"` for the in-list "loading more" indicator at the sentinel — not
  the ring/tail variants, those read as a full-page loading state

## Advanced Topics (references)

- **[references/plugins.md](references/plugins.md)** — Read when adding/configuring plugins (retry, delay, auto-refetch, cache-persister, query hooks) or writing custom plugins
- **[references/advanced-patterns.md](references/advanced-patterns.md)** — Read for optimistic updates, infinite queries, paginated queries, error handling, SSR, Nuxt, cancellation
- **[references/query-cache.md](references/query-cache.md)** — Read when directly interacting with the cache (getQueryData, setQueryData, invalidateQueries with predicates)
