<!-- eslint-disable vue/multi-word-component-names -- kept as `Button`, the name the whole project uses -->
<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant = 'primary' | 'secondary' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonRound = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'circle'
export type ButtonWidth = 'full' | 'fit'
export type ButtonType = 'button' | 'submit' | 'reset'

export interface ButtonRippleOptions {
  center?: boolean
  color?: string
}
export type ButtonRipple = boolean | ButtonRippleOptions

export interface ButtonCustomSize {
  width?: ButtonWidth | string
  height?: string
  padding?: string
  fontSize?: string
}

const {
  label = '',
  variant = 'primary',
  size = 'lg',
  round = 'lg',
  customSize = null,
  disabled = false,
  loading = false,
  type = 'button',
  color = null,
  textColor = null,
  // Unset = the variant's own feedback: outline ripples, the filled variants scale on press.
  ripple = undefined,
  scaleOnPress = undefined,
  ariaLabel = undefined,
} = defineProps<{
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  round?: ButtonRound | string
  customSize?: ButtonCustomSize | null
  disabled?: boolean
  loading?: boolean
  type?: ButtonType
  color?: string | null
  textColor?: string | null
  ripple?: ButtonRipple
  scaleOnPress?: boolean
  // Required when the button is icon-only (start-icon/end-icon slot, no label and no default
  // slot) — otherwise a screen reader has no accessible name to announce for it.
  ariaLabel?: string
}>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const SIZE_TEXT_CLASSES: Record<ButtonSize, string> = {
  sm: 'text-14',
  md: 'text-14',
  lg: 'text-16',
}

const SIZE_HEIGHT_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
}

const SIZE_PADDING_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-5',
}

const ROUND_CLASSES: Record<ButtonRound, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
  circle: 'rounded-full',
}

const WIDTH_CLASSES: Record<ButtonWidth, string> = {
  full: 'w-full',
  fit: 'w-fit',
}

const VARIANT_BASE_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-content-inverted',
  secondary: 'bg-brand-subtle text-brand',
  outline: 'border border-solid border-brand text-brand',
}

const VARIANT_HOVER_CLASSES: Record<ButtonVariant, string> = {
  primary: 'hover:bg-brand-hover',
  secondary: 'hover:brightness-95',
  // A light wash instead of a solid fill, since outline's own text and border are the brand colour.
  outline: 'hover:bg-brand/10',
}

// A disabled button keeps the shape of its variant, in the disabled colours.
const DISABLED_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-btn-disabled text-btn-disabled-text',
  secondary: 'bg-btn-disabled text-btn-disabled-text',
  outline: 'border border-solid border-border text-btn-disabled-text',
}

const isRoundKeyword = (value: string): value is ButtonRound => value in ROUND_CLASSES
const isWidthKeyword = (value: string): value is ButtonWidth => value in WIDTH_CLASSES

const isInteractive = computed(() => !disabled && !loading)

// A custom `color` tints the hover state via color-mix instead of the fixed hover class, see
// the .btn-hover-tint rule below. Only outline qualifies: its surface is genuinely transparent,
// so mixing the tint color into transparent reads as a light wash appearing on hover. Primary
// and secondary have a solid face under their light and shade shadows, a tint over it would not
// read as a hover — they keep the brightness-based hover instead, which works on any face.
const hasCustomHoverTint = computed(() => !!color && variant === 'outline')

const classes = computed(() => [
  'box-border relative inline-flex items-center justify-center overflow-hidden font-medium transition',
  !customSize?.fontSize && SIZE_TEXT_CLASSES[size],
  !customSize?.height && SIZE_HEIGHT_CLASSES[size],
  // shrink-0: a flex item with aspect-ratio and no explicit width normally sizes from its
  // height just fine, but combined with overflow-hidden (needed for the ripple effect) its
  // automatic minimum width becomes 0 instead of content-based, so a flex-wrap parent can
  // shrink it all the way to 0 width — verified in the browser, not just spec reading.
  round === 'circle' && 'aspect-square shrink-0',
  !customSize?.padding && round !== 'circle' && SIZE_PADDING_CLASSES[size],
  isRoundKeyword(round) && ROUND_CLASSES[round],
  customSize?.width && isWidthKeyword(customSize.width) && WIDTH_CLASSES[customSize.width],
  disabled
    ? DISABLED_CLASSES[variant]
    : [
        VARIANT_BASE_CLASSES[variant],
        isInteractive.value &&
          (hasCustomHoverTint.value ? 'btn-hover-tint' : VARIANT_HOVER_CLASSES[variant]),
      ],
  // A disabled <button> still matches :active, so the scale has to be left off the class list.
  isInteractive.value && isScaleOnPress.value && 'active:scale-95',
  isInteractive.value ? 'cursor-pointer' : 'cursor-not-allowed',
])

