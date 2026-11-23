import type { Plugin } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VueDompurifyHTML from 'vue-dompurify-html'
import Svg from '@/components/ui/Svg.vue'

const plugins: [Plugin, unknown][] = [
  [VueDompurifyHTML, { namedConfigurations: { svg: { USE_PROFILES: { svg: true } } } }],
]

// Inline fixtures served through the remote-URL path, so these specs do not depend on a file
// under assets/icons that could be deleted as unused.
const FIXTURE_ORIGIN = 'https://fixtures.example'
// Root <svg> has no width/height of its own, only stroke-width="2".
const CLOCK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>'
// Root <svg> has no width/height, but the child <rect> elements do.
const GIFT_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="4" /><rect x="4" y="13" width="16" height="8" /></svg>'
const USER_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.5 3.5-7 8-7s8 2.5 8 7" /></svg>'

function mockFixtures(): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = String(input)
    const body = url.endsWith('/gift.svg')
      ? GIFT_SVG
      : url.endsWith('/user.svg')
        ? USER_SVG
        : CLOCK_SVG
    return Promise.resolve(new Response(body, { status: 200 }))
  })
}

interface FixtureProps {
  src: string
  allowedOrigins: string[]
  width?: string
  height?: string
  color?: string
  colorGradient?: string[]
}

function fixtureProps(name: string, extra: Partial<FixtureProps> = {}): FixtureProps {
  return { src: `${FIXTURE_ORIGIN}/${name}.svg`, allowedOrigins: [FIXTURE_ORIGIN], ...extra }
}

describe('Svg', () => {
  beforeEach(mockFixtures)

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('blocks fetching a remote URL whose origin is not allowlisted, by default', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const wrapper = mount(Svg, {
      props: { src: 'https://evil.example/icon.svg' },
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.emitted('error')).toHaveLength(1))
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('fetches a remote URL once its origin is explicitly allowlisted', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('<svg></svg>', { status: 200 }))
    const wrapper = mount(Svg, {
      props: {
        src: 'https://cdn.example/icon.svg',
        allowedOrigins: ['https://cdn.example'],
      },
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.emitted('load')).toHaveLength(1))
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/icon.svg')
    fetchSpy.mockRestore()
  })

  it('loads and renders a known icon', async () => {
    const wrapper = mount(Svg, { props: { src: 'common/x-close' }, global: { plugins } })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('emits an error and shows the placeholder for a missing icon', async () => {
    const wrapper = mount(Svg, { props: { src: 'common/does-not-exist' }, global: { plugins } })

    await vi.waitFor(() => expect(wrapper.emitted('error')).toHaveLength(1))
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('[aria-label="SVG failed to load"]').exists()).toBe(true)
  })

  it('renders a custom placeholder slot while there is no content', async () => {
    const wrapper = mount(Svg, {
      props: { src: 'common/does-not-exist' },
      slots: { placeholder: '<span>missing</span>' },
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.emitted('error')).toHaveLength(1))
    expect(wrapper.text()).toContain('missing')
  })

  it('sizes the container from the width and height props', () => {
    const wrapper = mount(Svg, {
      props: { src: 'common/x-close', width: 32, height: 16 },
      global: { plugins },
    })

    const style = wrapper.get('.svg-container').attributes('style')
    expect(style).toContain('width: 32px')
    expect(style).toContain('height: 16px')
  })

  it('sizes the container from unitless string width/height, as a plain HTML attribute passes them', () => {
    const wrapper = mount(Svg, {
      props: { src: 'common/x-close', width: '20', height: '20' },
      global: { plugins },
    })

    const style = wrapper.get('.svg-container').attributes('style')
    expect(style).toContain('width: 20px')
    expect(style).toContain('height: 20px')
  })

  it('defaults to 20px square when neither the props nor the file specify a size', async () => {
    // The clock fixture has no width/height attribute of its own and no width/height prop is passed.
    const wrapper = mount(Svg, { props: fixtureProps('clock'), global: { plugins } })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    const style = wrapper.get('.svg-container').attributes('style')
    expect(style).toContain('width: 20px')
    expect(style).toContain('height: 20px')
  })

  it('sizes an icon with no native width/height without corrupting its stroke-width', async () => {
    // The clock fixture has no width/height attribute of its own, only stroke-width="2" — a naive
    // substring search for "width=" matches the tail of "stroke-width=" and overwrites it.
    const wrapper = mount(Svg, {
      props: fixtureProps('clock', { width: '20', height: '20' }),
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('20')
    expect(svg.attributes('height')).toBe('20')
    expect(svg.attributes('stroke-width')).toBe('2')
  })

  it('defaults to 20px square even when a nested element has its own width/height', async () => {
    // The gift fixture's root <svg> has no width/height, but its child <rect> elements do
    // (width="18" height="4", width="16" height="8") — those must not be mistaken for the
    // root's own size.
    const wrapper = mount(Svg, { props: fixtureProps('gift'), global: { plugins } })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    const style = wrapper.get('.svg-container').attributes('style')
    expect(style).toContain('width: 20px')
    expect(style).toContain('height: 20px')
  })

  it('sizes an icon via props even when a nested element has its own width/height', async () => {
    const wrapper = mount(Svg, {
      props: fixtureProps('gift', { width: '32', height: '32' }),
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('32')
    expect(svg.attributes('height')).toBe('32')
    // The nested rects keep their own original dimensions, untouched.
    const rects = svg.findAll('rect')
    expect(rects[0]!.attributes('width')).toBe('18')
    expect(rects[1]!.attributes('width')).toBe('16')
  })

  it('paints fill/stroke with a gradient when colorGradient has 2+ stops', async () => {
    const wrapper = mount(Svg, {
      props: fixtureProps('clock', { colorGradient: ['#faa61a', '#f35b23'] }),
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    const html = wrapper.html()
    const gradientMatch = html.match(/url\(#([\w-]+)\)/)
    expect(gradientMatch).not.toBeNull()

    const id = gradientMatch![1]
    expect(html).toContain(`<stop offset="0%" style="stop-color: #faa61a">`)
    expect(html).toContain(`<stop offset="100%" style="stop-color: #f35b23">`)
    expect(html).toContain(`id="${id}"`)
  })

  it('scopes each instance to its own gradient id so multiple gradient icons never collide', async () => {
    const Wrapper = {
      components: { Svg },
      setup: () => ({
        clock: `${FIXTURE_ORIGIN}/clock.svg`,
        user: `${FIXTURE_ORIGIN}/user.svg`,
        origins: [FIXTURE_ORIGIN],
        gradient: ['#faa61a', '#f35b23'],
      }),
      template: `
        <Svg :src="clock" :allowedOrigins="origins" :colorGradient="gradient" />
        <Svg :src="user" :allowedOrigins="origins" :colorGradient="gradient" />
      `,
    }
    const wrapper = mount(Wrapper, { global: { plugins } })

    await vi.waitFor(() => expect(wrapper.findAll('svg')).toHaveLength(2))
    const [idA, idB] = wrapper
      .html()
      .match(/url\(#[\w-]+\)/g)!
      .map((match) => match.slice(5, -1))
    expect(idA).not.toBe(idB)
  })

  it('ignores color when colorGradient is also set', async () => {
    const wrapper = mount(Svg, {
      props: fixtureProps('clock', { color: 'red', colorGradient: ['#faa61a', '#f35b23'] }),
      global: { plugins },
    })

    await vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))
    expect(wrapper.html()).not.toContain('stroke="red"')
    expect(wrapper.html()).toContain('url(#')
  })
})
