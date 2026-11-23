import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeGuideSection from './HomeGuideSection.vue'
import { GUIDE_SECTIONS, type GuideSection } from './implementationGuide'

const SECTION: GuideSection = {
  id: 'page',
  title: 'เพิ่มหน้าใหม่',
  summary: 'สร้างไฟล์ใน src/pages/',
  steps: ['ข้อหนึ่ง', 'ข้อสอง'],
  file: 'src/pages/orders.vue',
  code: '<template>{{ value }}</template>',
}

describe('HomeGuideSection', () => {
  it('shows the title, summary and every step', () => {
    const wrapper = mount(HomeGuideSection, { props: { section: SECTION } })

    expect(wrapper.get('h2').text()).toBe('เพิ่มหน้าใหม่')
    expect(wrapper.text()).toContain('สร้างไฟล์ใน src/pages/')
    expect(wrapper.findAll('li').map((li) => li.text())).toEqual(['ข้อหนึ่ง', 'ข้อสอง'])
  })

  it('shows the code as plain text, never as markup', () => {
    const wrapper = mount(HomeGuideSection, { props: { section: SECTION } })

    expect(wrapper.get('code').text()).toBe('<template>{{ value }}</template>')
    expect(wrapper.text()).toContain('src/pages/orders.vue')
  })

  it('leaves out the code block when a section has no code', () => {
    const { code: _code, file: _file, ...withoutCode } = SECTION

    const wrapper = mount(HomeGuideSection, { props: { section: withoutCode } })

    expect(wrapper.find('pre').exists()).toBe(false)
  })
})

describe('GUIDE_SECTIONS', () => {
  it('gives every section a unique id, a title and at least one step', () => {
    const ids = GUIDE_SECTIONS.map((section) => section.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const section of GUIDE_SECTIONS) {
      expect(section.title).not.toBe('')
      expect(section.steps.length).toBeGreaterThan(0)
    }
  })
})
