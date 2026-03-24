# Component Principles

These principles apply to every component regardless of type.

---

## Component structure

Every component uses `<script setup lang="ts">`. No options API, no plain `<script>`.

```vue
<script setup lang="ts">
// ...
</script>

<template>
  <SomeRootComponent>
    <!-- ... -->
  </SomeRootComponent>
</template>
```

---

## Imports

Vue's compiler macros — `defineProps`, `defineEmits`, `defineModel`, `withDefaults`, `defineExpose` — are globally available inside `<script setup>` and must not be imported. All other Vue APIs must be explicitly imported from `'vue'`.

```ts
// Wrong — ref is not a compiler macro
// Correct
import { ref } from 'vue'

const count = ref(0)
const count = ref(0)
```

This applies to everything used from Vue: `computed`, `watch`, `watchEffect`, `onMounted`, `shallowRef`, `toRef`, `nextTick`, etc.

---

## Props

When `defineProps` is assigned to a const, always reference props through that const in both `<script setup>` and `<template>`. Accessing props directly by name in the template while the `props` const goes unused causes lint errors and inconsistency.

```ts
const props = defineProps<ButtonProps>()

// Correct — use props.x in script
const isLarge = computed(() => props.size === SIZE_LARGE)
```

```vue
<template>
  <!-- Correct — consistent with script, no unused const -->
  <Primitive :disabled="props.disabled">
    <slot />
  </Primitive>
</template>
```

---

## Single responsibility

A component does one thing. If you find yourself using "and" to describe what a component does, it likely needs to be split.

Signs a component has too many concerns:
- It mixes UI rendering with business logic
- It handles multiple unrelated business concerns
- Its props cover fundamentally different areas of functionality
- It is difficult to name without using "and"

Split along the boundaries defined by the component taxonomy — UI, domain, feature, and view are distinct concerns and should live in distinct components.

---

## Extend vs. create

When modifying an existing component, decide upfront whether to extend it or create a new focused component.

**Extend the existing component when:**
- The change adds to the same responsibility the component already has
- The new props fit naturally alongside the existing ones
- The component's name still accurately describes what it does after the change

**Create a new focused component when:**
- The change introduces a second distinct responsibility
- The new props don't belong alongside the existing ones
- Accurately describing the combined result would require "and"

When in doubt, prefer creating a new focused component over stretching an existing one.

---

## Single state ownership

Every piece of reactive state has exactly one owner: the component that created it. That component is solely responsible for mutating it.

**The pattern:**
- The owner creates the ref and manages its value
- Children receive the current value via props or v-model
- Children signal intent to change via emits
- The owner decides whether and how to update the state

**v-model is encouraged** for parent-child state binding — it is the idiomatic Vue mechanism for this pattern, not a violation of it. Ownership still stays with the parent.

**Avoid internal copies:** do not mirror a prop into a local ref to manage it independently. This creates two sources of truth and leads to sync bugs.

```ts
// Wrong — creates a second owner
const internal = ref(props.modelValue)

// Correct — emit the change, let the owner update
emit('update:modelValue', newValue)
```

---

## Reactivity

Use `shallowRef` for non-primitive reactive state. For objects, arrays, and other complex values, `shallowRef` makes reactivity depth explicit and avoids unnecessary deep observation.

When using `shallowRef`, replace the entire value to trigger reactivity — mutating nested properties does not.

```ts
const session = shallowRef<Session | null>(null)

// Correct — replace the value
session.value = { ...session.value, status: 'active' }

// Wrong — mutation won't trigger reactivity
session.value.status = 'active'
```

---

## v-model exposes values, not objects

When a component has options (e.g. a select, combobox, or radio group), `modelValue` must be the option's value — a primitive — not the full option object.

The component is responsible for mapping between the value and its internal representation. The parent should not need to know the shape of an option item.

```ts
// Wrong
modelValue: ComboBoxOption // { label: string, value: string }

// Correct
modelValue: string // just the value
```

This keeps the component's API clean and prevents internal data structures from leaking into parent components.

---

## Clean API

Props and emits form the public contract of a component. They should be self-explanatory to anyone reading a template, without needing to look at the component implementation.

**Props:**
- Use consistent names across components: `disabled`, `loading`, `variant`, `size`, `color`
- Be intentional about required vs. optional — provide sensible defaults where appropriate
- Do not expose internal implementation details as props

**Emits:**
- Name emits after what happened, not what should happen
- `update:modelValue`, `select`, `close` — not `handleSelect`, `onClose`

**No class or style props on root elements** — a UI component's styling is fully its own concern. External layout (margin) is the only exception, handled via a wrapping element if necessary.

---

## Naming

Name a component after what it *is*, not what it *does*.

- `UserProfile` not `DisplayUserInfo`
- `ChargingTypeSelector` not `SelectChargingType`
- `SessionStatusBadge` not `ShowSessionStatus`

Component names must be multi-word to avoid conflicts with HTML elements.

Domain components are named after the domain concept they represent, not the UI primitive they wrap: `ChargingTypeSelector` not `ChargingTypeComboBox`.

---

## Documentation

Use TSDoc to document exported interfaces and non-obvious props. Keep it proportionate — document what is not self-evident, not everything.

**Always document:**
- Exported prop interfaces with a JSDoc block that includes at least one `@example` showing real usage
- Props where the expected format or constraint is not obvious from the type
- Props with `@default` when the default is not obvious

**Skip documentation for:**
- Props whose name and type make their purpose entirely clear
- Internal implementation details
- Things already expressed by TypeScript types
