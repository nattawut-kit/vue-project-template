<template>
  <div class="w-full">
    <div
      v-if="title"
      class="mb-1.5 font-bold text-gray-900"
      :class="titleTextClass"
    >
      <span>{{ title }}</span>
      <span
        v-if="required"
        class="ml-1 text-error-1"
        :class="titleRequiredClass"
        >*</span
      >
    </div>

    <div class="relative w-full">
      <input
        v-if="!isTextarea"
        :type="type === 'number' || type === 'currency' ? 'text' : type"
        :inputmode="
          type === 'number' || type === 'currency' ? 'decimal' : type === 'tel' ? 'tel' : undefined
        "
        :value="displayValue"
        :maxlength="maxLength"
        :placeholder="label && !isFocused && !displayValue ? '' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="text-field-control box-border w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border outline-none transition-colors duration-150"
        :class="[
          sizeConfig.height,
          sizeConfig.padding,
          sizeConfig.text,
          inputStateClasses,
          {
            'pr-10': hasEndIcon,
            'pl-10': hasStartIcon,
            [sizeConfig.labelPadding]: label,
          },
        ]"
        v-bind="$attrs"
        @input="onInput"
        @keypress="onKeypress"
        @focus="isFocused = true"
        @blur="validate"
      />

      <textarea
        v-else
        :value="displayValue"
        :maxlength="maxLength"
        :placeholder="label && !isFocused && !displayValue ? '' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        class="text-field-control box-border w-full min-w-[20%] max-w-full min-h-12.5 rounded-lg border py-3 outline-none transition-colors duration-150"
        :class="[
          sizeConfig.padding,
          sizeConfig.text,
          inputStateClasses,
          textareaHeightClass,
          textareaResizeClass,
          {
            'pr-10': hasEndIcon,
            'pl-10': hasStartIcon,
            'min-h-20': !rows,
            [sizeConfig.labelPadding]: label,
          },
        ]"
        v-bind="$attrs"
        @input="onInput"
        @focus="isFocused = true"
        @blur="validate"
      ></textarea>

      <label
        v-if="label"
        class="pointer-events-none absolute left-4 transform duration-150"
        :class="
          isFocused || displayValue
            ? 'top-1 text-14 font-bold text-gray-900'
            : isTextarea
              ? 'top-4 text-18 font-regular text-gray-900'
              : 'top-1/2 -translate-y-1/2 text-18 font-regular text-gray-900'
        "
      >
        <span>{{ label }}</span>
        <span
          v-if="required && !title"
          class="ml-0.5 text-error-1"
          :class="isFocused || displayValue ? 'text-16' : 'text-20'"
          >*</span
        >
      </label>

      <div
        v-if="hasEndIcon && !isTextarea"
        class="absolute inset-y-0 right-0 flex items-center pr-3.25"
      >
        <slot
          v-if="!hasError || !slots['end-icon-error']"
          name="end-icon"
        ></slot>
        <slot
          v-else
          name="end-icon-error"
        ></slot>
      </div>

      <div
        v-if="hasStartIcon && !isTextarea"
        class="absolute inset-y-0 left-0 flex items-center pl-4"
      >
        <slot
          v-if="!hasError || !slots['start-icon-error']"
          name="start-icon"
        ></slot>
        <slot
          v-else
          name="start-icon-error"
        ></slot>
      </div>
    </div>

    <div
      v-if="hasError && errorMessage"
      class="mt-1 font-regular text-error-1 duration-150 animate-[slideIn_0.15s_ease-out_forwards]"
      :class="errorTextClass"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="helperText"
      class="mt-1 text-12 font-regular text-gray-500 duration-150 animate-[fadeIn_0.1s_ease-out_forwards]"
    >
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  type TextFieldType = 'text' | 'email' | 'number' | 'tel' | 'password' | 'currency' | 'textarea'
  type TextFieldResizable = boolean | 'vertical' | 'horizontal' | 'both'

  interface Props {
    label?: string
    // ข้อความหัวข้อแบบนิ่ง แสดงเหนือกล่อง input — ใช้แทน label ตอนไม่ต้องการ label ลอยด้านใน
    title?: string
    placeholder?: string
    helperText?: string
    type?: TextFieldType
    rules?: IValidationRule[]
    maxLength?: number
    formatFunc?: (value: string) => string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    rows?: number
    autoResize?: boolean
    resizable?: TextFieldResizable
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    title: '',
    placeholder: '',
    helperText: '',
    type: 'text',
    rules: () => [],
    maxLength: undefined,
    formatFunc: (value: string) => value,
    disabled: false,
    readonly: false,
    required: false,
    rows: undefined,
    autoResize: false,
    resizable: false,
  })

  const emit = defineEmits<{
    error: [error: { hasError: boolean; message: string }]
    blur: [event: FocusEvent]
  }>()

  const isTextarea = computed(() => props.type === 'textarea')

  const model = defineModel<string | number>({ required: true })

  const displayValue = ref('')
  const isFocused = ref(false)

  watchEffect(() => {
    if (model.value !== undefined) {
      displayValue.value = String(model.value)
    }
  })

  const slots = useSlots()
  const hasEndIcon = !!slots['end-icon'] || !!slots['end-icon-error']
  const hasStartIcon = !!slots['start-icon'] || !!slots['start-icon-error']

  const hasError = ref(false)
  const errorMessage = ref('')

  const sizeConfigBase = { height: 'h-12', padding: 'pl-[15px] pr-4' }

  // มี placeholder = ช่องแสดงผลเดี่ยว ใช้ตัวอักษรใหญ่ 20px, ไม่มี placeholder (เช่น label ลอย) = ตาม default เดิมของ mk-one ที่ 14px
  const hasPlaceholder = computed(() => !!props.placeholder)
  const textClass = computed(() => (hasPlaceholder.value ? 'text-20' : 'text-17'))
  const errorTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-16'))
  const titleTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-14'))
  const titleRequiredClass = computed(() => (hasPlaceholder.value ? 'text-16' : 'text-14'))
  const labelPaddingClass = computed(() =>
    props.readonly || props.disabled || props.type !== 'textarea' ? 'pt-3' : 'pt-5'
  )

  const sizeConfig = computed(() => ({
    ...sizeConfigBase,
    text: textClass.value,
    labelPadding: labelPaddingClass.value,
  }))

  const textareaHeightClass = computed(() => {
    if (isTextarea.value && props.autoResize) return 'overflow-hidden'
    return 'overflow-auto'
  })

  const textareaResizeClass = computed(() => {
    if (!isTextarea.value) return ''
    if (props.resizable === true || props.resizable === 'both') return 'resize'
    if (props.resizable === 'vertical') return 'resize-y'
    if (props.resizable === 'horizontal') return 'resize-x'
    return 'resize-none'
  })

  const inputStateClasses = computed(() => {
    if (props.disabled) {
      return ['border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed']
    }

    if (hasError.value) {
      return [
        'border-error-1',
        'bg-error-2',
        'text-error-1',
        'focus:border-error-1',
        'focus:ring-2',
        'focus:ring-error-1/20',
        'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)]',
      ]
    }

    return [
      'border-gray-300',
      'bg-white',
      'text-gray-900',
      'hover:border-gray-400',
      'focus:border-main-1',
      // 'focus:ring-2',
      // 'focus:ring-main-1/20',
    ]
  })

  const onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement
    let value = input.value

    if (isTextarea.value && props.autoResize) {
      input.style.height = 'auto'
      input.style.height = `${input.scrollHeight}px`
    }

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

    if (
      !isTextarea.value &&
      (props.type === 'number' || props.type === 'currency' || props.type === 'tel')
    ) {
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

  const onKeypress = (event: KeyboardEvent): void => {
    if (isTextarea.value || (props.type !== 'number' && props.type !== 'tel')) return

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

    if (
      !isTextarea.value &&
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
      const fieldName = props.label || props.title
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
</style>
