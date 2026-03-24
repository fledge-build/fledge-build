<script setup lang="ts">
const stats = [
  { label: 'Active Sessions', value: '24', delta: '+3 vs yesterday', color: 'info' },
  { label: 'Revenue Today', value: '€2,847', delta: '+12% vs yesterday', color: 'success' },
  { label: 'Caution Alerts', value: '5', delta: '2 unresolved', color: 'caution' },
  { label: 'Offline Stations', value: '1', delta: 'Since 09:14', color: 'destructive' },
]

const sessions = [
  { id: 'CHG-001', station: 'Berlin-Mitte A2', user: 'Max Müller', kwh: '32.4', duration: '1h 12m', status: 'active' },
  { id: 'CHG-002', station: 'Hamburg HBF B1', user: 'Anna Schmidt', kwh: '18.1', duration: '0h 41m', status: 'active' },
  { id: 'CHG-003', station: 'Munich Ost C3', user: 'Lukas Weber', kwh: '61.0', duration: '2h 05m', status: 'completed' },
  { id: 'CHG-004', station: 'Frankfurt A7', user: 'Julia Bauer', kwh: '—', duration: '—', status: 'error' },
  { id: 'CHG-005', station: 'Cologne Ring D2', user: 'Tom Fischer', kwh: '44.7', duration: '1h 33m', status: 'completed' },
  { id: 'CHG-006', station: 'Stuttgart West E1', user: 'Sara Keller', kwh: '9.2', duration: '0h 19m', status: 'warning' },
]

const statusStyle: Record<string, string> = {
  active: 'bg-info/15 text-info',
  completed: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-destructive/15 text-destructive',
}

const statusLabel: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  warning: 'Warning',
  error: 'Error',
}

const swatches = [
  { name: 'background', cls: 'bg-background border border-border' },
  { name: 'surface', cls: 'bg-surface' },
  { name: 'surface-2', cls: 'bg-surface-2' },
  { name: 'foreground', cls: 'bg-foreground' },
  { name: 'subtle', cls: 'bg-subtle' },
  { name: 'muted', cls: 'bg-muted' },
  { name: 'border', cls: 'bg-border' },
  { name: 'primary', cls: 'bg-primary' },
  { name: 'success', cls: 'bg-success' },
  { name: 'info', cls: 'bg-info' },
  { name: 'caution', cls: 'bg-caution' },
  { name: 'warning', cls: 'bg-warning' },
  { name: 'destructive', cls: 'bg-destructive' },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold text-primary tracking-tight">Fledge</span>
          <span class="text-subtle text-sm">/ playground</span>
        </div>
        <nav class="flex items-center gap-6 text-sm text-subtle">
          <span class="text-foreground font-medium">Dashboard</span>
          <span>Stations</span>
          <span>Users</span>
          <span>Settings</span>
        </nav>
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            MK
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-semibold text-foreground">
          Overview
        </h1>
        <p class="text-subtle text-sm mt-1">
          Live charging network · updated just now
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl border border-border bg-surface p-5 space-y-3"
        >
          <p class="text-xs font-medium text-muted uppercase tracking-wider">
            {{ stat.label }}
          </p>
          <p class="text-3xl font-bold text-foreground">
            {{ stat.value }}
          </p>
          <p
            class="text-xs font-medium" :class="[
              stat.color === 'success' ? 'text-success'
              : stat.color === 'info' ? 'text-info'
                : stat.color === 'caution' ? 'text-caution'
                  : stat.color === 'destructive' ? 'text-destructive' : 'text-subtle',
            ]"
          >
            {{ stat.delta }}
          </p>
        </div>
      </div>

      <!-- Sessions table -->
      <div class="rounded-xl border border-border bg-surface overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-sm font-semibold text-foreground">
            Charging Sessions
          </h2>
          <span class="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            {{ sessions.filter(s => s.status === 'active').length }} active
          </span>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-2 text-left">
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Station
              </th>
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                kWh
              </th>
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                Duration
              </th>
              <th class="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="session in sessions"
              :key="session.id"
              class="hover:bg-background/50 transition-colors"
            >
              <td class="px-6 py-3 font-mono text-xs text-subtle">
                {{ session.id }}
              </td>
              <td class="px-6 py-3 text-foreground">
                {{ session.station }}
              </td>
              <td class="px-6 py-3 text-subtle">
                {{ session.user }}
              </td>
              <td class="px-6 py-3 text-right text-foreground tabular-nums">
                {{ session.kwh }}
              </td>
              <td class="px-6 py-3 text-right text-subtle tabular-nums">
                {{ session.duration }}
              </td>
              <td class="px-6 py-3 text-right">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="[statusStyle[session.status]]">
                  {{ statusLabel[session.status] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Color swatches -->
      <div class="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h2 class="text-sm font-semibold text-foreground">
          Color Tokens
        </h2>
        <div class="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
          <div v-for="swatch in swatches" :key="swatch.name" class="flex flex-col gap-1.5">
            <div class="h-10 rounded-lg" :class="[swatch.cls]" />
            <span class="text-[10px] text-muted font-mono leading-none">{{ swatch.name }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
