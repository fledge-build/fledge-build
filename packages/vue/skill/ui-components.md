# UI Components

A UI component is a generic, fully reusable building block with zero domain or business knowledge. It owns its styling entirely and exposes a clean, consistent API.

## Categories

UI components are organised into categories. This taxonomy determines what components to reach for when composing features and views — particularly structural components, which are what allow feature and view layers to remain styling-free.

| Category | Purpose | Examples |
|---|---|---|
| **Actions** | Triggers and navigation controls | `Button`, `Link`, `IconButton` |
| **Forms** | Inputs and selection controls | `TextInput`, `Combobox`, `RadioGroup`, `Toggle`, `DatePicker` |
| **Feedback** | Status, alerts, and loading states | `Badge`, `Banner`, `Spinner`, `Toast` |
| **Data** | Structured data display | `Table`, `DataList`, `Stat` |
| **Content** | Text, icons, and media | `Text`, `Heading`, `Icon`, `Avatar` |
| **Structure** | Layout and composition | `Stack`, `Grid`, `Card`, `Divider`, `Section`, `Page` |
| **Overlays** | Floating and modal layers | `Modal`, `Dialog`, `Popover`, `Tooltip`, `Sheet` |
| **Navigation** | Movement within the application | `Tabs`, `Breadcrumb`, `Pagination`, `NavLink` |

**Structure components are the primary tool for layout** — feature components and views should use them instead of applying layout classes directly. If a structural component does not exist yet for a layout need, create it first as a UI component before composing it into the feature.

Overlays and navigation components carry specific accessibility requirements (focus trapping, ARIA roles, keyboard interaction) — always use the corresponding reka-ui primitives as their foundation.

---

## Styling encapsulation

A UI component is fully responsible for its own styling. It does not accept `class` or `style` props on its root element — external code has no influence over its internal appearance.

**Before applying any styling, read [design-tokens.md](design-tokens.md).** Explore what tokens the project defines before reaching for raw Tailwind utilities or inventing values.

The only exception is outer spacing (margin) when required for layout purposes, handled by a wrapping element in the parent — never by a prop on the UI component itself.

## Variants with CVA

Use `class-variance-authority` (CVA) to define variants. Variant values are defined as shared constants — not inline strings — so they can be referenced consistently across components.

```ts
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { SIZE_BASE, SIZE_LARGE, SIZE_SMALL } from '../shared/variants'

const componentVariants = cva('/* base classes */', {
  variants: {
    size: {
      [SIZE_SMALL]: '...',
      [SIZE_BASE]: '...',
      [SIZE_LARGE]: '...',
    },
  },
  defaultVariants: {
    size: SIZE_BASE,
  },
})

type Variants = VariantProps<typeof componentVariants>
```

Use `compoundVariants` for styles that depend on a combination of variant values.

## Props pattern

Define props with a TypeScript interface, apply defaults with `withDefaults`, and validate the result with `satisfies Variants` to ensure prop types stay in sync with CVA variant definitions. Do not include `modelValue` in the props interface — it is handled separately via `defineModel` (see Form input modelValue below). This keeps all variant-related props unified in `withDefaults` so the `satisfies Variants` check works correctly.

In Vue 3 `<script setup>`, `defineProps` is a compiler macro — props are available as top-level template variables regardless of whether the result is assigned. **Do not assign the result to `props` unless you need to reference props by name inside the script block.** Assigning to an unused `props` variable triggers a lint error.

```ts
// No assignment — props (size, disabled) are accessible directly in the template
withDefaults(defineProps<MyComponentProps>(), {
  size: SIZE_BASE,
  disabled: false,
}) satisfies Variants

export interface MyComponentProps {
  /**
   * Component size
   * @default 'base'
   */
  size?: 'sm' | 'base' | 'lg'

  /**
   * @default false
   */
  disabled?: boolean
}
```

Only assign when props are used inside the script block (e.g. in a computed or watcher):

```ts
// Assignment needed — props.userId is referenced in a script-side watcher
const props = withDefaults(defineProps<MyComponentProps>(), {
  userId: null,
}) satisfies Variants

watch(() => props.userId, fetchUser)
```

Export the props interface so consumers can reference it.

## Accessible primitives with reka-ui

