import type { Router } from 'vue-router'

export function installDynamicTitleGuard(router: Router): void {
  router.beforeEach((to) => {
    const title = to.query.title
    if (typeof title === 'string') to.meta.title = title
  })
}
