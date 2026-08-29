<template>
  <div class="drag-scroll-container overflow-hidden">
    <div
      ref="containerRef"
      class="drag-scroll-track flex cursor-grab select-none overflow-x-auto active:cursor-grabbing"
      :style="trackStyle"
    >
      <slot />

      <!-- หน้าสุดท้ายมีการ์ดไม่ครบ itemsPerPage ใบ — เติมที่ว่างท้ายแถวชดเชยให้ scroll ไปสุดได้จริง
           ดูคอมเมนต์ที่ recomputePages ว่าทำไมถึงต้องมีตัวนี้ -->
      <div
        v-if="props.itemsPerPage > 0 && hasIncompleteLastPage"
        data-drag-scroll-spacer
        aria-hidden="true"
        class="pointer-events-none flex-shrink-0 select-none"
        :style="{ width: `${spacerWidth}px` }"
      ></div>
    </div>

    <!-- มีจุดนำทางเฉพาะโหมด itemsPerPage เท่านั้น — โหมดลากอิสระไม่มี "หน้า" ให้กดไปหา -->
    <div
      v-if="props.itemsPerPage > 0 && props.showIndicators && pageCount > 1"
      class="mt-2 flex flex-wrap items-center justify-center gap-1"
    >
      <slot
        name="indicators"
        :current="currentPage"
        :count="pageCount"
        :select="goToPage"
        :next="nextPage"
        :prev="prevPage"
        :first="currentPage === 0"
        :last="currentPage === pageCount - 1"
      >
        <button
          v-for="(_, index) in pageCount"
          :key="index"
          type="button"
          class="h-1 flex-shrink-0 cursor-pointer rounded p-0 transition-[width,height,background-color] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-1 sm:h-2"
          :class="currentPage === index ? 'w-[10px] bg-main-1 sm:w-4' : 'w-1 bg-gray-200 sm:w-2'"
          :aria-label="`ไปที่หน้า ${index + 1} จาก ${pageCount}`"
          :aria-current="currentPage === index"
          @click="goToPage(index)"
        ></button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useElementSize, useResizeObserver, useScroll } from '@vueuse/core'

  interface Props {
    // ระยะห่างระหว่างการ์ด (px)
    gap?: number
    // padding ซ้าย/ขวาของแถว — ทำให้การ์ดแรกเว้นซ้าย และการ์ดสุดท้ายเว้นขวาเท่ากับค่านี้
    // (ไม่ใช่ container padding ปกติ เพราะ container นี้ scroll ได้ ระยะขวาเลยยังโผล่ให้เห็น
    // แม้ลากไปสุดทางแล้วก็ตาม)
    padding?: number
    // จำนวนการ์ดต่อหน้า — 0 (ค่าเดิม) = ลากอิสระ จอดตรงไหนก็ได้เหมือนเดิมทุกอย่าง การ์ดกว้างเท่าที่
    // ผู้ใช้กำหนดเอง (ไม่ยุ่ง)
    // > 0 = เปิดโหมดจอดทีละหน้า (ทุกๆ itemsPerPage ใบ) แทน — ยังเป็น native scroll ล้วนๆ อยู่
    // (ไม่มี transform/clone แบบ Carousel) แค่ตอนปล่อยมือจะเลื่อน (smooth) ไปจอดที่จุดแบ่งหน้าที่
    // ใกล้ที่สุดเอง โหมดนี้ component จะบังคับความกว้างการ์ดทุกใบให้เท่ากันเอง
    // (= (100% - (itemsPerPage-1)*gap) / itemsPerPage) เพื่อให้ itemsPerPage ใบรวม gap คั่นแล้ว
    // พอดี 100% ของ container เป๊ะเสมอ — ผู้ใช้ไม่ต้องคำนวณ calc() เองและพลาดไม่ได้ถ้าเปลี่ยน
    // gap/itemsPerPage ทีหลัง (ดูรายละเอียดที่ recomputePages)
    itemsPerPage?: number
    // แสดงจุดนำทาง (หรือ slot #indicators ที่ override) ใต้แถว — มีผลเฉพาะตอน itemsPerPage > 0
    showIndicators?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    gap: 8,
    padding: 0,
    itemsPerPage: 0,
    showIndicators: true,
  })

  const emit = defineEmits<{
    'update:width': [width: number]
  }>()

  // v-model ควบคุม/อ่านตำแหน่ง scroll แนวนอน (px) จากภายนอกได้ เช่น sync กับ custom scrollbar
  // ไม่ผูก v-model ก็ยังลากเลื่อนได้ปกติ — ต่างจาก Carousel ตรงนี้ไม่มี concept ของ index/สไลด์เลย
  // เป็นแค่ native scroll ที่ลากด้วยเมาส์ได้ (จอดตรงไหนก็ได้ ไม่มี snap เว้นแต่เปิด itemsPerPage)
  const scrollPosition = defineModel<number>({ default: 0 })

  // v-model:page — หน้าปัจจุบัน (0-based) มีความหมายเฉพาะตอน itemsPerPage > 0 เท่านั้น
  // (itemsPerPage = 0 ค่านี้จะค้างที่ 0 เสมอ เพราะไม่มี concept ของหน้า)
  const page = defineModel<number>('page', { default: 0 })

  const trackStyle = computed(() => ({
    gap: `${props.gap}px`,
    paddingLeft: `${props.padding}px`,
    paddingRight: `${props.padding}px`,
    // scroll-snap-type ไม่ได้อยู่ในนี้ — คุมผ่าน raw DOM (recomputePages + enableDrag) แทน เพราะต้อง
    // ปิดทันทีแบบ synchronous ตอน pointerdown (ก่อน pointermove ถัดไปมาถึง) ไม่ทันรอ Vue re-render
    // รอบถัดไป ดูคอมเมนต์ที่ enableDrag ว่าทำไม
  }))

  const containerRef = ref<HTMLDivElement | null>(null)
  const { x } = useScroll(containerRef, { behavior: 'smooth' })
  const { width } = useElementSize(containerRef)

  watch(width, value => emit('update:width', value))

  // sync ตำแหน่ง scroll จริงกลับขึ้น v-model เวลาผู้ใช้ลากเอง (ไม่ใช่แค่ตอนถูกสั่งจากภายนอก)
  watch(x, value => {
    if (value !== scrollPosition.value) scrollPosition.value = value
  })

  // v-model ถูกสั่งจากภายนอก (ค่าที่ไม่ตรงกับ scroll จริง) — เลื่อนให้ตรงกันแบบ smooth
  watch(scrollPosition, value => {
    if (!containerRef.value || value === x.value) return
    containerRef.value.scrollTo({ left: value, behavior: 'smooth' })
  })

  // ตำแหน่ง scrollLeft ของการ์ดตัวแรกในแต่ละหน้า — ใช้เป็นจุด snap ที่ goToPage เลื่อนไปหา
  // คำนวณจาก getBoundingClientRect() เทียบกับ track เอง ไม่ใช้ offsetLeft เพราะ offsetLeft อ้างอิง
  // offsetParent ซึ่งอาจลอยไปอยู่ ancestor ที่ไกลกว่า track เอง (ไม่มีอะไรการันตีว่า track เป็น
  // positioned element) — สูตรนี้ใช้ได้เสมอไม่ว่า track จะ position อะไรอยู่
  const pageOffsets = ref<number[]>([])
  // หน้าสุดท้ายมีการ์ดไม่ครบ itemsPerPage ใบไหม (เช่น 10 การ์ด หน้าละ 3 ใบ หน้าสุดท้ายเหลือ 1 ใบ)
  const hasIncompleteLastPage = ref(false)
  // ที่ว่างท้ายแถว (px) ที่ต้องเติมให้พอ scroll ไปสุดได้ ดูคอมเมนต์ใน recomputePages
  const spacerWidth = ref(0)

  const recomputePages = () => {
    const container = containerRef.value

    // mandatory บังคับจอดที่จุด snap เสมอ ไม่ปล่อยให้ค้างกลางทาง — ปิดไว้ตอน itemsPerPage = 0
    // ตั้งผ่าน raw DOM ตรงนี้ (ไม่ใช่ Vue :style) เพราะ enableDrag ต้องปิดค่านี้ทันทีแบบ synchronous
    // ตอน pointerdown ก่อนที่ pointermove ถัดไปจะมาถึง — ถ้าฝากไว้กับ Vue reactive re-render ซึ่ง
    // เป็น async (รอ tick ถัดไป) จะช้าไม่ทัน บน browser จริงที่ rAF ทำงานปกติ scroll-snap-type จะ
    // ยังเป็น mandatory อยู่ระหว่าง pointermove ชุดแรกๆ แล้วบังคับ snap กลับตลอดเวลาที่ scrollLeft
    // เปลี่ยน (ไม่ใช่แค่ตอนปล่อยมือ) สู้กับการ set scrollLeft ทีละพิกเซลของเราเองจนลากไม่ขยับเลย
    if (container) container.style.scrollSnapType = props.itemsPerPage > 0 ? 'x mandatory' : ''

    // ไม่นับ spacer เองเป็นการ์ด (ไม่งั้นการนับ index % itemsPerPage จะเพี้ยน และมันไม่ควรเป็น
    // จุด snap ด้วย)
    const children = container
      ? (Array.from(container.children).filter(
          el => !el.hasAttribute('data-drag-scroll-spacer')
        ) as HTMLElement[])
      : []

    // เคลียร์ก่อนทุกครั้ง เผื่อ itemsPerPage เปลี่ยนค่าหรือจำนวนการ์ดเปลี่ยน ไม่งั้นการ์ดที่เคยเป็น
    // จุด snap หรือถูกบังคับความกว้างไว้ จะค้าง style เดิมทั้งที่ไม่ควรแล้ว (เช่นปิด itemsPerPage
    // กลับไปโหมดลากอิสระ ต้องคืนความกว้างให้เป็นไปตามที่ผู้ใช้กำหนดเองเหมือนเดิม)
    children.forEach(child => {
      child.style.scrollSnapAlign = ''
      child.style.scrollSnapStop = ''
      child.style.flex = ''
    })

    if (!container || props.itemsPerPage <= 0 || children.length === 0) {
      pageOffsets.value = []
      hasIncompleteLastPage.value = false
      spacerWidth.value = 0
      return
    }

    // บังคับการ์ดทุกใบกว้างเท่ากัน = (100% - (itemsPerPage-1)*gap) / itemsPerPage เพื่อให้
    // itemsPerPage ใบรวม gap คั่นแล้วพอดี 100% ของ container เป๊ะเสมอ (คือนิยามของ "หนึ่งหน้า")
    // ไม่ต้องให้ผู้ใช้คำนวณ calc() เอง — ใช้ flex-basis (ผ่าน shorthand flex) ไม่ใช่ width ตรงๆ
    // เพราะ flex-basis ชนะ width เดิมที่การ์ดอาจมีอยู่แล้วเสมอสำหรับ flex item (กันเคสผู้ใช้ลืมเอา
    // width/class เดิมออกตอนเปลี่ยนมาใช้โหมดนี้)
    const cardWidth = `calc((100% - ${(props.itemsPerPage - 1) * props.gap}px) / ${props.itemsPerPage})`
    children.forEach(child => {
      child.style.flex = `0 0 ${cardWidth}`
    })

    const trackRect = container.getBoundingClientRect()
    const offsets: number[] = []

    children.forEach((child, index) => {
      if (index % props.itemsPerPage !== 0) return

      // scrollSnapStop: always กันลากเร็วๆ แล้วสไลด์ข้ามหน้าเกิน 1 หน้าต่อครั้ง
      child.style.scrollSnapAlign = 'start'
      child.style.scrollSnapStop = 'always'
      offsets.push(child.getBoundingClientRect().left - trackRect.left + container.scrollLeft)
    })

    pageOffsets.value = offsets
    hasIncompleteLastPage.value = children.length % props.itemsPerPage !== 0

    // หน้าสุดท้ายที่การ์ดไม่ครบ (เช่นเหลือ 1 ใบจาก 3) กว้างน้อยกว่าหนึ่งหน้าเต็ม — ถ้าไม่เติมที่ว่าง
    // ชดเชย ความกว้างที่ scroll ได้จริง (scrollWidth) จะสั้นกว่าที่ต้องใช้เลื่อนให้การ์ดใบสุดท้ายไป
    // ชิดซ้ายสุด แล้วค้างอยู่หน้าก่อนหน้าแทน (ไปหน้าสุดท้ายไม่ถึง) — เติม spacer โปร่งใสท้ายแถว
    // (นับ gap ก่อนหน้ามันด้วย เพราะ track มี gap คั่นทุกตัว) ให้พอดีกับ container width ที่จุด snap
    // สุดท้ายพอดี
    spacerWidth.value = 0
    if (hasIncompleteLastPage.value) {
      const lastChild = children[children.length - 1]
      const lastChildRight =
        lastChild.getBoundingClientRect().right - trackRect.left + container.scrollLeft
      const naturalContentWidth = lastChildRight + props.padding
      const requiredWidth = offsets[offsets.length - 1] + container.clientWidth
      spacerWidth.value = Math.max(0, requiredWidth - naturalContentWidth - props.gap)
    }
  }

  const pageCount = computed(() => pageOffsets.value.length)

  // จุด snap ตัวสุดท้ายที่ผ่านมาแล้ว (offset <= scrollLeft ปัจจุบัน) คือหน้าที่กำลังอยู่
  const EPSILON = 1
  const currentPage = computed(() => {
    const offsets = pageOffsets.value
    let current = 0
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] > x.value + EPSILON) break
      current = i
    }
    return current
  })

  const goToPage = (index: number) => {
    const offsets = pageOffsets.value
    if (!containerRef.value || offsets.length === 0) return

    const clamped = Math.max(0, Math.min(index, offsets.length - 1))
    containerRef.value.scrollTo({ left: offsets[clamped], behavior: 'smooth' })
  }

  const nextPage = () => goToPage(currentPage.value + 1)
  const prevPage = () => goToPage(currentPage.value - 1)

  // จุด snap ที่ใกล้ scrollLeft ปัจจุบันที่สุด (ไม่ใช่แค่ floor) — ลากเลยครึ่งทางไปเยอะพอก็ควรตัดสิน
  // ใจไปหน้าถัดไปเลย ไม่ใช่ดีดกลับหน้าเดิมเสมอ
  const nearestPageForScrollLeft = (scrollLeft: number) => {
    const offsets = pageOffsets.value
    let nearest = 0
    let minDistance = Infinity

    offsets.forEach((offset, index) => {
      const distance = Math.abs(offset - scrollLeft)
      if (distance < minDistance) {
        minDistance = distance
        nearest = index
      }
    })

    return nearest
  }

  watch(currentPage, value => {
    if (value !== page.value) page.value = value
  })

  // v-model:page ถูกสั่งจากภายนอก (ค่าที่ไม่ตรงกับหน้าที่คำนวณได้จริง) — เลื่อนไปหน้านั้น
  watch(page, value => {
    if (value !== currentPage.value) goToPage(value)
  })

  watch(() => props.itemsPerPage, recomputePages)

  // จำนวนการ์ดเปลี่ยน (v-for ของ parent เปลี่ยน) ต้องคำนวณจุด snap ใหม่ — ใช้ MutationObserver
  // เจาะจงดู childList แทน onUpdated(recomputePages) ที่เคยลองมาก่อน เพราะ onUpdated ไล่ตาม
  // "component re-render ครั้งไหนก็ได้" ซึ่งรวม re-render ที่มาจาก currentPage เปลี่ยนระหว่าง scroll
  // ด้วย (ผูกกับ template ของจุด indicator) — recomputePages วัดตำแหน่งจาก scrollLeft ปัจจุบัน ซึ่ง
  // ขยับตลอดเวลาระหว่าง smooth-scroll ทำให้ได้ค่าคลาดเคลื่อนเล็กน้อยไม่เท่าเดิมทุกครั้ง วนกลับไป
  // trigger re-render ซ้ำได้ไม่มีที่สิ้นสุด (Vue ขึ้น "Maximum recursive updates exceeded")
  // MutationObserver({childList:true}) ไม่สนใจการเปลี่ยนแปลงจาก scroll เลย ยิงเฉพาะตอนมีการ
  // เพิ่ม/ลบ DOM node จริงๆ เท่านั้น — กันเหตุ ignore เฉพาะตอนโหนดที่เปลี่ยนคือ spacer เอง
  // (ที่ recomputePages เพิ่ม/ลบเข้าไปเองผ่าน v-if) ไม่งั้นจะเด้งเรียกตัวเองซ้ำอีกชั้นหนึ่ง
  const isSpacerNode = (node: Node) =>
    node instanceof HTMLElement && node.hasAttribute('data-drag-scroll-spacer')

  let mutationObserver: MutationObserver | null = null

  useResizeObserver(containerRef, recomputePages)

  // Pointer Events ใช้แทน mouse/touch event แยกกัน — ครอบคลุมทั้งเมาส์และนิ้วด้วยโค้ดชุดเดียว
  // ลากแล้วแปลง delta เป็น scrollLeft ตรงๆ — โหมด itemsPerPage เรียก goToPage(nearestPage...) ตอน
  // ปล่อยมือเอง (ดูคอมเมนต์ที่ recomputePages ว่าทำไมต้องปิด scroll-snap-type เองตอน pointerdown ด้วย)
  const enableDrag = (container: HTMLDivElement) => {
    let isDragging = false
    let startX = 0
    let startScrollLeft = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      startX = e.pageX - container.offsetLeft
      startScrollLeft = container.scrollLeft
      // ปิด scroll-snap-type ทันที (synchronous) ก่อน pointermove ถัดไปจะมาถึง ไม่งั้น browser จะ
      // บังคับ snap กลับสู้กับการ set scrollLeft ทีละพิกเซลของเราเองระหว่างลาก จนดูเหมือนลากไม่ขยับ
      if (props.itemsPerPage > 0) container.style.scrollSnapType = 'none'
      e.preventDefault()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const currentX = e.pageX - container.offsetLeft
      container.scrollLeft = startScrollLeft - (currentX - startX)
    }

    const onPointerUp = () => {
      if (!isDragging) return
      isDragging = false

      if (props.itemsPerPage > 0) {
        container.style.scrollSnapType = 'x mandatory'
        goToPage(nearestPageForScrollLeft(container.scrollLeft))
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('pointerleave', onPointerUp)

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointerleave', onPointerUp)
    }
  }

  let cleanupDrag: (() => void) | null = null

  onMounted(() => {
    if (containerRef.value) {
      cleanupDrag = enableDrag(containerRef.value)

      mutationObserver = new MutationObserver(mutations => {
        const onlySpacerChanged = mutations.every(
          mutation =>
            Array.from(mutation.addedNodes).every(isSpacerNode) &&
            Array.from(mutation.removedNodes).every(isSpacerNode)
        )
        if (!onlySpacerChanged) recomputePages()
      })
      mutationObserver.observe(containerRef.value, { childList: true })
    }

    recomputePages()
  })

  onUnmounted(() => {
    cleanupDrag?.()
    mutationObserver?.disconnect()
  })

  defineExpose({ goToPage, nextPage, prevPage, currentPage, pageCount })
</script>

<style scoped>
  .drag-scroll-track {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .drag-scroll-track::-webkit-scrollbar {
    display: none;
  }

  /* กัน native drag ของ browser (ลากรูป/ลิงก์ไปวาง) มาแย่ง pointer event ตอนลาก
     — เนื้อหามาจาก slot ของ parent เลยต้องใช้ :deep ถึงจะทะลุ scoped style ไปถึง */
  .drag-scroll-track :deep(img),
  .drag-scroll-track :deep(a) {
    -webkit-user-drag: none;
  }
</style>
