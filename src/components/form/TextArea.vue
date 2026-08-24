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
      <textarea
        :value="displayValue"
        :maxlength="maxLength"
        :placeholder="label && !isLabelActive ? '' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :class="textareaClasses"
        v-bind="$attrs"
        @input="onInput"
        @focus="isFocused = true"
        @blur="validate"
      ></textarea>

      <label
        v-if="label"
        :class="labelClasses"
      >
        <span>{{ label }}</span>
        <span
          v-if="required && !title"
          class="ml-0.5 text-error-1"
          :class="isLabelActive ? 'text-16' : 'text-20'"
          >*</span
        >
      </label>

      <div
        v-if="hasEndIcon"
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
        v-if="hasStartIcon"
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
  type TextAreaResizable = boolean | 'vertical' | 'horizontal' | 'both'

  interface Props {
    label?: string
    // ข้อความหัวข้อแบบนิ่ง แสดงเหนือกล่อง textarea — ใช้แทน label ตอนไม่ต้องการ label ลอย
    title?: string
    placeholder?: string
    helperText?: string
    rules?: IValidationRule[]
    maxLength?: number
    formatFunc?: (value: string) => string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    rows?: number
    autoResize?: boolean
    resizable?: TextAreaResizable
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    title: '',
    placeholder: '',
    helperText: '',
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

  const model = defineModel<string>({ required: true })

  const displayValue = ref('')
  const isFocused = ref(false)

  const slots = useSlots()
  const hasEndIcon = !!slots['end-icon'] || !!slots['end-icon-error']
  const hasStartIcon = !!slots['start-icon'] || !!slots['start-icon-error']

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

  const DISABLED_STATE_CLASSES = ['border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed']

  const isLabelActive = computed(() => isFocused.value || !!displayValue.value)

  // มี placeholder = ช่องแสดงผลเดี่ยว ใช้ตัวอักษรใหญ่ 20px, ไม่มี placeholder (เช่น label ลอย) = ตาม default เดิมของ mk-one ที่ 14px
  const hasPlaceholder = computed(() => !!props.placeholder)
  const textClass = computed(() => (hasPlaceholder.value ? 'text-20' : 'text-17'))
  const errorTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-16'))
  const titleTextClass = computed(() => (hasPlaceholder.value ? 'text-18' : 'text-14'))
  const titleRequiredClass = computed(() => (hasPlaceholder.value ? 'text-16' : 'text-14'))
  const labelPaddingClass = computed(() => (props.readonly || props.disabled ? 'pt-3' : 'pt-5'))

  // ห้ามใช้ 'pl-[15px] pr-4' คู่กับ 'pl-10'/'pr-10' พร้อมกัน (ตอนมี icon) — utility ที่ padding เดียวกันชนกัน ผลลัพธ์ขึ้นกับลำดับใน generated CSS ไม่ใช่ลำดับ class ในเทมเพลต จึงต้องเลือกใช้อันเดียวต่อด้าน
  const paddingClass = computed(() => [
    hasStartIcon ? 'pl-10' : 'pl-[15px]',
    hasEndIcon ? 'pr-10' : 'pr-4',
  ])

  const textareaHeightClass = computed(() => (props.autoResize ? 'overflow-hidden' : 'overflow-auto'))

  const textareaResizeClass = computed(() => {
    if (props.resizable === true || props.resizable === 'both') return 'resize'
    if (props.resizable === 'vertical') return 'resize-y'
    if (props.resizable === 'horizontal') return 'resize-x'
    return 'resize-none'
  })

  const inputStateClasses = computed(() => {
    if (props.disabled) return DISABLED_STATE_CLASSES
    if (hasError.value) return ERROR_STATE_CLASSES
    return DEFAULT_STATE_CLASSES
  })

  const textareaClasses = computed(() => [
    'text-field-control box-border w-full min-w-[20%] max-w-full min-h-12.5 rounded-lg border py-3 outline-none transition-colors duration-150',
    textClass.value,
    paddingClass.value,
    inputStateClasses.value,
    textareaHeightClass.value,
    textareaResizeClass.value,
    !props.rows && 'min-h-20',
    props.label && labelPaddingClass.value,
  ])

  const labelClasses = computed(() => [
    'pointer-events-none absolute transform duration-150',
    hasStartIcon ? 'left-10' : 'left-4',
    isLabelActive.value
      ? 'top-1 text-14 font-bold text-gray-900'
      : 'top-4 text-18 font-regular text-gray-900',
  ])

  const onInput = (event: Event): void => {
    const textarea = event.target as HTMLTextAreaElement

    if (props.autoResize) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    const formattedValue = props.formatFunc(textarea.value)
    hasError.value = false
    errorMessage.value = ''
    emit('error', { hasError: false, message: '' })

    displayValue.value = formattedValue
    model.value = formattedValue

    if (textarea.value !== formattedValue) {
      textarea.value = formattedValue
    }
  }

  const validate = (event?: FocusEvent): void => {
    hasError.value = false
    errorMessage.value = ''

    if (!displayValue.value) {
      isFocused.value = false
    }

    const valueToValidate = displayValue.value || ''

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
</style>
