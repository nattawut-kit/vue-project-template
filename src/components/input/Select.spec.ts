import type { Plugin } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VueDompurifyHTML from 'vue-dompurify-html'
import Select from './Select.vue'

const plugins: [Plugin, unknown][] = [
  [VueDompurifyHTML, { namedConfigurations: { svg: { USE_PROFILES: { svg: true } } } }],
]

function mountSelect(props: InstanceType<typeof Select>['$props']) {
  return mount(Select, { props, global: { plugins } })
}

function lastCall<T>(calls: T[][] | undefined): T[] | undefined {
  return calls?.[calls.length - 1]
}

// jsdom has no ResizeObserver — Select's virtual-scroll measurement needs one to exist, even as a no-op.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const OPTIONS = [
  { label: 'Bangkok', value: 'bangkok' },
  { label: 'Chiang Mai', value: 'chiang-mai' },
  { label: 'Phuket', value: 'phuket' },
]

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('Select', () => {
  it('renders its label and placeholder', () => {
    const wrapper = mountSelect({
      label: 'Province',
      placeholder: 'Choose one',
      options: OPTIONS,
      modelValue: '',
    })
    expect(wrapper.text()).toContain('Province')
    expect(wrapper.text()).toContain('Choose one')
  })

  it('binds the label to the trigger for accessible name resolution', () => {
    const wrapper = mountSelect({ label: 'Province', options: OPTIONS, modelValue: '' })
    const trigger = wrapper.get('[role="combobox"]')
    const labelledby = trigger.attributes('aria-labelledby')

    expect(labelledby).toBeTruthy()
    expect(wrapper.find(`#${labelledby}`).text()).toContain('Province')
  })

  it('opens the panel and lists every option on trigger click', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: '' })
    await wrapper.get('[role="combobox"]').trigger('click')

    const rows = wrapper.findAll('[role="option"]')
    expect(rows).toHaveLength(3)
    expect(wrapper.text()).toContain('Bangkok')
  })

  it('selects an option and emits its value', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: '' })
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.findAll('[role="option"]')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['chiang-mai']])
  })

  it('accumulates and toggles values off in multiple mode', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: [], multiple: true })
    await wrapper.get('[role="combobox"]').trigger('click')
    const rows = wrapper.findAll('[role="option"]')
    await rows[0]!.trigger('click')
    await wrapper.setProps({ modelValue: ['bangkok'] })
    await rows[1]!.trigger('click')

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([['bangkok', 'chiang-mai']])
  })

  it('clears the value through the clear button', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: 'bangkok', clearable: true })

    await wrapper.get('button').trigger('click')

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([''])
  })

  it('does not open the panel when disabled', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: '', disabled: true })
    await wrapper.get('[role="combobox"]').trigger('click')

    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
  })

  it('fails required validation and reports the message', async () => {
    const wrapper = mountSelect({
      options: OPTIONS,
      modelValue: '',
      required: true,
      requiredMessage: 'Province is required',
    })

    wrapper.vm.validate()
    await nextTick()

    expect(wrapper.text()).toContain('Province is required')
    expect(lastCall(wrapper.emitted('error'))).toEqual([
      { hasError: true, message: 'Province is required' },
    ])
  })

  it('filters options by label when searchable', async () => {
    const wrapper = mountSelect({ options: OPTIONS, modelValue: '', searchable: true })
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.get('input').setValue('chiang')

    const rows = wrapper.findAll('[role="option"]')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.text()).toContain('Chiang Mai')
  })

  it('shows a removable chip per selection when multiple and useChips are set', async () => {
    const wrapper = mountSelect({
      options: OPTIONS,
      modelValue: ['bangkok', 'phuket'],
      multiple: true,
    })

    const chips = wrapper.findAll('button')
    expect(wrapper.text()).toContain('Bangkok')
    expect(wrapper.text()).toContain('Phuket')

    await chips[0]!.trigger('click')

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([['phuket']])
  })

  it('falls back to comma-joined text when useChips is false', () => {
    const wrapper = mountSelect({
      options: OPTIONS,
      modelValue: ['bangkok', 'phuket'],
      multiple: true,
      useChips: false,
    })

    expect(wrapper.text()).toContain('Bangkok, Phuket')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('removes the last chip on Backspace when the useInput field is empty', async () => {
    const wrapper = mountSelect({
      options: OPTIONS,
      modelValue: ['bangkok', 'phuket'],
      multiple: true,
      useInput: true,
    })

    await wrapper.get('input').trigger('keydown', { key: 'Backspace' })

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([['bangkok']])
  })

  it('fires filter instead of local-filtering when useInput is set', async () => {
    const wrapper = mountSelect({
      options: OPTIONS,
      modelValue: '',
      useInput: true,
      inputDebounce: 0,
    })
    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('chiang')

    expect(wrapper.emitted('filter')).toBeTruthy()
    // useInput never filters locally — every option is still passed through.
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
  })

  it('marks the prepend icon of a disabled select so it can be recolored to gray', () => {
    const slots = { prepend: '<span data-testid="icon">i</span>' }
    const options = [{ label: 'A', value: 'a' }]

    const enabled = mount(Select, {
      props: { options, modelValue: '' },
      slots,
      global: { plugins },
    })
    const disabled = mount(Select, {
      props: { options, modelValue: '', disabled: true },
      slots,
      global: { plugins },
    })

    expect(enabled.get('[data-testid="icon"]').element.parentElement?.className).not.toContain(
      'select-icon-disabled',
    )
    expect(disabled.get('[data-testid="icon"]').element.parentElement?.className).toContain(
      'select-icon-disabled',
    )
  })

  describe('a required error that the customer has not had the chance to fix', () => {
    const FIRST = [{ label: 'A', value: 'a' }]
    const SECOND = [{ label: 'B', value: 'b' }]

    function mountRequired(extra: Partial<InstanceType<typeof Select>['$props']> = {}) {
      return mountSelect({
        options: FIRST,
        modelValue: '',
        label: 'เขต/อำเภอ',
        required: true,
        ...extra,
      })
    }

    it('shows the error after leaving the select empty', async () => {
      const wrapper = mountRequired()

      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await nextTick()

      expect(wrapper.text()).toContain('กรุณาเลือกเขต/อำเภอ')
    })

    it('goes away when the options change, like a district list after a new province', async () => {
      const wrapper = mountRequired()
      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await nextTick()

      await wrapper.setProps({ options: SECOND })

      expect(wrapper.text()).not.toContain('กรุณาเลือกเขต/อำเภอ')
      expect(lastCall(wrapper.emitted('error'))).toEqual([{ hasError: false, message: '' }])
    })

    it('goes away when the select gets disabled', async () => {
      const wrapper = mountRequired()
      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await nextTick()

      await wrapper.setProps({ disabled: true })

      expect(wrapper.text()).not.toContain('กรุณาเลือกเขต/อำเภอ')
    })

    it('stays when nothing about the choices changed', async () => {
      const wrapper = mountRequired()
      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await nextTick()

      await wrapper.setProps({ label: 'เขต/อำเภอ' })

      expect(wrapper.text()).toContain('กรุณาเลือกเขต/อำเภอ')
    })

    it('comes back when the customer leaves it empty again', async () => {
      const wrapper = mountRequired()
      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await wrapper.setProps({ options: SECOND })

      ;(wrapper.vm as unknown as { validate: () => void }).validate()
      await nextTick()

      expect(wrapper.text()).toContain('กรุณาเลือกเขต/อำเภอ')
    })
  })
})
