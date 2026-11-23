<script lang="ts">
export interface TextFieldValidationRule {
  validator: (value: string) => boolean
  message: string
}

// Shape of this component's defineExpose(), for typing a template ref without reaching into
// InstanceType<typeof TextField>.
export interface TextFieldExposed {
  hasError: boolean
  errorMessage: string
  validate: () => void
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs, useId, useSlots, watch, watchEffect, type StyleValue } from 'vue'
import Svg from '@/components/ui/Svg.vue'

type TextFieldType = 'text' | 'email' | 'number' | 'tel' | 'password' | 'currency'

// class and style size the whole field from outside, every other attribute (name, aria-*, data-*,
// listeners) belongs on the <input>. Inheriting them would put each one on both elements.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style as StyleValue)
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

type RoundedPreset = 'none' | 'sm' | 'md' | 'lg' | 'full'
type RoundedValue = RoundedPreset | string
interface RoundedCorners {
  tl?: RoundedValue
  tr?: RoundedValue
  br?: RoundedValue
  bl?: RoundedValue
}

interface TextFieldCustomStyle {
  rounded?: RoundedValue | RoundedCorners
  bgColor?: string
  labelColor?: string
  textColor?: string
  borderColor?: string
  focusColor?: string
}

const {
  label = '',
  floatLabel = false,
  labelSpace = false,
  placeholder = '',
  helperText = '',
  type = 'text',
  rules = [],
  maxLength = undefined,
  formatFunc = (value: string) => value,
  decimals = 2,
  disabled = false,
  readonly = false,
  required = false,
  requiredMessage = '',
  clearable = false,
  prefix = '',
  suffix = '',
  mask = '',
  fillMask = false,
  reverseFillMask = false,
  unmaskedValue = false,
  customStyle = {},
  outlined = false,
  borderless = false,
} = defineProps<{
  label?: string
  // false (default) = label stays put above the field, true = it floats over the value like a placeholder.
  floatLabel?: boolean
  // Only matters when floatLabel is false and label is empty: reserves the label row's height anyway,
  // so this field still lines up with sibling fields that do have a label.
  labelSpace?: boolean
  placeholder?: string
  helperText?: string
  type?: TextFieldType
  rules?: TextFieldValidationRule[]
  maxLength?: number
  formatFunc?: (value: string) => string
  // Currency only: the fraction digits a whole value settles on when the field loses focus, 0 shows
  // 1,234 instead of 1,234.00. A value that does have a fraction is never rounded to fit, it keeps
  // its typed digits so a rule can flag it instead of the amount silently changing.
  decimals?: number
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  // Message shown when required validation fails and no rule already produced one; left blank by
  // default so this ui-primitive stays free of hardcoded, language-specific text.
  requiredMessage?: string
  clearable?: boolean
  prefix?: string
  suffix?: string
  // Quasar-style mask tokens: '#' digit, 'S' letter, 'N' alphanumeric, 'A'/'a' letter forced
  // upper/lowercase, 'X'/'x' alphanumeric forced upper/lowercase, anything else is a literal
  // separator (escape with '\' to use a token character as a literal).
  mask?: string
  fillMask?: boolean | string
  reverseFillMask?: boolean
  unmaskedValue?: boolean
  customStyle?: TextFieldCustomStyle
  outlined?: boolean
  borderless?: boolean
}>()

const emit = defineEmits<{
  error: [error: { hasError: boolean; message: string }]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string | number>({ required: true })

const inputRef = ref<HTMLInputElement>()
const inputId = useId()
const displayValue = ref('')
const isFocused = ref(false)
// Browser autofill sets the input value directly without firing an 'input' event, so
// displayValue/label state would go stale — detected via the CSS animation trick below instead
// (see the :-webkit-autofill rule).
const isAutofilled = ref(false)

const slots = useSlots()
// Plain functions, not computed(): Vue's `slots` object isn't a reactive proxy, so reading it
// inside a computed() never registers as a tracked dependency — the computed would cache its first
// result and never re-run when the caller's slot content changes after mount. Calling these (and
// everything downstream of them) directly from the template works because the template itself
// re-runs on every render, which Vue already triggers correctly when dynamic slot content changes.
function hasEndIconSlot(): boolean {
  return !!slots['end-icon'] || !!slots['end-icon-error']
}
function hasStartIconSlot(): boolean {
  return !!slots['start-icon'] || !!slots['start-icon-error']
}

const hasMask = computed(() => !!mask)

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
  A: (char) => char.toUpperCase(),
  X: (char) => char.toUpperCase(),
  a: (char) => char.toLowerCase(),
  x: (char) => char.toLowerCase(),
}

