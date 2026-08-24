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

      <slot></slot>

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
        class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
      ></span>
    </span>
  </button>
</template>

<script setup lang="ts">
  type ButtonVariant = 'primary' | 'secondary' | 'outline'
  type ButtonSize = 'sm' | 'md' | 'lg'
  type ButtonRound = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  type ButtonWidth = 'full' | 'fit'
  type ButtonType = 'button' | 'submit' | 'reset'

  // เลียนแบบ shape ของ Quasar's ripple prop (Boolean | Object) — ใส่ true เอาค่า default,
  // หรือใส่ object มาทับเฉพาะบาง field ก็ได้
  interface ButtonRippleOptions {
    center?: boolean
    color?: string
  }
  type ButtonRipple = boolean | ButtonRippleOptions

  interface Props {
    variant?: ButtonVariant
    size?: ButtonSize
    round?: ButtonRound
    width?: ButtonWidth | null
    disabled?: boolean
    loading?: boolean
    type?: ButtonType
    color?: string | null
    textColor?: string | null
    ripple?: ButtonRipple
    scaleOnPress?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'lg',
    round: 'lg',
    width: null,
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

  // px/text ต่อ size — h ตรึงเป็นค่าคงที่ (28/34/48px) ให้ touch target สม่ำเสมอ ไม่ผันตามความสูงบรรทัดของฟอนต์
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-7 px-3 text-12',
    md: 'h-8.5 px-4 text-12',
    lg: 'h-12 px-5 text-14',
  }

  const roundClasses: Record<ButtonRound, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  const widthClasses: Record<ButtonWidth, string> = {
    full: 'w-full',
    fit: 'w-fit',
  }

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-main-1 text-white hover:opacity-90',
    secondary: 'border border-main-1 bg-white text-main-1 hover:bg-main-1/5',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100',
  }

  const disabledClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gray-400 text-white',
    secondary: 'border border-gray-400 bg-gray-400 text-white',
    outline: 'border border-gray-300 bg-gray-100 text-gray-400',
  }

  const classes = computed(() => [
    'relative inline-flex items-center justify-center overflow-hidden font-bold transition',
    sizeClasses[props.size],
    roundClasses[props.round],
    props.width && widthClasses[props.width],
    props.disabled ? disabledClasses[props.variant] : variantClasses[props.variant],
    props.scaleOnPress && 'active:scale-95',
    props.disabled && 'pointer-events-none',
    props.loading && 'pointer-events-none opacity-50',
  ])

  // color/textColor คือทางลัดสีเฉพาะจุด ไม่ต้องเพิ่ม variant ใหม่ทุกครั้งที่มีปุ่มสีพิเศษหนึ่งจุด
  const customStyle = computed(() => {
    if (props.disabled || (!props.color && !props.textColor)) return {}

    const style: Record<string, string> = {}

    if (props.color) {
      if (props.variant === 'primary') {
        style.backgroundColor = props.color
      } else {
        style.borderColor = props.color
      }
    }

    if (props.textColor) {
      style.color = props.textColor
    } else if (props.color && props.variant !== 'primary') {
      style.color = props.color
    }

    return style
  })

  // false ปิด ripple ไปเลย, true ใช้ค่า default, object ทับเฉพาะ field ที่ส่งมา
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
  // ripple span ถูกสร้างด้วย document.createElement นอก render tree ของ Vue เลยไม่มี
  // scoped data attribute ให้ชน — ต้องเป็น global style ไม่ใช่ scoped
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
