# Feature Components

A feature component owns the logic and state for a specific feature. It is the single source of truth for its feature's state and coordinates the domain and UI components beneath it.

## State ownership

A feature component creates and owns its reactive state. It passes current values down to children via props or v-model and updates state in response to emitted events. Children never manage this state independently.

```vue
<script setup lang="ts">
// This component owns selectedTypeId — it is the single source of truth
const selectedTypeId = ref<string | null>(null)

function handleSessionStart() {
  // only the owner mutates the state
}
</script>

<template>
  <ChargingTypeSelector v-model="selectedTypeId" />
  <StartSessionButton :disabled="!selectedTypeId" @click="handleSessionStart" />
</template>
```

## Coordinating children

A feature component delegates rendering to domain and UI components — it does not render UI primitives directly. Its template is a composition of domain and feature-level components.

If a feature component is directly rendering `<Button>`, `<ComboBox>`, or other UI primitives, introduce a domain component to bridge between the feature's data and the UI primitive's API.

## Extracting logic into composables

When a feature component's logic grows complex, extract it into a composable. The feature component then becomes the coordinator between the composable (logic) and the template (structure).

```ts
// useChargingSession.ts
import { ref } from 'vue'

export function useChargingSession() {
  const selectedTypeId = ref<string | null>(null)
  const status = ref<SessionStatus>('idle')

  async function startSession() { /* ... */ }

  return { selectedTypeId, status, startSession }
}
```

```vue
<!-- ChargingSessionManager.vue -->
<script setup lang="ts">
const { selectedTypeId, status, startSession } = useChargingSession()
</script>
```

See [composable-principles.md](composable-principles.md) for naming, return shape, and patterns.

## Data fetching and forms

Data fetching and form logic are feature-level concerns. Keep them in the feature component or a feature-local composable — not in views, domain components, or UI components.

- For data fetching patterns → [data-fetching.md](data-fetching.md)
- For form handling patterns → [forms.md](forms.md)

## Naming

Name feature components after the feature they manage, not the layout they produce:

- `ChargingSessionManager.vue`
- `UserProfileEditor.vue`
- `PaymentFlowController.vue`