function parseMask(maskValue: string): MaskToken[] {
  const tokens: MaskToken[] = []
  for (let i = 0; i < maskValue.length; i++) {
    const char = maskValue[i]!
    if (char === '\\' && i + 1 < maskValue.length) {
      tokens.push({ char: maskValue[i + 1]!, isToken: false })
      i++
    } else if (MASK_TOKEN_PATTERNS[char]) {
      tokens.push({ char, isToken: true })
    } else {
      tokens.push({ char, isToken: false })
    }
  }
  return tokens
}

const maskTokens = computed(() => (hasMask.value ? parseMask(mask) : []))
const maskTokenCount = computed(() => maskTokens.value.filter((token) => token.isToken).length)
const fillMaskChar = computed(() => (typeof fillMask === 'string' && fillMask ? fillMask[0]! : '_'))

// Pulls the content characters out of any string by matching this mask's token patterns — position
// independent, since a mask's literal separators (e.g. '-', '/', ' ') never match a token pattern
// and are filtered out regardless of where they sit.
function extractMaskContent(value: string): string {
  const usedTokenChars = [
    ...new Set(maskTokens.value.filter((token) => token.isToken).map((token) => token.char)),
  ]
  if (usedTokenChars.length === 0) return ''
  return [...value]
    .filter((char) =>
      usedTokenChars.some((tokenChar) => MASK_TOKEN_PATTERNS[tokenChar]!.test(char)),
    )
    .join('')
}

// Weaves content characters into the mask position by position, inserting literals as soon as
// their slot is reached, and stops at the first token that has no character yet. Returns
// `isContent` (same length as `text`) flagging which positions are real content versus literals —
// needed because a mask literal that happens to match its own token pattern (e.g. the leading '0'
// in mask="0##-###-####") can't otherwise be told apart from real content in the output string.
function buildMaskedValue(
  content: string,
  tokens: MaskToken[],
): { text: string; isContent: boolean[] } {
  if (!content) return { text: '', isContent: [] }
  let text = ''
  const isContent: boolean[] = []
  let charIndex = 0
  for (const token of tokens) {
    if (token.isToken) {
      if (charIndex >= content.length) break
      const pattern = MASK_TOKEN_PATTERNS[token.char]!
      while (charIndex < content.length && !pattern.test(content[charIndex]!)) charIndex++
      if (charIndex >= content.length) break
      const transform = MASK_CASE_TRANSFORM[token.char]
      text += transform ? transform(content[charIndex]!) : content[charIndex]
      isContent.push(true)
      charIndex++
    } else {
      text += token.char
      isContent.push(false)
    }
  }
  return { text, isContent }
}

function applyFillMask(
  compact: string,
  compactIsContent: boolean[],
  tokens: MaskToken[],
  fillChar: string,
): { text: string; isContent: boolean[] } {
  let text = ''
  const isContent: boolean[] = []
  for (let i = 0; i < tokens.length; i++) {
    if (i < compact.length) {
      text += compact[i]
      isContent.push(compactIsContent[i]!)
    } else if (tokens[i]!.isToken) {
      text += fillChar
      isContent.push(false)
    } else {
      text += tokens[i]!.char
      isContent.push(false)
    }
  }
  return { text, isContent }
}

