import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders the slot content over the label prop', () => {
    const wrapper = mount(Button, { props: { label: 'Ignored' }, slots: { default: 'Save' } })
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).not.toContain('Ignored')
  })

  it('falls back to the label prop without a slot', () => {
    const wrapper = mount(Button, { props: { label: 'Save' } })
    expect(wrapper.text()).toContain('Save')
  })

  it('emits click when enabled', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not emit click while loading', async () => {
    const wrapper = mount(Button, { props: { loading: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
  })

  it('disables the native button when disabled or loading', () => {
    const disabled = mount(Button, { props: { disabled: true } })
    expect(disabled.get('button').attributes('disabled')).toBeDefined()

    const loading = mount(Button, { props: { loading: true } })
    expect(loading.get('button').attributes('disabled')).toBeDefined()
  })

  it('ripples on click for the outline variant, which does not scale on press', async () => {
    const wrapper = mount(Button, { props: { variant: 'outline' } })
    await wrapper.trigger('click')
    expect(wrapper.find('.ripple-effect').exists()).toBe(true)
    expect(wrapper.get('button').classes()).not.toContain('active:scale-95')
  })

  it.each(['primary', 'secondary'] as const)(
    'scales on press instead of rippling for the %s variant',
    async (variant) => {
      const wrapper = mount(Button, { props: { variant } })
      await wrapper.trigger('click')
      expect(wrapper.find('.ripple-effect').exists()).toBe(false)
      expect(wrapper.get('button').classes()).toContain('active:scale-95')
    },
  )

  it.each(['primary', 'secondary'] as const)(
    'does not scale on press while the %s variant is disabled or loading',
    (variant) => {
      const disabled = mount(Button, { props: { variant, disabled: true } })
      expect(disabled.get('button').classes()).not.toContain('active:scale-95')

      const loading = mount(Button, { props: { variant, loading: true } })
      expect(loading.get('button').classes()).not.toContain('active:scale-95')
    },
  )

  it('paints each variant with the brand tokens', () => {
    const classesOf = (variant: 'primary' | 'secondary' | 'outline') =>
      mount(Button, { props: { variant } }).get('button').classes()

    expect(classesOf('primary')).toEqual(
      expect.arrayContaining(['bg-brand', 'text-content-inverted']),
    )
    expect(classesOf('secondary')).toEqual(
      expect.arrayContaining(['bg-brand-subtle', 'text-brand']),
    )
    expect(classesOf('outline')).toEqual(expect.arrayContaining(['border-brand', 'text-brand']))
  })

  it('draws a disabled filled variant in the disabled colours, not its own', () => {
    const primary = mount(Button, { props: { variant: 'primary', disabled: true } })
      .get('button')
      .classes()

    expect(primary).toContain('bg-btn-disabled')
    expect(primary).toContain('text-btn-disabled-text')
    expect(primary).not.toContain('bg-brand')
  })

  it('lets the ripple and scaleOnPress props override the variant default', async () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary', ripple: true, scaleOnPress: false },
    })
    await wrapper.trigger('click')
    expect(wrapper.find('.ripple-effect').exists()).toBe(true)
    expect(wrapper.get('button').classes()).not.toContain('active:scale-95')
  })

  it('renders the start and end icon slots', () => {
    const wrapper = mount(Button, {
      slots: { 'start-icon': '<span>start</span>', 'end-icon': '<span>end</span>' },
    })
    expect(wrapper.html()).toContain('start')
    expect(wrapper.html()).toContain('end')
  })

  it('sets aria-label so an icon-only button still has an accessible name', () => {
    const wrapper = mount(Button, {
      props: { ariaLabel: 'Close' },
      slots: { 'start-icon': '<span>x</span>' },
    })
    expect(wrapper.get('button').attributes('aria-label')).toBe('Close')
  })
})
