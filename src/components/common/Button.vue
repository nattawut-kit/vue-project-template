<template>
  <button
    :class="classes"
    :style="customStyle"
    :disabled="disabled || loading"
    :type="type"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span :class="['inline-flex items-center justify-center gap-2', { 'opacity-0': loading }]">
      <span
        v-if="$slots['start-icon']"
        class="flex items-center"
      >
        <slot name="start-icon"></slot>
      </span>

      <slot>{{ label }}</slot>

      <span
        v-if="$slots['end-icon']"
        class="flex items-center"
      >
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

<script setup lang="ts">
  type ButtonVariant = 'primary' | 'secondary' | 'outline'
  type ButtonSize = 'sm' | 'md' | 'lg'
  // circle = วงกลม บังคับสัดส่วน 1:1 ไม่มี padding แนวนอน
  type ButtonRound = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'circle'
  type ButtonWidth = 'full' | 'fit'
  type ButtonType = 'button' | 'submit' | 'reset'

  // true = ค่า default, object = ทับเฉพาะ field ที่ระบุ
  interface ButtonRippleOptions {
    center?: boolean
    color?: string
  }
  type ButtonRipple = boolean | ButtonRippleOptions

  // ทับเฉพาะ field ที่ระบุ, field ที่ไม่ใส่ใช้ค่าเดิมของ size — width รับ keyword ('full'/'fit') ได้เหมือน width prop เดิม
  interface ButtonCustomSize {
    width?: ButtonWidth | string
    height?: string
    padding?: string
    fontSize?: string
  }

  interface Props {
    // ข้อความปุ่ม, slot จะทับถ้ามีเนื้อหาส่งมา
    label?: string
    variant?: ButtonVariant
    size?: ButtonSize
    // keyword ใช้ Tailwind class, ค่าอื่นใช้เป็น border-radius ตรงๆ
    round?: ButtonRound | string
    customSize?: ButtonCustomSize | null
    disabled?: boolean
    loading?: boolean
    type?: ButtonType
    color?: string | null
    textColor?: string | null
    ripple?: ButtonRipple
    scaleOnPress?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    variant: 'primary',
    size: 'lg',
    round: 'lg',
    customSize: null,
    disabled: false,
    loading: false,
    type: 'button',
    color: null,
    textColor: null,
    ripple: true,
    scaleOnPress: false,
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  const sizeTextClasses: Record<ButtonSize, string> = {
    sm: 'text-12',
    md: 'text-12',
    lg: 'text-14',
  }

  // สูงคงที่เพื่อ touch target สม่ำเสมอ
  const sizeHeightClasses: Record<ButtonSize, string> = {
    sm: 'h-7',
    md: 'h-8.5',
    lg: 'h-12',
  }

  // ตัดออกตอน round="circle" ให้กว้าง = สูง
  const sizePaddingClasses: Record<ButtonSize, string> = {
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-5',
  }

  const roundClasses: Record<ButtonRound, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
    circle: 'rounded-full',
  }

  const widthClasses: Record<ButtonWidth, string> = {
    full: 'w-full',
    fit: 'w-fit',
  }

  const variantBaseClasses: Record<ButtonVariant, string> = {
    primary: 'bg-main-1 text-white',
    secondary: 'border border-main-1 bg-white text-main-1',
    outline: 'border border-gray-300 bg-white text-gray-900',
  }

  const variantHoverClasses: Record<ButtonVariant, string> = {
    primary: 'hover:opacity-80',
    secondary: 'hover:bg-main-1/5',
    outline: 'hover:bg-gray-100',
  }

  const disabledClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gray-400 text-white',
    secondary: 'border border-gray-400 bg-gray-400 text-white',
    outline: 'border border-gray-300 bg-gray-100 text-gray-400',
  }

  const isRoundKeyword = (value: string): value is ButtonRound => value in roundClasses
  const isWidthKeyword = (value: string): value is ButtonWidth => value in widthClasses

  const isInteractive = computed(() => !props.disabled && !props.loading)

  // custom color บน variant ที่ไม่ใช่ primary hover เป็น color-mix tint แทน
  const hasCustomHoverTint = computed(() => !!props.color && props.variant !== 'primary')

  const classes = computed(() => [
    'relative inline-flex items-center justify-center overflow-hidden font-bold transition',
    !props.customSize?.fontSize && sizeTextClasses[props.size],
    !props.customSize?.height && sizeHeightClasses[props.size],
    props.round === 'circle' && 'aspect-square',
    !props.customSize?.padding && props.round !== 'circle' && sizePaddingClasses[props.size],
    isRoundKeyword(props.round) && roundClasses[props.round],
    props.customSize?.width &&
      isWidthKeyword(props.customSize.width) &&
      widthClasses[props.customSize.width],
    props.disabled
      ? disabledClasses[props.variant]
      : [
          variantBaseClasses[props.variant],
          isInteractive.value &&
            (hasCustomHoverTint.value ? 'btn-hover-tint' : variantHoverClasses[props.variant]),
        ],
    props.scaleOnPress && 'active:scale-95',
    isInteractive.value ? 'cursor-pointer' : 'cursor-not-allowed',
  ])

  const customStyle = computed(() => {
    const style: Record<string, string> = {}

    if (!isRoundKeyword(props.round)) {
      style.borderRadius = props.round
    }

    if (props.customSize?.width && !isWidthKeyword(props.customSize.width)) {
      style.width = props.customSize.width
    }

    if (props.customSize?.padding) {
      style.padding = props.customSize.padding
    }

    if (props.customSize?.height) {
      style.height = props.customSize.height
    }

    if (props.customSize?.fontSize) {
      style.fontSize = props.customSize.fontSize
    }

    if (props.disabled || (!props.color && !props.textColor)) return style

    if (props.color) {
      if (props.variant === 'primary') {
        style.backgroundColor = props.color
      } else {
        style.borderColor = props.color
        style['--btn-hover-tint'] = props.color
      }
    }

    if (props.textColor) {
      style.color = props.textColor
    } else if (props.color && props.variant !== 'primary') {
      style.color = props.color
    }

    return style
  })

  const DEFAULT_RIPPLE_OPTIONS: Required<ButtonRippleOptions> = {
    center: false,
    color: '',
  }

  const rippleConfig = computed<Required<ButtonRippleOptions> | null>(() => {
    if (props.ripple === false) return null
    if (props.ripple === true) return DEFAULT_RIPPLE_OPTIONS

    return { ...DEFAULT_RIPPLE_OPTIONS, ...props.ripple }
  })

  const resolvedRippleColor = computed(() => {
    if (rippleConfig.value?.color) return rippleConfig.value.color
    return props.variant === 'primary' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.15)'
  })

  const createRipple = (event: MouseEvent, color: string, center: boolean) => {
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

  const handleClick = (event: MouseEvent) => {
    if (props.disabled || props.loading) return

    const config = rippleConfig.value
    if (config) {
      createRipple(event, resolvedRippleColor.value, config.center)
    }

    emit('click', event)
  }
</script>

<style lang="scss">
  // ripple span สร้างนอก Vue render tree เลยไม่มี scoped attribute ต้องเป็น global style
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

  @media (hover: hover) {
    .btn-hover-tint:hover {
      background-color: color-mix(in srgb, var(--btn-hover-tint) 8%, transparent);
    }
  }
</style>
