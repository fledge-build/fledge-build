---
name: vue-core
description: >-
  Guide Vue feature development following conventions.
  TRIGGER when: creating or modifying .vue files, composables, data fetching (TanStack Query), form logic (TanStack Form), interactive UI (reka-ui), or styling/design tokens — invoke BEFORE writing any code, not after.
  DO NOT TRIGGER when: only reading or explaining existing Vue code with no changes planned.
---

## Step 0: Triage the task

Determine the scope before touching any code.

**Targeted task** — one clear thing: a single component, composable, or logic unit. Proceed to Step 1.

**Full feature** — spans multiple concerns (components, logic, data fetching). **Do not write any code yet.** First:

1. **Map the component hierarchy** — classify each component as View, Feature, Domain, or UI (see [component-types.md](component-types.md))
2. **Identify logic needs** — composables, data fetching, form handling
3. **Audit existing** — for each component and logic unit needed: extend an existing one or create new?
4. **Audit design tokens** — before any styling work, explore the project's token vocabulary: Tailwind config, CSS custom properties, shared variant constants. See [design-tokens.md](design-tokens.md). Do this once per feature, not per component.
5. **Audit required UI components** — for each feature and domain component in the hierarchy, list every UI primitive it needs (inputs, buttons, dialogs, badges, tables, etc.). Check whether each exists in the project. Any missing UI components must be added to the top of the checklist — do not write feature or domain components that depend on UI components that do not exist yet.
6. **Produce a checklist** — explicit list of what to create and what to modify

Then execute the checklist **bottom-up**: UI → Domain → Feature / Logic → View. Each item becomes a targeted task.

---

## Step 1: What are we touching?

**Component** — a `.vue` file. Proceed to Step 2A.

**Logic unit** — a composable or utility function. Proceed to Step 2B.

---

## Step 2A: Component — create or modify?

**Creating a new component** — proceed to Step 3A.

**Modifying an existing component** — first ask: does this change keep the component focused on its single responsibility?

- **Yes** — extend the component. Proceed to Step 3A.
- **No** — the change belongs in a new, focused component. Create that instead. Proceed to Step 3A.

---

## Step 3A: Identify the component type

Before writing any code, determine which type of component this is. The type defines its responsibilities and constraints — see [component-types.md](component-types.md) for full detail and decision guidance.

**View** — Route-bound entry point for a page. Composes feature and domain components, handles page-level layout.

**Feature component** — Owns business logic or feature state. Coordinates child components. Never renders UI primitives directly.

**Domain component** — Adapts a single UI primitive to a domain concept. No business logic beyond the mapping.

**UI component** — Generic, fully reusable, zero business or domain knowledge. Completely self-contained in styling.

---

## Step 4A: Apply component principles

The following principles apply to every component regardless of type. See [component-principles.md](component-principles.md) for full detail.

- **Single responsibility** — one component, one concern; never mix UI with business logic or multiple business concerns
- **Single state ownership** — the component that creates a ref owns it; children receive values and emit changes back
- **v-model exposes values, not objects** — `modelValue` is always a primitive value, never a full option item
- **Clean API** — props and emits are self-explanatory and consistently named
- **Naming** — name after what a component *is*, not what it *does*
- **Documentation** — TSDoc on exported interfaces and non-obvious props; not excessive

---

## Step 5A: Apply type-specific guidance

Consult the reference for the component type identified in Step 3A:

- **UI component** → [ui-components.md](ui-components.md)
- **Domain component** → [domain-components.md](domain-components.md)
- **Feature component** → [feature-components.md](feature-components.md)
- **View** → [views.md](views.md)

---

## Step 2B: Logic unit — create or modify?

**Creating a new logic unit** — proceed to Step 3B.

**Modifying an existing logic unit** — first ask: does this change keep the logic unit focused on its single responsibility?

- **Yes** — extend it. Proceed to Step 3B.
- **No** — create a new focused logic unit instead. Proceed to Step 3B.

---

## Step 3B: Composable or util?

Does this logic involve Vue reactivity, lifecycle hooks, or setup context?

- **No** → plain TypeScript utility function. No further guidance needed.
- **Yes** → composable. Proceed to Step 4B.

---

## Step 4B: Apply composable principles and locate it

See [composable-principles.md](composable-principles.md) for naming, return shape, and patterns.

**Feature-local or shared?**

- Default to **feature-local** — locate it within the feature by existing project convention
- Promote to **shared** deliberately, only when the composable is used across multiple features

---

## Step 5B: What does it do?

Consult the specific reference for the composable's concern:

- **Data fetching** → [data-fetching.md](data-fetching.md) — TanStack Query patterns
- **Form logic** → [forms.md](forms.md) — TanStack Form + Zod patterns
- **Other** → [composable-principles.md](composable-principles.md)
