<!-- eslint-disable vue/multi-word-component-names -- kept as `Select` to match the source component this was ported from -->
<script lang="ts">
export interface ISelectOption {
  label: string
  value: string | number
  disabled?: boolean
  // The raw object before normalization, equal to itself unless optionValue/optionLabel/optionDisabled
  // are set — lets the option/selected slots reach fields beyond label/value/disabled.
  raw?: unknown
}

export interface SelectExposed {
  hasError: boolean
  errorMessage: string
  validate: () => void
}
</script>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch, type ComputedRef, type Ref } from 'vue'
import { onClickOutside, useResizeObserver } from '@vueuse/core'
import Svg from '@/components/ui/Svg.vue'
import type { TextFieldValidationRule } from './TextField.vue'

type OptionValueAccessor = string | ((option: Record<string, unknown>) => string | number)
type OptionLabelAccessor = string | ((option: Record<string, unknown>) => string)
type OptionDisabledAccessor = string | ((option: Record<string, unknown>) => boolean)

type RoundedPreset = 'none' | 'sm' | 'md' | 'lg' | 'full'

interface SelectCustomStyle {
  // A single value, not per-corner like TextField — overkill for Select.
  rounded?: RoundedPreset | string
  bgColor?: string
  labelColor?: string
  textColor?: string
  borderColor?: string
  focusColor?: string
  // Background of an option row on mouse hover / arrow-key highlight (no effect on option.disabled).
  optionHoverColor?: string
  // Background of the currently selected row(s) in the panel.
  optionSelectedColor?: string
  // Text color of the currently selected row(s) in the panel.
  optionSelectedTextColor?: string
}

// emitValue=true (default): v-model is a single value/array of values. emitValue=false: v-model is
// a full option object/array of them. mapOptions controls whether a raw value gets resolved back to
// a label for display (only matters when emitValue=true — with emitValue=false the model already
// carries its label, nothing to resolve).
type SelectValue = string | number | ISelectOption | (string | number)[] | ISelectOption[]

const {
  label = '',
  labelSpace = false,
  placeholder = '',
  helperText = '',
  rules = [],
  options,
  optionValue = 'value',
  optionLabel = 'label',
  optionDisabled = 'disabled',
  disabled = false,
  readonly = false,
  loading = false,
  required = false,
  requiredMessage = '',
  clearable = false,
  multiple = false,
  useChips = true,
  searchable = false,
  useInput = false,
  inputDebounce = 500,
  loadingText = 'กำลังค้นหา...',
  emitValue = true,
  mapOptions = true,
  displayValue = '',
  optionHeight = 44,
  maxPanelHeight = 280,
  noOptionsText = 'ไม่พบข้อมูล',
  searchPlaceholder = 'ค้นหา',
  dropdownIcon = 'common/arrow-down-01',
  clearIcon = 'common/x-close',
  customStyle = {},
} = defineProps<{
  label?: string
  labelSpace?: boolean
  placeholder?: string
  helperText?: string
  rules?: TextFieldValidationRule[]
  // Accepts any object shape (not forced into { label, value, disabled }) — pair with
  // optionValue/optionLabel/optionDisabled if the shape doesn't match; plain ISelectOption[] needs
  // nothing extra.
  options: object[]
  // Quasar-style option-value/option-label/option-disabled — a field name (string) or a function
  // reading straight off the raw option, for when options aren't already { label, value, disabled }
  // (e.g. an API returning { id, name }).
  optionValue?: OptionValueAccessor
  optionLabel?: OptionLabelAccessor
  optionDisabled?: OptionDisabledAccessor
  disabled?: boolean
  readonly?: boolean
  // Shows a spinner instead of the chevron and blocks opening the panel (e.g. while options are
  // still loading from an API) — doesn't gray out the trigger like disabled does.
  loading?: boolean
  required?: boolean
  requiredMessage?: string
  clearable?: boolean
  multiple?: boolean
  // Quasar-style use-chips — true (default) shows each selected option (multiple only) as a removable
  // chip (× button, or Backspace while useInput and the input is empty). false falls back to the
  // plain comma-joined label text, with no in-trigger removal. No effect when multiple is false.
  useChips?: boolean
  searchable?: boolean
  // Quasar-style use-input — the trigger becomes a typeable <input> instead of a separate search box
  // in the panel (auto-disables the searchable box if both are set). Does not filter locally like
  // searchable does — the caller must listen for @filter and mutate its own options, or the list
  // never narrows while typing.
  useInput?: boolean
  // Quasar-style input-debounce — delay (ms) before firing @filter while typing, to avoid firing an
  // API call on every keystroke. 0 = fire immediately. No effect when useInput is false.
  inputDebounce?: number
  // Message shown while filteredOptions is empty *during* loading=true (e.g. waiting on an async
  // @filter response) — separate from noOptionsText, used once a search has actually come up empty.
  loadingText?: string
  // true (default): v-model is ISelectOption['value'], single or array. false: v-model is the full
  // ISelectOption, single or array.
  emitValue?: boolean
  // Quasar-style map-options — true (default) resolves a label from options to show in the trigger;
  // false shows the raw model value as-is. Only matters when emitValue is true.
  mapOptions?: boolean
  // Quasar-style display-value — overrides whatever the trigger shows, regardless of the computed
  // selected labels; doesn't affect v-model/selection logic. Leave unset to show the resolved label(s).
  displayValue?: string
  // px per row — also drives the virtual-scroll math, so it must match each row's real height
  // (labels must truncate, never wrap).
  optionHeight?: number
  maxPanelHeight?: number
  noOptionsText?: string
  searchPlaceholder?: string
  // Quasar-style dropdown-icon/clear-icon — override the icon path (same Svg src="folder/name"
  // convention used across the project).
  dropdownIcon?: string
  clearIcon?: string
  customStyle?: SelectCustomStyle
}>()