const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (!isRoundKeyword(round)) {
    style.borderRadius = round
  }

  if (customSize?.width && !isWidthKeyword(customSize.width)) {
    style.width = customSize.width
  }

  if (customSize?.padding) {
    style.padding = customSize.padding
  }

  if (customSize?.height) {
    style.height = customSize.height
  }

  if (customSize?.fontSize) {
    style.fontSize = customSize.fontSize
  }

  if (disabled || (!color && !textColor)) return style

  if (color) {
    if (variant !== 'outline') {
      // Cancels any background image a project gives its filled variants, it would cover the color.
      style.backgroundImage = 'none'
      style.backgroundColor = color
    } else {
      style.borderColor = color
      style['--btn-hover-tint'] = color
    }
  }

  if (textColor) {
    style.color = textColor
  } else if (color && variant === 'outline') {
    style.color = color
  }

  return style
})

const DEFAULT_RIPPLE_OPTIONS: Required<ButtonRippleOptions> = {
  center: false,
  color: '',
}

const isScaleOnPress = computed(() => scaleOnPress ?? variant !== 'outline')

const rippleConfig = computed<Required<ButtonRippleOptions> | null>(() => {
  const effective = ripple ?? variant === 'outline'
  if (effective === false) return null
  if (effective === true) return DEFAULT_RIPPLE_OPTIONS

  return { ...DEFAULT_RIPPLE_OPTIONS, ...effective }
})

const resolvedRippleColor = computed(() => {
  if (rippleConfig.value?.color) return rippleConfig.value.color
  return variant === 'outline' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.45)'
})

function createRipple(event: MouseEvent, color: string, center: boolean) {
  const button = event.currentTarget as HTMLElement
  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)
  const radius = diameter / 2

  const rect = button.getBoundingClientRect()
  const left = center ? button.clientWidth / 2 - radius : event.clientX - rect.left - radius
  const top = center ? button.clientHeight / 2 - radius : event.clientY - rect.top - radius

  circle.style.cssText = `
    position: absolute;
    width: ${diameter}px;
    height: ${diameter}px;
    left: ${left}px;
    top: ${top}px;
    background: ${color};
  `
  circle.classList.add('ripple-effect')
  button.appendChild(circle)
  circle.addEventListener('animationend', () => circle.remove())
}

function handleClick(event: MouseEvent) {
  if (disabled || loading) return

  const config = rippleConfig.value
  if (config) {
    createRipple(event, resolvedRippleColor.value, config.center)
  }

  emit('click', event)
}
</script>

<template>
  <button
    :class="classes"
    :style="customStyle"
    :disabled="disabled || loading"
    :type="type"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span :class="['inline-flex items-center justify-center gap-2', { 'opacity-0': loading }]">
      <span v-if="$slots['start-icon']" class="flex items-center">
        <slot name="start-icon"></slot>
      </span>

      <div v-if="$slots.default">
        <slot></slot>
      </div>

      <span v-if="label">
        <slot>{{ label }}</slot>
      </span>

      <span v-if="$slots['end-icon']" class="flex items-center">
        <slot name="end-icon"></slot>
      </span>
    </span>

    <span
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span
        class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      ></span>
    </span>
  </button>
</template>

<!-- Not scoped, on purpose: the ripple <span> is appended outside Vue's render tree via
     appendChild, so a scoped attribute on .ripple-effect would never apply to it. Everything else
     that CAN be scoped (applied via :class on the compiled <button> itself) lives in the second,
     scoped <style> block below instead, so it doesn't leak into the rest of the app. -->
<style>
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-animation 650ms linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>

<style scoped>
@media (hover: hover) {
  .btn-hover-tint:hover {
    /* Only outline's custom-color hover uses this, and outline's own surface is genuinely
       transparent — so mixing into transparent (not a solid surface color) is correct here,
       producing a light tinted wash rather than replacing an opaque background. */
    background-color: color-mix(in srgb, var(--btn-hover-tint) 8%, transparent);
  }
}
</style>
