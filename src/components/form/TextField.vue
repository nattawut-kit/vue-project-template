<template>
  <div class="w-full">
    <!-- default (floatLabel=false) = label อยู่นิ่งด้านบนเสมอ (แบบ QInput's stack-label ของ Quasar) เพราะใช้บ่อยกว่า floating — ยังต้องขึ้นแม้ label ว่าง (เช่น field ไม่มี label แต่ต้องเรียงตรงกับ field อื่นที่มี label ในกลุ่มเดียวกัน) จึงกันความสูงไว้ด้วย min-h-[1em] — field ที่ตั้งใจไม่มี concept label เลย (ไม่อยากได้บล็อกนี้) ให้ส่ง float-label แม้จะไม่ได้ใส่ label ก็ตาม -->
    <div
      v-if="!floatLabel"
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
  // นอกจาก preset แล้วใส่ CSS value ดิบๆ เองได้เลย (เช่น '12px', '0.5rem') — ไม่ตรง preset ไหนเลยจะไปใช้ inline style border-radius ให้แทนที่จะเป็น Tailwind class
  type RoundedValue = RoundedPreset | string
  interface RoundedCorners {
    tl?: RoundedValue
    tr?: RoundedValue
    br?: RoundedValue
    bl?: RoundedValue
  }

  interface TextFieldCustomStyle {
    // ความมนของขอบ — ไม่ใส่ = rounded-lg เดิม (เท่ากันทุกมุม) ใส่เป็น object { tl, tr, br, bl } ได้ถ้าอยากคุมทีละมุม — มุมที่ไม่ได้ระบุใน object จะเป็น 'none' (ไม่มน) ไม่ได้ fallback ไปที่ 'lg'
    rounded?: RoundedValue | RoundedCorners
    // สีพื้นหลัง ใส่ CSS color ใดๆ ก็ได้ (hex/rgb/ชื่อสี) — ไม่ใช่ Tailwind token เพราะเป็นค่าที่กำหนดตอน runtime ไม่ใช่ตอน build จึงให้ Tailwind gen class ล่วงหน้าไม่ได้ ต้องใส่ผ่าน inline style แทน
    bgColor?: string
    // สีตัวอักษร label (ทั้งแบบ stack และแบบ float) — เครื่องหมาย * ของ required ยังคงเป็น error-1 เสมอ ไม่ถูกสีนี้ทับ เพราะกำหนดสีของตัวเองแยกไว้แล้ว
    labelColor?: string
    // สีตัวอักษรที่พิมพ์ใน input
    textColor?: string
    // สีกรอบตอนปกติ/hover — ไม่ใส่ = gray-300/gray-400 เดิม
    borderColor?: string
    // สีกรอบตอน focus — ไม่ใส่ = ใช้ borderColor (ถ้ามี) ต่อ ไม่งั้นใช้ main-1 เดิม
    focusColor?: string
  }

  interface Props {
    label?: string
    // กลับ default จาก QInput's stack-label ของ Quasar เพราะ label นิ่งด้านบนใช้บ่อยกว่า: false (default) = label อยู่นิ่งด้านบนเสมอ (ไม่ลอย), true = label ลอย (ซ้อนเป็น placeholder ตอนว่าง ลอยขึ้นตอน focus/มีค่า)
    floatLabel?: boolean
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
    // ข้อความคงที่แสดงชิดขอบซ้าย/ขวาของกล่อง input เช่น '$' หรือ 'บาท' (เหมือน prefix/suffix ของ QInput ของ Quasar) — start-icon/end-icon slot มีสิทธิ์เหนือกว่าถ้าใส่มาด้วยกัน
    prefix?: string
    suffix?: string
    // รูปแบบ mask แบบ QInput ของ Quasar: '#' ตัวเลข, 'S' ตัวอักษร, 'N' ตัวอักษร+ตัวเลข, 'A'/'a' ตัวอักษรบังคับพิมพ์ใหญ่/เล็ก, 'X'/'x' ตัวอักษร+ตัวเลขบังคับพิมพ์ใหญ่/เล็ก ตัวอื่นถือเป็นตัวคั่นคงที่ (ใส่ '\' นำหน้าถ้าต้องการใช้ตัวอักษร token พวกนี้เป็นตัวคั่นจริงๆ) — เมื่อใส่ mask จะข้ามการกรองตัวอักษรตาม type (number/currency/tel) ไปใช้กติกาของ mask แทนทั้งหมด
    mask?: string
    // เติมตำแหน่งของ mask ที่ยังไม่ถึงด้วยอักขระ fill (default '_') ให้เห็นรูปแบบเต็มตั้งแต่ยังไม่พิมพ์ — ใส่เป็น string เพื่อกำหนดอักขระ fill เอง
    fillMask?: boolean | string
    // เติม fillMask จากขวาไปซ้ายแทน เหมาะกับ mask ตัวเลขที่พิมพ์ไล่จากหลักท้ายๆ (เช่นช่องจำนวนเงิน) ใช้คู่กับ fillMask
    reverseFillMask?: boolean
    // true = ค่าใน v-model เป็นตัวอักษรเนื้อหาล้วนๆ ไม่มีตัวคั่นของ mask, false (default) = ค่าใน v-model เป็น string ที่ใส่ mask แล้ว
    unmaskedValue?: boolean
    // ปรับหน้าตาแบบ custom ผ่าน object เดียว แทนการเพิ่ม props แยกทีละสี/ทีละแบบ — ไม่มีผลตอน disabled/error เพื่อให้ยังคง signal สถานะเหล่านั้นชัดเจนเสมอ
    customStyle?: TextFieldCustomStyle
    // true = พื้นหลังโปร่งใส (เท่ากับตั้ง customStyle.bgColor เป็น transparent ให้ ถ้าไม่ได้ระบุ bgColor เองไว้ก่อน) — แยกเป็น prop ตรงๆ เพราะเป็น variant ที่ใช้บ่อย ไม่ต้องเข้าไปใน object
    outlined?: boolean
    // true = ไม่มีกรอบและไม่มีพื้นหลังเลยทุก state มีสิทธิ์เหนือกว่า customStyle.borderColor/focusColor/bgColor — แยกเป็น prop ตรงๆ เหมือน outlined
    borderless?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    floatLabel: false,
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
  // เบราว์เซอร์ autofill เซ็ตค่า input โดยตรงโดยไม่ยิง 'input' event เสมอไป ทำให้ displayValue ไม่อัปเดตและ label ไม่ลอยขึ้น — ตรวจจับผ่าน CSS animation trick แทน (ดู :-webkit-autofill ด้านล่าง)
  const isAutofilled = ref(false)

  const slots = useSlots()
  const hasEndIconSlot = !!slots['end-icon'] || !!slots['end-icon-error']
  const hasStartIconSlot = !!slots['start-icon'] || !!slots['start-icon-error']

  const hasMask = computed(() => !!props.mask)

  interface MaskToken {
    char: string
    isToken: boolean
  }

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

  // แปลง mask string เป็น token ทีละตัว — '\' นำหน้าตัวอักษร token ทำให้กลายเป็นตัวคั่นธรรมดา (เผื่อ mask ต้องมีตัวอักษร #/S/N/A/a/X/x เป็นตัวคั่นจริงๆ)
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

  const maskTokens = computed(() => (hasMask.value ? parseMask(props.mask) : []))
  const maskTokenCount = computed(() => maskTokens.value.filter(token => token.isToken).length)
  const fillMaskChar = computed(() =>
    typeof props.fillMask === 'string' && props.fillMask ? props.fillMask[0] : '_'
  )

  // ดึงเฉพาะตัวอักษรเนื้อหาจาก string ใดๆ โดยเทียบกับชนิด token ที่ mask นี้ใช้จริง — ไม่สนตำแหน่งเดิม เพราะตัวคั่นที่กำหนดใน mask (เช่น '-', '/', ' ') ไม่มีทาง match pattern ของ token พวกนี้อยู่แล้ว จึงกรองตัวคั่นทิ้งได้โดยไม่ต้องรู้ตำแหน่ง
  const extractMaskContent = (value: string): string => {
    const usedTokenChars = [
      ...new Set(maskTokens.value.filter(token => token.isToken).map(token => token.char)),
    ]
    if (usedTokenChars.length === 0) return ''
    return [...value]
      .filter(char => usedTokenChars.some(tokenChar => MASK_TOKEN_PATTERNS[tokenChar].test(char)))
      .join('')
  }

  // ประกอบตัวอักษรเนื้อหาเข้ากับ mask ทีละตำแหน่ง แทรกตัวคั่นทันทีที่ถึงตำแหน่งนั้น (ไม่รอพิมพ์ครบกลุ่มก่อน) แล้วหยุดทันทีที่เจอ token ที่ยังไม่มีตัวอักษรเติม — คืน isContent (ยาวเท่า text) กำกับมาด้วยว่าตำแหน่งไหนเป็นเนื้อหาจริง ไม่ใช่ตัวคั่น เพราะถ้า mask มีตัวคั่นที่ match pattern ของ token เอง (เช่น '0' ใน mask="0##-###-####") จะแยกไม่ออกจากตัวอักษรผลลัพธ์เฉยๆ ว่าตัวไหนเป็นตัวคั่น ตัวไหนเป็นเนื้อหาจริง
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

  // เติมตำแหน่ง token/ตัวคั่นที่ยังไม่ถึงด้วย fillChar/ตัวคั่นจริง — compact เรียงตรงกับ tokens ทีละตัวเสมออยู่แล้ว จึงเทียบตำแหน่งตรงๆ ได้เลยโดยไม่ต้อง parse ซ้ำ อักขระ fill ไม่ถือเป็นเนื้อหา
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

  // reverseFillMask กลับด้าน mask กับเนื้อหา (พร้อม isContent) ก่อนประกอบ (เท่ากับเติมจากท้าย mask เข้ามา) แล้วกลับผลลัพธ์คืนตอนจบ — ใช้ engine เดียวกับโหมดปกติได้โดยไม่ต้องเขียนซ้ำ
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
    // ดึง content กลับด้วยตำแหน่ง (maskedIsContent) ไม่ใช่ extractMaskContent(masked) เพราะ masked มีตัวคั่นปนอยู่ — ถ้า mask มีตัวคั่นที่ match pattern ของ token เอง extractMaskContent จะดูดตัวคั่นนั้นกลับมานับเป็นเนื้อหาซ้ำด้วย ส่วนดึงจาก masked (ไม่ใช่จาก rawContent ตรงๆ) เพราะผ่านการแปลงตัวพิมพ์ใหญ่/เล็กตาม token (A/a/X/x) มาแล้ว ต้องให้ค่าที่ unmaskedValue ส่งออกตรงกับสิ่งที่แสดงจริง
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

  // แหล่งความจริงของ "มีเนื้อหาจริงไหม" สำหรับ field ที่มี mask — ใช้แทน displayValue เพราะตอน fillMask ทำงาน displayValue จะเต็มไปด้วยอักขระ fill ตั้งแต่ยังไม่พิมพ์อะไรเลย
  const maskRawContent = ref('')
  // isContent ของ displayValue ปัจจุบัน (ยาวเท่ากัน) เก็บไว้ใช้ตอนแก้ไขครั้งถัดไป — ต้องอิงตำแหน่งนี้เวลานับว่า "ก่อน cursor มีเนื้อหากี่ตัว" ห้ามใช้ extractMaskContent กับ displayValue ตรงๆ เพราะแยกตัวคั่นที่ match pattern ของ token เอง (เช่น '0' ใน mask="0##-###-####") ออกจากเนื้อหาจริงไม่ได้
  const maskDisplayIsContent = ref<boolean[]>([])
  // onMaskInput เซ็ต model.value เอง (v-model สองทาง) ทำให้ watchEffect ด้านล่างที่ watch model.value ไว้สำหรับรับค่าจากภายนอกถูกเรียกซ้ำทุกครั้งที่พิมพ์ด้วย — ถ้าปล่อยให้ watchEffect ประมวลผลซ้ำ มันจะ extractMaskContent จาก masked string ทั้งก้อนใหม่ ซึ่งแยกตัวคั่นที่ match pattern ของ token เอง (เช่น '0') ออกจากเนื้อหาจริงไม่ได้ ทำให้ค่าที่ onMaskInput เพิ่งคำนวณถูกต้องถูกเขียนทับด้วยค่าผิดทุกครั้ง ต้องกันด้วย flag นี้ให้ watchEffect ข้ามรอบที่มาจาก onMaskInput เอง (ไม่ใช่ ref เพราะไม่ต้องการให้ trigger reactivity เพิ่ม)
  let isInternalMaskUpdate = false

  // end-icon slot ที่ผู้ใช้กำหนดเองมีสิทธิ์เหนือกว่า ปุ่ม clear จะไม่ถูกเพิ่มถ้าช่องนี้มี end-icon slot อยู่แล้ว
  const showClearButton = computed(
    () =>
      props.clearable &&
      !hasEndIconSlot &&
      !props.disabled &&
      !props.readonly &&
      (hasMask.value ? !!maskRawContent.value : !!displayValue.value)
  )
  const hasEndIcon = computed(() => hasEndIconSlot || showClearButton.value)
  // prefix/suffix แสดงคู่กับ icon slot ได้เลย (icon อยู่ริมขอบ ข้อความอยู่ถัดเข้ามาทางค่า input) — ปุ่ม clear ทับ suffix เสมอเพราะอยู่ตำแหน่งเดียวกัน
  const hasPrefix = computed(() => !!props.prefix)
  const hasSuffix = computed(() => !!props.suffix && !showClearButton.value)
  const hasStartContent = computed(() => hasStartIconSlot || hasPrefix.value)
  const hasEndContent = computed(() => hasEndIcon.value || hasSuffix.value)
  // icon + prefix/suffix พร้อมกันกินพื้นที่กว้างกว่า icon เดี่ยวๆ ต้องกัน padding เพิ่ม ไม่งั้นตัวอักษรที่พิมพ์ใน input จะไปทับกับ prefix/suffix
  const hasStartCombo = computed(() => hasStartIconSlot && hasPrefix.value)
  const hasEndCombo = computed(() => hasEndIconSlot && hasSuffix.value)

  const hasError = ref(false)
  const errorMessage = ref('')

  // border-color คุมผ่าน .text-field-custom-border (CSS variable, ดูด้านล่าง) แทนการ hardcode class ตรงๆ เพื่อให้ customStyle.borderColor/focusColor override ได้โดยไม่ชนกับ hover:/focus: variant ซึ่ง inline style ทำไม่ได้ (bg/text ยังใช้ class ปกติได้ เพราะ inline style ที่ผูกไว้ใน template ชนะ class เสมออยู่แล้วถ้ามีการ override)
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

  // ต้องเขียน class เต็มไว้ตรงๆ แบบนี้ (ห้าม template ต่อ string เช่น `rounded-tl-${size}`) เพราะ Tailwind หา class จาก source แบบ static scan ต่อ string runtime แล้ว generate ไม่ได้ — ค่าที่ไม่ตรง preset ไหนเลย (เช่น '12px') ไปใช้ inline style border-radius แทน (ดู roundedStyle)
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

  // ค่าที่ไม่ตรง preset ไหนเลย (เช่น '12px', '0.5rem') ใส่ผ่าน inline style ตรงนี้แทน — คู่กับ roundedClass ที่จะเว้น class ของมุมนั้นไว้เป็นค่าว่างให้ไม่ชนกัน
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

  // ไม่ปรับสี custom ตอน disabled/error เพื่อให้ signal สถานะทั้งสองยังชัดเจนเสมอ ไม่ว่าจะตั้ง customStyle/outlined/borderless อะไรไว้
  const canCustomizeColors = computed(() => !props.disabled && !hasError.value)
  const isBorderless = computed(() => canCustomizeColors.value && props.borderless)

  const effectiveBgColor = computed(() => {
    if (!canCustomizeColors.value) return undefined
    // borderless ไม่มี bg ขาวด้วยเช่นกัน (ไม่งั้นจะเหลือกล่องขาวลอยๆ ไม่มีกรอบ) — bgColor ที่ตั้งเองมาก่อนเสมอถ้าใส่ไว้
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

  // ป้องกัน Chrome ตีความ tel/email ที่วางอยู่ก่อนช่อง password ผิดเป็นช่อง username แล้วเสนอ autofill บัญชีที่บันทึกไว้
  const autocompleteAttr = computed(() => {
    if (props.type === 'email') return 'email'
    if (props.type === 'tel') return 'tel'
    if (props.type === 'password') return 'current-password'
    return undefined
  })

  // label ลอย (floatLabel) และมีข้อความจริง — ใช้คุมทั้ง input font size, padding, และการซ่อน placeholder
  const hasFloatingLabel = computed(() => props.floatLabel && !!props.label)

  // มี placeholder = ช่องแสดงผลเดี่ยว ใช้ตัวอักษรใหญ่ 20px, ไม่มี placeholder (เช่น label ลอย) = ตาม default เดิมของ mk-one ที่ 14px
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

  // ห้ามใช้ 'pl-[15px] pr-4' คู่กับ 'pl-10'/'pr-10' พร้อมกัน (ตอนมี icon) — utility ที่ padding เดียวกันชนกัน ผลลัพธ์ขึ้นกับลำดับใน generated CSS ไม่ใช่ลำดับ class ในเทมเพลต จึงต้องเลือกใช้อันเดียวต่อด้าน
  // ระยะ padding ตอนมี prefix/suffix เดี่ยวๆ ใช้ค่าเดียวกับ icon (คำนวณจากไอคอนขนาดคงที่) เหมาะกับข้อความสั้นๆ เช่น '$'/'บาท' — ถ้าข้อความยาวอาจล้นทับตัวอักษรใน input ได้ ส่วนตอนมี icon + prefix/suffix คู่กัน (กว้างกว่า icon เดี่ยว) ขยับ padding เผื่อเพิ่มอีกชั้น
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

  // นับจำนวนตำแหน่งที่เป็นเนื้อหาจริง (isContent[i]===true) ในช่วง [start, end) ของ isContent array
  const countContent = (isContent: boolean[], start: number, end: number): number => {
    let count = 0
    for (let i = start; i < end; i++) {
      if (isContent[i]) count++
    }
    return count
  }

  // เทียบ raw value ใหม่กับ displayValue เดิม (ก่อนแก้ไข) โดยอาศัยตำแหน่ง cursor หลังแก้ไขหาว่าช่วงไหนถูกแทรก/ลบไป แล้วปรับเฉพาะช่วงนั้นใน maskRawContent — ต้องใช้ maskDisplayIsContent (ตำแหน่งจริง) ในการนับ "ก่อนจุดนี้มีเนื้อหากี่ตัว" ทุกจุด ห้ามใช้ extractMaskContent กับชิ้นส่วนของ displayValue เดิมเด็ดขาด เพราะถ้า mask มีตัวคั่นที่ตรงกับ pattern ของ token ตัวเอง (เช่น mask="0##-###-####" ที่ '0' เป็นตัวคั่นแต่ pattern เดียวกับ '#') จะแยกตัวคั่นออกจากเนื้อหาจริงไม่ได้ ทำให้ตัวคั่นถูกดูดกลับมานับเป็นเนื้อหาซ้ำทุกครั้งที่พิมพ์
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
      // แทรกตัวอักษรใหม่ (พิมพ์/วาง) — ดึงเฉพาะช่วงที่ถูกแทรกจริงๆ (เป็นตัวอักษรดิบที่พิมพ์เข้ามาสดๆ ไม่ปนตัวคั่นเดิม) มาต่อเป็นเนื้อหา ไม่แตะเนื้อหาก่อน/หลังช่วงนี้เลย
      const insertStart = cursorEnd - lengthDiff
      const insertedContent = extractMaskContent(newRaw.slice(insertStart, cursorEnd))
      const contentBeforeInsertPoint = countContent(oldIsContent, 0, insertStart)
      newContent =
        newContent.slice(0, contentBeforeInsertPoint) +
        insertedContent +
        newContent.slice(contentBeforeInsertPoint)
      targetContentIndex = contentBeforeInsertPoint + insertedContent.length
    } else if (lengthDiff < 0) {
      // ลบตัวอักษร (backspace/delete/ตัดข้อความที่เลือกไว้) — หาว่าช่วงที่หายไปมีตัวอักษรเนื้อหากี่ตัว
      const deletedCount = -lengthDiff
      const deletedContentCount = countContent(oldIsContent, cursorEnd, cursorEnd + deletedCount)
      const contentBeforeDeletePoint = countContent(oldIsContent, 0, cursorEnd)

      if (deletedContentCount > 0) {
        newContent =
          newContent.slice(0, contentBeforeDeletePoint) +
          newContent.slice(contentBeforeDeletePoint + deletedContentCount)
        targetContentIndex = contentBeforeDeletePoint
      } else if (inputType === 'deleteContentForward') {
        // ช่วงที่ลบไปเป็นตัวคั่นล้วนๆ (เช่นกด Delete ทับ '-') แปลว่าจริงๆ ต้องการลบตัวอักษรเนื้อหาตัวถัดไปด้วย ไม่งั้นตัวคั่นจะถูกสร้างกลับมาแทนที่ทันทีจนดูเหมือนลบไม่ได้เลย
        newContent =
          newContent.slice(0, contentBeforeDeletePoint) +
          newContent.slice(contentBeforeDeletePoint + 1)
        targetContentIndex = contentBeforeDeletePoint
      } else {
        // เคสเดียวกันแต่เป็น backspace (หรือไม่รู้ inputType) — ลบตัวอักษรเนื้อหาตัวก่อนหน้าแทน
        const removeAt = Math.max(0, contentBeforeDeletePoint - 1)
        newContent = newContent.slice(0, removeAt) + newContent.slice(contentBeforeDeletePoint)
        targetContentIndex = removeAt
      }
    } else {
      // ความยาวเท่าเดิม (เช่น select ข้อความแล้วพิมพ์ทับด้วยความยาวเท่ากัน) — เคสหายากพอที่จะ fallback มา parse ใหม่ทั้ง string ได้ (ยอมรับความเสี่ยงเรื่องตัวคั่นก้ำกึ่งในเคสหายากนี้)
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

      // ถ้าตำแหน่งที่หาได้ดันไปตกอยู่หน้าตัวคั่นที่เพิ่งแทรกเข้ามาเอง (เช่นพิมพ์ครบกลุ่มแล้วมี '-' ต่อท้ายให้ทันที) ให้เลื่อน cursor ข้ามตัวคั่นนั้นไปเลย เพราะพิมพ์ต่อก็ต้องไปลงที่ตัวเนื้อหาถัดไปอยู่ดี ไม่มีประโยชน์ที่จะจอดหน้าตัวคั่น
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

    // fillMask ทำให้ displayValue เต็มไปด้วยอักขระ fill ตั้งแต่ยังไม่พิมพ์อะไรเลย จึงต้องเช็คความว่างจาก maskRawContent แทน
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
      // onMaskInput เซ็ต model.value เองเสมอ ทำให้ watchEffect นี้ถูกเรียกซ้ำทุกครั้งที่พิมพ์ — ต้องข้ามรอบที่มาจาก onMaskInput เอง (ตรวจจับผ่าน isInternalMaskUpdate) ไม่งั้นจะ extractMaskContent จากทั้ง masked string ซ้ำ ซึ่งแยกตัวคั่นที่ match pattern ของ token เอง (เช่น '0' ใน mask="0##-###-####") ออกจากเนื้อหาจริงไม่ได้ เขียนทับค่าที่ถูกต้องอยู่แล้วด้วยค่าผิด
      if (isInternalMaskUpdate) {
        isInternalMaskUpdate = false
        return
      }

      // extractMaskContent ดึงเนื้อหาล้วนได้ไม่ว่าค่าที่มาจากภายนอกจะเป็น raw content (unmaskedValue) หรือ string ที่ใส่ mask มาแล้วก็ตาม (ยกเว้น mask ที่ตัวคั่นตรงกับ pattern ของ token เอง ซึ่งเป็นข้อจำกัดที่ยอมรับได้สำหรับการเซ็ตค่าจากภายนอก ต่างจากตอนพิมพ์สดที่มีตำแหน่ง cursor ให้ diff ได้แม่นยำกว่า)
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

  // บังคับสีแดงให้ icon ใน slot end-icon-error/start-icon-error เอง ไม่ต้องพึ่ง caller ส่ง color มาเอง — ปรับแค่ stroke เพราะไอคอนชุดนี้ (eye, x-close, info-circle, ...) วาดด้วย stroke ทั้งหมด ส่วน fill เป็น none อยู่แล้วจึงไม่ต้องแตะ
  .text-field-icon-error :deep(svg *) {
    stroke: var(--color-error-1);
  }

  // border-color ของ state ปกติ ผูกกับ CSS variable แทน Tailwind class ตรงๆ เพื่อให้ customStyle.borderColor/focusColor ที่ผูกผ่าน inline style (--tf-border-color/--tf-focus-color) override ตอน hover/focus ได้ — inline style เข้าไปแทรก pseudo-class เองไม่ได้ ต้องผ่าน CSS variable แบบนี้ ไม่กระทบ error/disabled เพราะสอง state นั้นใช้ class คนละชุด (ERROR_STATE_CLASSES/DISABLED_STATE_CLASSES) ไม่มี .text-field-custom-border ปนอยู่
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

<!-- ไม่ scoped โดยตั้งใจ: Vue จะเติม hash ต่อท้ายชื่อ @keyframes ในบล็อก scoped ทำให้ event.animationName ที่เช็คใน onAnimationStart ไม่ตรงกับชื่อที่ตั้งไว้ -->
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