const emit = defineEmits<{
  error: [error: { hasError: boolean; message: string }]
  // Not always a real FocusEvent — only present for a genuine blur off the trigger; every other
  // close path (Escape, outside click, selecting in single mode) sends undefined.
  blur: [event?: FocusEvent]
  // Quasar-style @filter — fires only when useInput is true, on every keystroke. Must call update()
  // with a callback that mutates the caller's own options ref (sync, or async after a fetch) or
  // nothing happens.
  filter: [value: string, update: (apply: () => void) => void, abort: () => void]
  // Fires whenever the panel actually opens/closes (every path, not just clicking the trigger) — for
  // analytics, first-open lazy loading, etc.
  'popup-show': []
  'popup-hide': []
  // Quasar-style @virtual-scroll — fires whenever the virtual-scroll window moves, for infinite
  // scroll (index/to nearing options.length, then loading the next page).
  'virtual-scroll': [
    details: { index: number; from: number; to: number; direction: 'increase' | 'decrease' },
  ]
}>()

const model = defineModel<SelectValue>({ required: true })

const wrapperRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const triggerInputRef = ref<HTMLInputElement>()
const panelRef = ref<HTMLElement>()
const panelScrollRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()

const panelId = `select-panel-${useId()}`
// role="combobox" here sits on a <div> (or an <input> whose role is overridden), neither of which
// a native <label for> reliably associates with — aria-labelledby works regardless of tag/role.
const labelId = `select-label-${useId()}`

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const openUpward = ref(false)
const resolvedPanelMaxHeight = ref(maxPanelHeight)

const hasError = ref(false)
const errorMessage = ref('')

// Fallback so a caller that sets `required` without its own `requiredMessage` still gets a real
// message instead of a red box with nothing under it.
const effectiveRequiredMessage = computed(() => requiredMessage || `กรุณาเลือก${label}`)

interface UseVirtualListOptions {
  itemHeight: number
  overscan?: number
}

interface VirtualListEntry<T> {
  item: T
  index: number
}

// Fixed-height virtual scroll: windows a long list down to only the rows near the visible area of
// `containerRef`, using translateY on a spacer div (see totalHeight/offsetY) to fake full-list
// scroll height. Rows MUST render at a constant `itemHeight` (no wrapping) or the windowing math
// goes wrong. No on/off threshold — a short list's containerHeight already covers the whole thing,
// so it naturally renders everything.
function useVirtualList<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  containerRef: Ref<HTMLElement | undefined>,
  virtualListOptions: UseVirtualListOptions,
) {
  const itemHeight = virtualListOptions.itemHeight
  const overscan = virtualListOptions.overscan ?? 4

  const scrollTop = ref(0)
  const containerHeight = ref(0)

  // containerRef is usually only mounted behind a v-if (e.g. a dropdown panel), so its first
  // ResizeObserver callback fires a frame late — measure synchronously as soon as it appears too.
  function measureContainer(): void {
    if (containerRef.value)
      containerHeight.value = containerRef.value.getBoundingClientRect().height
  }

  watch(containerRef, (el) => {
    if (el) nextTick(measureContainer)
  })

  useResizeObserver(containerRef, (entries) => {
    containerHeight.value = entries[0]?.contentRect.height ?? 0
  })

  const startIndex = computed(() =>
    Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan),
  )

  const visibleCount = computed(() => Math.ceil(containerHeight.value / itemHeight) + overscan * 2)

  const endIndex = computed(() =>
    Math.min(items.value.length, startIndex.value + visibleCount.value),
  )

  const visibleItems = computed<VirtualListEntry<T>[]>(() =>
    items.value
      .slice(startIndex.value, endIndex.value)
      .map((item, i) => ({ item, index: startIndex.value + i })),
  )

  const totalHeight = computed(() => items.value.length * itemHeight)
  const offsetY = computed(() => startIndex.value * itemHeight)

  function onScroll(event: Event): void {
    scrollTop.value = (event.target as HTMLElement).scrollTop
  }

  // Call when the underlying item list shrinks (e.g. a search query narrows it) so a stale
  // scrollTop from the longer list can't leave startIndex pointing past the new array's end.
  function resetScroll(): void {
    scrollTop.value = 0
    if (containerRef.value) containerRef.value.scrollTop = 0
  }

  // center=true forces the item to the middle of the viewport (e.g. reopening the panel on the
  // already-selected option) instead of the default "just scroll it into view" behavior.
  function scrollToIndex(index: number, center = false): void {
    const el = containerRef.value
    if (!el || index < 0) return

    measureContainer()
    const itemTop = index * itemHeight
    const itemBottom = itemTop + itemHeight

    if (center) {
      const maxScrollTop = Math.max(0, items.value.length * itemHeight - el.clientHeight)
      el.scrollTop = Math.max(
        0,
        Math.min(maxScrollTop, itemTop + itemHeight / 2 - el.clientHeight / 2),
      )
    } else if (itemTop < el.scrollTop) {
      el.scrollTop = itemTop
    } else if (itemBottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = itemBottom - el.clientHeight
    }
    scrollTop.value = el.scrollTop
  }

  return { visibleItems, totalHeight, offsetY, onScroll, scrollToIndex, resetScroll }
}