// reverseFillMask reverses both the mask and the content (with isContent) before composing —
// equivalent to filling in from the end of the mask — then reverses the result back, reusing the
// same engine instead of duplicating it.
function formatMaskValue(rawContent: string): {
  content: string
  masked: string
  display: string
  displayIsContent: boolean[]
} {
  const tokens = maskTokens.value
  const limit = maskTokenCount.value
  const boundedContent = reverseFillMask ? rawContent.slice(-limit) : rawContent.slice(0, limit)

  const orderedTokens = reverseFillMask ? [...tokens].reverse() : tokens
  const orderedContent = reverseFillMask ? [...boundedContent].reverse().join('') : boundedContent

  const compactResult = buildMaskedValue(orderedContent, orderedTokens)
  const masked = reverseFillMask ? [...compactResult.text].reverse().join('') : compactResult.text
  const maskedIsContent = reverseFillMask
    ? [...compactResult.isContent].reverse()
    : compactResult.isContent
  // Read content back by position (maskedIsContent), not extractMaskContent(masked), since a mask
  // literal matching its own token pattern would otherwise get re-absorbed as content; and read it
  // from `masked` rather than rawContent because it already carries the token case transforms
  // (A/a/X/x), which unmaskedValue must reflect.
  const content = [...masked].filter((_, i) => maskedIsContent[i]).join('')

  if (!fillMask) return { content, masked, display: masked, displayIsContent: maskedIsContent }

  const filledResult = applyFillMask(
    compactResult.text,
    compactResult.isContent,
    orderedTokens,
    fillMaskChar.value,
  )
  const display = reverseFillMask ? [...filledResult.text].reverse().join('') : filledResult.text
  const displayIsContent = reverseFillMask
    ? [...filledResult.isContent].reverse()
    : filledResult.isContent

  return { content, masked, display, displayIsContent }
}

const maskRawContent = ref('')
// isContent for the current displayValue (same length), kept for the next edit — position lookups
// must go through this rather than extractMaskContent on a displayValue slice, for the same
// separator-matches-token-pattern reason as above.
const maskDisplayIsContent = ref<boolean[]>([])
// Every place that writes model.value from inside this component sets this flag first. The
// watchEffect below (which mirrors external model.value writes into displayValue) checks it and
// skips one round when set, instead of re-deriving displayValue from model.value and clobbering
// formatting (mask grouping, currency separators) this component just computed itself.
let isInternalUpdate = false

function showClearButton(): boolean {
  return (
    clearable &&
    !hasEndIconSlot() &&
    !disabled &&
    !readonly &&
    (hasMask.value ? !!maskRawContent.value : !!displayValue.value)
  )
}
const hasPrefix = computed(() => !!prefix)
function hasEndIcon(): boolean {
  return hasEndIconSlot() || showClearButton()
}
function hasSuffix(): boolean {
  return !!suffix && !showClearButton()
}
function hasStartContent(): boolean {
  return hasStartIconSlot() || hasPrefix.value
}
function hasEndContent(): boolean {
  return hasEndIcon() || hasSuffix()
}
function hasStartCombo(): boolean {
  return hasStartIconSlot() && hasPrefix.value
}
function hasEndCombo(): boolean {
  return hasEndIconSlot() && hasSuffix()
}

const hasError = ref(false)
const errorMessage = ref('')

// Fallback so a caller that sets `required` without its own `requiredMessage` still gets a real
// message instead of a red box with nothing under it.
const effectiveRequiredMessage = computed(() => requiredMessage || `กรุณากรอก${label}`)

// Corner radius of the 44px tall field, a project sets its own here or per field through customStyle.rounded.
const DEFAULT_ROUNDED = '12px'

const DEFAULT_STATE_CLASSES = ['text-field-custom-border', 'bg-surface', 'text-content']
const ERROR_STATE_CLASSES = [
  'border-danger-input',
  'bg-danger-surface',
  'text-danger-input',
  'focus:border-danger-input',
  'animate-[shake_0.2s_cubic-bezier(.36,.07,.19,.97)]',
]
const DISABLED_STATE_CLASSES = [
  'border-border-input',
  'bg-input-disabled',
  'text-content-subtle',
  'cursor-not-allowed',
]

// Class names are written out in full (no template string concatenation) because Tailwind scans
// source statically and can't discover a runtime-built class name — a rounded value outside these
// presets (e.g. '12px') falls back to inline style instead (see roundedStyle).
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

function isRoundedCorners(value: TextFieldCustomStyle['rounded']): value is RoundedCorners {
  return typeof value === 'object' && value !== null
}

function isRoundedPreset(value: RoundedValue): value is RoundedPreset {
  return value in ROUNDED_CLASS_MAP
}

