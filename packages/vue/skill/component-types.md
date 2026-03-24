# Component Types

## Classification guide

Work through these questions in order to determine the component type:

1. **Is this component bound to a route?** → View
2. **Does it wrap exactly one UI primitive and map domain data to its API?** → Domain component
3. **Does it own business logic or feature state and coordinate multiple children?** → Feature component
4. **Is it generic and reusable with zero domain knowledge?** → UI component

If a component seems to fit multiple types, that is a signal to split it.

---

## Where styling lives

Styling belongs exclusively in UI components. Every other layer composes UI components — including structural ones — to achieve its visual result.

| Type | Styling |
|---|---|
| **UI component** | Owns all styling. The only place Tailwind classes live. |
| **Domain component** | None. Inherits appearance entirely from the UI primitive it wraps. |
| **Feature component** | None. Uses structural UI components (`Stack`, `Card`, `Grid`, etc.) for layout needs. |
| **View** | None. Uses structural UI components for page-level layout. |

If a feature component or view needs layout — spacing, grouping, grid arrangement — the answer is always a structural UI component, not a Tailwind class applied directly. If the right structural component does not exist yet, create it first.

---

## View

A view is the entry point for a route. It owns the page-level composition — which feature components appear, how they are laid out — but contains minimal logic itself.

**Responsibilities:**
- Page-level layout and structure
- Composing feature and domain components
- Route-level concerns (params, query, navigation guards)

**Does not:**
- Own feature-level business logic or state
- Render UI primitives directly
- Contain component logic that could live in a feature component

**Example:** `ChargingSessionView.vue` renders a `ChargingSessionManager` and a `ChargingHistoryList` in a layout — it does not manage charging state itself.

---

## Feature component

A feature component owns the logic and state for a specific feature. It coordinates the domain and UI components beneath it, decides what data flows where, and is the single owner of the state it creates.

**Responsibilities:**
- Owning and managing feature state
- Coordinating child components
- Handling business logic for the feature
- Data fetching and side effects for the feature

**Does not:**
- Render UI primitives directly — delegates to domain or UI components
- Leak its internal state to siblings — state flows downward via props/v-model

**Example:** `ChargingSessionManager.vue` owns the selected charging type, the session status, and coordinates a `ChargingTypeSelector` and a `StartSessionButton`.

---

## Domain component

A domain component is the bridge between a domain concept and a UI primitive. It wraps exactly one UI primitive, provides it with domain-specific data, and translates between domain values and the UI component's API.

**Responsibilities:**
- Mapping domain data to a UI component's props (e.g. converting `ChargingType[]` to `Combobox` options)
- Emitting domain values — not internal UI values
- Naming and representing a specific domain concept

**Does not:**
- Contain business logic beyond the domain-to-UI mapping
- Own state (state is passed in via v-model from the parent)
- Wrap more than one UI primitive — if it does, reconsider the split

**Naming:** after the domain concept it represents, not the UI primitive it wraps. `ChargingTypeSelector`, not `ChargingTypeComboBox`.

**Example:** `ChargingTypeSelector.vue` wraps `Combobox`. It fetches or receives `ChargingType[]`, converts them to `{ label, value }` options, and emits the selected type's id — not the full option object.

---

## UI component

A UI component is a generic, fully reusable building block with zero knowledge of the domain or business logic. It accepts generic props, is completely self-contained in styling, and can be used in any context across any project.

**Responsibilities:**
- Rendering UI with full internal control over styling and layout
- Accepting generic, domain-agnostic props
- Providing a clean, consistent API (variants, sizes, states)

**Does not:**
- Know anything about the domain or business logic
- Accept `class` or `style` props on its root element
- Depend on external state — it receives values and emits changes

**Example:** `Combobox.vue` accepts `options: { label: string, value: string }[]` and `modelValue: string`. It has no knowledge of charging types, users, or any other domain concept.
