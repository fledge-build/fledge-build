import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

function createDevRoutes(): RouteRecordRaw[] {
  if (import.meta.env.PROD) {
    return []
  }

  return [
    {
      path: '/theme-demo',
      component: () => import('@/dev/views/ThemeDemoView.vue'),
    },
  ]
}

function createRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '/',
      component: () => import('@/views/IndexView.vue'),
    },
  ]
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...createRoutes(),
    ...createDevRoutes(),
  ],
})

export default router
