# Domain Components

A domain component adapts a single UI primitive to a specific domain concept. It is the only place where domain knowledge and UI knowledge meet — everything above it is domain-aware, everything below it is generic.

## The mapping pattern

A domain component receives domain data, maps it to the UI primitive's API, and emits domain values back. The parent works with domain types; the UI primitive works with generic types — the domain component handles the translation.

Use `defineModel` for the v-model binding — it removes the need for a separate `defineEmits` and makes the bidirectional binding intent explicit. Other props (domain data, configuration) use `defineProps` as normal.

```vue
<!-- ChargingTypeSelector.vue -->
<script setup lang="ts">
import type { ChargingType } from '@/domain/charging'

const props = defineProps<{
  chargingTypes: ChargingType[]
}>()

const model = defineModel<string | null>({ default: null })

// Map domain data to the UI primitive's option format
const options = computed(() =>
  props.chargingTypes.map(type => ({
    label: type.displayName,
    value: type.id,
  }))
)
</script>

<template>
  <ComboBox v-model="model" :options="options" />
</template>
```

## modelValue is a domain value

The domain component's `modelValue` is the domain identifier (e.g. the type's `id`) — not the full domain object and not the UI primitive's internal option shape. The parent receives and emits the domain value it cares about.

## No business logic

A domain component contains no business logic beyond the domain-to-UI mapping. It does not validate, does not trigger side effects, and does not manage feature state. If logic beyond the mapping is needed, it belongs in the parent feature component.

## State ownership

A domain component does not own state. The `modelValue` it receives is owned by the parent. It forwards changes upward via `emit('update:modelValue', value)` and the parent decides what to do with them.

## One UI primitive

A domain component wraps exactly one UI primitive. If the component needs to compose multiple UI primitives, reconsider the split — it may be a feature component in disguise.

The UI primitive it wraps must be a **project UI component** (e.g. `ComboBox`, `RadioGroup`) — not a reka-ui primitive directly. reka-ui is the foundation layer for UI components only; domain components sit one level above that. If a suitable UI component does not exist yet, create it first.

## Display mapping

Domain components often map an enum or string literal union to a display configuration — a badge variant, a label, an icon. Use a `computed` that switches over the value and returns a config object, followed by a `throw` for unhandled cases.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { Status } from '../types'

const props = defineProps<{ status: Status }>()

const config = computed(() => {
  switch (props.status) {
    case Status.CONFIRMED:
      return { variant: 'success' as const, label: 'Confirmed' }
    case Status.PENDING:
      return { variant: 'caution' as const, label: 'Pending' }
  }
  throw new TypeError(`Unsupported status: ${props.status}`)
})
</script>

<template>
  <AppBadge :variant="config.variant">
    {{ config.label }}
  </AppBadge>
</template>
```

Do not use a `default` case — an exhaustive switch lets TypeScript and the linter verify that every member is handled. If a new enum value or union member is added, the missing case becomes a type error. The `throw` after the switch provides a runtime guard for any value that slips through (e.g. data from an untyped API).

The `as const` assertion on each returned `variant` is required to preserve the string literal type — without it TypeScript widens the value to `string`, breaking the UI component's prop type.

This pattern applies equally to TypeScript enums and string literal union types.

---

## Naming

Name after the domain concept the component represents, not the UI primitive it wraps:

- `ChargingTypeSelector` — not `ChargingTypeComboBox`
- `CountryPicker` — not `CountryDropdown`
- `UserRoleBadge` — not `UserRoleTag`
