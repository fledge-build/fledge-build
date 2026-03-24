# Views

A view is the entry point for a route. Its responsibility is page-level composition — assembling the feature and domain components that make up the page and handling route-level concerns. Views are intentionally thin.

## Composition over logic

A view composes, it does not implement. Business logic, state management, and data fetching belong in feature components or composables — not in the view itself.

If a view's `<script setup>` is growing complex, that is a signal to extract a feature component.

```vue
<!-- Correct — view is thin, delegates to feature components -->
<template>
  <AppLayout>
    <ChargingSessionManager />
    <ChargingHistoryList />
  </AppLayout>
</template>
```

## Route-level concerns

Views handle the concerns that are specific to being a route entry point:

- Reading route params and query params
- Navigation guards (via `onBeforeRouteLeave`, `onBeforeRouteUpdate`)
- Page-level layout and structure
- Passing route data down as props to feature components

Route params and query params are read in the view and passed down explicitly as props — they do not leak into feature components via `useRoute()`.

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
</script>

<template>
  <ChargingSessionDetail :session-id="sessionId" />
</template>
```

## Naming and location

Views live in a `views/` or `pages/` directory. Name them after the route they represent, suffixed with `View`:

- `ChargingSessionView.vue`
- `UserProfileView.vue`
- `DashboardView.vue`