function resolveOptionValue(raw: object): string | number {
  const record = raw as Record<string, unknown>
  return (typeof optionValue === 'function' ? optionValue(record) : record[optionValue]) as
    | string
    | number
}

function resolveOptionLabel(raw: object): string {
  const record = raw as Record<string, unknown>
  return String(typeof optionLabel === 'function' ? optionLabel(record) : record[optionLabel])
}

function resolveOptionDisabled(raw: object): boolean {
  const record = raw as Record<string, unknown>
  return Boolean(
    typeof optionDisabled === 'function' ? optionDisabled(record) : record[optionDisabled],
  )
}

// Normalizes every raw option to the same shape regardless of optionValue/optionLabel/optionDisabled,
// so the rest of the file works with plain ISelectOption without knowing about custom keys — raw
// keeps the original object for the option/selected slots to reach other fields.
const normalizedOptions = computed<ISelectOption[]>(() =>
  options.map((raw) => ({
    label: resolveOptionLabel(raw),
    value: resolveOptionValue(raw),
    disabled: resolveOptionDisabled(raw),
    raw,
  })),
)

const filteredOptions = computed<ISelectOption[]>(() => {
  // useInput doesn't filter itself — it waits for the parent to filter its own bound options via
  // @filter (like Quasar's use-input+filter).
  if (useInput) return normalizedOptions.value
  if (!searchable || !searchQuery.value.trim()) return normalizedOptions.value
  const query = searchQuery.value.trim().toLowerCase()
  return normalizedOptions.value.filter((option) => option.label.toLowerCase().includes(query))
})

const { visibleItems, totalHeight, offsetY, onScroll, scrollToIndex, resetScroll } = useVirtualList(
  filteredOptions,
  panelScrollRef,
  { itemHeight: optionHeight },
)

// Quasar-style @virtual-scroll — lets the consumer know how far the visible window has scrolled, for
// infinite-scroll (e.g. `to` nearing options.length - 1, then fetching the next page).
let lastVirtualScrollTo = -1
watch(visibleItems, (items) => {
  if (items.length === 0) return
  const from = items[0]!.index
  const to = items[items.length - 1]!.index
  const direction = to >= lastVirtualScrollTo ? 'increase' : 'decrease'
  lastVirtualScrollTo = to
  emit('virtual-scroll', { index: to, from, to, direction })
})

// A single raw entry as it might appear in model.value — scalar when emitValue=true, a full
// ISelectOption when emitValue=false.
type SelectEntry = string | number | ISelectOption

function extractValue(entry: SelectEntry): string | number {
  return typeof entry === 'object' ? entry.value : entry
}

const selectedValueSet = computed(() => {
  if (multiple) {
    const entries = (Array.isArray(model.value) ? model.value : []) as SelectEntry[]
    return new Set(entries.map(extractValue))
  }
  if (model.value === '' || model.value == null) return new Set<string | number>()
  return new Set([extractValue(model.value as SelectEntry)])
})

function isOptionSelected(option: ISelectOption): boolean {
  return selectedValueSet.value.has(option.value)
}

// Safe against a lookup miss (a previously selected value no longer in options, e.g. after an async
// reload) — silently skipped instead of showing undefined. Labels are always resolved fresh from
// `options`, never read off a model.value entry directly (even with emitValue=false), so a stale
// object in model.value can't show a stale label after options change.
const selectedEntries = computed<SelectEntry[]>(() =>
  multiple
    ? ((Array.isArray(model.value) ? model.value : []) as SelectEntry[])
    : model.value === '' || model.value == null
      ? []
      : [model.value as SelectEntry],
)

const selectedLabels = computed<string[]>(() =>
  selectedEntries.value
    .map((entry) => {
      // Already a full object (emitValue=false) — use its label directly, nothing to resolve.
      if (typeof entry === 'object') return entry.label
      // Scalar (emitValue=true) — resolve to a label from options when mapOptions is on, otherwise
      // show the raw value (like Quasar's emit-value without map-options).
      if (!mapOptions) return String(entry)
      return normalizedOptions.value.find((option) => option.value === entry)?.label
    })
    .filter((label): label is string => !!label),
)

// The full ISelectOption (with raw attached) for each currently selected entry — lets the #selected
// slot reach full option data, not just a label string. Same lookup-miss safety as selectedLabels.
const selectedOptionObjects = computed<ISelectOption[]>(() =>
  selectedEntries.value
    .map((entry) =>
      typeof entry === 'object'
        ? entry
        : normalizedOptions.value.find((option) => option.value === entry),
    )
    .filter((option): option is ISelectOption => !!option),
)

