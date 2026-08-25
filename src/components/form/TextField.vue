<template>
  <div class="w-full">
    <!-- labelSpace เว้นพื้นที่ label แม้ label ว่าง เพื่อเรียงให้ตรงกับ field อื่นที่มี label ในกลุ่มเดียวกัน -->
    <div
      v-if="!floatLabel && (label || labelSpace)"
      class="mb-1.5 min-h-[1.5em] font-bold text-gray-900"
      :class="stackLabelTextClass"
      :style="labelStyle"
    >
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="ml-1 text-error-1"
        :class="stackLabelRequiredClass"
        >*</span
      >
    </div>

    <div class="relative w-full">
      <input
        ref="inputRef"
        :type="type === 'number' || type === 'currency' ? 'text' : type"
        :inputmode="
          type === 'number' || type === 'currency' ? 'decimal' : type === 'tel' ? 'tel' : undefined
        "
        :value="displayValue"
        :maxlength="maxLength"
        :placeholder="floatLabel && label && !isLabelActive ? '' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocompleteAttr"
        :class="inputClasses"
        :style="[inputCustomStyle, roundedStyle]"
        v-bind="$attrs"
        @input="onInput"
        @keypress="onKeypress"
        @focus="isFocused = true"
        @blur="validate"
        @animationstart="onAnimationStart"
      />

      <label
        v-if="label && floatLabel"
        :class="labelClasses"
        :style="labelStyle"
      >
        <span>{{ label }}</span>
        <span
          v-if="required"
          class="ml-0.5 text-error-1"
          :class="isLabelActive ? 'text-16' : 'text-20'"
          >*</span
        >
      </label>

      <div
        v-if="hasEndIconSlot"
        class="absolute inset-y-0 right-0 flex items-center gap-1 pr-4"
      >
        <span
          v-if="suffix"
          class="text-gray-500"
          :class="textClass"
          >{{ suffix }}</span
        >
        <slot
          v-if="!hasError || !slots['end-icon-error']"
          name="end-icon"
        ></slot>
        <span
          v-else
          class="contents text-field-icon-error"
        >
          <slot name="end-icon-error"></slot>
        </span>
      </div>

      <button
        v-else-if="showClearButton"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
        @click="clearValue"
      >
        <Svg
          src="common/x-close"
          class="size-4"
          color="black"
        />
      </button>

      <div
        v-else-if="hasSuffix"
        class="absolute inset-y-0 right-0 flex items-center pr-4"
      >
        <span
          class="text-gray-500"
          :class="textClass"
          >{{ suffix }}</span
        >
      </div>

      <div
        v-if="hasStartIconSlot"
        class="absolute inset-y-0 left-0 flex items-center gap-1 pl-4"
      >
        <slot
          v-if="!hasError || !slots['start-icon-error']"
          name="start-icon"
        ></slot>
        <span
          v-else
          class="contents text-field-icon-error"
        >
          <slot name="start-icon-error"></slot>
        </span>
        <span
          v-if="prefix"
          class="text-gray-500"
          :class="textClass"
          >{{ prefix }}</span
        >
      </div>

      <div
        v-else-if="hasPrefix"
        class="absolute inset-y-0 left-0 flex items-center pl-4"
      >
        <span
          class="text-gray-500"
          :class="textClass"
          >{{ prefix }}</span
        >
      </div>
    </div>

    <div
      v-if="hasError && errorMessage"
      class="mt-1 font-light text-error-1 duration-150 animate-[slideIn_0.15s_ease-out_forwards]"
      :class="errorTextClass"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="helperText"
      class="mt-1 font-light text-gray-500 duration-150 animate-[fadeIn_0.1s_ease-out_forwards]"
      :class="helperTextClass"
    >
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  type TextFieldType = 'text' | 'email' | 'number' | 'tel' | 'password' | 'currency'

  type RoundedPreset = 'none' | 'sm' | 'md' | 'lg' | 'full'
  // preset หรือ raw CSS value ก็ได้ (เช่น '12px') — ค่าที่ไม่ตรง preset จะ fallback ไปเป็น inline style แทน
  type RoundedValue = RoundedPreset | string
  interface RoundedCorners {
    tl?: RoundedValue
    tr?: RoundedValue
    br?: RoundedValue
    bl?: RoundedValue
  }

  interface MaskToken {
    char: string
    isToken: boolean
  }

  interface TextFieldCustomStyle {
    // ไม่ใส่ = rounded-lg ทุกมุม, ใส่ object คุมทีละมุมได้ — มุมที่ไม่ระบุ default เป็น 'none' ไม่ใช่ 'lg'
    rounded?: RoundedValue | RoundedCorners
    // ใส่ผ่าน inline style เพราะเป็นค่า runtime, Tailwind generate class ล่วงหน้าให้ไม่ได้
    bgColor?: string
    // คุมสีตัวอักษร label ทั้งแบบ stack และ float — เครื่องหมาย * ยังคง error-1 เสมอ
    labelColor?: string
    textColor?: string
    // ไม่ใส่ = gray-300/gray-400 เดิม
    borderColor?: string
    // ไม่ใส่ = ใช้ borderColor ต่อ ไม่งั้น main-1 เดิม
    focusColor?: string
  }

  interface Props {
    label?: string
    // false (default) = label นิ่งด้านบนเสมอ, true = label ลอยซ้อนเป็น placeholder แล้วลอยขึ้นตอน focus/มีค่า
    floatLabel?: boolean
    // มีผลเฉพาะตอน floatLabel=false และ label ว่าง — true = เว้นพื้นที่ไว้เท่ากับตอนมี label
    labelSpace?: boolean
    placeholder?: string
    helperText?: string
    type?: TextFieldType
    rules?: IValidationRule[]
    maxLength?: number
    formatFunc?: (value: string) => string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    clearable?: boolean
    // ข้อความคงที่ชิดขอบซ้าย/ขวา เช่น '$', 'บาท' — start-icon/end-icon slot มีสิทธิ์เหนือกว่า
    prefix?: string
    suffix?: string
    // '#' ตัวเลข, 'S' ตัวอักษร, 'N' ตัวอักษร+ตัวเลข, 'A'/'a' บังคับพิมพ์ใหญ่/เล็ก, 'X'/'x' ตัวอักษร+ตัวเลขบังคับพิมพ์ใหญ่/เล็ก ตัวอื่นเป็นตัวคั่น (ใส่ '\' นำหน้าถ้าต้องใช้ตัวอักษร token เป็นตัวคั่นจริง)
    mask?: string
    // เติมตำแหน่งที่ยังไม่ถึงด้วยอักขระ fill (default '_')
    fillMask?: boolean | string
    // เติม fillMask จากขวาไปซ้าย เหมาะกับ mask ที่พิมพ์ไล่จากหลักท้าย
    reverseFillMask?: boolean
    // true = v-model เป็นเนื้อหาล้วนไม่มีตัวคั่น, false (default) = v-model มี mask ติดมาด้วย
    unmaskedValue?: boolean
    // ไม่มีผลตอน disabled/error เพื่อให้ signal สถานะยังชัดเจน
    customStyle?: TextFieldCustomStyle
    // เท่ากับตั้ง customStyle.bgColor เป็น transparent ถ้ายังไม่ได้ตั้งเอง
    outlined?: boolean
    // ไม่มีกรอบ/พื้นหลังทุก state มีสิทธิ์เหนือกว่า customStyle.borderColor/focusColor/bgColor
    borderless?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    floatLabel: false,
    labelSpace: false,
    placeholder: '',
    helperText: '',
    type: 'text',
    rules: () => [],
    maxLength: undefined,
    formatFunc: (value: string) => value,
    disabled: false,
    readonly: false,
    required: false,
    clearable: false,
    prefix: '',
    suffix: '',
    mask: '',
    fillMask: false,
    reverseFillMask: false,
    unmaskedValue: false,
    customStyle: () => ({}),
    outlined: false,
    borderless: false,
  })

  const emit = defineEmits<{
    error: [error: { hasError: boolean; message: string }]
    blur: [event: FocusEvent]
  }>()

  const model = defineModel<string | number>({ required: true })

  const inputRef = ref<HTMLInputElement>()
  const displayValue = ref('')
  const isFocused = ref(false)
  // autofill เซ็ตค่าตรงๆ ไม่ยิง 'input' event เสมอไป ตรวจจับผ่าน CSS animation trick แทน (ดู :-webkit-autofill ด้านล่าง)
  const isAutofilled = ref(false)

  const slots = useSlots()
  const hasEndIconSlot = !!slots['end-icon'] || !!slots['end-icon-error']
  const hasStartIconSlot = !!slots['start-icon'] || !!slots['start-icon-error']

  const hasError = ref(false)
  const errorMessage = ref('')

  // แหล่งความจริงของเนื้อหา — displayValue ตอน fillMask จะเต็มไปด้วยอักขระ fill ตั้งแต่ยังไม่พิมพ์อะไรเลย ใช้เช็คความว่างไม่ได้
  const maskRawContent = ref('')
  // ตำแหน่งเนื้อหาจริงของ displayValue ปัจจุบัน ใช้นับ "ก่อน cursor มีเนื้อหากี่ตัว" ตอนแก้ไขครั้งถัดไป
  const maskDisplayIsContent = ref<boolean[]>([])
  // กัน watchEffect (sync จากภายนอก) ประมวลผลซ้ำตอน onMaskInput เซ็ต model.value เอง — ไม่ใช้ ref เพราะไม่ต้องการ trigger reactivity เพิ่ม
  let isInternalMaskUpdate = false

  // border-color ผูกกับ CSS variable (.text-field-custom-border) แทน hardcode เพื่อให้ customStyle.borderColor/focusColor override ตอน hover/focus ได้
  const DEFAULT_STATE_CLASSES = ['text-field-custom-border', 'bg-white', 'text-gray-900']

  const ERROR_STATE_CLASSES = [
    'border-error-1',
    'bg-error-2',
    'text-error-1',
    'focus:border-error-1',
    'focus:ring-2',
    'focus:ring-error-1/20',
    'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)]',
  ]

  const DISABLED_STATE_CLASSES = ['border-gray-300', 'bg-gray-100', 'cursor-not-allowed']

  const MASK_TOKEN_PATTERNS: Record<string, RegExp> = {
    '#': /[0-9]/,
    S: /[a-zA-Z]/,
    N: /[0-9a-zA-Z]/,
    A: /[a-zA-Z]/,
    a: /[a-zA-Z]/,
    X: /[0-9a-zA-Z]/,
    x: /[0-9a-zA-Z]/,
  }

  const MASK_CASE_TRANSFORM: Record<string, (char: string) => string> = {
    A: char => char.toUpperCase(),
    X: char => char.toUpperCase(),
    a: char => char.toLowerCase(),
    x: char => char.toLowerCase(),
  }

  // '\' นำหน้าตัวอักษร token ทำให้กลายเป็นตัวคั่นธรรมดา
  const parseMask = (mask: string): MaskToken[] => {
    const tokens: MaskToken[] = []
    for (let i = 0; i < mask.length; i++) {
      const char = mask[i]
      if (char === '\\' && i + 1 < mask.length) {
        tokens.push({ char: mask[i + 1], isToken: false })
        i++
      } else if (MASK_TOKEN_PATTERNS[char]) {
        tokens.push({ char, isToken: true })
      } else {
        tokens.push({ char, isToken: false })
      }
    }
    return tokens
  }

  // กรองตัวคั่นทิ้งได้โดยไม่ต้องรู้ตำแหน่งเดิม เพราะตัวคั่นใน mask ไม่มีทาง match pattern ของ token อยู่แล้ว
  const extractMaskContent = (value: string): string => {
    const usedTokenChars = [
      ...new Set(maskTokens.value.filter(token => token.isToken).map(token => token.char)),
    ]
    if (usedTokenChars.length === 0) return ''
    return [...value]
      .filter(char => usedTokenChars.some(tokenChar => MASK_TOKEN_PATTERNS[tokenChar].test(char)))
      .join('')
  }

  // isContent กำกับว่าตำแหน่งไหนคือเนื้อหาจริง (ไม่ใช่ตัวคั่น) เพราะถ้า mask มีตัวคั่นที่ match pattern ของ token เอง (เช่น '0' ใน "0##-###-####") จะแยกไม่ออกจากผลลัพธ์เฉยๆ
  const buildMaskedValue = (
    content: string,
    tokens: MaskToken[]
  ): { text: string; isContent: boolean[] } => {
    if (!content) return { text: '', isContent: [] }
    let text = ''
    const isContent: boolean[] = []
    let charIndex = 0
    for (const token of tokens) {
      if (token.isToken) {
        if (charIndex >= content.length) break
        const pattern = MASK_TOKEN_PATTERNS[token.char]
        while (charIndex < content.length && !pattern.test(content[charIndex])) charIndex++
        if (charIndex >= content.length) break
        const transform = MASK_CASE_TRANSFORM[token.char]
        text += transform ? transform(content[charIndex]) : content[charIndex]
        isContent.push(true)
        charIndex++
      } else {
        text += token.char
        isContent.push(false)
      }
    }
    return { text, isContent }
  }

  // compact เรียงตรงกับ tokens ทีละตัวอยู่แล้ว เทียบตำแหน่งตรงๆ ได้เลย
  const applyFillMask = (
    compact: string,
    compactIsContent: boolean[],
    tokens: MaskToken[],
    fillChar: string
  ): { text: string; isContent: boolean[] } => {
    let text = ''
    const isContent: boolean[] = []
    for (let i = 0; i < tokens.length; i++) {
      if (i < compact.length) {
        text += compact[i]
        isContent.push(compactIsContent[i])
      } else if (tokens[i].isToken) {
        text += fillChar
        isContent.push(false)
      } else {
        text += tokens[i].char
        isContent.push(false)
      }
    }
    return { text, isContent }
  }

  // reverseFillMask กลับด้าน mask+เนื้อหาก่อนประกอบ (เท่ากับเติมจากท้าย) แล้วกลับผลลัพธ์คืน ใช้ engine เดียวกับโหมดปกติ
  const formatMaskValue = (
    rawContent: string
  ): { content: string; masked: string; display: string; displayIsContent: boolean[] } => {
    const tokens = maskTokens.value
    const limit = maskTokenCount.value
    const boundedContent = props.reverseFillMask
      ? rawContent.slice(-limit)
      : rawContent.slice(0, limit)

    const orderedTokens = props.reverseFillMask ? [...tokens].reverse() : tokens
    const orderedContent = props.reverseFillMask
      ? [...boundedContent].reverse().join('')
      : boundedContent

    const compactResult = buildMaskedValue(orderedContent, orderedTokens)
    const masked = props.reverseFillMask
      ? [...compactResult.text].reverse().join('')
      : compactResult.text
    const maskedIsContent = props.reverseFillMask
      ? [...compactResult.isContent].reverse()
      : compactResult.isContent
    // ดึงจาก masked (ผ่านการแปลงตัวพิมพ์ใหญ่/เล็กแล้ว) ด้วย maskedIsContent ไม่ใช่ extractMaskContent(masked) เพราะตัวคั่นที่ match pattern ของ token เองจะถูกนับซ้ำ
    const content = [...masked].filter((_, i) => maskedIsContent[i]).join('')

    if (!props.fillMask)
      return { content, masked, display: masked, displayIsContent: maskedIsContent }

    const filledResult = applyFillMask(
      compactResult.text,
      compactResult.isContent,
      orderedTokens,
      fillMaskChar.value
    )
    const display = props.reverseFillMask
      ? [...filledResult.text].reverse().join('')
      : filledResult.text
    const displayIsContent = props.reverseFillMask
      ? [...filledResult.isContent].reverse()
      : filledResult.isContent

    return { content, masked, display, displayIsContent }
  }

  // ต้องเขียน class เต็มตรงๆ ห้าม template string ต่อ (Tailwind scan แบบ static หา class ที่ generate runtime ไม่เจอ) — ค่าที่ไม่ตรง preset ไปใช้ roundedStyle แทน
  const ROUNDED_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  const ROUNDED_TL_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-tl-none',
    sm: 'rounded-tl-sm',
    md: 'rounded-tl-md',
    lg: 'rounded-tl-lg',
    full: 'rounded-tl-full',
  }
  const ROUNDED_TR_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-tr-none',
    sm: 'rounded-tr-sm',
    md: 'rounded-tr-md',
    lg: 'rounded-tr-lg',
    full: 'rounded-tr-full',
  }
  const ROUNDED_BR_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-br-none',
    sm: 'rounded-br-sm',
    md: 'rounded-br-md',
    lg: 'rounded-br-lg',
    full: 'rounded-br-full',
  }
  const ROUNDED_BL_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-bl-none',
    sm: 'rounded-bl-sm',
    md: 'rounded-bl-md',
    lg: 'rounded-bl-lg',
    full: 'rounded-bl-full',
  }

  const isRoundedCorners = (value: TextFieldCustomStyle['rounded']): value is RoundedCorners =>
    typeof value === 'object' && value !== null

  const isRoundedPreset = (value: RoundedValue): value is RoundedPreset =>
    value in ROUNDED_CLASS_MAP

  const hasMask = computed(() => !!props.mask)
  const maskTokens = computed(() => (hasMask.value ? parseMask(props.mask) : []))
  const maskTokenCount = computed(() => maskTokens.value.filter(token => token.isToken).length)
  const fillMaskChar = computed(() =>
    typeof props.fillMask === 'string' && props.fillMask ? props.fillMask[0] : '_'
  )

  // end-icon slot ที่กำหนดเองมีสิทธิ์เหนือกว่า ปุ่ม clear จะไม่ขึ้นถ้ามี end-icon slot อยู่แล้ว
  const showClearButton = computed(
    () =>
      props.clearable &&
      !hasEndIconSlot &&
      !props.disabled &&
      !props.readonly &&
      (hasMask.value ? !!maskRawContent.value : !!displayValue.value)
  )
  const hasEndIcon = computed(() => hasEndIconSlot || showClearButton.value)
  // prefix/suffix แสดงคู่กับ icon slot ได้ — ปุ่ม clear ทับ suffix เสมอเพราะอยู่ตำแหน่งเดียวกัน
  const hasPrefix = computed(() => !!props.prefix)
  const hasSuffix = computed(() => !!props.suffix && !showClearButton.value)
  const hasStartContent = computed(() => hasStartIconSlot || hasPrefix.value)
  const hasEndContent = computed(() => hasEndIcon.value || hasSuffix.value)
  // icon + prefix/suffix พร้อมกันกินพื้นที่กว้างกว่า ต้องกัน padding เพิ่ม ไม่งั้นตัวอักษรทับกัน
  const hasStartCombo = computed(() => hasStartIconSlot && hasPrefix.value)
  const hasEndCombo = computed(() => hasEndIconSlot && hasSuffix.value)

  const roundedClass = computed(() => {
    const rounded = props.customStyle.rounded ?? 'lg'

    if (!isRoundedCorners(rounded)) {
      return isRoundedPreset(rounded) ? ROUNDED_CLASS_MAP[rounded] : ''
    }

    const tl = rounded.tl ?? 'none'
    const tr = rounded.tr ?? 'none'
    const br = rounded.br ?? 'none'
    const bl = rounded.bl ?? 'none'
    return [
      isRoundedPreset(tl) ? ROUNDED_TL_CLASS_MAP[tl] : '',
      isRoundedPreset(tr) ? ROUNDED_TR_CLASS_MAP[tr] : '',
      isRoundedPreset(br) ? ROUNDED_BR_CLASS_MAP[br] : '',
      isRoundedPreset(bl) ? ROUNDED_BL_CLASS_MAP[bl] : '',
    ]
  })

  // ค่าที่ไม่ตรง preset ใส่ inline style ตรงนี้แทน คู่กับ roundedClass ที่เว้น class มุมนั้นไว้ว่าง
  const roundedStyle = computed(() => {
    const rounded = props.customStyle.rounded ?? 'lg'
    const style: Record<string, string> = {}

    if (!isRoundedCorners(rounded)) {
      if (!isRoundedPreset(rounded)) style.borderRadius = rounded
      return style
    }

    if (rounded.tl && !isRoundedPreset(rounded.tl)) style.borderTopLeftRadius = rounded.tl
    if (rounded.tr && !isRoundedPreset(rounded.tr)) style.borderTopRightRadius = rounded.tr
    if (rounded.br && !isRoundedPreset(rounded.br)) style.borderBottomRightRadius = rounded.br
    if (rounded.bl && !isRoundedPreset(rounded.bl)) style.borderBottomLeftRadius = rounded.bl
    return style
  })

  // ไม่ปรับสี custom ตอน disabled/error เพื่อให้ signal สถานะชัดเจนเสมอ
  const canCustomizeColors = computed(() => !props.disabled && !hasError.value)
  const isBorderless = computed(() => canCustomizeColors.value && props.borderless)

  // borderless ไม่มี bg ขาวด้วย ไม่งั้นจะเหลือกล่องขาวลอยๆ ไม่มีกรอบ
  const effectiveBgColor = computed(() => {
    if (!canCustomizeColors.value) return undefined
    return (
      props.customStyle.bgColor ??
      (props.outlined || isBorderless.value ? 'transparent' : undefined)
    )
  })

  // borderless มีสิทธิ์เหนือกว่า borderColor/focusColor เสมอ
  const effectiveBorderColor = computed(() => {
    if (isBorderless.value) return 'transparent'
    return canCustomizeColors.value ? props.customStyle.borderColor : undefined
  })
  const effectiveFocusColor = computed(() => {
    if (isBorderless.value) return 'transparent'
    return canCustomizeColors.value ? props.customStyle.focusColor : undefined
  })

  const inputCustomStyle = computed(() => {
    const style: Record<string, string> = {}
    if (effectiveBgColor.value) style.backgroundColor = effectiveBgColor.value
    if (canCustomizeColors.value && props.customStyle.textColor) {
      style.color = props.customStyle.textColor
    }
    if (effectiveBorderColor.value) style['--tf-border-color'] = effectiveBorderColor.value
    if (effectiveFocusColor.value) style['--tf-focus-color'] = effectiveFocusColor.value
    return style
  })

  const labelStyle = computed(() =>
    props.customStyle.labelColor ? { color: props.customStyle.labelColor } : undefined
  )

  const isLabelActive = computed(
    () =>
      isFocused.value ||
      (hasMask.value ? !!maskRawContent.value : !!displayValue.value) ||
      isAutofilled.value
  )

  // ป้องกัน Chrome ตีความ tel/email ก่อนช่อง password ผิดเป็น username แล้วเสนอ autofill บัญชีที่บันทึกไว้
  const autocompleteAttr = computed(() => {
    if (props.type === 'email') return 'email'
    if (props.type === 'tel') return 'tel'
    if (props.type === 'password') return 'current-password'
    return undefined
  })

  // floatLabel + มี label จริง — คุม input font size, padding, และการซ่อน placeholder
  const hasFloatingLabel = computed(() => props.floatLabel && !!props.label)

  // มี placeholder = ตัวอักษรใหญ่ 20px, ไม่มี (เช่น label ลอย) = 14px ตาม default เดิม
  const hasPlaceholder = computed(() => !!props.placeholder)
  const textClass = computed(() =>
    hasFloatingLabel.value ? 'text-16' : hasPlaceholder.value ? 'text-20' : 'text-17'
  )
  const helperTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-16'))
  const errorTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-18'))
  const stackLabelTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-14'))
  const stackLabelRequiredClass = computed(() => (hasPlaceholder.value ? 'text-16' : 'text-14'))
  const labelPaddingClass = computed(() =>
    props.readonly || props.disabled ? 'pt-3' : 'pt-[13px]'
  )

  // ห้ามใช้ 'pl-[15px]' คู่กับ 'pl-10' พร้อมกัน (ชนกันตอนมี icon) — เลือกใช้อันเดียวต่อด้าน / มี prefix+icon พร้อมกันขยับ padding เผื่ออีกชั้น
  const paddingClass = computed(() => {
    let pl = 'pl-[15px]'
    if (hasStartCombo.value) pl = hasFloatingLabel.value ? 'pl-[71px]' : 'pl-[74px]'
    else if (hasStartContent.value) pl = hasFloatingLabel.value ? 'pl-[39px]' : 'pl-[42px]'

    let pr = 'pr-4'
    if (hasEndCombo.value) pr = 'pr-[62px]'
    else if (hasEndContent.value) pr = 'pr-10'

    return [pl, pr]
  })

  const inputStateClasses = computed(() => {
    if (props.disabled) return DISABLED_STATE_CLASSES
    if (hasError.value) return ERROR_STATE_CLASSES
    return DEFAULT_STATE_CLASSES
  })

  const inputClasses = computed(() => [
    'text-field-control box-border h-12 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border outline-none transition-colors duration-150',
    roundedClass.value,
    textClass.value,
    paddingClass.value,
    inputStateClasses.value,
    hasFloatingLabel.value && labelPaddingClass.value,
  ])

  const labelClasses = computed(() => [
    'pointer-events-none absolute transform duration-150',
    hasStartCombo.value ? 'left-[72px]' : hasStartContent.value ? 'left-10' : 'left-4',
    isLabelActive.value
      ? 'top-1 text-14 font-bold text-gray-900'
      : 'top-1/2 -translate-y-1/2 text-18 font-regular text-gray-900',
  ])

  // นับตำแหน่งเนื้อหาจริงในช่วง [start, end)
  const countContent = (isContent: boolean[], start: number, end: number): number => {
    let count = 0
    for (let i = start; i < end; i++) {
      if (isContent[i]) count++
    }
    return count
  }

  // diff ตำแหน่ง cursor เทียบ raw value ใหม่กับ displayValue เดิม หาว่าช่วงไหนถูกแทรก/ลบ แล้วปรับเฉพาะช่วงนั้นใน maskRawContent — ห้ามใช้ extractMaskContent กับชิ้นส่วน displayValue เดิมตรงๆ เพราะแยกตัวคั่นที่ match pattern ของ token เอง (เช่น '0' ใน "0##-###-####") ไม่ได้
  const onMaskInput = (input: HTMLInputElement, event: Event): void => {
    const oldDisplay = displayValue.value
    const oldIsContent = maskDisplayIsContent.value
    const newRaw = input.value
    const cursorEnd = input.selectionEnd ?? newRaw.length
    const lengthDiff = newRaw.length - oldDisplay.length
    const inputType = event instanceof InputEvent ? event.inputType : undefined

    const prevContent = maskRawContent.value
    let newContent = prevContent
    let targetContentIndex: number

    if (lengthDiff > 0) {
      // แทรกตัวอักษรใหม่ — ดึงเฉพาะช่วงที่แทรกจริงมาต่อเป็นเนื้อหา ไม่แตะเนื้อหาก่อน/หลังช่วงนี้
      const insertStart = cursorEnd - lengthDiff
      const insertedContent = extractMaskContent(newRaw.slice(insertStart, cursorEnd))
      const contentBeforeInsertPoint = countContent(oldIsContent, 0, insertStart)
      newContent =
        newContent.slice(0, contentBeforeInsertPoint) +
        insertedContent +
        newContent.slice(contentBeforeInsertPoint)
      targetContentIndex = contentBeforeInsertPoint + insertedContent.length
    } else if (lengthDiff < 0) {
      // ลบตัวอักษร — หาว่าช่วงที่หายไปมีเนื้อหากี่ตัว
      const deletedCount = -lengthDiff
      const deletedContentCount = countContent(oldIsContent, cursorEnd, cursorEnd + deletedCount)
      const contentBeforeDeletePoint = countContent(oldIsContent, 0, cursorEnd)

      if (deletedContentCount > 0) {
        newContent =
          newContent.slice(0, contentBeforeDeletePoint) +
          newContent.slice(contentBeforeDeletePoint + deletedContentCount)
        targetContentIndex = contentBeforeDeletePoint
      } else if (inputType === 'deleteContentForward') {
        // ลบตัวคั่นล้วนๆ (เช่น Delete ทับ '-') ต้องลบเนื้อหาตัวถัดไปด้วย ไม่งั้นตัวคั่นจะถูกสร้างกลับมาทันที
        newContent =
          newContent.slice(0, contentBeforeDeletePoint) +
          newContent.slice(contentBeforeDeletePoint + 1)
        targetContentIndex = contentBeforeDeletePoint
      } else {
        // backspace เคสเดียวกัน — ลบเนื้อหาตัวก่อนหน้าแทน
        const removeAt = Math.max(0, contentBeforeDeletePoint - 1)
        newContent = newContent.slice(0, removeAt) + newContent.slice(contentBeforeDeletePoint)
        targetContentIndex = removeAt
      }
    } else {
      // ความยาวเท่าเดิม (เช่น select ทับด้วยความยาวเท่ากัน) หายากพอที่จะ fallback parse ใหม่ทั้ง string
      newContent = extractMaskContent(newRaw)
      targetContentIndex = extractMaskContent(newRaw.slice(0, cursorEnd)).length
    }

    const { content, masked, display, displayIsContent } = formatMaskValue(newContent)

    hasError.value = false
    errorMessage.value = ''
    emit('error', { hasError: false, message: '' })

    maskRawContent.value = content
    displayValue.value = display
    maskDisplayIsContent.value = displayIsContent
    isInternalMaskUpdate = true
    model.value = props.unmaskedValue ? content : masked

    if (input.value !== display) {
      input.value = display

      let newCursorPos = display.length
      let contentCharsSeen = 0
      for (let i = 0; i < display.length; i++) {
        if (contentCharsSeen === targetContentIndex) {
          newCursorPos = i
          break
        }
        if (displayIsContent[i]) contentCharsSeen++
      }

      // ข้าม cursor ผ่านตัวคั่นที่เพิ่งแทรกเข้ามาเอง เพราะพิมพ์ต่อก็ต้องไปที่เนื้อหาถัดไปอยู่ดี
      while (newCursorPos < display.length && !displayIsContent[newCursorPos]) {
        newCursorPos++
      }

      if (document.activeElement === input) {
        input.setSelectionRange(newCursorPos, newCursorPos)
      }
    }
  }

  const onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement

    if (hasMask.value) {
      onMaskInput(input, event)
      return
    }

    let value = input.value

    const cursorPos = input.selectionStart || 0

    const isContentChar = (char: string, index: number, originalString: string): boolean => {
      if (props.type === 'currency') return char !== ','
      if (props.type === 'tel') return /\d/.test(char)
      if (props.type === 'number') {
        if (/\d/.test(char)) return true
        if (char === '.' && originalString.indexOf('.') === index) return true
        if (char === '-' && index === 0) return true
        return false
      }
      return true
    }

    let contentCharsBeforeCursor = 0
    for (let i = 0; i < cursorPos; i++) {
      if (isContentChar(value[i], i, value)) contentCharsBeforeCursor++
    }

    if (props.type === 'number' || props.type === 'currency' || props.type === 'tel') {
      let filteredValue = ''
      let hasDecimal = false

      if (props.type !== 'tel' && value.charAt(0) === '-') {
        filteredValue = '-'
        value = value.substring(1)
      }

      if (props.type === 'currency') {
        value = value.replace(/,/g, '')
      }

      for (let i = 0; i < value.length; i++) {
        const char = value.charAt(i)
        if (/\d/.test(char)) {
          filteredValue += char
        } else if (props.type !== 'tel' && char === '.' && !hasDecimal) {
          filteredValue += char
          hasDecimal = true
        }
      }

      if (props.type === 'currency') {
        const [rawIntegerPart, decimalPart = ''] = filteredValue.split('.')
        let integerPart = rawIntegerPart

        if (integerPart) {
          let negative = ''
          if (integerPart.startsWith('-')) {
            negative = '-'
            integerPart = integerPart.substring(1)
          }
          integerPart = negative + integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }

        filteredValue = hasDecimal ? `${integerPart}.${decimalPart}` : integerPart
      }

      if (filteredValue !== input.value) {
        input.value = filteredValue
      }
    }

    const formattedValue = props.formatFunc(input.value)
    hasError.value = false
    errorMessage.value = ''
    emit('error', { hasError: false, message: '' })

    displayValue.value = formattedValue

    if (props.type === 'currency') {
      const cleanValue = formattedValue.replace(/,/g, '')
      const numValue = parseFloat(cleanValue)
      model.value = isNaN(numValue) ? 0 : numValue
    } else {
      model.value = formattedValue
    }

    if (input.value !== formattedValue) {
      input.value = formattedValue

      let newCursorPos = 0
      let contentCharsSeen = 0
      for (let i = 0; i < formattedValue.length; i++) {
        if (contentCharsSeen === contentCharsBeforeCursor) {
          newCursorPos = i
          break
        }
        if (isContentChar(formattedValue[i], i, formattedValue)) contentCharsSeen++
        newCursorPos = i + 1
      }

      if (document.activeElement === input) {
        input.setSelectionRange(newCursorPos, newCursorPos)
      }
    }
  }

  const onAnimationStart = (event: AnimationEvent): void => {
    if (event.animationName === 'onAutoFillStart') {
      isAutofilled.value = true
      onInput({ target: event.target } as unknown as Event)
    } else if (event.animationName === 'onAutoFillCancel') {
      isAutofilled.value = false
    }
  }

  const clearValue = (): void => {
    displayValue.value = ''
    maskRawContent.value = ''
    maskDisplayIsContent.value = []
    model.value = props.type === 'currency' ? 0 : ''
    hasError.value = false
    errorMessage.value = ''
    emit('error', { hasError: false, message: '' })
    inputRef.value?.focus()
  }

  const onKeypress = (event: KeyboardEvent): void => {
    if (props.type !== 'number' && props.type !== 'tel') return

    const input = event.target as HTMLInputElement
    const key = event.key

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
      ].includes(key)
    ) {
      return
    }

    if (/^\d$/.test(key)) return

    if (props.type === 'number') {
      if (key === '.' && !input.value.includes('.')) return
      if (key === '-' && input.selectionStart === 0 && !input.value.includes('-')) return
    }

    event.preventDefault()
  }

  const validate = (event?: FocusEvent): void => {
    hasError.value = false
    errorMessage.value = ''

    // fillMask ทำให้ displayValue มีอักขระ fill เต็มตั้งแต่ยังไม่พิมพ์อะไร เช็คความว่างจาก maskRawContent แทน
    if (hasMask.value ? !maskRawContent.value : !displayValue.value) {
      isFocused.value = false
    }

    let valueToValidate = (hasMask.value ? maskRawContent.value : displayValue.value) || ''

    if (
      !hasMask.value &&
      (props.type === 'number' || props.type === 'currency' || props.type === 'tel')
    ) {
      if (props.type === 'currency') {
        valueToValidate = valueToValidate.replace(/,/g, '')
      }

      if (props.type === 'tel') {
        valueToValidate = valueToValidate.replace(/\D/g, '')
      }

      const isEmpty = !valueToValidate || valueToValidate.trim() === '' || valueToValidate === '.'

      if (!isEmpty && props.type !== 'tel') {
        const numValue = parseFloat(valueToValidate)
        valueToValidate = String(numValue)

        if (props.type === 'currency') {
          const formattedValue = numValue.toFixed(2)
          const [rawIntPart, decPart] = formattedValue.split('.')
          const negative = numValue < 0 ? '-' : ''
          const intPart = rawIntPart.replace(/^-/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

          displayValue.value = `${negative}${intPart}.${decPart}`
          model.value = numValue
        }
      }
    }

    for (const rule of props.rules) {
      if (!rule.validator(valueToValidate)) {
        hasError.value = true
        errorMessage.value = rule.message
        emit('error', { hasError: true, message: errorMessage.value })
        if (event) emit('blur', event)
        return
      }
    }

    if (props.required && (!valueToValidate || valueToValidate.trim().length === 0)) {
      hasError.value = true
      const fieldName = props.label
      errorMessage.value = fieldName ? `กรุณากรอก${fieldName}` : 'กรุณากรอกข้อมูล'
      emit('error', { hasError: true, message: errorMessage.value })
      if (event) emit('blur', event)
      return
    }

    emit('error', { hasError: hasError.value, message: errorMessage.value })
    if (event) emit('blur', event)
  }

  defineExpose({
    hasError,
    errorMessage,
    validate,
  })

  watchEffect(() => {
    if (model.value === undefined) return

    if (hasMask.value) {
      // onMaskInput เซ็ต model.value เอง ทำให้ watch นี้ถูกเรียกซ้ำทุกครั้งที่พิมพ์ — ข้ามรอบนั้นด้วย isInternalMaskUpdate
      if (isInternalMaskUpdate) {
        isInternalMaskUpdate = false
        return
      }

      // เนื้อหาจากภายนอกอาจเป็น raw content หรือ string ที่ใส่ mask มาแล้วก็ได้ — ยกเว้น mask ที่ตัวคั่นตรงกับ pattern ของ token เอง ซึ่งยอมรับเป็นข้อจำกัด
      const { content, display, displayIsContent } = formatMaskValue(
        extractMaskContent(String(model.value))
      )
      maskRawContent.value = content
      displayValue.value = display
      maskDisplayIsContent.value = displayIsContent
      return
    }

    displayValue.value = String(model.value)
  })

  watch(
    () => props.rules,
    () => validate()
  )
</script>

<style scoped lang="scss">
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .text-field-control::placeholder {
    color: var(--color-gray-500);
  }

  .text-field-control::-webkit-scrollbar {
    width: 6px;
  }

  .text-field-control::-webkit-scrollbar-track {
    background: transparent;
  }

  .text-field-control::-webkit-scrollbar-thumb {
    background: var(--color-gray-300);
    border-radius: 3px;
  }

  .text-field-control::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-400);
  }

  // ไอคอนชุดนี้วาดด้วย stroke ทั้งหมด (fill: none) จึงปรับแค่ stroke พอ
  .text-field-icon-error :deep(svg *) {
    stroke: var(--color-error-1);
  }

  // ผูกกับ CSS variable แทน Tailwind class เพื่อให้ inline style (--tf-border-color/--tf-focus-color) override ตอน hover/focus ได้ — ไม่กระทบ error/disabled เพราะใช้ class คนละชุด
  .text-field-custom-border {
    border-color: var(--tf-border-color, var(--color-gray-300));
  }

  .text-field-custom-border:hover {
    border-color: var(--tf-border-color, var(--color-gray-400));
  }

  .text-field-custom-border:focus {
    border-color: var(--tf-focus-color, var(--tf-border-color, var(--color-main-1)));
  }
</style>

<!-- ไม่ scoped โดยตั้งใจ: Vue เติม hash ต่อชื่อ @keyframes ในบล็อก scoped ทำให้ event.animationName ที่เช็คใน onAnimationStart ไม่ตรงกับที่ตั้งไว้ -->
<style lang="scss">
  @keyframes onAutoFillStart {
    from {
    }
    to {
    }
  }

  @keyframes onAutoFillCancel {
    from {
    }
    to {
    }
  }

  .text-field-control:-webkit-autofill {
    animation-name: onAutoFillStart;
  }

  .text-field-control:not(:-webkit-autofill) {
    animation-name: onAutoFillCancel;
  }

  .text-field-control:-webkit-autofill,
  .text-field-control:-webkit-autofill:hover,
  .text-field-control:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--color-gray-900);
    -webkit-box-shadow: 0 0 0 1000px color-mix(in srgb, var(--color-main-4) 12%, white) inset;
    box-shadow: 0 0 0 1000px color-mix(in srgb, var(--color-main-4) 12%, white) inset;
    caret-color: var(--color-gray-900);
    transition:
      background-color 9999s ease-in-out 0s,
      color 9999s ease-in-out 0s;
  }
</style>
