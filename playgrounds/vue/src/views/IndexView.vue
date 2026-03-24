<script setup lang="ts">
import DevMenu from '@/dev/components/DevMenu.vue'
import DevOnly from '@/dev/components/DevOnly.vue'
</script>

<template>
  <main class="min-h-screen p-12">
    <h1>Hello World</h1>

    <DevOnly>
      <DevMenu />
    </DevOnly>
  </main>
</template>
