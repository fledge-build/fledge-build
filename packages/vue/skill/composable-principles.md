# Composable Principles

## What makes something a composable

A composable is a function that encapsulates logic that relies on Vue's reactivity system, lifecycle hooks, or setup context. If none of these are involved, the logic belongs in a plain TypeScript utility function instead.

Write a composable when the logic:
- creates or works with reactive state (`ref`, `computed`, `watch`, `watchEffect`, `shallowRef`)
- registers lifecycle hooks (`onScopeDispose`, `onMounted`, `onUnmounted`, etc.)
- depends on setup context — for example, injecting a provided value via `inject`, or using router/store composables that must be called in setup

Write a plain utility function when the logic:
- transforms or derives values without reactivity
- performs pure calculations or data mapping
- has no dependency on Vue internals

```ts
// Composable — owns reactive state, watches a reactive target, cleans up on scope disposal
export function useResizeObserver(target: MaybeRefOrGetter<HTMLElement | null>) {
  const width = ref(0)

  watch(() => toValue(target), (el) => { /* cleanup previous, setup new */ }, { immediate: true })
  onScopeDispose(() => { /* final cleanup */ })

  return { width: readonly(width) }
}

// Utility — pure transformation, no Vue involvement
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value)
}
```

## Naming

Composables are prefixed with `use`. Beyond the prefix, name after what the composable *manages*, not what it *does* — the same principle as component naming.

- `useChargingSession` — not `useFetchChargingSession` or `useHandleSession`
- `useResizeObserver` — not `useObserveResize`
- `useFormValidation` — not `useValidateForm`

The name should read as the thing being encapsulated, not the action being performed. A caller should be able to infer what state and behaviour they get back from the name alone.

## Parameters

The key question for each parameter: can this value change after the composable is set up, and should the composable react when it does?

**Plain value** — use when the parameter is static configuration that will not change for the lifetime of the composable. The composable reads it once at setup time.

```ts
export function useDebounce(fn: () => void, delay: number) {
  // delay is static — no need to react to changes
}
```

**Ref or getter** — use when the parameter can change and the composable's internal logic should react to those changes. Accept `MaybeRefOrGetter<T>` and resolve it with `toValue()` so callers can pass either a plain value or a reactive source.

```ts
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export function useSessionDetails(sessionId: MaybeRefOrGetter<string>) {
  const details = shallowRef(null)

  watch(
    () => toValue(sessionId),
    (id) => { /* re-fetch when id changes */ },
    { immediate: true }
  )

  return { details }
}

// Caller can pass a plain string, a ref, or a getter
useSessionDetails('abc-123')
useSessionDetails(selectedSessionId)
useSessionDetails(() => route.params.sessionId as string)
```

`toValue()` normalises all three forms — `T`, `Ref<T>`, and `() => T` — to the current value. Prefer it over `unref()` when getters are a valid input.

## Return shape

Always return a plain object — not a reactive object. This keeps the return shape explicit and lets callers destructure without losing reactivity.

```ts
// Correct — plain object, refs stay reactive when destructured
return { session, status, startSession }

// Wrong — reactive() wrapping obscures what is returned and creates pitfalls
return reactive({ session, status, startSession })
```

Return `readonly` refs when the caller should not mutate the value directly. Expose a dedicated function for mutations instead.

```ts
const _status = ref<SessionStatus>('idle')

function setStatus(next: SessionStatus) {
  _status.value = next
}

return {
  status: readonly(_status),
  setStatus,
}
```

Be selective about what you return. Expose only what callers need — internal refs and helpers used only within the composable stay private.

---

## Setup and teardown

Side effects registered inside a composable must be cleaned up. Use `onScopeDispose` rather than `onUnmounted` — it fires when the current reactive scope is disposed, which works correctly both inside components and in any other reactive scope (e.g. `effectScope`). `onUnmounted` only works in component context.

When the side effect is tied to a reactive target, use `watch` to manage setup and teardown together: clean up the old target when the value changes, set up the new one, and use `onScopeDispose` for the final cleanup when the scope is torn down.

```ts
export function useResizeObserver(target: MaybeRefOrGetter<HTMLElement | null>) {
  const width = ref(0)
  let observer: ResizeObserver | null = null

  function cleanup() {
    observer?.disconnect()
    observer = null
  }

  watch(
    () => toValue(target),
    (el) => {
      cleanup() // disconnect from previous target
      if (!el)
        return
      observer = new ResizeObserver(([entry]) => {
        width.value = entry.contentRect.width
      })
      observer.observe(el)
    },
    { immediate: true },
  )

  onScopeDispose(cleanup)

  return { width: readonly(width) }
}
```

Composables must be called in setup context — either directly in `<script setup>` or inside another composable that is itself called in setup. Calling a composable outside setup (e.g. in an event handler or async callback) breaks lifecycle hook registration.

---

## Patterns

### Encapsulating feature state

The most common pattern: a feature composable owns all reactive state and actions for a feature, and the feature component uses it as a coordinator.

```ts
export function useChargingSession() {
  const selectedTypeId = ref<string | null>(null)
  const status = ref<SessionStatus>('idle')

  async function startSession() {
    status.value = 'starting'
    // ...
  }

  return {
    selectedTypeId,
    status: readonly(status),
    startSession,
  }
}
```

### Wrapping a ref with derived logic

When a raw ref needs computed derivations or guarded mutations, wrap it in a composable rather than spreading that logic across components.

```ts
export function useSessionStatus(initial: SessionStatus = 'idle') {
  const status = ref(initial)
  const isActive = computed(() => status.value === 'active')
  const canStart = computed(() => status.value === 'idle')

  return { status: readonly(status), isActive, canStart }
}
```

### Composing composables

Composables can call other composables. Keep each composable focused on one concern and compose them at the feature level. Each composable owns its own state — avoid passing a ref created in one composable into another composable that also tries to own or mutate it.

```ts
export function useChargingSession(sessionId: MaybeRefOrGetter<string>) {
  const { data: session, isPending } = useSessionQuery(sessionId) // data fetching concern
  const { location, isLocating } = useLocationResolver() // location concern

  return { session, isPending, location, isLocating }
}
```
