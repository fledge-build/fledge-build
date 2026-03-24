# reka-ui

reka-ui is the primitive library for all interactive UI components. It provides accessible, unstyled building blocks that this project styles with Tailwind.

## Explore before assuming

**Do not assume how a reka-ui primitive works based on general knowledge or patterns from other libraries.**

Before using any reka-ui primitive, locate and read its type definitions using a glob:

```text
node_modules/reka-ui/**/{index,main}.d.ts
```

Check what props and emits the primitive actually exposes — do not guess from the component name alone.

This matters because applying generic "controlled component" intuition often produces code that appears to work (the UI updates locally) but does not propagate state correctly through the component tree.

## What to look for

**Group roots** — for any selection primitive, check whether a group root component exists (e.g. `CheckboxGroupRoot`, `RadioGroupRoot`, `ToggleGroupRoot`, `SelectRoot`). If it does, it is the correct entry point for managing selection state. The individual item component (e.g. `CheckboxRoot`) is meant to be composed inside the group root — props that seem relevant on the item (like `checked`) may be ignored or behave differently when a group root is managing state.

**Standalone vs. group context** — read whether a prop is documented for standalone use, group use, or both. A prop that works on a standalone component may conflict with or be overridden by the group root.

**Value shape** — check what type the group root's `v-model` actually accepts. It is often `string[]` or `string | null`, not a custom object. If your component's `modelValue` has a different shape, bridge it with a computed ref as described in [ui-components.md](ui-components.md#binding-to-reka-ui-primitives).
