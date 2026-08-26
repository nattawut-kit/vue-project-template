<template>
  <div
    class="relative inline-block overflow-hidden bg-transparent"
    :class="roundClass"
    :style="containerStyle"
  >
    <img
      class="block h-full w-full"
      :class="[
        fitClasses[props.fit],
        positionClass,
        props.imgClass,
        // visibility ไม่ใช่ display:none — ต้องเหลือ layout box ไว้ให้ loading=lazy (IntersectionObserver) ทำงานได้ปกติ
        hasError || (props.reveal && isLoading) ? 'invisible' : 'visible',
      ]"
      :src="currentSrc"
      :srcset="props.srcset || undefined"
      :sizes="props.sizes || undefined"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :draggable="draggable"
      :style="[imgStyle, props.imgStyle]"
      @load="handleLoad"
      @error="handleError"
    />

    <slot />

    <div
      v-if="isLoading || hasError"
      class="absolute inset-0"
    >
      <slot
        v-if="hasError"
        name="error"
      >
        <div
          v-if="!isLoading"
          class="h-full min-h-6 w-full min-w-6 bg-gray-100"
        />
      </slot>
      <slot
        v-else
        name="placeholder"
      >
        <img
          v-if="props.placeholderSrc"
          class="h-full w-full"
          :class="[fitClasses[props.fit], positionClass]"
          :src="props.placeholderSrc"
          :style="imgStyle"
          alt=""
          aria-hidden="true"
        />
        <div
          v-else-if="isPulse"
          class="pulse-fade h-full min-h-6 w-full min-w-6 bg-[#9ca3af]"
        />
        <div
          v-else-if="spinnerConfig"
          class="flex h-full min-h-6 w-full min-w-6 items-center justify-center bg-gray-100/70"
        >
          <span
            class="animate-spin rounded-full border-2 border-t-transparent"
            :class="[!spinnerConfig.size && 'size-5', !spinnerConfig.color && 'border-gray-400']"
            :style="spinnerStyle"
            aria-hidden="true"
          />
        </div>
        <div
          v-else
          class="h-full min-h-6 w-full min-w-6 bg-gray-100/70"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { HTMLAttributes } from 'vue'

  type DimensionValue = number | string | null
  type ImgFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  type ImgPosition =
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'left-top'
    | 'left-bottom'
    | 'right-top'
    | 'right-bottom'
  type ImgRound = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

  // 'pulse' (default) = กล่องเทากะพริบ (animation เดียวกับ MKSkeleton.vue ใน mk-one), true = spinner หมุน, object = spinner หมุนแบบทับเฉพาะ field ที่ระบุ, false = ไม่มี spinner (กล่องเทาเปล่าๆ)
  interface ImgSpinnerOptions {
    color?: string
    size?: string
  }
  type ImgSpinner = boolean | 'pulse' | ImgSpinnerOptions

  interface Props {
    src: string
    // native srcset/sizes — ให้ browser เลือกรูปตาม pixel density/viewport เอง, src ยังเป็น fallback เดิม
    srcset?: string | null
    sizes?: string | null
    alt?: string
    width?: DimensionValue
    height?: DimensionValue
    // ตัด layout shift ตอนโหลด, รูปแบบ CSS aspect-ratio เช่น '1/1', '16/9'
    aspectRatio?: string | null
    fit?: ImgFit
    // keyword ใช้ Tailwind class object-*, ค่าอื่นใช้เป็น object-position ตรงๆ เช่น '50% 20%'
    position?: ImgPosition | string
    // keyword ใช้ Tailwind class, ค่าอื่นใช้เป็น border-radius ตรงๆ
    round?: ImgRound | string
    lazy?: boolean
    // ปิด native image drag ของ browser (เช่น รูปอยู่ใน carousel ที่ swipe ด้วยนิ้ว)
    draggable?: boolean
    spinner?: ImgSpinner
    // true (default) = ซ่อนรูปไว้จนกว่าจะโหลดเสร็จค่อยโชว์ทีเดียว (กัน progressive-render ทะลุ loading indicator เช่นตอน spinner="pulse")
    // false = โชว์รูปตั้งแต่เริ่มโหลด (พฤติกรรมเดิมก่อนแก้) — เห็นรูปค่อยๆ render ทับ/ปนกับ loading indicator ได้
    reveal?: boolean
    // รูป (มักเป็น base64/low-res) โชว์ทันทีระหว่างรอ src โหลด แทน spinner default — สลับเป็น src จริงอัตโนมัติตอนโหลดเสร็จ
    placeholderSrc?: string | null
    // สลับไปรูปนี้ถ้าโหลด src หลักไม่สำเร็จ
    fallbackSrc?: string | null
    // ทับ class/style เฉพาะ <img> เอง แยกจาก class/style ที่ส่งเข้า <Img> (ไปลงที่ container ด้านนอกตามปกติของ Vue attrs fallthrough) — ใช้เช่น grayscale/blur ตอน disabled
    imgClass?: HTMLAttributes['class']
    imgStyle?: HTMLAttributes['style']
  }

  const props = withDefaults(defineProps<Props>(), {
    srcset: null,
    sizes: null,
    alt: '',
    width: null,
    height: null,
    aspectRatio: null,
    fit: 'cover',
    position: 'center',
    round: 'none',
    lazy: true,
    draggable: true,
    spinner: 'pulse',
    reveal: true,
    placeholderSrc: null,
    fallbackSrc: null,
    imgClass: undefined,
    imgStyle: undefined,
  })

  const emit = defineEmits<{
    load: []
    error: [error: Event]
  }>()

  const isLoading = ref(true)
  const hasError = ref(false)
  const usingFallback = ref(false)

  const currentSrc = computed(() =>
    usingFallback.value && props.fallbackSrc ? props.fallbackSrc : props.src
  )

  const fitClasses: Record<ImgFit, string> = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }

  const positionClasses: Record<ImgPosition, string> = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
    'left-top': 'object-left-top',
    'left-bottom': 'object-left-bottom',
    'right-top': 'object-right-top',
    'right-bottom': 'object-right-bottom',
  }

  const roundClasses: Record<ImgRound, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  const isPositionKeyword = (value: string): value is ImgPosition => value in positionClasses
  const isRoundKeyword = (value: string): value is ImgRound => value in roundClasses

  const positionClass = computed(() =>
    isPositionKeyword(props.position) ? positionClasses[props.position] : ''
  )
  const roundClass = computed(() => (isRoundKeyword(props.round) ? roundClasses[props.round] : ''))

  const toCssSize = (value: DimensionValue): string | undefined => {
    if (value === null) return undefined
    return typeof value === 'number' ? `${value}px` : value
  }

  const containerStyle = computed(() => {
    const style: Record<string, string> = {}

    const width = toCssSize(props.width)
    const height = toCssSize(props.height)
    if (width) style.width = width
    if (height) style.height = height
    if (props.aspectRatio) style.aspectRatio = props.aspectRatio
    if (!isRoundKeyword(props.round)) style.borderRadius = props.round

    return style
  })

  const imgStyle = computed(() => {
    if (isPositionKeyword(props.position)) return {}
    return { objectPosition: props.position }
  })

  const DEFAULT_SPINNER_OPTIONS: Required<ImgSpinnerOptions> = {
    color: '',
    size: '',
  }

  const isPulse = computed(() => props.spinner === 'pulse')

  const spinnerConfig = computed<Required<ImgSpinnerOptions> | null>(() => {
    if (props.spinner === false || props.spinner === 'pulse') return null
    if (props.spinner === true) return DEFAULT_SPINNER_OPTIONS

    return { ...DEFAULT_SPINNER_OPTIONS, ...props.spinner }
  })

  const spinnerStyle = computed(() => {
    const config = spinnerConfig.value
    if (!config) return {}

    const style: Record<string, string> = {}
    if (config.size) {
      style.width = config.size
      style.height = config.size
    }
    if (config.color) {
      style.borderColor = config.color
      style.borderTopColor = 'transparent'
    }

    return style
  })

  const resetState = (): void => {
    isLoading.value = true
    hasError.value = false
    usingFallback.value = false
  }

  const handleLoad = (): void => {
    isLoading.value = false
    emit('load')
  }

  const handleError = (event: Event): void => {
    if (props.fallbackSrc && !usingFallback.value) {
      usingFallback.value = true
      return
    }

    isLoading.value = false
    hasError.value = true
    emit('error', event)
  }

  watch(() => props.src, resetState)
</script>

<style scoped lang="scss">
  // timing เดียวกับ MKSkeleton.vue (mk-one) — ไม่ใช้ Tailwind animate-pulse เพราะ duration/easing ต่างกัน (2s cubic-bezier vs 1.8s ease-in-out)
  .pulse-fade {
    animation: pulse-fade 1.8s ease-in-out infinite;
  }

  @keyframes pulse-fade {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }
</style>
