import type { Meta, StoryObj } from '@storybook/vue3-vite'
import IconClock from './IconClock.vue'

const meta: Meta = {
  title: 'Icons/IconClock',
  render: () => ({
    components: { IconClock },
    template: `<IconClock class="w-12 h-12 text-blue-600" />`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
