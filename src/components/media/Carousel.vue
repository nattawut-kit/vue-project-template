<template>
  <!-- carousel/slide roledescription ตาม APG carousel pattern — ไม่ใช้ tab/tabpanel เพราะโหมด peek
       มีหลายสไลด์โผล่พร้อมกัน ผิดความหมายของ tab ที่ต้องเห็นทีละ panel -->
  <div
    class="carousel w-full box-border"
    role="group"
    aria-roledescription="carousel"
    :aria-label="ariaLabel"
  >
    <div
      class="relative w-full overflow-visible"
      :style="{ aspectRatio }"
    >
      <div
        ref="sliderRef"
        class="slider-container flex h-full w-full cursor-grab select-none transition-transform duration-500 ease-out"
        :style="sliderStyle"
        @mousedown="handleMouseDown"
        @dragstart.prevent
      >
        <!-- โหมด infinity จะมี clone ของใบท้าย/ใบแรกขนาบอยู่ ซ่อนจาก screen reader ไว้ไม่ให้อ่านซ้ำ -->
        <div
          v-for="(slide, position) in renderedSlides"
          :key="position"
          class="box-border flex-shrink-0"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${slide.realIndex + 1} จาก ${items.length}`"
          :aria-hidden="isInfinite && (position === 0 || position === renderedSlides.length - 1)"
          :style="slideStyle"
          @click="handleClick(slide.item, slide.realIndex)"
        >
          <div
            class="box-border h-full w-full overflow-hidden transition-all duration-300 ease-out"
            :class="[
              roundClass,
              // ระหว่างลากต้องถอย cursor-pointer ออก ไม่งั้นมันทับ cursor-grab ของ track (ลูกชนะพ่อ)
              // ทำให้ลากอยู่แต่เคอร์เซอร์ยังเป็นนิ้วชี้
              clickable && !isDragging && 'cursor-pointer',
              slide.realIndex === currentSlide ? 'scale-100 opacity-100' : 'scale-100 opacity-60',
            ]"
            :style="customRoundStyle"
          >
            <slot
              :item="slide.item"
              :index="slide.realIndex"
              :active="slide.realIndex === currentSlide"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- slot แทนที่บล็อก indicator ทั้งก้อน (เหลือไว้แค่ตัวคุมตำแหน่ง) เพื่อให้ custom nav
         จัด layout เองได้เต็มที่ — ไม่ใส่ก็ได้จุดแบบ default ตามเดิม
         indicatorsInside: ทับบนรูปด้วย absolute — อ้างอิง .carousel ที่เป็น relative อยู่แล้ว
         และพอหลุด flow ความสูง root จะเท่าพื้นที่รูปพอดี จุดเลยไปเกาะขอบล่างของรูปตรงๆ -->
    <div
      v-if="showIndicators && items.length > 1"
      :class="indicatorsWrapperClass"
      :style="indicatorsInsideStyle"
    >
      <slot
        name="indicators"
        :current="currentSlide"
        :count="slidesCount"
        :select="goToSlide"
        :next="goNext"
        :prev="goPrev"
        :first="currentSlide === 0"
        :last="currentSlide === slidesCount - 1"
      >
        <div
          class="flex flex-wrap items-center justify-center gap-1"
          :class="[
            isIndicatorsVertical ? 'flex-col py-2' : 'px-2',
            indicatorsInsideConfig ? '' : 'mt-2',
          ]"
        >
          <!-- ต้องเป็น <button> จริง ไม่ใช่ div+@click — ไม่งั้น Tab ไม่ติด กดคีย์บอร์ดไม่ได้
               และ screen reader ไม่อ่านว่าเป็นปุ่ม
               แนวตั้งสลับแกนของ pill: ตัว active ยืดตามแนวที่จุดเรียงกัน (แนวนอนยืดกว้าง แนวตั้งยืดสูง) -->
          <button
            v-for="(_, index) in items"
            :key="index"
            type="button"
            class="flex-shrink-0 cursor-pointer rounded p-0 transition-[width,height,background-color] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-1"
            :class="[
              isIndicatorsVertical ? 'w-1 sm:w-2' : 'h-1 sm:h-2',
              currentSlide === index
                ? isIndicatorsVertical
                  ? 'h-[10px] bg-main-1 sm:h-4'
                  : 'w-[10px] bg-main-1 sm:w-4'
                : isIndicatorsVertical
                  ? 'h-1 sm:h-2'
                  : 'w-1 sm:w-2',
              // บนรูปใช้ขาวโปร่งแทนเทา ไม่งั้นจุดที่ยังไม่ active จมหายไปกับภาพ
              currentSlide === index ? '' : indicatorsInsideConfig ? 'bg-white/70' : 'bg-gray-200',
            ]"
            :aria-label="`ไปที่สไลด์ ${index + 1} จาก ${items.length}`"
            :aria-current="currentSlide === index"
            @click="goToSlide(index)"
            @keydown="handleIndicatorKeydown($event, index)"
          ></button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
  type CarouselRound = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

  // เกาะขอบไหนของรูป — left/right เรียงจุดแนวตั้ง (เหมือน navigation-position ของ Quasar)
  type CarouselIndicatorsPosition = 'top' | 'right' | 'bottom' | 'left'
  // ตำแหน่งตามแนวของขอบนั้น — ขอบบน/ล่างคือซ้าย-ขวา, ขอบซ้าย/ขวาคือบน-ล่าง
  type CarouselIndicatorsAlign = 'start' | 'center' | 'end'

  // true = ค่า default, object = ทับเฉพาะ field ที่ระบุ (เหมือน spinner ของ Img / ripple ของ Button)
  interface CarouselIndicatorsInsideOptions {
    position?: CarouselIndicatorsPosition
    // ระยะห่างจากขอบนั้น เป็น CSS value ตรงๆ เช่น '12px', '1rem'
    offset?: string
    align?: CarouselIndicatorsAlign
  }
  type CarouselIndicatorsInside = boolean | CarouselIndicatorsInsideOptions

  interface Props {
    items: T[]
    autoplay?: boolean
    duration?: number
    // CSS aspect-ratio ของพื้นที่สไลด์ เช่น '16/9', '2/1'
    aspectRatio?: string
    // เปิด/ปิด peek effect — false = สไลด์เต็มความกว้าง ไม่เห็นสไลด์ข้างๆ (peekAmount ไม่มีผล)
    peek?: boolean
    // ระยะ (px) ที่โผล่ให้เห็นสไลด์ถัดไป/ก่อนหน้า และเป็นระยะเว้นขอบซ้ายของสไลด์แรก/ขอบขวาของสไลด์สุดท้าย
    peekAmount?: number
    gap?: number
    // keyword ใช้ Tailwind class, ค่าอื่นใช้เป็น border-radius ตรงๆ (เหมือน Img/Button)
    round?: CarouselRound | string
    showIndicators?: boolean
    // ย้าย indicator ไปลอยทับบนรูปแทนที่จะอยู่ใต้รูป — มีผลกับ slot indicators ด้วย
    // true = ขอบล่างกึ่งกลาง, object = ปรับ position/offset/align เองได้
    indicatorsInside?: CarouselIndicatorsInside
    clickable?: boolean
    // true = วนไม่สุด เลยใบสุดท้ายไปต่อเป็นใบแรกได้เรื่อยๆ โดย animation เลื่อนไปข้างหน้าต่อเนื่อง
    // ไม่ใช่รูดย้อนกลับ (ใช้ clone ขนาบ + เทเลพอร์ตกลับใบจริงตอน transition จบ)
    // false = ไปตามลำดับ สุดที่ใบแรก/ใบสุดท้าย ต้องลากย้อนกลับเท่านั้น (มีแรงหน่วงตอนสุดทาง)
    infinity?: boolean
    // true = track ขยับตามเมาส์/นิ้วแบบ real-time ระหว่างลาก, false = อยู่นิ่งจนกว่าจะปล่อยแล้วค่อยเลื่อน
    // (ยังลากเปลี่ยนสไลด์ได้เหมือนเดิมทั้งสองแบบ ต่างแค่ระหว่างลากเห็นภาพขยับตามมือไหม)
    dragFollow?: boolean
    // คำอธิบายตัว carousel ให้ screen reader (ไม่ได้โชว์บนจอ)
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    autoplay: false,
    duration: 3000,
    aspectRatio: '16/9',
    peek: true,
    peekAmount: 16,
    gap: 8,
    round: '16px',
    showIndicators: true,
    indicatorsInside: false,
    clickable: true,
    infinity: true,
    dragFollow: false,
    ariaLabel: 'สไลด์รูปภาพ',
  })

  const emit = defineEmits<{
    click: [item: T, index: number]
  }>()

  // v-model บอก/สั่ง index สไลด์ปัจจุบัน — ไม่ผูก v-model ก็ยังทำงานปกติ (defineModel เป็น ref ภายในให้เอง)
  // ใช้ตัวนี้แทน ref เดิมทั้งไฟล์ เลยได้ทั้งอ่านค่าออกข้างนอกและสั่งเข้ามาจากข้างนอกด้วยตัวเดียว
  const currentSlide = defineModel<number>({ default: 0 })

  const roundClasses: Record<CarouselRound, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  const DEFAULT_INDICATORS_INSIDE: Required<CarouselIndicatorsInsideOptions> = {
    position: 'bottom',
    offset: '12px',
    align: 'center',
  }

  // ขอบบน/ล่าง จุดเรียงแนวนอนเลยจัดตำแหน่งด้วย justify-*, ขอบซ้าย/ขวาเรียงแนวตั้งใช้ items-* แทน
  const indicatorsAlignClasses: Record<
    'horizontal' | 'vertical',
    Record<CarouselIndicatorsAlign, string>
  > = {
    horizontal: { start: 'justify-start', center: 'justify-center', end: 'justify-end' },
    vertical: { start: 'items-start', center: 'items-center', end: 'items-end' },
  }

  // null = อยู่ใต้รูปตามปกติ, object = ลอยทับบนรูปด้วยค่าที่ resolve แล้ว
  const indicatorsInsideConfig = computed<Required<CarouselIndicatorsInsideOptions> | null>(() => {
    if (props.indicatorsInside === false) return null
    if (props.indicatorsInside === true) return DEFAULT_INDICATORS_INSIDE

    return { ...DEFAULT_INDICATORS_INSIDE, ...props.indicatorsInside }
  })

  const isIndicatorsVertical = computed(() => {
    const position = indicatorsInsideConfig.value?.position
    return position === 'left' || position === 'right'
  })

  // แนวนอนกางเต็มความกว้าง (inset-x) แล้วขยับเข้าจากขอบบน/ล่าง, แนวตั้งกลับด้านกัน
  const indicatorsWrapperClass = computed(() => {
    const config = indicatorsInsideConfig.value
    if (!config) return ''

    const vertical = isIndicatorsVertical.value

    return [
      'absolute z-10 flex',
      vertical ? 'inset-y-0' : 'inset-x-0',
      indicatorsAlignClasses[vertical ? 'vertical' : 'horizontal'][config.align],
    ]
  })

  // โหมด peek ตัวรูปจริงไม่ได้เริ่มที่ขอบ container — สไลด์แรกเว้นซ้ายไว้เท่า peekAmount (สไลด์สุดท้ายก็ขวา)
  // ถ้าไม่หักค่านี้ออก จุดที่ align start/end หรือเกาะซ้าย/ขวา จะไปลอยอยู่บนช่องว่าง/สไลด์ที่โผล่ข้างๆ
  // แทนที่จะเกาะขอบรูป — ใช้ peekAmount ตรงๆ (ไม่ใช่ระยะจริงของสไลด์ที่ active ซึ่งเปลี่ยนไปตามใบ
  // ที่อยู่ ไม่งั้น indicator จะขยับไปมาเวลาเลื่อนสไลด์)
  const indicatorsPeekInset = computed(() => (hasPeek.value ? props.peekAmount : 0))

  const indicatorsInsideStyle = computed(() => {
    const config = indicatorsInsideConfig.value
    if (!config) return {}

    const peek = indicatorsPeekInset.value

    // แนวตั้ง: บวก peek เข้าไปในระยะห่างจากขอบซ้าย/ขวาโดยตรง
    if (isIndicatorsVertical.value) {
      return { [config.position]: peek ? `calc(${config.offset} + ${peek}px)` : config.offset }
    }

    // แนวนอน: ระยะบน/ล่างเท่าเดิม แต่หด inset ซ้าย-ขวาเข้ามาเท่า peek ให้ start/end ตรงกับขอบรูป
    // (align center ไม่ขยับ เพราะหดเท่ากันทั้งสองข้าง)
    return {
      [config.position]: config.offset,
      ...(peek ? { left: `${peek}px`, right: `${peek}px` } : {}),
    }
  })

  const isRoundKeyword = (value: string): value is CarouselRound => value in roundClasses
  const roundClass = computed(() => (isRoundKeyword(props.round) ? roundClasses[props.round] : ''))
  const customRoundStyle = computed(() =>
    isRoundKeyword(props.round) ? {} : { borderRadius: props.round }
  )

  let autoplayInterval: number | null = null
  const sliderRef = ref<HTMLDivElement | null>(null)
  const slidesCount = computed(() => props.items.length)

  // มีสไลด์เดียวก็วนไม่ได้/ไม่มีอะไรให้โผล่
  const isInfinite = computed(() => props.infinity && slidesCount.value > 1)
  const hasPeek = computed(() => props.peek && slidesCount.value > 1)

  // โหมด infinity โคลนใบสุดท้ายไว้หน้าสุด และใบแรกไว้ท้ายสุด เพื่อให้เลื่อนข้ามขอบไปเจอ "ใบถัดไป"
  // ที่หน้าตาถูกต้องอยู่แล้ว แล้วค่อยเทเลพอร์ตกลับใบจริงตอน transition จบ — ผู้ใช้เลยเห็นเป็นสไลด์
  // ต่อเนื่องไปข้างหน้า ไม่ใช่รูดย้อนกลับมาใบแรก
  const renderedSlides = computed(() => {
    const slides = props.items.map((item, realIndex) => ({ item, realIndex }))
    if (!isInfinite.value) return slides

    const last = slidesCount.value - 1
    return [
      { item: props.items[last], realIndex: last },
      ...slides,
      { item: props.items[0], realIndex: 0 },
    ]
  })

  // ตำแหน่งบน track ที่นับรวม clone — 0 = clone ใบสุดท้าย, 1..n = ใบจริง, n+1 = clone ใบแรก
  const trackIndex = ref(1)
  // true ระหว่างเทเลพอร์ต ปิด transition ไว้ ผู้ใช้จะได้ไม่เห็นการกระโดด
  const isJumping = ref(false)

  const trackRealIndex = computed(() => {
    const n = slidesCount.value
    if (!isInfinite.value) return currentSlide.value
    if (trackIndex.value === 0) return n - 1
    if (trackIndex.value === n + 1) return 0

    return trackIndex.value - 1
  })

  // พื้นที่แนวนอนที่ไม่ใช่ตัวสไลด์ active
  // - infinity: อยู่กึ่งกลางตลอด (มี clone ขนาบ) เผื่อ gap สองช่อง เพื่อนบ้านเลยโผล่ = peekAmount เป๊ะทุกใบ
  // - อื่นๆ: ใบหัว/ท้ายชิดขอบ ใช้ gap ช่องเดียว ระยะเว้นขอบเลย = peekAmount เป๊ะ (ถ้าเผื่อสองช่อง
  //   ที่ว่างส่วนเกินจะไปโผล่ฝั่งในเป็น peekAmount + gap และสไลด์ก็แคบกว่าที่ควร)
  const inset = computed(() => {
    if (!hasPeek.value) return 0

    return isInfinite.value ? (props.peekAmount + props.gap) * 2 : props.peekAmount * 2 + props.gap
  })

  // ระยะเว้นขอบของสไลด์หัว/ท้าย ซึ่งไม่มีสไลด์ข้างๆ มาเติมที่ว่าง
  const edgeMargin = computed(() => (hasPeek.value ? props.peekAmount : 0))

  const slideStyle = computed(() => ({
    width: `calc(100% - ${inset.value}px)`,
  }))

  // จัดสไลด์ active ไว้กลาง (ideal) เพื่อให้สไลด์ก่อนหน้าโผล่ทางซ้ายด้วย ไม่ใช่โผล่แค่สไลด์ถัดไป
  // แล้ว clamp หัวท้ายไว้ที่ edgeMargin — สไลด์แรกเว้นซ้าย = peekAmount, สไลด์สุดท้ายเว้นขวา = peekAmount
  // ที่ตำแหน่งหัว/ท้ายสไลด์ข้างๆ จะโผล่ = peekAmount พอดี ส่วนสไลด์กลางๆ โผล่ peekAmount - gap/2
  // (สไลด์กว้างเท่ากันทุกใบ เลยให้ทั้งสองตำแหน่งโผล่เท่ากันเป๊ะพร้อมกันไม่ได้)
  const sliderStyle = computed(() => {
    if (slidesCount.value === 0) return { gap: `${props.gap}px` }

    const step = `(100% - ${inset.value}px + ${props.gap}px)`
    const ideal = `${inset.value / 2}px - ${(isInfinite.value ? trackIndex : currentSlide).value} * ${step}`

    // infinity มี clone ขนาบอยู่แล้ว ทุกใบเลยมีเพื่อนบ้านครบ ไม่ต้อง clamp ขอบ (และห้าม clamp
    // ไม่งั้นเลื่อนไปตำแหน่ง clone ไม่ได้)
    const minOffset = `${inset.value - edgeMargin.value}px - ${slidesCount.value - 1} * ${step}`
    const base = isInfinite.value
      ? ideal
      : `max(${minOffset}, min(${ideal}, ${edgeMargin.value}px))`

    return {
      transform: `translateX(calc(${base} + ${dragDelta.value}px))`,
      // ปิด transition ระหว่างลาก ให้ track ตามเมาส์/นิ้วทันทีแบบไม่หน่วง แล้วเปิดคืนตอนปล่อยเพื่อ snap
      transitionDuration: isInteracting.value || isJumping.value ? '0s' : '',
      gap: `${props.gap}px`,
    }
  })

  const handleClick = (item: T, index: number) => {
    if (hasDragged.value || !props.clickable) return
    emit('click', item, index)
  }

  // ถ้า track ค้างอยู่บน clone ให้เด้งกลับใบจริงที่หน้าตาเหมือนกันเป๊ะแบบไม่มี transition ก่อน
  // เรียกทั้งตอน transition จบ และตอนจะเลื่อนครั้งถัดไป (กันเคสกดรัวจน transitionend ยังไม่ทันมา)
  const normalizeTrackPosition = async () => {
    if (!isInfinite.value) return

    const n = slidesCount.value
    const atStartClone = trackIndex.value === 0
    if (!atStartClone && trackIndex.value !== n + 1) return

    isJumping.value = true
    trackIndex.value = atStartClone ? n : 1

    // รอ DOM แล้วบังคับ reflow ให้ transform ใหม่ลงจริงตอน transition ยังปิดอยู่ ก่อนเปิดคืน
    await nextTick()
    void sliderRef.value?.offsetWidth
    isJumping.value = false
    await nextTick()
  }

  const goToSlide = async (index: number) => {
    if (isInfinite.value) {
      await normalizeTrackPosition()
      trackIndex.value = index + 1
    }

    currentSlide.value = index
    resetAutoplay()
  }

  // ลูกศร/Home/End เลื่อนสไลด์แล้วย้าย focus ตามไปด้วย — วนรอบเสมอเหมือนการกดจุดที่กระโดดไปใบไหนก็ได้
  // (ไม่ผูกกับ infinity ซึ่งคุมแค่การลาก/ปัด) อ่านปุ่มถัดไปจาก parent ตรงๆ ไม่ต้องเก็บ ref เป็น array
  const handleIndicatorKeydown = (event: KeyboardEvent, index: number) => {
    const last = slidesCount.value - 1
    const next = index === last ? 0 : index + 1
    const prev = index === 0 ? last : index - 1

    const targetByKey: Record<string, number> = {
      ArrowRight: next,
      ArrowDown: next,
      ArrowLeft: prev,
      ArrowUp: prev,
      Home: 0,
      End: last,
    }

    const target = targetByKey[event.key]
    if (target === undefined) return

    event.preventDefault()
    goToSlide(target)

    const buttons = (event.currentTarget as HTMLElement).parentElement?.children
    ;(buttons?.[target] as HTMLElement | undefined)?.focus()
  }

  // โหมด infinity เลื่อน track ไปข้างหน้า/ถอยหลังทีละก้าวเสมอ (ก้าวเข้าไปบน clone ได้) แล้วค่อย
  // เทเลพอร์ตกลับใบจริงทีหลัง — ทิศทางของ animation เลยต่อเนื่องไม่มีวันย้อน ไม่ใช่การวนด้วย index
  // เฉยๆ ที่กระโดดจากใบสุดท้ายกลับใบแรกแล้วรูดถอยหลังให้เห็น
  const stepTrack = async (delta: 1 | -1) => {
    await normalizeTrackPosition()
    trackIndex.value += delta
  }

  const nextSlide = async (wrap = true) => {
    if (!slidesCount.value) return
    const last = slidesCount.value - 1
    if (currentSlide.value === last && !wrap) return

    if (isInfinite.value) await stepTrack(1)
    currentSlide.value = currentSlide.value === last ? 0 : currentSlide.value + 1
    resetAutoplay()
  }

  const prevSlide = async (wrap = true) => {
    if (!slidesCount.value) return
    if (currentSlide.value === 0 && !wrap) return

    if (isInfinite.value) await stepTrack(-1)
    currentSlide.value = currentSlide.value === 0 ? slidesCount.value - 1 : currentSlide.value - 1
    resetAutoplay()
  }

  // ตัวที่ผูก wrap ไว้กับ infinity แล้ว — ใช้ทั้งกับการลาก/ปัด และปุ่มที่ส่งออกไปให้ slot indicators
  // เพื่อให้ปุ่ม custom เดินเรื่อง/ตันสุดทางเหมือนกับการลากเป๊ะๆ (autoplay เรียก next/prevSlide
  // แบบ default = วนเสมอ เพราะ banner ที่เปิด autoplay ไม่ควรค้างตายที่ใบสุดท้าย)
  const goNext = () => nextSlide(isInfinite.value)
  const goPrev = () => prevSlide(isInfinite.value)

  // จังหวะปกติที่เทเลพอร์ตกลับใบจริง: พอสไลด์ที่วิ่งเข้าไปหา clone เล่นจบ
  const handleTransitionEnd = (event: Event) => {
    const { target, propertyName } = event as TransitionEvent
    if (target !== sliderRef.value || propertyName !== 'transform') return

    normalizeTrackPosition()
  }

  // v-model ถูกสั่งมาจากข้างนอก (ไม่ได้มาจาก next/prev/goToSlide ที่ตั้ง trackIndex ให้แล้ว)
  watch(currentSlide, value => {
    if (!isInfinite.value || trackRealIndex.value === value) return

    trackIndex.value = value + 1
  })

  // เข้า/ออกโหมด infinity หรือจำนวนสไลด์เปลี่ยน ต้องรีเซ็ต track ให้ตรงกับใบที่อยู่
  watch([isInfinite, slidesCount], () => {
    trackIndex.value = currentSlide.value + 1
  })

  const resetAutoplay = () => {
    if (props.autoplay && slidesCount.value > 1) {
      cleanupAutoplay()
      setupAutoplay()
    }
  }

  const setupAutoplay = () => {
    cleanupAutoplay()

    if (props.autoplay && slidesCount.value > 1) {
      autoplayInterval = window.setInterval(() => {
        nextSlide()
      }, props.duration)
    }
  }

  const cleanupAutoplay = () => {
    if (autoplayInterval !== null) {
      clearInterval(autoplayInterval)
      autoplayInterval = null
    }
  }

  // หยุด autoplay ตลอดช่วงที่ผู้ใช้แตะ/กดค้างอยู่ ไม่งั้น interval อาจ fire กลางคันแล้วเลื่อนไปเอง
  // พอปล่อยแล้วเกิน threshold ก็เลื่อนซ้ำอีกที = เลื่อน 2 ใบรวด (และ track ก็กระตุกใต้นิ้วเพราะ
  // ตอนลาก transition ถูกปิดอยู่ base เลยเปลี่ยนแบบกระโดด)
  const pauseAutoplayWhileInteracting = () => cleanupAutoplay()

  // เริ่มนับ duration ใหม่ทั้งรอบหลังปล่อย — setupAutoplay เคลียร์ interval เดิมให้อยู่แล้ว
  // เลยเรียกซ้ำได้ปลอดภัยแม้ next/prevSlide จะ resetAutoplay ไปแล้ว
  const resumeAutoplayAfterInteracting = () => setupAutoplay()

  // ระยะที่ลากไปแล้ว (px) ใช้ให้ track ขยับตามเมาส์/นิ้วระหว่างลาก แล้วรีเซ็ตเป็น 0 ตอนปล่อยให้ snap
  const dragDelta = ref(0)

  // ปิด transition เฉพาะตอนที่ track ต้องวิ่งตามมือจริงๆ — โหมด dragFollow = false ไม่มีอะไรขยับ
  // ระหว่างลาก ปล่อยให้ transition ปกติทำงานไปเลย ตอนปล่อยแล้วเปลี่ยนสไลด์จะได้เลื่อนแบบมี animation
  const isInteracting = computed(
    () => props.dragFollow && (isDragging.value || isHorizontalSwipe.value)
  )

  // dragFollow = false ก็ยังลากเปลี่ยนสไลด์ได้ แค่ไม่ขยับตามมือ เลยไม่ต้องคิด delta
  const followDelta = (delta: number) => (props.dragFollow ? withResistance(delta) : 0)

  // หน่วงการลากเมื่อสุดทางแล้ว (สไลด์แรกลากไปขวา / สไลด์สุดท้ายลากไปซ้าย) ให้รู้สึกว่าไปต่อไม่ได้
  // โหมด infinity ไม่หน่วง เพราะลากต่อได้จริง ไม่มีจุดสุดทาง
  const withResistance = (delta: number) => {
    if (isInfinite.value) return delta

    const atStart = currentSlide.value === 0 && delta > 0
    const atEnd = currentSlide.value === slidesCount.value - 1 && delta < 0
    return atStart || atEnd ? delta / 3 : delta
  }

  // Touch swipe (mobile)
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const isHorizontalSwipe = ref(false)
  // ล็อกแกนไว้ตั้งแต่ต้น gesture — ถ้าตัดสินว่าเป็น scroll แนวตั้งแล้วจะไม่สลับมาลาก carousel กลางคัน
  // แม้ต่อมา diffX จะแซง diffY (เช่นนิ้วเบี่ยงระหว่าง scroll) ไม่งั้นหน้าเว็บที่ scroll อยู่จะโดนแย่ง
  const isVerticalScroll = ref(false)

  const handleTouchStart = (e: Event) => {
    const touch = (e as TouchEvent).touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchEndX.value = touch.clientX
    isHorizontalSwipe.value = false
    isVerticalScroll.value = false
    pauseAutoplayWhileInteracting()
  }

  const handleTouchMove = (e: Event) => {
    if (isVerticalScroll.value) return

    const touch = (e as TouchEvent).touches[0]
    touchEndX.value = touch.clientX

    const diffX = Math.abs(touch.clientX - touchStartX.value)
    const diffY = Math.abs(touch.clientY - touchStartY.value)

    if (!isHorizontalSwipe.value) {
      if (diffX > diffY && diffX > 10) isHorizontalSwipe.value = true
      else if (diffY > diffX && diffY > 10) isVerticalScroll.value = true
    }

    if (isHorizontalSwipe.value) {
      // กัน scroll แนวตั้งของหน้าเว็บ เมื่อจับได้ว่าเป็น swipe แนวนอนแล้ว
      if (e.cancelable) e.preventDefault()
      dragDelta.value = followDelta(touch.clientX - touchStartX.value)
    }
  }

  const handleTouchEnd = () => {
    const diffX = touchStartX.value - touchEndX.value
    const wasVerticalScroll = isVerticalScroll.value

    isHorizontalSwipe.value = false
    isVerticalScroll.value = false
    dragDelta.value = 0

    // gesture ที่ตัดสินไปแล้วว่าเป็น scroll แนวตั้ง ไม่ต้องเปลี่ยนสไลด์ แม้ diffX จะเกิน threshold
    // (นิ้วเบี่ยงแนวนอนระหว่าง scroll ยาวๆ ก็เกิน 50px ได้ง่าย)
    if (!wasVerticalScroll && Math.abs(diffX) > 50) {
      if (diffX > 0) goNext()
      else goPrev()
    }

    resumeAutoplayAfterInteracting()
  }

  // Mouse drag (desktop)
  const isDragging = ref(false)
  const hasDragged = ref(false)
  const dragStartX = ref(0)
  const dragEndX = ref(0)

  const handleMouseDown = (e: Event) => {
    isDragging.value = true
    hasDragged.value = false
    dragStartX.value = (e as MouseEvent).clientX
    dragEndX.value = (e as MouseEvent).clientX
    dragDelta.value = 0
    pauseAutoplayWhileInteracting()
  }

  const handleMouseMove = (e: Event) => {
    if (!isDragging.value) return

    dragEndX.value = (e as MouseEvent).clientX
    const delta = dragEndX.value - dragStartX.value

    if (Math.abs(delta) > 5) {
      hasDragged.value = true
    }

    dragDelta.value = followDelta(delta)
  }

  const handleMouseUp = () => {
    if (!isDragging.value) return
    isDragging.value = false
    dragDelta.value = 0

    const diffX = dragStartX.value - dragEndX.value

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) goNext()
      else goPrev()
    }

    resumeAutoplayAfterInteracting()
  }

  watch(() => props.autoplay, setupAutoplay)
  watch(() => props.duration, setupAutoplay)
  watch(() => props.items, setupAutoplay, { deep: true })

  onMounted(() => {
    setupAutoplay()

    if (sliderRef.value) {
      sliderRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      sliderRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
      sliderRef.value.addEventListener('touchend', handleTouchEnd)
      sliderRef.value.addEventListener('transitionend', handleTransitionEnd)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  })

  onUnmounted(() => {
    cleanupAutoplay()

    if (sliderRef.value) {
      sliderRef.value.removeEventListener('touchstart', handleTouchStart)
      sliderRef.value.removeEventListener('touchmove', handleTouchMove)
      sliderRef.value.removeEventListener('touchend', handleTouchEnd)
      sliderRef.value.removeEventListener('transitionend', handleTransitionEnd)
    }

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  })

  defineExpose({ goToSlide, nextSlide, prevSlide, currentSlide })
</script>

<style scoped>
  .carousel {
    position: relative;
    overflow: hidden;
  }

  .slider-container {
    touch-action: pan-y;
  }

  /* กัน native drag ของ browser (ลากรูป/ลิงก์ไปวาง) มาแย่ง mouse event ตอนลาก carousel บน desktop
     — เนื้อหาสไลด์มาจาก slot ของ parent เลยต้องใช้ :deep ถึงจะทะลุ scoped style ไปถึง */
  .slider-container :deep(img),
  .slider-container :deep(a) {
    -webkit-user-drag: none;
  }
</style>
