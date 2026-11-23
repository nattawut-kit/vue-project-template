import { defineComponent, type Plugin } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import VueDompurifyHTML from 'vue-dompurify-html'
import TextField from './TextField.vue'

const plugins: [Plugin, unknown][] = [
  [VueDompurifyHTML, { namedConfigurations: { svg: { USE_PROFILES: { svg: true } } } }],
]

function lastCall<T>(calls: T[][] | undefined): T[] | undefined {
  return calls?.[calls.length - 1]
}

describe('TextField', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders its label', () => {
    const wrapper = mount(TextField, { props: { label: 'Name', modelValue: '' } })
    expect(wrapper.text()).toContain('Name')
  })

  it('binds the label to the input for accessible name resolution', () => {
    const wrapper = mount(TextField, { props: { label: 'Name', modelValue: '' } })
    const inputId = wrapper.get('input').attributes('id')
    expect(inputId).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(inputId)
  })

  it('binds the floating label to the input too', () => {
    const wrapper = mount(TextField, {
      props: { label: 'Name', modelValue: '', floatLabel: true },
    })
    const inputId = wrapper.get('input').attributes('id')
    expect(inputId).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(inputId)
  })

  it('marks the start icon of a disabled field so it can be recolored to gray', () => {
    const slots = { 'start-icon': '<span data-testid="icon">i</span>' }

    const enabled = mount(TextField, { props: { label: 'Phone', modelValue: '' }, slots })
    const disabled = mount(TextField, {
      props: { label: 'Phone', modelValue: '', disabled: true },
      slots,
    })

    expect(enabled.get('[data-testid="icon"]').element.parentElement?.className).not.toContain(
      'text-field-icon-disabled',
    )
    expect(disabled.get('[data-testid="icon"]').element.parentElement?.className).toContain(
      'text-field-icon-disabled',
    )
  })

  it('reacts to the end-icon slot appearing/disappearing after mount, not just at setup', async () => {
    const Wrapper = defineComponent({
      components: { TextField },
      data: () => ({ showIcon: false }),
      template: `
        <TextField label="Name" model-value="">
          <template v-if="showIcon" #end-icon><span>x</span></template>
        </TextField>
      `,
    })
    const wrapper = mount(Wrapper)

    expect(wrapper.get('input').classes()).toContain('pr-4')

    await wrapper.setData({ showIcon: true })

    expect(wrapper.get('input').classes()).toContain('pr-10')
  })

  it('emits the new value on input', async () => {
    const wrapper = mount(TextField, { props: { label: 'Name', modelValue: '' } })
    await wrapper.get('input').setValue('mei')
    expect(wrapper.emitted('update:modelValue')).toEqual([['mei']])
  })

  it('shows the required asterisk next to the label', () => {
    const wrapper = mount(TextField, { props: { label: 'Name', modelValue: '', required: true } })
    expect(wrapper.text()).toContain('*')
  })

  it('fails required validation on blur and reports the message', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Name', modelValue: '', required: true, requiredMessage: 'Name is required' },
    })
    await wrapper.get('input').trigger('blur')

    expect(wrapper.text()).toContain('Name is required')
    expect(lastCall(wrapper.emitted('error'))).toEqual([
      { hasError: true, message: 'Name is required' },
    ])
  })

  it('reports the first failing custom rule', async () => {
    const wrapper = mount(TextField, {
      props: {
        label: 'Name',
        modelValue: 'ab',
        rules: [{ validator: (value: string) => value.length >= 3, message: 'Too short' }],
      },
    })
    await wrapper.get('input').trigger('blur')

    expect(wrapper.text()).toContain('Too short')
  })

  it('clears the value through the clear button', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Name', modelValue: 'mei', clearable: true },
      global: { plugins },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([''])
  })

  it('formats digits through a mask', async () => {
    const wrapper = mount(TextField, { props: { label: 'Phone', modelValue: '', mask: '###-###' } })
    await wrapper.get('input').setValue('123456')

    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual(['123-456'])
  })

  it('groups a currency value with thousand separators', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Amount', modelValue: 0, type: 'currency' },
    })
    await wrapper.get('input').setValue('1234')

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('1,234')
    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([1234])
  })

  it('settles a whole currency value on no fraction digits when decimals is 0', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Amount', modelValue: 0, type: 'currency', decimals: 0 },
    })
    const input = wrapper.get('input')
    await input.setValue('1234')
    await input.trigger('blur')

    expect((input.element as HTMLInputElement).value).toBe('1,234')
  })

  it('does not round a fractional value when decimals is 0, it keeps the typed digits', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Amount', modelValue: 0, type: 'currency', decimals: 0 },
    })
    const input = wrapper.get('input')
    await input.setValue('48.5')
    await input.trigger('blur')

    expect((input.element as HTMLInputElement).value).toBe('48.50')
  })

  it('keeps at most two decimals of a currency value', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'Amount', modelValue: 0, type: 'currency' },
    })
    await wrapper.get('input').setValue('1234.5678')

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('1,234.56')
    expect(lastCall(wrapper.emitted('update:modelValue'))).toEqual([1234.56])
  })
})
