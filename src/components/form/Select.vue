<template>
  <div class="w-full">
    <div
      v-if="label || labelSpace"
      class="mb-1.5 min-h-[1.5em] text-14 font-bold text-gray-900"
      :style="labelStyle"
    >
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="ml-1 text-error-1"
        >*</span
      >
    </div>

    <div
      ref="wrapperRef"
      class="relative w-full"
    >
      <div
        ref="triggerRef"
        :tabindex="useInput || disabled ? -1 : 0"
        :role="useInput ? undefined : 'combobox'"
        :aria-haspopup="useInput ? undefined : 'listbox'"
        :aria-expanded="useInput ? undefined : isOpen"
        :aria-controls="useInput ? undefined : panelId"
        :class="triggerClasses"
        :style="triggerCustomStyle"
        @click="!useInput && toggleOpen()"
        @blur="!useInput && handleTriggerBlur($event)"
        @keydown.down.prevent="!useInput && moveHighlight(1)"
        @keydown.up.prevent="!useInput && moveHighlight(-1)"
        @keydown.enter.prevent="!useInput && selectHighlighted()"
        @keydown.space.prevent="!useInput && toggleOpen()"
      >
        <input
          v-if="useInput"
          ref="triggerInputRef"
          v-model="searchQuery"
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="panelId"
          :disabled="disabled"
          :readonly="readonly"
          :placeholder="placeholder"
          class="w-full min-w-0 flex-1 bg-transparent text-17 outline-none placeholder:text-gray-500 disabled:cursor-not-allowed"
          @input="handleInputChange"
          @focus="handleInputFocus"
          @blur="handleTriggerBlur"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
        />
        <span
          v-else
          class="flex-1 truncate text-17"
          :class="!resolvedDisplayText && 'text-gray-500'"
          >{{ resolvedDisplayText || placeholder }}</span
        >

        <span
          class="flex shrink-0 items-center gap-1"
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
            <Svg
              src="common/x-close"
              class="size-4 cursor-pointer"
              color="black"
            />
          </button>
          <span
            v-if="loading"
            class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
            aria-hidden="true"
          ></span>
          <Svg
            v-else
            src="common/chevron-down"
            class="size-4 transition-transform duration-150"
            :class="isOpen && 'rotate-180'"
            color="black"
          />
        </span>
      </div>

      <Transition name="select-panel">
        <div
          v-if="isOpen"
          :id="panelId"
          ref="panelRef"
          class="select-panel-shadow absolute z-45 w-full rounded-lg border border-gray-300 bg-white"
          :class="openUpward ? 'bottom-full mb-1' : 'top-full mt-1'"
          :style="panelCustomStyle"
          @mousedown.prevent
        >
          <div
            v-if="searchable && !useInput"
            class="border-b border-gray-100 p-2"
            @mousedown.stop
          >
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="h-9 w-full rounded-md border border-gray-300 px-3 text-16 outline-none focus:border-main-1"
              @keydown.down.prevent="moveHighlight(1)"
              @keydown.up.prevent="moveHighlight(-1)"
              @keydown.enter.prevent="selectHighlighted"
            />
          </div>

          <div
            v-if="filteredOptions.length === 0"
            class="p-3 text-center text-16 text-gray-500"
          >
            {{ loading ? loadingText : noOptionsText }}
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
                          ? 'border-main-1 bg-main-1'
                          : 'border-gray-300 bg-white'
                      "
                    >
                      <Svg
                        v-if="isOptionSelected(entry.item)"
                        src="common/check"
                        class="size-3"
                        color="white"
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
      class="mt-1 text-16 font-light text-error-1 duration-150 animate-[slideIn_0.15s_ease-out_forwards]"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="helperText"
      class="mt-1 text-16 font-light text-gray-500 duration-150 animate-[fadeIn_0.1s_ease-out_forwards]"
    >
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onClickOutside, useResizeObserver } from '@vueuse/core'

  export interface ISelectOption {
    label: string
    value: string | number
    disabled?: boolean
  }

  type RoundedPreset = 'none' | 'sm' | 'md' | 'lg' | 'full'

  interface SelectCustomStyle {
    // ค่าเดียว ไม่คุมทีละมุมเหมือน TextField — เกินความจำเป็นสำหรับ Select
    rounded?: RoundedPreset | string
    bgColor?: string
    labelColor?: string
    textColor?: string
    borderColor?: string
    focusColor?: string
    // สี background ตอน hover เมาส์/ไล่ด้วย arrow key บน option แถวหนึ่ง (ไม่มีผลตอน option.disabled)
    optionHoverColor?: string
    // สี background ของแถวที่ถูกเลือกอยู่ใน panel
    optionSelectedColor?: string
    // สีตัวอักษรของแถวที่ถูกเลือกอยู่ใน panel
    optionSelectedTextColor?: string
  }

  // emitValue=true (default): v-model เป็นค่า value เดี่ยว/array — emitValue=false: v-model เป็น option object เต็มๆ/array ของมัน
  // mapOptions คุมว่าจะ resolve ค่าดิบกลับเป็น label ให้แสดงผลไหม (มีผลเฉพาะตอน emitValue=true — ตอน emitValue=false model มี label ติดมาอยู่แล้ว ไม่ต้อง resolve)
  type SelectValue = string | number | ISelectOption | (string | number)[] | ISelectOption[]

  interface Props {
    label?: string
    labelSpace?: boolean
    placeholder?: string
    helperText?: string
    rules?: IValidationRule[]
    options: ISelectOption[]
    disabled?: boolean
    readonly?: boolean
    // แสดง spinner แทน chevron และกันเปิด panel ไว้ก่อน (เช่น ระหว่างรอ options โหลดจาก API) — ไม่ทำให้ trigger เทาเหมือน disabled
    loading?: boolean
    required?: boolean
    clearable?: boolean
    multiple?: boolean
    searchable?: boolean
    // แบบ Quasar's use-input — trigger กลายเป็น <input> พิมพ์ได้ตรงๆ แทนกล่อง search แยกใน panel (ปิด searchable box อัตโนมัติถ้าเปิดคู่กัน)
    // ไม่ทำ local filter ให้เองเหมือน searchable — ต้องฟัง @filter แล้ว mutate options ที่ผูกไว้เองเสมอ ไม่งั้นพิมพ์แล้วลิสต์ไม่กรอง (ของจริงตาม Quasar)
    useInput?: boolean
    // แบบ Quasar's input-debounce — หน่วงก่อนยิง @filter ตอนพิมพ์ (ms) กัน API ยิงรัวทุกตัวอักษร — 0 = ไม่หน่วงเลย ยิงทันที (ไม่มีผลตอน useInput=false)
    inputDebounce?: number
    // ข้อความตอน filteredOptions ว่างเปล่า "ระหว่าง" loading=true (เช่น รอ @filter แบบ async ตอบ) แยกจาก noOptionsText ที่ใช้ตอนค้นจริงแล้วไม่เจอ
    loadingText?: string
    // true (default) = v-model ได้ ISelectOption['value'] เดี่ยว/array, false = v-model ได้ ISelectOption เต็มๆ/array ของมัน
    emitValue?: boolean
    // แบบ Quasar's map-options — true (default) = resolve label จาก options มาโชว์ที่ trigger, false = โชว์ค่าดิบใน model.value ตรงๆ (มีผลเฉพาะตอน emitValue=true)
    mapOptions?: boolean
    // แบบ Quasar's display-value — ทับข้อความที่ trigger โชว์ตรงๆ ไม่ว่า selectedLabels จะคำนวณออกมาเป็นอะไร (ไม่กระทบ v-model/selection logic เลย) ปล่อยว่างไว้ = ใช้ label ที่ resolve จาก options ตามปกติ
    displayValue?: string
    // px ต่อแถว — ใช้คำนวณ virtual-scroll ด้วย ต้องตรงกับความสูงจริงของแถว (label ต้อง truncate ห้าม wrap)
    optionHeight?: number
    maxPanelHeight?: number
    noOptionsText?: string
    searchPlaceholder?: string
    customStyle?: SelectCustomStyle
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    labelSpace: false,
    placeholder: '',
    helperText: '',
    rules: () => [],
    disabled: false,
    readonly: false,
    loading: false,
    required: false,
    clearable: false,
    multiple: false,
    searchable: false,
    useInput: false,
    inputDebounce: 500,
    loadingText: 'กำลังค้นหา...',
    emitValue: true,
    mapOptions: true,
    displayValue: '',
    optionHeight: 44,
    maxPanelHeight: 280,
    noOptionsText: 'ไม่พบข้อมูล',
    searchPlaceholder: 'ค้นหา',
    customStyle: () => ({}),
  })

  const emit = defineEmits<{
    error: [error: { hasError: boolean; message: string }]
    // ไม่มี FocusEvent จริงเสมอไป — มีค่าจริงเฉพาะตอน blur จริงจาก trigger, path ปิดแบบอื่น (Escape/click นอก/เลือกใน single mode) ส่ง undefined
    blur: [event?: FocusEvent]
    // แบบ Quasar's @filter — ยิงเฉพาะตอน useInput=true ทุกครั้งที่พิมพ์ ต้องเรียก update() พร้อม callback ที่ mutate options ref ของตัวเอง (sync หรือ async หลัง fetch ก็ได้) ถึงจะเห็นผล ไม่เรียก = list ไม่กรองเลย
    filter: [value: string, update: (apply: () => void) => void, abort: () => void]
  }>()

  const model = defineModel<SelectValue>({ required: true })

  const wrapperRef = ref<HTMLElement>()
  const triggerRef = ref<HTMLElement>()
  const triggerInputRef = ref<HTMLInputElement>()
  const panelRef = ref<HTMLElement>()
  const panelScrollRef = ref<HTMLElement>()
  const searchInputRef = ref<HTMLInputElement>()

  const panelId = `select-panel-${useId()}`

  const isOpen = ref(false)
  const searchQuery = ref('')
  const highlightedIndex = ref(-1)
  const openUpward = ref(false)
  const resolvedPanelMaxHeight = ref(props.maxPanelHeight)

  const hasError = ref(false)
  const errorMessage = ref('')

  interface UseVirtualListOptions {
    itemHeight: number
    overscan?: number
  }

  interface VirtualListEntry<T> {
    item: T
    index: number
  }

  // Fixed-height virtual scroll: windows a long list down to only the rows near the visible
  // area of `containerRef`, using translateY on a spacer div (see totalHeight/offsetY) to fake
  // full-list scroll height. Rows MUST render at a constant `itemHeight` (no wrapping) or the
  // windowing math goes wrong. No on/off threshold — for a short list containerHeight already
  // covers the whole thing, so it naturally renders everything. Local to Select — no other
  // component needs it, so it stays inline instead of its own composable file.
  function useVirtualList<T>(
    items: Ref<T[]> | ComputedRef<T[]>,
    containerRef: Ref<HTMLElement | undefined>,
    options: UseVirtualListOptions
  ) {
    const itemHeight = options.itemHeight
    const overscan = options.overscan ?? 4

    const scrollTop = ref(0)
    const containerHeight = ref(0)

    // containerRef is usually only mounted behind a v-if (e.g. a dropdown panel), so its first
    // ResizeObserver callback fires a frame late — measure synchronously as soon as it appears too.
    const measureContainer = (): void => {
      if (containerRef.value)
        containerHeight.value = containerRef.value.getBoundingClientRect().height
    }

    watch(containerRef, el => {
      if (el) nextTick(measureContainer)
    })

    useResizeObserver(containerRef, entries => {
      containerHeight.value = entries[0]?.contentRect.height ?? 0
    })

    const startIndex = computed(() =>
      Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    )

    const visibleCount = computed(
      () => Math.ceil(containerHeight.value / itemHeight) + overscan * 2
    )

    const endIndex = computed(() =>
      Math.min(items.value.length, startIndex.value + visibleCount.value)
    )

    const visibleItems = computed<VirtualListEntry<T>[]>(() =>
      items.value
        .slice(startIndex.value, endIndex.value)
        .map((item, i) => ({ item, index: startIndex.value + i }))
    )

    const totalHeight = computed(() => items.value.length * itemHeight)
    const offsetY = computed(() => startIndex.value * itemHeight)

    const onScroll = (event: Event): void => {
      scrollTop.value = (event.target as HTMLElement).scrollTop
    }

    // call when the underlying item list shrinks (e.g. a search query narrows it) so a stale
    // scrollTop from the longer list can't leave startIndex pointing past the new array's end
    const resetScroll = (): void => {
      scrollTop.value = 0
      if (containerRef.value) containerRef.value.scrollTop = 0
    }

    const scrollToIndex = (index: number): void => {
      const el = containerRef.value
      if (!el || index < 0) return

      measureContainer()
      const itemTop = index * itemHeight
      const itemBottom = itemTop + itemHeight

      if (itemTop < el.scrollTop) {
        el.scrollTop = itemTop
      } else if (itemBottom > el.scrollTop + el.clientHeight) {
        el.scrollTop = itemBottom - el.clientHeight
      }
      scrollTop.value = el.scrollTop
    }

    return { visibleItems, totalHeight, offsetY, onScroll, scrollToIndex, resetScroll }
  }

  const filteredOptions = computed<ISelectOption[]>(() => {
    // useInput ไม่ filter เอง — รอ parent กรอง options ที่ผูกไว้เองผ่าน @filter (เหมือน Quasar use-input+filter)
    if (props.useInput) return props.options
    if (!props.searchable || !searchQuery.value.trim()) return props.options
    const query = searchQuery.value.trim().toLowerCase()
    return props.options.filter(option => option.label.toLowerCase().includes(query))
  })

  const { visibleItems, totalHeight, offsetY, onScroll, scrollToIndex, resetScroll } =
    useVirtualList(filteredOptions, panelScrollRef, { itemHeight: props.optionHeight })

  // entry ดิบที่อาจเจอใน model.value ทีละตัว — scalar ตอน emitValue=true, ISelectOption เต็มๆ ตอน emitValue=false
  type SelectEntry = string | number | ISelectOption

  const extractValue = (entry: SelectEntry): string | number =>
    typeof entry === 'object' ? entry.value : entry

  const selectedValueSet = computed(() => {
    if (props.multiple) {
      const entries = (Array.isArray(model.value) ? model.value : []) as SelectEntry[]
      return new Set(entries.map(extractValue))
    }
    if (model.value === '' || model.value == null) return new Set<string | number>()
    return new Set([extractValue(model.value as SelectEntry)])
  })

  const isOptionSelected = (option: ISelectOption): boolean =>
    selectedValueSet.value.has(option.value)

  // ปลอดภัยกรณี lookup-miss (ค่าที่เลือกไว้ไม่มีอยู่ใน options แล้ว เช่น options โหลดมาใหม่แบบ async) — ข้ามเงียบๆ แทนที่จะโชว์ undefined
  // label ถูก resolve จาก props.options สดใหม่เสมอ ไม่ได้อ่านจาก entry ของ model.value ตรงๆ แม้ตอน emitValue=false — กัน label ค้างถ้า options เปลี่ยนแต่ object ใน model.value ยังเป็นก้อนเดิม
  const selectedLabels = computed<string[]>(() => {
    const entries: SelectEntry[] = props.multiple
      ? ((Array.isArray(model.value) ? model.value : []) as SelectEntry[])
      : model.value === '' || model.value == null
        ? []
        : [model.value as SelectEntry]

    return entries
      .map(entry => {
        // ได้ object เต็มๆ อยู่แล้ว (emitValue=false) — ใช้ label ของมันตรงๆ เสมอ ไม่ต้อง resolve
        if (typeof entry === 'object') return entry.label
        // scalar (emitValue=true) — resolve เป็น label จาก options ถ้าเปิด mapOptions ไม่งั้นโชว์ค่าดิบตรงๆ (เหมือน Quasar emit-value ที่ไม่เปิด map-options)
        if (!props.mapOptions) return String(entry)
        return props.options.find(option => option.value === entry)?.label
      })
      .filter((label): label is string => !!label)
  })

  const resolvedDisplayText = computed(() => props.displayValue || selectedLabels.value.join(', '))

  // ใช้เฉพาะ sync ข้อความกลับเข้า <input> ตอน useInput+single — ถ้า resolve label ไม่ได้ (เช่น พิมพ์กรอง options จนไม่เหลือตัวที่เลือกไว้แล้ว) โชว์ค่าดิบแทน ดีกว่าโชว์ว่างเปล่าทำให้ดูเหมือนค่าหาย ทั้งที่ model.value ยังมีค่าอยู่จริง
  const inputFallbackDisplayText = computed(() => {
    if (resolvedDisplayText.value) return resolvedDisplayText.value
    if (model.value === '' || model.value == null) return ''
    return String(extractValue(model.value as SelectEntry))
  })

  const showClearButton = computed(
    () => props.clearable && !props.disabled && !props.readonly && selectedLabels.value.length > 0
  )

  const ROUNDED_CLASS_MAP: Record<RoundedPreset, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  const isRoundedKeyword = (value: string): value is RoundedPreset => value in ROUNDED_CLASS_MAP

  const roundedClass = computed(() => {
    const rounded = props.customStyle.rounded ?? 'lg'
    return isRoundedKeyword(rounded) ? ROUNDED_CLASS_MAP[rounded] : ''
  })

  const DEFAULT_STATE_CLASSES = ['select-custom-border', 'bg-white', 'text-gray-900']
  const ERROR_STATE_CLASSES = ['border-error-1', 'bg-error-2', 'text-error-1']
  const DISABLED_STATE_CLASSES = ['border-gray-300', 'bg-gray-100', 'text-gray-400']

  const triggerStateClasses = computed(() => {
    if (props.disabled) return DISABLED_STATE_CLASSES
    if (hasError.value) return ERROR_STATE_CLASSES
    return DEFAULT_STATE_CLASSES
  })

  const triggerClasses = computed(() => [
    'box-border flex h-12 w-full min-w-0 items-center justify-between gap-2 border px-4 outline-none transition-colors duration-150',
    roundedClass.value,
    triggerStateClasses.value,
    isOpen.value &&
      !props.disabled &&
      !hasError.value &&
      'select-trigger-open ring-2 ring-main-1/20',
    props.disabled || props.readonly || props.loading ? 'cursor-not-allowed' : 'cursor-pointer',
  ])

  const triggerCustomStyle = computed(() => {
    const style: Record<string, string> = {}
    if (!isRoundedKeyword(props.customStyle.rounded ?? 'lg')) {
      style.borderRadius = props.customStyle.rounded ?? 'lg'
    }
    if (!props.disabled) {
      if (props.customStyle.bgColor) style.backgroundColor = props.customStyle.bgColor
      if (props.customStyle.textColor) style.color = props.customStyle.textColor
      if (props.customStyle.borderColor)
        style['--select-border-color'] = props.customStyle.borderColor
      if (props.customStyle.focusColor) style['--select-focus-color'] = props.customStyle.focusColor
    }
    return style
  })

  const labelStyle = computed(() =>
    props.customStyle.labelColor ? { color: props.customStyle.labelColor } : undefined
  )

  const panelCustomStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.customStyle.optionHoverColor)
      style['--select-option-hover-color'] = props.customStyle.optionHoverColor
    if (props.customStyle.optionSelectedColor)
      style['--select-option-selected-color'] = props.customStyle.optionSelectedColor
    if (props.customStyle.optionSelectedTextColor)
      style['--select-option-selected-text-color'] = props.customStyle.optionSelectedTextColor
    return style
  })

  const optionRowClasses = (option: ISelectOption, index: number) => [
    'flex items-center gap-2 px-3 text-16',
    option.disabled ? 'cursor-not-allowed text-gray-400' : 'select-option-row cursor-pointer text-gray-900',
    !option.disabled && isOptionSelected(option) && 'select-option-selected font-bold',
    !option.disabled && index === highlightedIndex.value && 'select-option-highlighted',
  ]

  const toggleOption = (option: ISelectOption): void => {
    if (option.disabled) return

    const entry: SelectEntry = props.emitValue ? option.value : option

    if (props.multiple) {
      const current = (Array.isArray(model.value) ? model.value : []) as SelectEntry[]
      const alreadySelected = current.some(item => extractValue(item) === option.value)
      model.value = (
        alreadySelected
          ? current.filter(item => extractValue(item) !== option.value)
          : [...current, entry]
      ) as SelectValue
      // เคลียร์คำค้นให้พิมพ์คำถัดไปต่อได้เลย — multiple ไม่มีที่โชว์รายการที่เลือกไว้ในตัว input (ไม่ทำ chips) เลยไม่ sync กลับเป็น label เหมือน single
      // ยิง filter('') ด้วย (เหมือน focus/clear) ให้ consumer reset list กลับเป็นชุดเต็ม ไม่งั้นเลือกแล้ว panel ยังค้างโชว์แค่ผลกรองรอบก่อน
      if (props.useInput) {
        searchQuery.value = ''
        clearFilterDebounce()
        emitFilter('')
      }
      return
    }

    model.value = entry as SelectValue
    closePanel()
  }

  const clearValue = (): void => {
    model.value = props.multiple ? [] : ''
    if (props.useInput) {
      searchQuery.value = ''
      // ล้าง debounce ที่ค้างไว้ก่อน กันคำค้นเก่ามาทับ list ที่เพิ่ง reset ไปแล้วจากปุ่มนี้
      clearFilterDebounce()
      emitFilter('')
    }
    validate()
  }

  const computePlacement = (): void => {
    const trigger = triggerRef.value
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const margin = 8
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceBelow < props.maxPanelHeight && spaceAbove > spaceBelow) {
      openUpward.value = true
      resolvedPanelMaxHeight.value = Math.max(
        120,
        Math.min(props.maxPanelHeight, spaceAbove - margin)
      )
    } else {
      openUpward.value = false
      resolvedPanelMaxHeight.value = Math.max(
        120,
        Math.min(props.maxPanelHeight, spaceBelow - margin)
      )
    }
  }

  // force=true ข้าม guard ของ props.loading (ไม่ข้าม isOpen) — ใช้ตอนเปิดจาก update() ของ @filter เท่านั้น เพราะตอนนั้น
  // apply() (ที่ mutate options ของ consumer) รันไปแล้วจริงๆ options พร้อมแล้ว แต่ props.loading (ref ฝั่ง consumer เอง
  // เช่น filterLoading) มักยังไม่ทันเป็น false เพราะ finally ของ async function เขายังไม่ถึงรอบ — ถ้าไม่ข้าม panel จะไม่เปิดเลย
  const openPanel = async (force = false): Promise<void> => {
    // loading ไม่ล็อก trigger เหมือน disabled (ยัง focus/tab ได้) แค่กันเปิด panel ที่ options ยังไม่มาก่อน
    if (isOpen.value || (props.loading && !force)) return
    isOpen.value = true
    searchQuery.value = ''

    await nextTick()
    computePlacement()

    if (props.searchable && !props.useInput) searchInputRef.value?.focus()

    const selectedIndex = filteredOptions.value.findIndex(option => isOptionSelected(option))
    highlightedIndex.value = selectedIndex
    if (selectedIndex >= 0) scrollToIndex(selectedIndex)
  }

  // idempotent โดยตั้งใจ — เรียกซ้ำได้จากหลายทาง (native blur, click-outside, Escape, เลือก option ใน single mode)
  // ไกด์ isOpen กันไม่ให้ validate/emit ซ้ำสองครั้งจากเหตุการณ์เดียวกัน
  const closePanel = (event?: FocusEvent): void => {
    if (!isOpen.value) return
    isOpen.value = false
    // useInput + single: กลับไปโชว์ label/ค่าของสิ่งที่เลือกไว้จริง (เผื่อพิมพ์ค้างแล้วไม่ได้เลือกอะไรก็ revert กลับ) — โหมดอื่นเคลียร์เป็นค่าว่างเหมือนเดิม
    searchQuery.value = props.useInput && !props.multiple ? inputFallbackDisplayText.value : ''
    highlightedIndex.value = -1
    validate()
    emit('blur', event)
  }

  const toggleOpen = (): void => {
    if (props.disabled || props.readonly) return
    if (isOpen.value) closePanel()
    else openPanel()
  }

  // relatedTarget อยู่ใน wrapper เอง (เช่น โฟกัสย้ายไป search input ตอนเปิด) ไม่ถือเป็นการปิดจริง
  const handleTriggerBlur = (event: FocusEvent): void => {
    const related = event.relatedTarget as Node | null
    if (related && wrapperRef.value?.contains(related)) return
    closePanel(event)
  }

  const emitFilter = (value: string): void => {
    emit(
      'filter',
      value,
      apply => {
        apply()
        // force: true — ตอนนี้ apply() เพิ่ง mutate options ของ consumer เสร็จจริงๆ ต้องเปิดให้เห็นผลทันที
        // ต่อให้ props.loading (ref ฝั่ง consumer) ยังไม่ทันเป็น false ก็ตาม (ดูคอมเมนต์ที่ openPanel)
        if (!isOpen.value) openPanel(true)
      },
      () => {}
    )
  }

  // จับเวลา debounce ของ handleInputChange — ตัวแปรธรรมดา ไม่ใช่ ref เพราะไม่ต้องขับ template
  let filterDebounceTimer: ReturnType<typeof setTimeout> | undefined

  const clearFilterDebounce = (): void => {
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
    filterDebounceTimer = undefined
  }

  // เลือก text ทั้งหมดตอน focus ให้พิมพ์ทับได้ทันที เหมือน combobox ทั่วไป (คลิก address bar แล้วพิมพ์ทับ)
  const handleInputFocus = (): void => {
    if (props.disabled || props.readonly) return
    openPanel()
    // searchQuery ถูก openPanel() เคลียร์เป็น '' ไปแล้ว (synchronous ก่อน await แรก) — ยิง filter('') ทุกครั้งที่เปิด แบบไม่หน่วง (ไม่ใช่พิมพ์ ไม่มีเหตุผลต้องรอ)
    // ให้ consumer มีโอกาส reset list ของตัวเองกลับเป็นชุดเต็ม เผื่อรอบก่อนพิมพ์ค้างไว้จนกรองเหลือน้อย (ครอบคลุมทั้งคลิก input ตรงๆ และคลิกไอคอน chevron ที่ focus() ให้ input ต่อ)
    if (props.useInput) {
      clearFilterDebounce()
      emitFilter(searchQuery.value)
    }
    nextTick(() => triggerInputRef.value?.select())
  }

  // @input เท่านั้น (ไม่ใช่ watch(searchQuery)) — กันไม่ให้ยิง filter event ตอนโปรแกรมเซ็ต searchQuery เอง (sync กลับเป็น label ตอนปิด panel, clear ฯลฯ)
  // แบบ Quasar's input-debounce — หน่วงก่อนยิงจริง กันพิมพ์รัวแล้ว @filter (มักผูกกับ API) ทำงานทุกตัวอักษร — inputDebounce=0 ยิงทันทีไม่หน่วง
  const handleInputChange = (): void => {
    if (!props.useInput) return
    clearFilterDebounce()

    if (props.inputDebounce <= 0) {
      emitFilter(searchQuery.value)
      return
    }

    const value = searchQuery.value
    filterDebounceTimer = setTimeout(() => emitFilter(value), props.inputDebounce)
  }

  // ไอคอน chevron/spinner (และปุ่ม clear ที่ stop propagation ของตัวเองอยู่แล้ว) เป็น sibling ของ <input> ไม่ใช่ ancestor
  // — กัน mousedown แค่ตรงนี้ไม่ให้ blur input ที่กำลัง focus อยู่ (เช่น panel เปิดจาก input แล้วมาคลิก chevron) โดยไม่กระทบการคลิก input เองเลย
  const handleIconAreaMousedown = (event: MouseEvent): void => {
    if (props.useInput) event.preventDefault()
  }

  // แบบ Quasar: คลิกลูกศรเปิด/ปิด panel ได้โดยไม่ต้องพิมพ์ก่อน — ปิดอยู่ก็ focus() ให้ input เอง (เข้า handleInputFocus ต่อเองผ่าน native focus event)
  const handleChevronClick = (): void => {
    if (!props.useInput) return
    if (isOpen.value) closePanel()
    else triggerInputRef.value?.focus()
  }

  const moveHighlight = (delta: number): void => {
    if (!isOpen.value) {
      openPanel()
      return
    }

    const list = filteredOptions.value
    if (list.length === 0) return

    let index = highlightedIndex.value
    for (let step = 0; step < list.length; step++) {
      index = (index + delta + list.length) % list.length
      if (!list[index].disabled) break
    }

    highlightedIndex.value = index
    scrollToIndex(index)
  }

  const selectHighlighted = (): void => {
    if (!isOpen.value) {
      openPanel()
      return
    }

    const option = filteredOptions.value[highlightedIndex.value]
    if (option && !option.disabled) toggleOption(option)
  }

  const handleGlobalKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closePanel()
  }

  watch(isOpen, open => {
    if (open) {
      document.addEventListener('keydown', handleGlobalKeydown)
      window.visualViewport?.addEventListener('resize', computePlacement)
      // ทั้งหน้า scroll ที่ window/document เสมอ (ดู CLAUDE.md) — ระยะห่างจาก trigger ถึงขอบจอเปลี่ยนตาม scroll จริง ต้องคำนวณ flip ใหม่ทุกครั้ง ไม่ใช่แค่ตอนเปิด
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

  // คำค้นหาเปลี่ยนทำให้ filteredOptions สั้นลง/ยาวขึ้น — รีเซ็ต scroll/highlight กัน startIndex ค้างเกินขอบ array ใหม่
  watch(filteredOptions, () => {
    resetScroll()
    highlightedIndex.value = -1
  })

  // useInput + single: sync ค่าเริ่มต้น/ค่าที่เปลี่ยนจากภายนอก (v-model ถูกเซ็ตตรงๆ) เข้า input ตอน panel ปิดอยู่ — ไม่แตะระหว่างเปิด กันไปทับข้อความที่ผู้ใช้กำลังพิมพ์อยู่
  watch(
    inputFallbackDisplayText,
    text => {
      if (props.useInput && !props.multiple && !isOpen.value) searchQuery.value = text
    },
    { immediate: true }
  )

  onClickOutside(panelRef, () => closePanel(), { ignore: [triggerRef] })

  const validate = (): void => {
    hasError.value = false
    errorMessage.value = ''

    // ข้อจำกัดที่ยอมรับ: comma ในค่า value ของ option เองจะทำให้ rule ที่เช็คแบบ substring บน string ที่ join แล้วผิดเพี้ยนได้ — value ปกติเป็น id ความเสี่ยงต่ำ
    const valueToValidate = props.multiple
      ? ((Array.isArray(model.value) ? model.value : []) as SelectEntry[])
          .map(extractValue)
          .join(',')
      : String(
          model.value === '' || model.value == null ? '' : extractValue(model.value as SelectEntry)
        )

    for (const rule of props.rules) {
      if (!rule.validator(valueToValidate)) {
        hasError.value = true
        errorMessage.value = rule.message
        emit('error', { hasError: true, message: errorMessage.value })
        return
      }
    }

    const isEmpty = props.multiple
      ? !Array.isArray(model.value) || model.value.length === 0
      : model.value === '' || model.value == null

    if (props.required && isEmpty) {
      hasError.value = true
      errorMessage.value = props.label ? `กรุณาเลือก${props.label}` : 'กรุณาเลือกข้อมูล'
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
    () => props.rules,
    () => validate()
  )
</script>

<style scoped lang="scss">
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
    border-color: var(--select-border-color, var(--color-gray-300));
  }

  .select-custom-border:hover {
    border-color: var(--select-border-color, var(--color-gray-400));
  }

  .select-trigger-open {
    border-color: var(--select-focus-color, var(--select-border-color, var(--color-main-1)));
  }

  .select-panel-shadow {
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  // --select-option-*-color มาจาก customStyle ผ่าน panelCustomStyle — ไม่ตั้งไว้ก็ fallback เป็นค่า default เดิม
  .select-option-row:hover {
    background-color: var(--select-option-hover-color, var(--color-gray-100));
  }

  .select-option-highlighted {
    background-color: var(--select-option-hover-color, var(--color-gray-100));
  }

  .select-option-selected {
    background-color: var(
      --select-option-selected-color,
      color-mix(in srgb, var(--color-main-1) 5%, transparent)
    );
    color: var(--select-option-selected-text-color, var(--color-main-1));
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
