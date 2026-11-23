import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { defineComponent } from 'vue'
import { installDynamicTitleGuard } from '@/router/dynamicTitleGuard'

const Blank = defineComponent({ template: '<i />' })

const ROUTES: RouteRecordRaw[] = [
  { path: '/', name: '/', component: Blank },
  { path: '/home', name: '/home', component: Blank, meta: { title: 'หน้าแรก' } },
]

function createTestRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES })
  installDynamicTitleGuard(router)
  return router
}

describe('installDynamicTitleGuard', () => {
  it('overrides the static title from a title query param', async () => {
    const router = createTestRouter()

    await router.push({ name: '/home', query: { title: 'โปรโมชัน' } })

    expect(router.currentRoute.value.meta.title).toBe('โปรโมชัน')
  })

  it('survives landing straight on the route, as a hard reload would', async () => {
    const router = createTestRouter()

    await router.push({ path: '/game', query: { title: 'บทความ/ข่าวสาร' } })

    expect(router.currentRoute.value.meta.title).toBe('บทความ/ข่าวสาร')
  })

  it('leaves the static title alone when there is no title query param', async () => {
    const router = createTestRouter()

    await router.push({ name: '/home' })

    expect(router.currentRoute.value.meta.title).toBe('หน้าแรก')
  })

  it('works on any route, not just one it was written for', async () => {
    const router = createTestRouter()

    await router.push({ path: '/', query: { title: 'อะไรก็ได้' } })

    expect(router.currentRoute.value.meta.title).toBe('อะไรก็ได้')
  })

  it('reverts to the static title after a later navigation drops the query param', async () => {
    const router = createTestRouter()

    await router.push({ name: '/home', query: { title: 'โปรโมชัน' } })
    expect(router.currentRoute.value.meta.title).toBe('โปรโมชัน')

    await router.push({ name: '/home' })
    expect(router.currentRoute.value.meta.title).toBe('หน้าแรก')
  })
})