Use reka-ui primitives as the foundation for interactive components. This provides accessible behaviour (keyboard navigation, ARIA attributes, focus management) without building it from scratch.

**Before using any reka-ui primitive, read [reka-ui.md](reka-ui.md).** Do not assume how a primitive works — fetch its official documentation first.

For polymorphic components — components that can render as different elements or be composed into other components — use the `Primitive` component and expose `as` and `asChild` props:

```ts
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from 'reka-ui'

export interface MyComponentProps {
  as?: PrimitiveProps['as']
  asChild?: PrimitiveProps['asChild']
}
```

## Consistent variant vocabulary

Use the shared variant constants from `shared/variants.ts` for all size, color, and variant values. Do not introduce one-off string values — maintain a consistent vocabulary across all UI components.

Common variant dimensions:
- **Size:** `xs`, `sm`, `base`, `lg`, `xl`
- **Color:** `default`, `primary`, `success`, `info`, `caution`, `warning`, `destructive`
- **Variant:** `ghost`, `outlined`, `contained`

## Form input modelValue

Declare `modelValue` via `defineModel` — separately from the props interface so it does not interfere with the `satisfies Variants` check on the other props.

### Concrete vs. generic types

The decision depends on who controls the value type:

**Option-based components** (Select, RadioGroup, Combobox, CheckboxGroup) — the consumer provides the options and their values, so the value type is consumer-defined. Always use the `generic` attribute:

```vue
<script setup lang="ts" generic="T extends string | number = string">
export interface RadioGroupProps<T extends string | number> {
  options: RadioGroupOption<T>[]
  disabled?: boolean
}

export interface RadioGroupOption<T extends string | number> {
  label: string
  value: T
}

withDefaults(defineProps<RadioGroupProps<T>>(), {
  disabled: false,
})

const modelValue = defineModel<T | null>({ default: null })
</script>
```

The constraint `T extends string | number` covers the common cases. The default `= string` means the component works without an explicit type argument when the value is a string.

**Intrinsic value components** (TextInput, NumberInput, Toggle, DatePicker) — the value type is determined by the component itself, not the consumer. Use a concrete type:

```ts
// TextInput always produces a string
const modelValue = defineModel<string>({ default: '' })

// Toggle always produces a boolean
const modelValue = defineModel<boolean>({ default: false })
```

### Nullish values

Allow `null` when no selection is a valid state (optional input). Use `default: null` so the parent is not required to provide an initial value:

```ts
const modelValue = defineModel<string | null>({ default: null })
// or with a generic
const modelValue = defineModel<T | null>({ default: null })
```

Use `required: true` (non-null) only when the component always has a value — for example, a segmented control that always has one option active:

```ts
const modelValue = defineModel<string>({ required: true })
```

Prefer `null` over `undefined` for an explicit empty state.

### Binding to reka-ui primitives

Bind `modelValue` to the reka-ui root component using `v-model` — not `:model-value` plus an event handler:

```vue
<!-- Correct -->
<RadioGroupRoot v-model="modelValue">

<!-- Avoid -->
<RadioGroupRoot
  :model-value="props.modelValue"
  @update:model-value="(v) => emit('update:modelValue', v)"
>
```

reka-ui internally uses `undefined` for the empty state, while our API uses `null`. When the types don't align, bridge the mismatch with a computed ref rather than inline casting:

```ts
import { computed } from 'vue'

const internalValue = computed({
  get: () => modelValue.value ?? undefined,
  set: (v) => { modelValue.value = v ?? null },
})
```

```vue
<RadioGroupRoot v-model="internalValue">
```

## Accessibility

UI components are responsible for their own accessibility. reka-ui handles most ARIA behaviour — ensure the following are always correct:

**Labels:** every form input must have an associated label. Use reka-ui's `Label` component with a matching `for` attribute pointing to the input's `id`. Never render a visible label without the `for` association.

```vue
<Label :for="inputId">
Charging type
</Label>

<input :id="inputId" ... />
```

For compound reka-ui components (e.g. `RadioGroup`, `Select`), use the label primitives provided by reka-ui rather than plain HTML `<label>` elements.

## Icons

Use `@iconify/vue` for icons. Accept an icon name as a `string` prop (e.g. `'lucide:search'`) — do not import icon components directly. Size icons relative to the component's own size variant.
