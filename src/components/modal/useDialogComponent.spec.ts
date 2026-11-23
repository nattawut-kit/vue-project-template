import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useDialogComponent } from '@/components/modal/useDialogComponent'

const Host = defineComponent({
  emits: ['ok', 'cancel'],
  setup(_, { emit }) {
    return useDialogComponent(emit)
  },
  template: '<div>{{ visible }}</div>',
})

describe('useDialogComponent', () => {
  it('flips visible to true on mount, so the enter transition can play', async () => {
    const wrapper = mount(Host)
    await nextTick()

    expect(wrapper.vm.visible).toBe(true)
  })

  it('emits ok and closes when onDialogOk is called', async () => {
    const wrapper = mount(Host)
    await nextTick()

    wrapper.vm.onDialogOk({ code: 1 })

    expect(wrapper.vm.visible).toBe(false)
    expect(wrapper.emitted('ok')).toEqual([[{ code: 1 }]])
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('emits cancel when visible is set to false directly (backdrop/Esc close)', async () => {
    const wrapper = mount(Host)
    await nextTick()

    wrapper.vm.visible = false
    await nextTick()

    expect(wrapper.emitted('cancel')).toEqual([[undefined]])
  })

  it('only settles once, even if closed twice', async () => {
    const wrapper = mount(Host)
    await nextTick()

    wrapper.vm.onDialogOk('first')
    wrapper.vm.onDialogCancel('second')

    expect(wrapper.emitted('ok')).toEqual([['first']])
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })
})
