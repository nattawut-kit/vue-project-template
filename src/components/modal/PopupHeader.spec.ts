import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VueDompurifyHTML from 'vue-dompurify-html'
import Svg from '@/components/ui/Svg.vue'
import PopupHeader from './PopupHeader.vue'
import type { DialogType } from './dialog'

const TYPES: DialogType[] = ['success', 'question', 'alert', 'error']

function mountHeader(type?: DialogType) {
  return mount(PopupHeader, {
    props: type ? { type } : {},
    global: { plugins: [[VueDompurifyHTML, { namedConfigurations: { svg: {} } }]] },
  })
}

describe('PopupHeader', () => {
  it('defaults to the success icon', () => {
    expect(mountHeader().getComponent(Svg).props('src')).toBe('dialog/success')
  })

  it.each(TYPES)('draws the icon of the %s type', (type) => {
    expect(mountHeader(type).getComponent(Svg).props('src')).toBe(`dialog/${type}`)
  })

  it('gives each type its own colour', () => {
    const tones = TYPES.map((type) => mountHeader(type).classes().join(' '))

    expect(new Set(tones).size).toBe(TYPES.length)
  })
})
