# Data Fetching

Data fetching uses TanStack Vue Query (`@tanstack/vue-query`). Queries are declared as composables and live in the feature component or a feature-local composable — never in views, domain components, or UI components.

## Where data fetching lives

Keep query composables in the feature that owns the data. Do not fetch in views (too high), domain components (wrong layer), or UI components (zero business knowledge).

Extract into a dedicated composable when:
- the query is used in more than one place
- the query options are complex enough to clutter the feature component

Keep it inline in the feature component when the query is simple and local.

---

## Query basics

Use `useQuery` from `@tanstack/vue-query`. Every query needs a `queryKey` and a `queryFn`.

```ts
import type { MaybeRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { toRef } from 'vue'

const SERVICES_QUERY_KEY = 'services'

export function useServices(searchQuery: MaybeRef<string | null>) {
  const query = toRef(searchQuery)

  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, query],
    queryFn: ({ signal }): Promise<Service[]> => {
      const params = new URLSearchParams()
      if (query.value != null) {
        params.set('q', query.value)
      }
      return fetch(`/api/services?${params.toString()}`, { signal }).then(r => r.json())
    },
    shallow: true,
  })
}
```

**`queryFn` receives a `signal`** — always pass it to the fetch call so in-flight requests are cancelled when the query key changes or the component unmounts.

**`shallow: true`** — use for queries that return arrays or large objects. Prevents Vue from deeply observing the returned data, which is unnecessary and expensive when the data is only read.

**`toRef()`** — normalises a `MaybeRef<T>` to a `Ref<T>`. Pass the ref (not the value) into the query key so Vue Query tracks it reactively and re-runs the query when it changes.

---

## Query keys

Query keys are arrays. Structure them as `[domain, ...params]` — a stable string identifying the resource, followed by any reactive parameters that scope or filter it.

```ts
// No params — fetch all
queryKey: ['services']

// With reactive param — refetches when query changes
queryKey: ['services', query]

// Nested resource
queryKey: ['users', userId, 'posts']
```

Extract the base key as a module-level constant. Export a key factory function when other parts of the codebase need to invalidate or target this query's cache — for example, after a mutation.

```ts
const SERVICES_QUERY_KEY = 'services'

export function getServicesQueryKey(searchQuery?: string | null) {
  return searchQuery != null
    ? [SERVICES_QUERY_KEY, searchQuery]
    : [SERVICES_QUERY_KEY]
}
```

---

## Mutations

Use `useMutation` for write operations. Invalidate related queries in `onSuccess` to keep the cache consistent.

```ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateServicePayload): Promise<Service> =>
      fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getServicesQueryKey() })
    },
  })
}
```

Use the exported key factory to target invalidation precisely. Calling it without arguments invalidates all queries under that domain regardless of params.

---

## Loading and error states

`useQuery` returns `isPending`, `isError`, `data`, and `error`. Consume them in the feature component or composable and pass the relevant values down to UI components as props — do not handle display logic inside the query composable.

```ts
const { data: services, isPending, isError } = useServices(searchQuery)
```

Use `placeholderData` to keep the previous result visible while a new query is loading — avoids layout shifts when params change.

```ts
import { keepPreviousData } from '@tanstack/vue-query'

useQuery({
  queryKey: [SERVICES_QUERY_KEY, query],
  queryFn: () => { /* ... */ },
  placeholderData: keepPreviousData,
})
```

---

## Cache and staleness

Sensible defaults apply in most cases. Configure explicitly only when there is a clear reason.

| Option | When to set |
|---|---|
| `staleTime` | Data that does not change often — avoid unnecessary background refetches |
| `refetchInterval` | Data that should stay fresh on a timer (e.g. live status) |
| `refetchOnWindowFocus: false` | Data where background refetch on tab switch is disruptive or wasteful |
| `gcTime` | Rarely needed — only when unused cache should be cleared sooner or later than the default |

```ts
useQuery({
  queryKey: [SERVICES_QUERY_KEY, query],
  queryFn: () => { /* ... */ },
  refetchInterval: 60 * 1000, // poll every 60s
  refetchOnWindowFocus: false, // don't refetch on tab switch
})
```
