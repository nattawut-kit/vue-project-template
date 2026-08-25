<template>
  <div class="w-full">
    <!-- default (floatLabel=false) = label อยู่นิ่งด้านบนเสมอ (แบบ QInput's stack-label ของ Quasar) เพราะใช้บ่อยกว่า floating — ยังต้องขึ้นแม้ label ว่าง (เช่น field ไม่มี label แต่ต้องเรียงตรงกับ field อื่นที่มี label ในกลุ่มเดียวกัน) จึงกันความสูงไว้ด้วย min-h-[1em] — field ที่ตั้งใจไม่มี concept label เลย (ไม่อยากได้บล็อกนี้) ให้ส่ง float-label แม้จะไม่ได้ใส่ label ก็ตาม -->
    <div
      v-if="!floatLabel"
      class="mb-1.5 min-h-[1.5em] font-bold text-gray-900"
      :class="stackLabelTextClass"
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
        class="absolute inset-y-0 right-0 flex items-center pr-4"
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
        v-if="hasStartIcon"
        class="absolute inset-y-0 left-0 flex items-center pl-4"
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
  const hasStartIcon = !!slots['start-icon'] || !!slots['start-icon-error']
  // end-icon slot ที่ผู้ใช้กำหนดเองมีสิทธิ์เหนือกว่า ปุ่ม clear จะไม่ถูกเพิ่มถ้าช่องนี้มี end-icon slot อยู่แล้ว
  const showClearButton = computed(
    () =>
      props.clearable &&
      !hasEndIconSlot &&
      !props.disabled &&
      !props.readonly &&
      !!displayValue.value
  )
  const hasEndIcon = computed(() => hasEndIconSlot || showClearButton.value)

  const hasError = ref(false)
  const errorMessage = ref('')

  const DEFAULT_STATE_CLASSES = [
    'border-gray-300',
    'bg-white',
    'text-gray-900',
    'hover:border-gray-400',
    'focus:border-main-1',
  ]

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

  const isLabelActive = computed(
    () => isFocused.value || !!displayValue.value || isAutofilled.value
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
  const paddingClass = computed(() => [
    hasStartIcon ? (hasFloatingLabel.value ? 'pl-[39px]' : 'pl-[42px]') : 'pl-[15px]',
    hasEndIcon.value ? 'pr-10' : 'pr-4',
  ])

  const inputStateClasses = computed(() => {
    if (props.disabled) return DISABLED_STATE_CLASSES
    if (hasError.value) return ERROR_STATE_CLASSES
    return DEFAULT_STATE_CLASSES
  })

  const inputClasses = computed(() => [
    'text-field-control box-border h-12 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border outline-none transition-colors duration-150',
    textClass.value,
    paddingClass.value,
    inputStateClasses.value,
    hasFloatingLabel.value && labelPaddingClass.value,
  ])

  const labelClasses = computed(() => [
    'pointer-events-none absolute transform duration-150',
    hasStartIcon ? 'left-10' : 'left-4',
    isLabelActive.value
      ? 'top-1 text-14 font-bold text-gray-900'
      : 'top-1/2 -translate-y-1/2 text-18 font-regular text-gray-900',
  ])

  const onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement
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

    if (!displayValue.value) {
      isFocused.value = false
    }

    let valueToValidate = displayValue.value || ''

    if (props.type === 'number' || props.type === 'currency' || props.type === 'tel') {
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
    if (model.value !== undefined) {
      displayValue.value = String(model.value)
    }
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