const resolvedDisplayText = computed(() => displayValue || selectedLabels.value.join(', '))

// Only used to sync text back into the <input> for useInput+single — if a label can't be resolved
// (e.g. typing has filtered options down past the selected one) shows the raw value instead of
// blank, since model.value still holds a real value even though its label can't be found right now.
const inputFallbackDisplayText = computed(() => {
  if (resolvedDisplayText.value) return resolvedDisplayText.value
  if (model.value === '' || model.value == null) return ''
  return String(extractValue(model.value as SelectEntry))
})

const showClearButton = computed(
  () => clearable && !disabled && !readonly && selectedLabels.value.length > 0,
)

const ROUNDED_CLASSES: Record<RoundedPreset, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

function isRoundedKeyword(value: string): value is RoundedPreset {
  return value in ROUNDED_CLASSES
}

// Corner radius of the 44px tall trigger, matches TextField's default so a form lines up.
const DEFAULT_ROUNDED = '12px'

const roundedClass = computed(() => {
  const rounded = customStyle.rounded ?? DEFAULT_ROUNDED
  return isRoundedKeyword(rounded) ? ROUNDED_CLASSES[rounded] : ''
})

const DEFAULT_STATE_CLASSES = ['select-custom-border', 'bg-surface', 'text-content']
const ERROR_STATE_CLASSES = ['border-danger-input', 'bg-danger-surface', 'text-danger-input']
const DISABLED_STATE_CLASSES = ['border-border-input', 'bg-input-disabled', 'text-content-subtle']

const triggerStateClasses = computed(() => {
  if (disabled) return DISABLED_STATE_CLASSES
  if (hasError.value) return ERROR_STATE_CLASSES
  return DEFAULT_STATE_CLASSES
})

const iconClass = computed(() => (disabled ? 'text-content-disabled-input' : 'text-content-subtle'))
const placeholderClass = computed(() => 'text-content-subtle')

const triggerClasses = computed(() => [
  'box-border flex w-full min-w-0 items-center justify-between gap-2 border px-4 outline-none transition-colors duration-150',
  // multiple+useChips (useInput or not) shows chips that can wrap onto multiple lines, so it needs a
  // min-h instead of a fixed h to grow with the chip count. useChips=false stays a single-line
  // comma-joined label truncated at a fixed h-11, no growth needed.
  multiple && useChips ? 'min-h-11 py-1.5' : 'h-11',
  roundedClass.value,
  triggerStateClasses.value,
  isOpen.value && !disabled && !hasError.value && 'select-trigger-open',
  disabled || readonly || loading ? 'cursor-not-allowed' : 'cursor-pointer',
])

const triggerCustomStyle = computed(() => {
  const style: Record<string, string> = {}
  if (!isRoundedKeyword(customStyle.rounded ?? DEFAULT_ROUNDED)) {
    style.borderRadius = customStyle.rounded ?? DEFAULT_ROUNDED
  }
  if (!disabled) {
    if (customStyle.bgColor) style.backgroundColor = customStyle.bgColor
    if (customStyle.textColor) style.color = customStyle.textColor
    if (customStyle.borderColor) style['--select-border-color'] = customStyle.borderColor
    if (customStyle.focusColor) style['--select-focus-color'] = customStyle.focusColor
  }
  return style
})

const labelStyle = computed(() =>
  customStyle.labelColor ? { color: customStyle.labelColor } : undefined,
)

const panelCustomStyle = computed(() => {
  const style: Record<string, string> = {}
  if (customStyle.optionHoverColor)
    style['--select-option-hover-color'] = customStyle.optionHoverColor
  if (customStyle.optionSelectedColor)
    style['--select-option-selected-color'] = customStyle.optionSelectedColor
  if (customStyle.optionSelectedTextColor)
    style['--select-option-selected-text-color'] = customStyle.optionSelectedTextColor
  return style
})

function optionRowClasses(option: ISelectOption, index: number) {
  return [
    'flex items-center gap-2 px-3 text-16 font-medium',
    option.disabled
      ? 'cursor-not-allowed text-content-subtle'
      : 'select-option-row cursor-pointer text-content',
    !option.disabled && isOptionSelected(option) && 'select-option-selected',
    !option.disabled && index === highlightedIndex.value && 'select-option-highlighted',
  ]
}

function toggleOption(option: ISelectOption): void {
  if (option.disabled) return

  const entry: SelectEntry = emitValue ? option.value : option

  if (multiple) {
    const current = (Array.isArray(model.value) ? model.value : []) as SelectEntry[]
    const alreadySelected = current.some((item) => extractValue(item) === option.value)
    model.value = (
      alreadySelected
        ? current.filter((item) => extractValue(item) !== option.value)
        : [...current, entry]
    ) as SelectValue
    // Clears the search so the next term can be typed right away — what's selected is already shown
    // as its own chip (see template), so there's nothing to sync the search text back to like single.
    // Also fires filter('') (like focus/clear) so the consumer resets its list back to the full set,
    // instead of the panel staying stuck on the previous filtered result after a selection.
    if (useInput) {
      searchQuery.value = ''
      clearFilterDebounce()
      emitFilter('')
    }
    return
  }

  model.value = entry as SelectValue
  closePanel()
}

