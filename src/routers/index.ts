import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'
import { resetHeaderTitle } from '../composables/useHeaderTitle'

const route = setupLayouts(generatedRoutes) as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(),
  routes: route,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

router.beforeEach(() => {
  return true
})

// รีเซ็ต header title ทุกครั้งที่เปลี่ยนหน้า (component จะถูก destroy ตอน route เปลี่ยน)
router.afterEach(() => {
  resetHeaderTitle()
})

export default router
