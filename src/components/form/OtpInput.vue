<template>
  <div :style="rootStyle">
    <div class="relative flex items-center justify-center">
      <div
        v-for="(digit, index) in digits"
        :key="index"
        :class="[
          BASE_BOX_CLASSES,
          digitBoxClasses(index),
          digit !== null && props.animate && 'otp-digit-bounce',
          isBoxFocused(index) && 'otp-box-focused',
        ]"
      >
        <span v-if="digit !== null">{{ displayDigit(digit) }}</span>
        <span
          v-else
          class="otp-dot-color"
        >
          {{ props.emptyChar }}
        </span>
      </div>

      <input
        ref="hiddenInput"
        v-model="hiddenValue"
        type="text"
        :inputmode="props.allowString ? 'text' : 'numeric'"
        :pattern="props.allowString ? undefined : '[0-9]*'"
        class="otp-hidden-input absolute inset-0 z-10 m-0 h-full w-full cursor-text touch-manipulation border-0 bg-transparent p-0 text-left text-transparent caret-transparent outline-none select-text"
        autocomplete="one-time-code"
        :style="inputStyle"
        :readonly="props.readonly"
        @input="handleHiddenInput"
        @beforeinput="handleBeforeInput"
        @paste="handlePaste"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleEnterKey"
      />
    </div>

    <div
      v-if="props.invalid && !props.expired && props.invalidMessage"
      class="mt-2 w-full text-center text-18 font-normal text-error-1"
      :class="props.messageClass"
    >
      {{ props.invalidMessage }}
    </div>

    <div
      v-else-if="props.expired && props.expiredMessage"
      class="mt-2 w-full text-center text-18 font-normal text-error-1"
      :class="props.messageClass"
    >
      {{ props.expiredMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
  type OtpForceFormat = 'uppercase' | 'lowercase'
  type OtpShape = 'square' | 'circle' | 'underline'
  type OtpRoundedPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  // preset (Tailwind class) หรือ raw CSS value ก็ได้ (เช่น '12px') — เหมือน customStyle.rounded ของ TextField.vue
  type OtpRounded = OtpRoundedPreset | string

  interface Props {
    digitCount?: number
    allowString?: boolean
    forceFormat?: OtpForceFormat
    readonly?: boolean
    invalid?: boolean
    // ข้อความใต้ช่องตอน invalid — component นี้ไม่มีข้อความในตัวเอง ไม่ผูก i18n ต้องส่งเข้ามาเอง
    invalidMessage?: string
    expired?: boolean
    expiredMessage?: string
    // ต่อท้าย/override class เดิม (mt-2 w-full text-center text-14 font-normal text-error-1)
    // ของข้อความ invalid/expired ด้านล่างช่อง เช่น เปลี่ยนตำแหน่งหรือสี
    messageClass?: string
    // ขนาด/รูปทรงกล่อง — ใช้ค่าเดียวกันไปคำนวณทั้ง box (CSS var) และ inputStyle ของ input
    // ที่ซ่อนอยู่ ป้องกันปัญหาต้องแก้สองที่แล้วลืมที่ใดที่หนึ่งจนตำแหน่ง caret เพี้ยนจากกล่อง
    boxSize?: number
    boxGap?: number
    fontSize?: number
    shape?: OtpShape
    // มุมกล่อง แยกอิสระจาก shape (shape คุมแค่ลักษณะ border รอบด้าน/ล่างด้านเดียว) — ไม่ส่งมา = ใช้ค่า
    // default ของ shape นั้น (square = lg, circle = full, underline = none)
    rounded?: OtpRounded
    // สี — ไม่มีโทเค็น --color-otp-* แยกเลย ใช้ตัวแปร gray scale ของ style.css ตรงๆ: borderColor
    // ไม่ส่งมา = --color-gray-200, dotColor ไม่ส่งมา = --color-gray-300, gradientStart/End
    // ไม่ส่งมา = --color-gray-900 (สีดำ)
    borderColor?: string
    dotColor?: string
    gradientStart?: string
    gradientEnd?: string
    // ตัวอักษรตอนช่องว่าง — ไม่ส่ง emptyCharFontSize มา = ใช้ fontSize เดียวกับตัวเลขที่พิมพ์
    emptyChar?: string
    emptyCharFontSize?: number
    // เปิด/ปิด animation ตอนกรอกตัวเลข
    animate?: boolean
    // แสดงกรอบไฮไลต์ที่ช่องซึ่งกำลังจะรับตัวเลขถัดไป ตอน input ที่ซ่อนอยู่ได้ focus
    focusIndicator?: boolean
    // focus input ที่ซ่อนอยู่ให้อัตโนมัติตอน mount (พิมพ์ได้ทันทีไม่ต้องคลิกก่อน) — ปิดถ้าหน้ามีหลาย
    // OtpInput พร้อมกันแล้วไม่อยากให้ตัวใดตัวหนึ่งแย่ง focus ไปตอนโหลดหน้า
    autoFocus?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    digitCount: 6,
    allowString: false,
    forceFormat: undefined,
    readonly: false,
    invalid: false,
    invalidMessage: '',
    expired: false,
    expiredMessage: '',
    messageClass: '',
    boxSize: 48,
    boxGap: 5,
    fontSize: 24,
    shape: 'square',
    rounded: undefined,
    borderColor: undefined,
    dotColor: undefined,
    gradientStart: undefined,
    gradientEnd: undefined,
    emptyChar: '•',
    emptyCharFontSize: undefined,
    animate: true,
    focusIndicator: false,
    autoFocus: true,
  })

  const emit = defineEmits<{
    enter: []
    input: []
    focus: []
    blur: []
    'clear-invalid': []
  }>()

  const model = defineModel<string>({ required: true })

  interface SyncOtpOptions {
    fromPaste?: boolean
  }

  const hiddenInput = ref<HTMLInputElement | null>(null)
  const hiddenValue = ref('')
  const digits = reactive<(string | null)[]>(Array.from({ length: props.digitCount }, () => null))
  const focusedIndex = ref(-1)
  const isFocused = ref(false)
  const previousInputLength = ref(0)
  const pasteHandledByBeforeInput = ref(false)

  const SHAPE_DEFAULT_ROUNDED: Record<OtpShape, OtpRoundedPreset> = {
    square: 'lg',
    circle: 'full',
    underline: 'none',
  }
  const ROUNDED_PX_MAP: Record<OtpRoundedPreset, string> = {
    none: '0px',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  }
  const isRoundedPreset = (value: OtpRounded): value is OtpRoundedPreset => value in ROUNDED_PX_MAP

  // props.rounded ที่ไม่ได้ส่งมา = ใช้ default ของ shape นั้น, ส่งมาเป็น preset = แปลงเป็น px,
  // ส่งมาเป็นค่าอื่น (เช่น '12px') = ใช้ตรงๆ
  const effectiveRounded = computed(() => {
    const value = props.rounded ?? SHAPE_DEFAULT_ROUNDED[props.shape]
    return isRoundedPreset(value) ? ROUNDED_PX_MAP[value] : value
  })

  const rootStyle = computed(() => ({
    '--otp-box-size': `${props.boxSize}px`,
    '--otp-box-gap': `${props.boxGap}px`,
    '--otp-font-size': `${props.fontSize}px`,
    '--otp-rounded': effectiveRounded.value,
    ...(props.borderColor ? { '--otp-border-color': props.borderColor } : {}),
    ...(props.dotColor ? { '--otp-dot-color': props.dotColor } : {}),
    ...(props.gradientStart ? { '--otp-gradient-start': props.gradientStart } : {}),
    ...(props.gradientEnd ? { '--otp-gradient-end': props.gradientEnd } : {}),
    ...(props.emptyCharFontSize ? { '--otp-empty-font-size': `${props.emptyCharFontSize}px` } : {}),
  }))

  const inputStyle = computed(() => {
    const slotWidth = props.boxSize + props.boxGap * 2
    const charWidth = props.fontSize * 0.6

    return {
      fontSize: `${props.fontSize}px`,
      letterSpacing: `${slotWidth - charWidth}px`,
      textIndent: `${props.boxGap + (props.boxSize - charWidth) / 2}px`,
    }
  })

  // ไม่ใส่ transition-colors ตรงนี้ — ถ้า animate border-color/color พร้อมกับ gradient border ของ
  // .otp-box-filled (ทำผ่าน background-image ไม่ใช่ border ปกติ) Chrome จะค้าง transition ไว้ที่ค่าเดิม
  // ไม่ยอมขยับไปค่าใหม่เลย
  const BASE_BOX_CLASSES = 'otp-box flex items-center justify-center font-bold pointer-events-none'
  const SHAPE_CLASSES: Record<OtpShape, string> = {
    square: 'otp-shape-square',
    circle: 'otp-shape-circle',
    underline: 'otp-shape-underline',
  }
  const IDLE_BOX_CLASSES = 'otp-box-idle bg-white'
  const FILLED_BOX_CLASSES = 'otp-box-filled bg-white'
  const INVALID_BOX_CLASSES = 'border-error-1 bg-error-2 text-error-1'

  const digitBoxClasses = (index: number): string => {
    const hasDigit = digits[index] !== null
    const shapeClass = SHAPE_CLASSES[props.shape]
    if (props.invalid && hasDigit) return `${shapeClass} ${INVALID_BOX_CLASSES}`
    if (hasDigit) return `${shapeClass} ${FILLED_BOX_CLASSES}`
    return `${shapeClass} ${IDLE_BOX_CLASSES}`
  }

  const isBoxFocused = (index: number): boolean => {
    return props.focusIndicator && isFocused.value && focusedIndex.value === index
  }

  const displayDigit = (digit: string | null): string => {
    if (!digit) return ''
    if (props.forceFormat === 'uppercase') return digit.toUpperCase()
    if (props.forceFormat === 'lowercase') return digit.toLowerCase()
    return digit
  }

  const sanitizeOtpValue = (value: string | null | undefined): string => {
    let sanitized = value ?? ''

    if (!props.allowString) {
      sanitized = sanitized.replace(/\D/g, '')
    }

    if (props.forceFormat === 'uppercase') {
      sanitized = sanitized.toUpperCase()
    } else if (props.forceFormat === 'lowercase') {
      sanitized = sanitized.toLowerCase()
    }

    return sanitized.slice(0, props.digitCount)
  }

  const getInputSelection = (): { start: number; end: number } => {
    const input = hiddenInput.value
    const start = input?.selectionStart ?? hiddenValue.value.length
    const end = input?.selectionEnd ?? hiddenValue.value.length

    return { start, end }
  }

  const mergeInputValue = (insertText: string, start: number, end: number): string => {
    return hiddenValue.value.slice(0, start) + insertText + hiddenValue.value.slice(end)
  }

  // preventScroll ใช้แค่ตอน auto-focus บน mount (กัน browser ลาก scroll ทั้งหน้าไปหาตัวที่ mount
  // หลังสุดตอนหน้ามีหลาย OtpInput ซ้อนกัน) — ตอนผู้ใช้กดที่กล่องเองบนมือถือ ต้อง "ไม่" ใส่ preventScroll
  // ไม่งั้น browser จะไม่เลื่อนจอขึ้นไปให้ช่อง OTP โผล่พ้นแป้นพิมพ์ที่เด้งขึ้นมา
  const focusDigit = (
    index: number,
    { preventScroll = false }: { preventScroll?: boolean } = {}
  ): void => {
    if (index >= 0 && index < digits.length) {
      focusedIndex.value = index
      hiddenInput.value?.focus({ preventScroll })
    } else {
      focusedIndex.value = -1
    }
  }

  const syncOtpValue = (rawValue: string, { fromPaste = false }: SyncOtpOptions = {}): void => {
    const inputValue = sanitizeOtpValue(rawValue)

    if (hiddenValue.value !== inputValue) {
      hiddenValue.value = inputValue
    }

    for (let i = 0; i < props.digitCount; i++) {
      digits[i] = i < inputValue.length ? inputValue.charAt(i) : null
    }

    model.value = inputValue

    // ลบตัวเลขระหว่าง invalid = true อยู่ ให้ล้างสถานะ invalid ทิ้งไปด้วยเลย ไม่งั้นกล่องสีแดงค้างอยู่
    // ทั้งที่ค่าที่ผู้เรียกยังไม่ได้ validate ใหม่
    if (inputValue.length < previousInputLength.value && props.invalid && !fromPaste) {
      emit('clear-invalid')
      resetInput()
      return
    }

    if (inputValue.length > previousInputLength.value || fromPaste) {
      emit('input')
    }

    previousInputLength.value = inputValue.length

    if (inputValue.length < props.digitCount) {
      focusDigit(inputValue.length)
    } else if (inputValue.length === 0) {
      focusDigit(0)
    }
  }

  const handleHiddenInput = (): void => {
    syncOtpValue(hiddenValue.value)
  }

  const handleBeforeInput = (event: InputEvent): void => {
    if (event.inputType !== 'insertFromPaste' || !event.data) return

    event.preventDefault()
    pasteHandledByBeforeInput.value = true

    const { start, end } = getInputSelection()
    syncOtpValue(mergeInputValue(event.data, start, end), { fromPaste: true })

    nextTick(() => {
      pasteHandledByBeforeInput.value = false
    })
  }

  const handlePaste = (event: ClipboardEvent): void => {
    if (pasteHandledByBeforeInput.value) return

    const pastedText =
      event.clipboardData?.getData('text/plain') ?? event.clipboardData?.getData('text') ?? ''

    // มือถือ/iOS บางทีไม่มี clipboardData เลย — ปล่อยให้ paste ปกติทำงาน แล้ว @input จะ sanitize ให้เอง
    if (!pastedText) return

    event.preventDefault()

    const { start, end } = getInputSelection()
    syncOtpValue(mergeInputValue(pastedText, start, end), { fromPaste: true })
  }

  const handleFocus = (): void => {
    // ไม่ล้างสถานะ invalid ตอน focus
    isFocused.value = true
    focusDigit(hiddenValue.value.length)
    emit('focus')
  }

  const handleBlur = (): void => {
    isFocused.value = false
    emit('blur')
  }

  const handleEnterKey = (): void => {
    if (hiddenValue.value.length === props.digitCount) {
      emit('enter')
    }
  }

  const resetInput = (): void => {
    hiddenValue.value = ''
    for (let i = 0; i < props.digitCount; i++) {
      digits[i] = null
    }
    model.value = ''
    focusedIndex.value = 0
    previousInputLength.value = 0
    hiddenInput.value?.focus()
  }

  onMounted(() => {
    if (props.autoFocus) {
      focusDigit(0, { preventScroll: true })
    }
  })

  defineExpose({
    reset: resetInput,
    focus: () => focusDigit(0),
  })
</script>

<style scoped lang="scss">
  @keyframes otp-bounce {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.1);
    }
  }

  .otp-digit-bounce {
    animation: otp-bounce 0.1s ease-in-out alternate;
  }

  .otp-hidden-input {
    -webkit-text-fill-color: transparent;
  }

  .otp-hidden-input::selection {
    background: transparent;
  }

  // กัน Android/Chrome ทาสีเทา (autofill highlight) ทับช่อง OTP ตอนกด autofill
  .otp-hidden-input:-webkit-autofill,
  .otp-hidden-input:-webkit-autofill:hover,
  .otp-hidden-input:-webkit-autofill:focus,
  .otp-hidden-input:-webkit-autofill:active {
    -webkit-text-fill-color: transparent;
    -webkit-box-shadow: 0 0 0 1000px transparent inset;
    box-shadow: 0 0 0 1000px transparent inset;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: transparent;
  }

  // ขนาด/ระยะห่าง/ฟอนต์/มุมมนมาจาก props ล้วน (ผ่าน CSS var บน root) — ไม่ hardcode ซ้ำกับ inputStyle
  // ในสคริปต์ ทั้งสองฝั่งอ่านจาก props.boxSize/boxGap/fontSize แหล่งเดียวกัน. border-radius แยกออกมา
  // จาก .otp-shape-* ด้านล่าง เพราะ rounded เป็น prop อิสระจาก shape (shape คุมแค่ border เอง)
  .otp-box {
    width: var(--otp-box-size);
    height: var(--otp-box-size);
    margin-inline: var(--otp-box-gap);
    font-size: var(--otp-font-size);
    border-radius: var(--otp-rounded);
    border-style: solid;
  }

  .otp-shape-square {
    border-width: 1px;
  }

  .otp-shape-circle {
    border-width: 1px;
  }

  .otp-shape-underline {
    border-width: 0 0 1px 0;
  }

  .otp-dot-color {
    font-size: var(--otp-empty-font-size, inherit);
    color: var(--otp-dot-color, var(--color-gray-300));
  }

  .otp-box-idle {
    border-color: var(--otp-border-color, var(--color-gray-200));
  }

  // ring บอกช่องที่กำลังจะรับตัวเลขถัดไปตอน focus (focusIndicator prop) — ใช้ box-shadow ไม่แตะ
  // border-color เพื่อไม่ไปชนกับเทคนิค gradient border ของ .otp-box-filled ด้านล่าง
  .otp-box-idle.otp-box-focused {
    border-color: var(--color-main-1);
  }

  .otp-box-focused {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-main-1) 20%, transparent);
  }

  // border-image ไม่รองรับ border-radius เลยใช้เทคนิค layered background แทน: พื้นสีทึบ clip แค่
  // padding-box ซ้อนทับ gradient ที่ clip ถึง border-box (เหมือนกับที่ทำไว้ใน fixfit)
  // ไม่มี --color-otp-gradient-* เป็นโทเค็นแยกใน style.css เพราะ default เป็นสีเดียวกับ
  // --color-gray-900 อยู่แล้ว อ้างอิงตรงๆ แทนการเพิ่มโทเค็นซ้ำซ้อน
  .otp-box-filled {
    border-color: transparent;
    background-image:
      linear-gradient(white, white),
      linear-gradient(
        223.19deg,
        var(--otp-gradient-start, var(--color-gray-900)) 0%,
        var(--otp-gradient-end, var(--color-gray-900)) 97.04%
      );
    background-origin: border-box;
    background-clip: padding-box, border-box;
    color: var(--otp-gradient-start, var(--color-gray-900));
  }
</style>