function clearValue(): void {
  model.value = multiple ? [] : ''
  if (useInput) {
    searchQuery.value = ''
    // Clear any pending debounce first, so a stale search term can't land on top of the list this
    // button just reset.
    clearFilterDebounce()
    emitFilter('')
  }
  nextTick(() => validate())
}

// Matches the mt-[15px]/mb-[15px] on the panel, which has to be a static class for Tailwind to find it.
const PANEL_GAP_PX = 15

function computePlacement(): void {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const margin = 8 + PANEL_GAP_PX
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  if (spaceBelow < maxPanelHeight && spaceAbove > spaceBelow) {
    openUpward.value = true
    resolvedPanelMaxHeight.value = Math.max(120, Math.min(maxPanelHeight, spaceAbove - margin))
  } else {
    openUpward.value = false
    resolvedPanelMaxHeight.value = Math.max(120, Math.min(maxPanelHeight, spaceBelow - margin))
  }
}

// force=true skips the loading guard only (not the isOpen guard) — used only when opening from
// @filter's update(), because by then apply() (which mutates the consumer's options) has already run
// for real and options are ready, even though the consumer's own loading ref (e.g. filterLoading)
// often hasn't flipped back to false yet since its async function's `finally` hasn't run its next
// tick. Skipping the guard here means the panel still opens.
// resetQuery=false only for the force-reopen from @filter (see emitFilter) — there searchQuery is
// still whatever the user is actively typing (not a fresh focus), so clearing it would show a blank
// input against a list that was just filtered to match that exact text.
async function openPanel(force = false, resetQuery = true): Promise<void> {
  // loading doesn't lock the trigger like disabled does (still focusable/tabbable) — it just blocks
  // opening a panel whose options aren't ready yet.
  if (isOpen.value || (loading && !force)) return
  isOpen.value = true
  emit('popup-show')
  if (resetQuery) searchQuery.value = ''

  await nextTick()
  computePlacement()

  if (searchable && !useInput) searchInputRef.value?.focus()

  const selectedIndex = filteredOptions.value.findIndex((option) => isOptionSelected(option))
  highlightedIndex.value = selectedIndex
  if (selectedIndex >= 0) scrollToIndex(selectedIndex, true)
}

// Deliberately idempotent — called from multiple paths (native blur, click-outside, Escape,
// selecting an option in single mode); the isOpen guard stops validate/emit from firing twice for
// the same event.
function closePanel(event?: FocusEvent): void {
  if (!isOpen.value) return
  isOpen.value = false
  emit('popup-hide')
  // useInput + single: revert back to the label/value of whatever is actually selected (in case
  // typing was left mid-way without picking anything) — every other mode clears back to empty as before.
  searchQuery.value = useInput && !multiple ? inputFallbackDisplayText.value : ''
  highlightedIndex.value = -1
  nextTick(() => validate())
  emit('blur', event)
}

function toggleOpen(): void {
  if (disabled || readonly) return
  if (isOpen.value) closePanel()
  else openPanel()
}

// relatedTarget landing inside the wrapper itself (e.g. focus moving to the search input on open)
// doesn't count as a real close.
function handleTriggerBlur(event: FocusEvent): void {
  const related = event.relatedTarget as Node | null
  if (related && wrapperRef.value?.contains(related)) return
  closePanel(event)
}

function emitFilter(value: string): void {
  emit(
    'filter',
    value,
    (apply) => {
      apply()
      // force: true — apply() just finished mutating the consumer's options for real, so the panel
      // needs to open and show that immediately, even if the consumer's own loading ref hasn't
      // flipped to false yet (see the comment on openPanel).
      // resetQuery: false — this panel closed on a previous selection while the input stayed focused
      // and the user kept typing/deleting until this filter round's debounce landed. Clearing
      // searchQuery on reopen would wipe what they typed even though the filtered options are based
      // on exactly that text (otherwise the input goes blank while the list shows a partial filter).
      if (!isOpen.value) openPanel(true, false)
    },
    () => {},
  )
}

// Debounce timer for handleInputChange — a plain variable, not a ref, since it never drives the template.
let filterDebounceTimer: ReturnType<typeof setTimeout> | undefined

function clearFilterDebounce(): void {
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
  filterDebounceTimer = undefined
}

// Selects all text on focus so typing immediately overwrites it, like a normal combobox (clicking an
// address bar and typing over it).
function handleInputFocus(): void {
  if (disabled || readonly) return
  openPanel()
  // openPanel() already cleared searchQuery to '' synchronously (before its first await) — fire
  // filter('') every time the panel opens, without debounce (it's not typing, no reason to wait), so
  // the consumer gets a chance to reset its own list back to the full set in case a previous search
  // had narrowed it down (covers both clicking the input directly and clicking the chevron, which
  // focuses the input too).
  if (useInput) {
    clearFilterDebounce()
    emitFilter(searchQuery.value)
  }
  nextTick(() => triggerInputRef.value?.select())
}

