import type { Plugin } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import VueDompurifyHTML from 'vue-dompurify-html'
import DialogHost from '@/components/modal/DialogHost.vue'
import DefaultModal from '@/components/modal/DefaultModal.vue'
import { activeDialogs, closeAllDialogs, Dialog } from '@/components/modal/dialog'

const BlankPage = defineComponent({ template: '<i />' })
const StubDialog = defineComponent({
  props: { label: { type: String, default: '' } },
  setup(props) {
    return () => h('div', props.label)
  },
})

const dompurifyPlugin: [Plugin, unknown] = [
  VueDompurifyHTML,
  { namedConfigurations: { svg: { USE_PROFILES: { svg: true } } } },
]

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: BlankPage },
      { path: '/other', name: 'other', component: BlankPage },
    ],
  })
}

async function mountHost() {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const wrapper = mount(DialogHost, { global: { plugins: [router, dompurifyPlugin] } })
  return { router, wrapper }
}

afterEach(() => {
  closeAllDialogs()
})

describe('DialogHost', () => {
  it('renders every active dialog with its props', async () => {
    Dialog.create({ component: StubDialog, componentProps: { label: 'First' } })
    Dialog.create({ component: StubDialog, componentProps: { label: 'Second' } })

    const { wrapper } = await mountHost()

    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Second')
  })

  it('closes every dialog when the route changes', async () => {
    Dialog.create({ component: StubDialog, componentProps: { label: 'First' } })
    const { router } = await mountHost()
    expect(activeDialogs.value).toHaveLength(1)

    await router.push('/other')

    expect(activeDialogs.value).toHaveLength(0)
  })

  it('forwards ok/cancel emits into the dialog instance close()', async () => {
    const onOk = vi.fn<(payload?: unknown) => void>()
    Dialog.create({ component: StubDialog }).onOk(onOk)
    const { wrapper } = await mountHost()

    await wrapper.findComponent(StubDialog).vm.$emit('ok', 'payload')

    expect(onOk).toHaveBeenCalledWith('payload')
  })

  it('replaces an undismissed cancel-type DefaultModal instead of stacking a new one', async () => {
    Dialog.create({
      component: DefaultModal,
      componentProps: { type: 'error', content: 'First error' },
    })
    await mountHost()
    expect(activeDialogs.value).toHaveLength(1)

    Dialog.create({
      component: DefaultModal,
      componentProps: { type: 'error', content: 'Second error' },
    })
    await nextTick()

    expect(activeDialogs.value).toHaveLength(1)
    expect(activeDialogs.value[0]!.componentProps.content).toBe('Second error')
  })

  it('leaves other dialog types alone when a new error dialog opens', async () => {
    Dialog.create({
      component: DefaultModal,
      componentProps: { type: 'success', content: 'Saved' },
    })
    await mountHost()

    Dialog.create({
      component: DefaultModal,
      componentProps: { type: 'error', content: 'Error' },
    })
    await nextTick()

    expect(activeDialogs.value).toHaveLength(2)
  })
})
