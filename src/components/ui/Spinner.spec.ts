import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from '@/components/ui/Spinner.vue'

describe('Spinner', () => {
  it('defaults to an 18px brand-colored oval spinner', () => {
    const wrapper = mount(Spinner)
    const sized = wrapper.find('span > span')

    expect(sized.attributes('style')).toContain('width: 18px')
    expect(sized.attributes('style')).toContain('height: 18px')
    expect(sized.attributes('style')).toContain('color: var(--app-brand)')
  })

  it('applies a custom size and color', () => {
    const wrapper = mount(Spinner, { props: { size: 32, color: 'var(--app-content-inverted)' } })
    const sized = wrapper.find('span > span')

    expect(sized.attributes('style')).toContain('width: 32px')
    expect(sized.attributes('style')).toContain('height: 32px')
    expect(sized.attributes('style')).toContain('color: var(--app-content-inverted)')
  })

  it('renders the oval ring markup by default', () => {
    const wrapper = mount(Spinner)

    expect(wrapper.find('span > span').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('defaults the oval ring to a 2px border', () => {
    const wrapper = mount(Spinner)
    const rings = wrapper.findAll('span > span > span')

    expect(rings).toHaveLength(2)
    for (const ring of rings) {
      expect(ring.attributes('style')).toContain('border-width: 2px')
    }
  })

  it('applies a custom border thickness to the oval ring', () => {
    const wrapper = mount(Spinner, { props: { thickness: 4 } })
    const rings = wrapper.findAll('span > span > span')

    expect(rings).toHaveLength(2)
    for (const ring of rings) {
      expect(ring.attributes('style')).toContain('border-width: 4px')
    }
  })

  it('renders three dots for type "dots"', () => {
    const wrapper = mount(Spinner, { props: { type: 'dots' } })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('circle')).toHaveLength(3)
  })

  it('renders a fading tail arc for type "tail"', () => {
    const wrapper = mount(Spinner, { props: { type: 'tail' } })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('path').exists()).toBe(true)
    expect(wrapper.find('linearGradient').exists()).toBe(true)
  })

  it('is decorative — purely visual, hidden from assistive tech', () => {
    // Same convention as every other spinner in this codebase (Img.vue, Select.vue,
    // Button.vue's inline loading spinner): the spinner itself carries no role/label, the
    // component that shows it (e.g. Loading) owns the accessible status/name.
    const wrapper = mount(Spinner)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('renders three lit-in-turn dots for type "trio", scaled to the size', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'trio', size: 64, color: '#fff', accent: '#ff3d00' },
    })
    const trio = wrapper.find('.spinner-trio')

    expect(trio.exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(trio.attributes('style')).toContain('--unit: 1px')
    expect(trio.attributes('style')).toContain('--trio-base: #fff')
    expect(trio.attributes('style')).toContain('--trio-accent: #ff3d00')
  })

  it('renders a ring with an orbiting dot for type "orbit", scaled to the size', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'orbit', size: 48, color: '#fff', accent: '#ff3d00' },
    })
    const orbit = wrapper.find('.spinner-orbit')

    expect(orbit.exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(orbit.attributes('style')).toContain('--unit: 1px')
    expect(orbit.attributes('style')).toContain('--orbit-ring: #fff')
    expect(orbit.attributes('style')).toContain('--orbit-accent: #ff3d00')
  })
})