// @input only (not a watch on searchQuery) — avoids firing a filter event when searchQuery is set
// programmatically (syncing back to a label on close, clearing, etc.).
// Quasar-style input-debounce — delays the real fire to avoid an @filter (usually API-bound) on
// every keystroke; inputDebounce=0 fires immediately with no delay.
function handleInputChange(): void {
  if (!useInput) return
  clearFilterDebounce()

  if (inputDebounce <= 0) {
    emitFilter(searchQuery.value)
    return
  }

  const value = searchQuery.value
  filterDebounceTimer = setTimeout(() => emitFilter(value), inputDebounce)
}

// Tag-input convention (Gmail's To: field, etc.) — Backspace on a completely empty input (nothing
// typed yet) removes the last chip outright, without reaching for the × button on it. Checks
// searchQuery first so a normal Backspace while editing text doesn't also delete a chip by accident.
function handleChipBackspace(): void {
  if (searchQuery.value) return
  const lastOption = selectedOptionObjects.value[selectedOptionObjects.value.length - 1]
  if (lastOption) toggleOption(lastOption)
}

// The chevron/spinner icon (and the clear button, which already stops its own propagation) are
// siblings of <input>, not ancestors — this mousedown guard only stops it from blurring an input
// that's currently focused (e.g. panel open from the input, then clicking the chevron), without
// affecting clicks on the input itself.
function handleIconAreaMousedown(event: MouseEvent): void {
  if (useInput) event.preventDefault()
}

// Quasar-style: clicking the arrow opens/closes the panel without typing first — if closed, it just
// focuses the input, which naturally flows into handleInputFocus via the native focus event.
function handleChevronClick(): void {
  if (!useInput) return
  if (isOpen.value) closePanel()
  else triggerInputRef.value?.focus()
}

function moveHighlight(delta: number): void {
  if (!isOpen.value) {
    openPanel()
    return
  }

  const list = filteredOptions.value
  if (list.length === 0) return

  let index = highlightedIndex.value
  for (let step = 0; step < list.length; step++) {
    index = (index + delta + list.length) % list.length
    if (!list[index]!.disabled) break
  }

  highlightedIndex.value = index
  scrollToIndex(index)
}

function selectHighlighted(): void {
  if (!isOpen.value) {
    openPanel()
    return
  }

  const option = filteredOptions.value[highlightedIndex.value]
  if (option && !option.disabled) toggleOption(option)
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closePanel()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleGlobalKeydown)
    window.visualViewport?.addEventListener('resize', computePlacement)
    // Always the window/document scroll for the whole page — the distance from the trigger to the
    // viewport edge changes with real scroll, so placement must be recomputed on every scroll, not
    // just on open.
    window.addEventListener('scroll', computePlacement, { passive: true })
  } else {
    document.removeEventListener('keydown', handleGlobalKeydown)
    window.visualViewport?.removeEventListener('resize', computePlacement)
    window.removeEventListener('scroll', computePlacement)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  window.visualViewport?.removeEventListener('resize', computePlacement)
  window.removeEventListener('scroll', computePlacement)
  clearFilterDebounce()
})

// A changed search query shrinks/grows filteredOptions — reset scroll/highlight so a stale
// startIndex can't point past the new array's end.
watch(filteredOptions, () => {
  resetScroll()
  highlightedIndex.value = -1
  lastVirtualScrollTo = -1
})

// useInput + single: sync the initial/externally changed value (v-model set directly) into the input
// while the panel is closed — never touched while open, to avoid overwriting text the user is
// currently typing.
watch(
  inputFallbackDisplayText,
  (text) => {
    if (useInput && !multiple && !isOpen.value) searchQuery.value = text
  },
  { immediate: true },
)

onClickOutside(panelRef, () => closePanel(), { ignore: [triggerRef] })

function validate(): void {
  hasError.value = false
  errorMessage.value = ''

  // Accepted limitation: a comma inside an option's own value could confuse a rule that checks the
  // joined string as a substring — values are normally ids, so the risk is low.
  const valueToValidate = multiple
    ? ((Array.isArray(model.value) ? model.value : []) as SelectEntry[]).map(extractValue).join(',')
    : String(
        model.value === '' || model.value == null ? '' : extractValue(model.value as SelectEntry),
      )

  for (const rule of rules) {
    if (!rule.validator(valueToValidate)) {
      hasError.value = true
      errorMessage.value = rule.message
      emit('error', { hasError: true, message: errorMessage.value })
      return
    }
  }

  const isEmpty = multiple
    ? !Array.isArray(model.value) || model.value.length === 0
    : model.value === '' || model.value == null

  if (required && isEmpty) {
    hasError.value = true
    errorMessage.value = effectiveRequiredMessage.value
    emit('error', { hasError: true, message: errorMessage.value })
    return
  }

  emit('error', { hasError: false, message: '' })
}

defineExpose({
  hasError,
  errorMessage,
  validate,
})

watch(
  () => rules,
  () => validate(),
)

function clearError(): void {
  if (!hasError.value) return
  hasError.value = false
  errorMessage.value = ''
  emit('error', { hasError: false, message: '' })
}