const roundedClass = computed(() => {
  const rounded = customStyle.rounded ?? DEFAULT_ROUNDED

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

const roundedStyle = computed(() => {
  const rounded = customStyle.rounded ?? DEFAULT_ROUNDED
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

// Custom colors are ignored while disabled/erroring so both states stay visually unambiguous no
// matter what customStyle/outlined/borderless the caller set.
const canCustomizeColors = computed(() => !disabled && !hasError.value)
const isBorderless = computed(() => canCustomizeColors.value && borderless)

const effectiveBgColor = computed(() => {
  if (!canCustomizeColors.value) return undefined
  return customStyle.bgColor ?? (outlined || isBorderless.value ? 'transparent' : undefined)
})

const effectiveBorderColor = computed(() => {
  if (isBorderless.value) return 'transparent'
  return canCustomizeColors.value ? customStyle.borderColor : undefined
})
const effectiveFocusColor = computed(() => {
  if (isBorderless.value) return 'transparent'
  return canCustomizeColors.value ? customStyle.focusColor : undefined
})

const inputCustomStyle = computed(() => {
  const style: Record<string, string> = {}
  if (effectiveBgColor.value) style.backgroundColor = effectiveBgColor.value
  if (canCustomizeColors.value && customStyle.textColor) {
    style.color = customStyle.textColor
  }
  if (effectiveBorderColor.value) style['--tf-border-color'] = effectiveBorderColor.value
  if (effectiveFocusColor.value) style['--tf-focus-color'] = effectiveFocusColor.value
  return style
})

const labelStyle = computed(() =>
  customStyle.labelColor ? { color: customStyle.labelColor } : undefined,
)

const isLabelActive = computed(
  () =>
    isFocused.value ||
    (hasMask.value ? !!maskRawContent.value : !!displayValue.value) ||
    isAutofilled.value,
)

// Stops Chrome from mistaking a tel/email field placed right before a password field for a
// username field and offering to autofill a saved account into it.
const autocompleteAttr = computed(() => {
  if (type === 'email') return 'email'
  if (type === 'tel') return 'tel'
  if (type === 'password') return 'current-password'
  return undefined
})

const hasFloatingLabel = computed(() => floatLabel && !!label)
const labelPaddingClass = computed(() => (readonly || disabled ? 'pt-3' : 'pt-[13px]'))

// Two padding utilities on the same side (e.g. 'pl-4' and 'pl-10') can't coexist safely — which one
// wins depends on generated CSS order, not template order — so pick exactly one per side up front.
// Plain function (see hasEndIconSlot/hasStartIconSlot above): depends on hasStartCombo/hasEndCombo,
// which read the icon slots and so can't be a computed().
function paddingClass(): string[] {
  let pl = 'pl-[15px]'
  if (hasStartCombo()) pl = hasFloatingLabel.value ? 'pl-[71px]' : 'pl-[74px]'
  else if (hasStartContent()) pl = hasFloatingLabel.value ? 'pl-[39px]' : 'pl-[42px]'

  let pr = 'pr-4'
  if (hasEndCombo()) pr = 'pr-[62px]'
  else if (hasEndContent()) pr = 'pr-10'

  return [pl, pr]
}

const inputStateClasses = computed(() => {
  if (disabled) return DISABLED_STATE_CLASSES
  if (hasError.value) return ERROR_STATE_CLASSES
  return DEFAULT_STATE_CLASSES
})

const iconClass = computed(() => (disabled ? 'text-content-disabled-input' : 'text-content-subtle'))
// An icon file paints itself with its own colors, so a disabled field recolors the strokes and fills
// through .text-field-icon-disabled instead of relying on currentColor.
const startIconClass = computed(() =>
  disabled ? 'text-content-subtle text-field-icon-disabled' : 'text-content-subtle',
)

// Plain function: pulls in paddingClass(), which reads the icon slots.
function inputClasses() {
  return [
    'text-field-control box-border h-11 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border text-16 font-medium outline-none transition-colors duration-150',
    roundedClass.value,
    paddingClass(),
    inputStateClasses.value,
    hasFloatingLabel.value && labelPaddingClass.value,
  ]
}

// Plain function: reads hasStartCombo()/hasStartContent(), which read the icon slots.
function labelClasses() {
  return [
    'pointer-events-none absolute transform duration-150',
    hasStartCombo() ? 'left-[72px]' : hasStartContent() ? 'left-10' : 'left-4',
    isLabelActive.value
      ? 'top-1 text-xs font-bold text-content-strong'
      : 'top-1/2 -translate-y-1/2 text-base font-medium text-content-strong',
  ]
}

function countContent(isContent: boolean[], start: number, end: number): number {
  let count = 0
  for (let i = start; i < end; i++) {
    if (isContent[i]) count++
  }
  return count
}

// Diffs the new raw value against the pre-edit displayValue using the post-edit cursor position to
// find which range was inserted/removed, then patches only that range in maskRawContent — must use
// maskDisplayIsContent (real positions) to count "how much content precedes this point", never
// extractMaskContent on a slice of the old displayValue, for the literal-matches-token-pattern
// reason documented on extractMaskContent.
function onMaskInput(input: HTMLInputElement, event: Event): void {
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
    const insertStart = cursorEnd - lengthDiff
    const insertedContent = extractMaskContent(newRaw.slice(insertStart, cursorEnd))
    const contentBeforeInsertPoint = countContent(oldIsContent, 0, insertStart)
    newContent =
      newContent.slice(0, contentBeforeInsertPoint) +
      insertedContent +
      newContent.slice(contentBeforeInsertPoint)
    targetContentIndex = contentBeforeInsertPoint + insertedContent.length
  } else if (lengthDiff < 0) {
    const deletedCount = -lengthDiff
    const deletedContentCount = countContent(oldIsContent, cursorEnd, cursorEnd + deletedCount)
    const contentBeforeDeletePoint = countContent(oldIsContent, 0, cursorEnd)

    if (deletedContentCount > 0) {
      newContent =
        newContent.slice(0, contentBeforeDeletePoint) +
        newContent.slice(contentBeforeDeletePoint + deletedContentCount)
      targetContentIndex = contentBeforeDeletePoint
    } else if (inputType === 'deleteContentForward') {
      // The deleted range was a pure literal (e.g. pressing Delete on '-'); the user really meant to
      // delete the next content character too, or the literal would just reappear immediately.
      newContent =
        newContent.slice(0, contentBeforeDeletePoint) +
        newContent.slice(contentBeforeDeletePoint + 1)
      targetContentIndex = contentBeforeDeletePoint
    } else {
      const removeAt = Math.max(0, contentBeforeDeletePoint - 1)
      newContent = newContent.slice(0, removeAt) + newContent.slice(contentBeforeDeletePoint)
      targetContentIndex = removeAt
    }
  } else {
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
  isInternalUpdate = true
  model.value = unmaskedValue ? content : masked

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

    // If the cursor landed right before a literal that was just inserted (e.g. a full group just
    // got typed and a '-' was appended), skip past it — typing further has to land on the next
    // content slot anyway.
    while (newCursorPos < display.length && !displayIsContent[newCursorPos]) {
      newCursorPos++
    }

    if (document.activeElement === input) {
      input.setSelectionRange(newCursorPos, newCursorPos)
    }
  }
}

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement

  if (hasMask.value) {
    onMaskInput(input, event)
    return
  }

  let value = input.value
  const cursorPos = input.selectionStart || 0

  const isContentChar = (char: string, index: number, originalString: string): boolean => {
    if (type === 'currency') return char !== ','
    if (type === 'tel') return /\d/.test(char)
    if (type === 'number') {
      if (/\d/.test(char)) return true
      if (char === '.' && originalString.indexOf('.') === index) return true
      if (char === '-' && index === 0) return true
      return false
    }
    return true
  }

  let contentCharsBeforeCursor = 0
  for (let i = 0; i < cursorPos; i++) {
    if (isContentChar(value[i]!, i, value)) contentCharsBeforeCursor++
  }

  if (type === 'number' || type === 'currency' || type === 'tel') {
    let filteredValue = ''
    let hasDecimal = false

    if (type !== 'tel' && value.charAt(0) === '-') {
      filteredValue = '-'
      value = value.substring(1)
    }

    if (type === 'currency') {
      value = value.replace(/,/g, '')
    }

    for (let i = 0; i < value.length; i++) {
      const char = value.charAt(i)
      if (/\d/.test(char)) {
        filteredValue += char
      } else if (type !== 'tel' && char === '.' && !hasDecimal) {
        filteredValue += char
        hasDecimal = true
      }
    }

    if (type === 'currency') {
      const [rawIntegerPart = '', decimalPart = ''] = filteredValue.split('.')
      let integerPart = rawIntegerPart

      if (integerPart) {
        let negative = ''
        if (integerPart.startsWith('-')) {
          negative = '-'
          integerPart = integerPart.substring(1)
        }
        integerPart = negative + integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }

      // Two decimals at most, the same precision the blur formatting settles on.
      filteredValue = hasDecimal ? `${integerPart}.${decimalPart.slice(0, 2)}` : integerPart
    }

    if (filteredValue !== input.value) {
      input.value = filteredValue
    }
  }

  const formattedValue = formatFunc(input.value)
  hasError.value = false
  errorMessage.value = ''
  emit('error', { hasError: false, message: '' })

  displayValue.value = formattedValue
  isInternalUpdate = true

  if (type === 'currency') {
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
      if (isContentChar(formattedValue[i]!, i, formattedValue)) contentCharsSeen++
      newCursorPos = i + 1
    }

    if (document.activeElement === input) {
      input.setSelectionRange(newCursorPos, newCursorPos)
    }
  }
}

function onAnimationStart(event: AnimationEvent): void {
  if (event.animationName === 'onAutoFillStart') {
    isAutofilled.value = true
    onInput({ target: event.target } as unknown as Event)
  } else if (event.animationName === 'onAutoFillCancel') {
    isAutofilled.value = false
  }
}

function clearValue(): void {
  displayValue.value = ''
  maskRawContent.value = ''
  maskDisplayIsContent.value = []
  isInternalUpdate = true
  model.value = type === 'currency' ? 0 : ''
  hasError.value = false
  errorMessage.value = ''
  emit('error', { hasError: false, message: '' })
  inputRef.value?.focus()
}

function onKeypress(event: KeyboardEvent): void {
  if (type !== 'number' && type !== 'tel') return

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

  if (type === 'number') {
    if (key === '.' && !input.value.includes('.')) return
    if (key === '-' && input.selectionStart === 0 && !input.value.includes('-')) return
  }

  event.preventDefault()
}

function validate(event?: FocusEvent): void {
  hasError.value = false
  errorMessage.value = ''

  if (hasMask.value ? !maskRawContent.value : !displayValue.value) {
    isFocused.value = false
  }

  let valueToValidate = (hasMask.value ? maskRawContent.value : displayValue.value) || ''

  if (!hasMask.value && (type === 'number' || type === 'currency' || type === 'tel')) {
    if (type === 'currency') {
      valueToValidate = valueToValidate.replace(/,/g, '')
    }

    if (type === 'tel') {
      valueToValidate = valueToValidate.replace(/\D/g, '')
    }

    const isEmpty = !valueToValidate || valueToValidate.trim() === '' || valueToValidate === '.'

    if (!isEmpty && type !== 'tel') {
      const numValue = parseFloat(valueToValidate)
      valueToValidate = String(numValue)

      if (type === 'currency') {
        const fractionDigits = Number.isInteger(numValue) ? decimals : Math.max(decimals, 2)
        const formattedValue = numValue.toFixed(fractionDigits)
        const [rawIntPart = '', decPart = ''] = formattedValue.split('.')
        const negative = numValue < 0 ? '-' : ''
        const intPart = rawIntPart.replace(/^-/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        displayValue.value = `${negative}${intPart}${fractionDigits > 0 ? `.${decPart}` : ''}`
        isInternalUpdate = true
        model.value = numValue
      }
    }
  }

  for (const rule of rules) {
    if (!rule.validator(valueToValidate)) {
      hasError.value = true
      errorMessage.value = rule.message
      emit('error', { hasError: true, message: errorMessage.value })
      if (event) emit('blur', event)
      return
    }
  }

  if (required && (!valueToValidate || valueToValidate.trim().length === 0)) {
    hasError.value = true
    errorMessage.value = effectiveRequiredMessage.value
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

  if (isInternalUpdate) {
    isInternalUpdate = false
    return
  }

  if (hasMask.value) {
    const { content, display, displayIsContent } = formatMaskValue(
      extractMaskContent(String(model.value)),
    )
    maskRawContent.value = content
    displayValue.value = display
    maskDisplayIsContent.value = displayIsContent
    return
  }

  displayValue.value = String(model.value)
})

watch(
  () => rules,
  () => validate(),
)
</script>

<template>
  <div class="w-full" :class="rootClass" :style="rootStyle">
    <label
      v-if="!floatLabel && (label || labelSpace)"
      :for="inputId"
      class="mb-1 block text-16 leading-5 font-medium text-content text-start"
      :class="{ 'min-h-[1.03em]': !label || labelSpace }"
      :style="labelStyle"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="ml-1 text-14 font-light text-danger">*</span>
    </label>

    <div class="relative w-full">
      <input
        :id="inputId"
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
        :class="inputClasses()"
        :style="[inputCustomStyle, roundedStyle]"
        v-bind="inputAttrs"
        @input="onInput"
        @keypress="onKeypress"
        @focus="isFocused = true"
        @blur="validate"
        @animationstart="onAnimationStart"
      />

      <label v-if="label && floatLabel" :for="inputId" :class="labelClasses()" :style="labelStyle">
        <span>{{ label }}</span>
        <span v-if="required" class="ml-0.5 text-danger">*</span>
      </label>

      <div
        v-if="hasEndIconSlot()"
        class="absolute inset-y-0 right-0 flex items-center gap-1 pr-4"
        :class="iconClass"
      >
        <span v-if="suffix" class="text-sm text-content-subtle">{{ suffix }}</span>
        <slot v-if="!hasError || !slots['end-icon-error']" name="end-icon"></slot>
        <span v-else class="contents text-field-icon-error">
          <slot name="end-icon-error"></slot>
        </span>
      </div>

      <button
        v-else-if="showClearButton()"
        type="button"
        class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4"
        @click="clearValue"
      >
        <Svg src="common/x-close" class="size-4" color="currentColor" />
      </button>

      <div v-else-if="hasSuffix()" class="absolute inset-y-0 right-0 flex items-center pr-4">
        <span class="text-sm text-content-subtle">{{ suffix }}</span>
      </div>

      <div
        v-if="hasStartIconSlot()"
        class="absolute inset-y-0 left-0 flex items-center gap-1 pl-4"
        :class="startIconClass"
      >
        <slot v-if="!hasError || !slots['start-icon-error']" name="start-icon"></slot>
        <span v-else class="contents text-field-icon-error">
          <slot name="start-icon-error"></slot>
        </span>
        <span v-if="prefix" class="text-sm text-content-subtle">{{ prefix }}</span>
      </div>

      <div v-else-if="hasPrefix" class="absolute inset-y-0 left-0 flex items-center pl-4">
        <span class="text-sm text-content-subtle">{{ prefix }}</span>
      </div>
    </div>

    <div
      v-if="hasError && errorMessage"
      class="w-fit mt-2 text-start text-14 font-light text-danger-input duration-150 animate-[slideIn_0.15s_ease-out_forwards]"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="helperText"
      class="w-fit mt-2 text-start text-14 font-light text-content-subtle duration-150 animate-[fadeIn_0.1s_ease-out_forwards]"
    >
      {{ helperText }}
    </div>
  </div>
</template>

<style scoped>
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
  color: var(--color-content-subtle);
}

.text-field-control:disabled::placeholder {
  color: var(--color-content-subtle);
}

.text-field-control::-webkit-scrollbar {
  width: 6px;
}

.text-field-control::-webkit-scrollbar-track {
  background: transparent;
}

.text-field-control::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.text-field-control::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-strong);
}

