# Forms

Forms use TanStack Vue Form (`@tanstack/vue-form`) for state management and Zod for validation.

## Form setup

Keep `useForm` in the component, not in a separate composable. The `form.Field` component is rendered in the template — the `form` instance and the template are inseparable. The mutation that `onSubmit` calls belongs in a composable; the form wiring belongs in the component.

```ts
const { update, isUpdating } = useBusinessDetails() // mutation in composable

const form = useForm({
  defaultValues: getDefaultValues(),
  onSubmit: async ({ value }) => {
    await update(value)
  },
})
```

**Default values** — always define as a factory function, not an inline object. This makes it easy to reset the form to current server values when data loads or changes.

```ts
function getDefaultValues() {
  return {
    companyName: data.value?.companyName ?? '',
    logoUrl: data.value?.logoUrl ?? '',
  }
}
```

Do not use `reactive` with `computed` properties for `defaultValues`. TanStack Form snapshots the values at creation time — computed refs inside a reactive object do not produce reactive updates to the form.

---

## Schema validation with Zod

Define schemas separately from the form setup as a `schemas` const. This keeps validation rules readable and allows reuse across fields or forms.

```ts
const schemas = {
  email: z.string().email('Please enter a valid email'),
  url: z
    .string()
    .url('Please enter a valid URL')
    .regex(/^https/, 'URL must start with https://'),
  optionalUrl: z.union([
    z.string().url().regex(/^https/),
    z.string().length(0),
  ]),
} as const
```

**Form-level validation** — the default. Pass a `z.object` to `validators` on `useForm`. Errors propagate automatically to each field's `field.state.meta.errors`, so no per-field validators are needed:

```ts
const form = useForm({
  defaultValues: getDefaultValues(),
  validators: {
    onChange: z.object(schemas),
  },
  onSubmit: async ({ value }) => { /* ... */ },
})
```

**Per-field validation** — only add when a specific field needs a different validation trigger than the rest. For example, if most fields validate `onChange` but one should only validate `onBlur`:

```vue
<!-- No per-field validator needed — form-level handles it -->
<form.Field name="email">
...
</form.Field>

<!-- This field needs a different trigger -->
<form.Field name="url" :validators="{ onBlur: schemas.url }">
...
</form.Field>
```

Do not add a per-field validator that duplicates the same trigger as the form-level validator — it causes the field to be validated twice with the same result.

---

## Field binding

Use the `form.Field` component with its default slot. Wire the field's value, blur, and change handlers to the input:

```vue
<form.Field name="email" :validators="{ onChange: schemas.email }">
  <template #default="{ field }">
    <label :for="field.name">Email</label>
    <input
      :id="field.name"
      :name="field.name"
      :value="field.state.value"
      @blur="field.handleBlur"
      @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
    />
    <em v-if="field.state.meta.errors.length" role="alert">
      {{ field.state.meta.errors.filter(Boolean).at(0)?.message }}
    </em>
  </template>
</form.Field>
```

When binding to a project UI component, pass `field.state.value` as the model value and wire `field.handleChange` and `field.handleBlur` to the component's events.

**Error display** — show only the first error, filter out falsy values from Zod union schemas that produce empty error entries: `field.state.meta.errors.filter(Boolean).at(0)?.message`.

---

## Validation behaviour

TanStack Form validates when and how you configure it. The most common validators:

| Trigger | When to use |
|---|---|
| `onChange` | Immediate feedback as the user types — good for format validation |
| `onBlur` | Validate after the user leaves a field — less disruptive |
| `onSubmit` | Validate only on submission — use for server-side errors |

Both examples use `onChange`. Prefer `onBlur` for fields where real-time validation is distracting (e.g. a URL field that is invalid until fully typed). Combine both when needed: `{ onChange: schema, onBlur: schema }`.

---

## Syncing with server data

For edit forms where `defaultValues` depend on data loaded from the server, use a `watch` + `form.reset` pattern to keep the form in sync:

```ts
const { data } = useBusinessDetails()

function getDefaultValues() {
  return {
    companyName: data.value?.companyName ?? '',
    logoUrl: data.value?.logoUrl ?? '',
  }
}

const form = useForm({ defaultValues: getDefaultValues(), /* ... */ })

watch(data, () => form.reset(getDefaultValues()), { immediate: true })
```

`{ immediate: true }` ensures the form is populated on first load. `form.reset` replaces the form state with fresh default values without re-creating the form instance.

---

## Dynamic fields

Use `form.pushFieldValue` and `form.removeFieldValue` to manage array fields. Access nested fields using dot and bracket notation in the `name` prop:

```ts
const addContact = () => form.pushFieldValue('contacts', { type: 'EMAIL', value: '' })
const removeContact = (index: number) => form.removeFieldValue('contacts', index)
```

```vue
<form.Field name="contacts">
  <template #default="{ field }">
    <div v-for="(_, i) in field.state.value" :key="i">
      <form.Field :name="`contacts[${i}].value`">
        <template #default="{ field: subField }">
          <input
            :value="subField.state.value"
            @blur="subField.handleBlur"
            @input="(e) => subField.handleChange((e.target as HTMLInputElement).value)"
          />
        </template>
      </form.Field>

      <button type="button" @click="removeContact(i)">
Remove
</button>
    </div>
  </template>
</form.Field>
```

---

## Submission

Bind `form.handleSubmit` to the form's submit event. Always include `.prevent` and `.stop` to prevent default browser submission and stop propagation to any parent form:

```vue
<form @submit.prevent.stop="form.handleSubmit">
```

`onSubmit` receives the validated form values. Delegate to the mutation from a composable and let the composable handle loading state:

```ts
const form = useForm({
  defaultValues: getDefaultValues(),
  onSubmit: async ({ value }) => {
    await update({
      companyName: value.companyName.trim() || null,
      logoUrl: value.logoUrl.trim() || null,
    })
  },
})
```

Trim string values in `onSubmit` before passing to the mutation. Use `|| null` to convert empty strings to `null` for optional fields.