// A required error means "pick one of these", so it goes once the choices behind it change or the select
// locks: a dependent select (เขต/อำเภอ after จังหวัด) is reset by its parent, and the customer has not
// had the chance to pick from the new list yet.
watch(
  () => options,
  () => clearError(),
)

watch(
  () => disabled,
  (isDisabled) => {
    if (isDisabled) clearError()
  },
)
</script>

<template>
  <div class="w-full">
    <div
      v-if="label || labelSpace"
      :id="labelId"
      class="mb-1 text-16 leading-5 font-medium text-content text-start"
      :class="{ 'min-h-[1.03em]': !label || labelSpace }"
      :style="labelStyle"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="ml-1 text-14 font-light text-danger">*</span>
    </div>

    <div ref="wrapperRef" class="relative w-full">
      <div
        ref="triggerRef"
        :tabindex="useInput || disabled ? -1 : 0"
        :role="useInput ? undefined : 'combobox'"
        :aria-haspopup="useInput ? undefined : 'listbox'"
        :aria-expanded="useInput ? undefined : isOpen"
        :aria-controls="useInput ? undefined : panelId"
        :aria-labelledby="useInput || !label ? undefined : labelId"
        :class="triggerClasses"
        :style="triggerCustomStyle"
        @click="!useInput && toggleOpen()"
        @blur="!useInput && handleTriggerBlur($event)"
        @keydown.down.prevent="!useInput && moveHighlight(1)"
        @keydown.up.prevent="!useInput && moveHighlight(-1)"
        @keydown.enter.prevent="!useInput && selectHighlighted()"
        @keydown.space.prevent="!useInput && toggleOpen()"
      >
        <!-- An icon file paints itself with its own colors, so a disabled select recolors the strokes and
             fills through .select-icon-disabled -->
        <span class="contents" :class="disabled && 'select-icon-disabled'">
          <slot name="prepend"></slot>
        </span>

        <div
          v-if="useInput && multiple && useChips"
          class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
        >
          <span
            v-for="option in selectedOptionObjects"
            :key="option.value"
            class="flex max-w-full items-center gap-1 rounded-md bg-brand-subtle py-1 pl-2 text-16 text-brand"
            :class="disabled || readonly ? 'pr-2' : 'pr-1'"
          >
            <span class="max-w-32 truncate">{{ option.label }}</span>
            <button
              v-if="!disabled && !readonly"
              type="button"
              tabindex="-1"
              class="flex shrink-0 cursor-pointer items-center"
              @mousedown.prevent
              @click.stop="toggleOption(option)"
            >
              <Svg src="common/x-close" class="size-3" color="currentColor" />
            </button>
          </span>
          <input
            ref="triggerInputRef"
            v-model="searchQuery"
            type="text"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            :aria-controls="panelId"
            :aria-labelledby="label ? labelId : undefined"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="selectedOptionObjects.length ? '' : placeholder"
            class="min-w-12 flex-1 bg-transparent text-16 font-medium outline-none placeholder:text-content-subtle disabled:placeholder:text-content-subtle disabled:cursor-not-allowed"
            @input="handleInputChange"
            @focus="handleInputFocus"
            @blur="handleTriggerBlur"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.delete="handleChipBackspace"
          />
        </div>
        <input
          v-else-if="useInput"
          ref="triggerInputRef"
          v-model="searchQuery"
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="panelId"
          :aria-labelledby="label ? labelId : undefined"
          :disabled="disabled"
          :readonly="readonly"
          :placeholder="placeholder"
          class="w-full min-w-0 flex-1 bg-transparent text-16 font-medium outline-none placeholder:text-content-subtle disabled:placeholder:text-content-subtle disabled:cursor-not-allowed"
          @input="handleInputChange"
          @focus="handleInputFocus"
          @blur="handleTriggerBlur"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
        />
        <slot
          v-else
          name="selected"
          :selected-options="selectedOptionObjects"
          :display-text="resolvedDisplayText"
        >
          <div
            v-if="multiple && useChips && selectedOptionObjects.length"
            class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          >
            <span
              v-for="option in selectedOptionObjects"
              :key="option.value"
              class="flex max-w-full items-center gap-1 rounded-md bg-brand-subtle py-1 pl-2 text-16 text-brand"
              :class="disabled || readonly ? 'pr-2' : 'pr-1'"
            >
              <span class="max-w-32 truncate">{{ option.label }}</span>
              <button
                v-if="!disabled && !readonly"
                type="button"
                tabindex="-1"
                class="flex shrink-0 cursor-pointer items-center"
                @mousedown.prevent
                @click.stop="toggleOption(option)"
              >
                <Svg src="common/x-close" class="size-3" color="currentColor" />
              </button>
            </span>
          </div>
          <span
            v-else
            class="min-w-0 flex-1 truncate text-16 font-medium"
            :class="!resolvedDisplayText && placeholderClass"
            >{{ resolvedDisplayText || placeholder }}</span
          >
        </slot>

        <slot name="append"></slot>

        <span
          class="flex shrink-0 items-center gap-1"
          :class="iconClass"
          @mousedown="handleIconAreaMousedown"
          @click="handleChevronClick"
        >
          <button
            v-if="showClearButton"
            type="button"
            tabindex="-1"
            class="flex items-center"
            @mousedown.prevent
            @click.stop="clearValue"
          >
            <Svg :src="clearIcon" class="size-4 cursor-pointer" color="currentColor" />
          </button>
          <span
            v-if="loading"
            class="size-4 animate-spin rounded-full border-2 border-border-strong border-t-content-subtle"
            aria-hidden="true"
          ></span>
          <Svg
            v-else
            :src="dropdownIcon"
            class="size-5 transition-transform duration-150"
            :class="[isOpen && 'rotate-180', !disabled && 'text-content-subtle']"
            color="currentColor"
          />
        </span>
      </div>

      <Transition name="select-panel">
        <div
          v-if="isOpen"
          :id="panelId"
          ref="panelRef"
          class="select-panel-shadow absolute z-45 w-full overflow-hidden rounded-2xl border border-border-input bg-surface"
          :class="openUpward ? 'bottom-full mb-[15px]' : 'top-full mt-[15px]'"
          :style="panelCustomStyle"
          @mousedown.prevent
        >
          <div v-if="searchable && !useInput" class="border-b border-border p-2" @mousedown.stop>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="h-9 w-full rounded-md border border-border-strong px-3 text-sm outline-none focus:border-focus"
              @keydown.down.prevent="moveHighlight(1)"
              @keydown.up.prevent="moveHighlight(-1)"
              @keydown.enter.prevent="selectHighlighted"
            />
          </div>

          <div
            v-if="filteredOptions.length === 0"
            class="p-3 text-center text-sm text-content-subtle"
          >
            <slot name="no-option">{{ loading ? loadingText : noOptionsText }}</slot>
          </div>

          <div
            v-else
            ref="panelScrollRef"
            role="listbox"
            :aria-multiselectable="multiple || undefined"
            class="overflow-y-auto py-1"
            :style="{ maxHeight: resolvedPanelMaxHeight + 'px' }"
            @scroll="onScroll"
          >
            <div :style="{ height: totalHeight + 'px', position: 'relative' }">
              <div
                class="absolute inset-x-0 top-0"
                :style="{ transform: `translateY(${offsetY}px)` }"
              >
                <div
                  v-for="entry in visibleItems"
                  :key="entry.item.value"
                  role="option"
                  :aria-selected="isOptionSelected(entry.item)"
                  :aria-disabled="entry.item.disabled || undefined"
                  :style="{ height: optionHeight + 'px' }"
                  :class="optionRowClasses(entry.item, entry.index)"
                  @click="!entry.item.disabled && toggleOption(entry.item)"
                  @mouseenter="!entry.item.disabled && (highlightedIndex = entry.index)"
                >
                  <slot
                    name="option"
                    :option="entry.item"
                    :index="entry.index"
                    :selected="isOptionSelected(entry.item)"
                    :highlighted="entry.index === highlightedIndex"
                  >
                    <span
                      v-if="multiple"
                      class="flex size-4 shrink-0 items-center justify-center rounded border"
                      :class="
                        isOptionSelected(entry.item)
                          ? 'border-brand bg-brand'
                          : 'border-border-strong bg-surface'
                      "
                    >
                      <Svg
                        v-if="isOptionSelected(entry.item)"
                        src="common/check"
                        class="size-3 text-content-inverted"
                      />
                    </span>

                    <span class="flex-1 truncate">{{ entry.item.label }}</span>
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div
      v-if="hasError && errorMessage"
      class="mt-2 text-start text-14 font-light text-danger-input duration-150 animate-[slideIn_0.15s_ease-out_forwards]"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="helperText"
      class="mt-2 text-start text-14 font-light text-content-subtle duration-150 animate-[fadeIn_0.1s_ease-out_forwards]"
    >
      {{ helperText }}
    </div>
  </div>
</template>

<style scoped>
.select-icon-disabled :deep([stroke]:not([stroke='none'])) {
  stroke: var(--color-content-subtle);
}

.select-icon-disabled :deep([fill]:not([fill='none'])) {
  fill: var(--color-content-subtle);
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

.select-custom-border {
  border-color: var(--select-border-color, var(--color-border-input));
}

.select-custom-border:hover {
  border-color: var(--select-border-color, var(--color-border-input));
}

.select-trigger-open {
  border-color: var(
    --select-focus-color,
    var(--select-border-color, var(--color-border-focus-input))
  );
}

.select-panel-shadow {
  box-shadow: var(--shadow-popup);
}

/* --select-option-*-color come from customStyle via panelCustomStyle — fall back to the defaults
   below when not set. */
.select-option-row:hover {
  background-color: var(--select-option-hover-color, var(--color-select-option-hover));
}

.select-option-highlighted {
  background-color: var(--select-option-hover-color, var(--color-select-option-hover));
}

.select-option-selected {
  background-color: var(--select-option-selected-color, var(--color-select-option-selected));
  color: var(--select-option-selected-text-color, var(--color-content));
}

.select-panel-enter-active,
.select-panel-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.select-panel-enter-from,
.select-panel-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
