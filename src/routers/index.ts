import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'

const route = setupLayouts(generatedRoutes) as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(),
  routes: route,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