.text-field-icon-error :deep(svg *) {
  stroke: var(--color-danger-input);
}

.text-field-icon-disabled :deep([stroke]:not([stroke='none'])) {
  stroke: var(--color-content-subtle);
}

.text-field-icon-disabled :deep([fill]:not([fill='none'])) {
  fill: var(--color-content-subtle);
}

/* Bound to a CSS variable rather than a Tailwind border class so customStyle.borderColor/focusColor,
   set via inline style (--tf-border-color/--tf-focus-color), can still win on hover/focus — inline
   style can't target pseudo-classes on its own. Doesn't affect error/disabled, which use their own
   class sets with no .text-field-custom-border in them. */
.text-field-custom-border {
  border-color: var(--tf-border-color, var(--color-border-input));
}

.text-field-custom-border:hover {
  border-color: var(--tf-border-color, var(--color-border-input));
}

.text-field-custom-border:focus {
  border-color: var(--tf-focus-color, var(--tf-border-color, var(--color-border-focus-input)));
}
</style>

<!-- Not scoped on purpose: Vue appends a hash to @keyframes names inside a scoped block, which
     would break the animationName check in onAnimationStart. -->
<style>
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
  -webkit-text-fill-color: var(--color-content);
  caret-color: var(--color-content);
}
</style>
