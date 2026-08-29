<template>
  <div>
    <div>DragScroll Demo</div>

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 px-4 text-18 font-bold">
          basic — ลากด้วยเมาส์/นิ้วเลื่อนแถวได้อิสระ ไม่มี snap
        </div>
        <DragScroll
          :gap="12"
          :padding="16"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="flex h-24 w-32 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center cursor-pointer"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>
      </div>

      <hr />

      <div id="demo-images">
        <div class="mb-2 px-4 text-18 font-bold">รูปภาพ — ใช้แทนแถว "ร้านค้าที่ร่วมรายการ"</div>
        <DragScroll
          :gap="8"
          :padding="16"
        >
          <Img
            v-for="n in 8"
            :key="n"
            :src="`https://picsum.photos/seed/drag-scroll-${n}/200/200`"
            :alt="`ร้านค้า ${n}`"
            class="h-24 w-24 flex-shrink-0 rounded-lg"
          />
        </DragScroll>
      </div>

      <hr />

      <div id="demo-gap-padding">
        <div class="mb-2 px-4 text-18 font-bold">
          gap / padding — padding 12px, gap 8px: การ์ดแรกเว้นซ้าย 12px, การ์ดสุดท้ายเว้นขวา 12px,
          ระหว่างการ์ดห่างกัน 8px
        </div>
        <DragScroll
          :gap="8"
          :padding="12"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="flex h-24 w-32 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>
        <span class="px-4 text-16 text-gray-500">
          ลากไปสุดซ้าย/ขวาแล้วสังเกตระยะเว้นขอบ — ต่างจาก padding ของ container ปกติตรงที่ระยะขวา
          ยังโผล่ให้เห็นแม้ลากไปสุดทางแล้วก็ตาม (เพราะ padding อยู่บนตัว container ที่ scroll
          ได้เอง)
        </span>
      </div>

      <hr />

      <div id="demo-v-model">
        <div class="mb-2 px-4 text-18 font-bold">
          v-model — อ่าน/สั่งตำแหน่ง scroll (px) จากข้างนอก
        </div>
        <DragScroll
          v-model="scrollX"
          :gap="12"
          :padding="16"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="flex h-24 w-32 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>

        <div class="mt-3 flex flex-wrap items-center gap-2 px-4">
          <Button
            variant="secondary"
            size="sm"
            label="เลื่อนไปสุดซ้าย"
            @click="scrollX = 0"
          />
          <Button
            variant="secondary"
            size="sm"
            label="เลื่อนไปกลาง"
            @click="scrollX = 300"
          />
          <span class="text-16 text-gray-500"
            >scrollPosition ตอนนี้: {{ Math.round(scrollX) }}px</span
          >
        </div>
        <span class="px-4 text-16 text-gray-500">
          ลากแถวข้างบนแล้วดูตัวเลขอัปเดตตาม — และกดปุ่มสั่งให้เลื่อนจากข้างนอกก็ได้ (smooth scroll)
        </span>
      </div>

      <hr />

      <div
        id="demo-items-per-page"
        class="px-4"
      >
        <div class="mb-2 text-18 font-bold">
          itemsPerPage = 2 — ลากแล้วปล่อยจะจอดทีละหน้า (หน้าละ 2 การ์ด) แทนที่จะจอดตรงไหนก็ได้
        </div>
        <DragScroll
          v-model:page="currentPage"
          :items-per-page="2"
          :gap="12"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="box-border flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>
        <span class="text-16 text-gray-500">
          จุด indicator ด้านล่างมาให้เองอัตโนมัติ (กดจุดเพื่อกระโดดข้ามหน้าได้) — v-model:page
          ตอนนี้:
          {{ currentPage }}
        </span>
      </div>

      <hr />

      <div
        id="demo-items-per-page-slot"
        class="px-4"
      >
        <div class="mb-2 text-18 font-bold">
          itemsPerPage + slot #indicators — เปลี่ยนตัวนำทางเป็นปุ่มลูกศร + ตัวนับเอง
        </div>
        <DragScroll
          :items-per-page="3"
          :gap="8"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="box-border flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>

          <template #indicators="{ current, count, prev, next, first, last }">
            <div class="mt-1 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                round="circle"
                label="‹"
                :disabled="first"
                @click="prev"
              />
              <span class="text-16 text-gray-500">{{ current + 1 }} / {{ count }}</span>
              <Button
                variant="outline"
                size="sm"
                round="circle"
                label="›"
                :disabled="last"
                @click="next"
              />
            </div>
          </template>
        </DragScroll>
      </div>

      <hr />

      <div
        id="demo-show-indicators"
        class="px-4"
      >
        <div class="mb-2 text-18 font-bold">
          showIndicators = false — ยังลากจอดทีละหน้าได้ปกติ แค่ไม่มีจุดนำทางให้เห็น
        </div>
        <DragScroll
          :items-per-page="2"
          :gap="12"
          :show-indicators="false"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="box-border flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>
      </div>

      <hr />

      <div
        id="demo-incomplete-last-page"
        class="px-4"
      >
        <div class="mb-2 text-18 font-bold">
          หน้าสุดท้ายไม่ครบ — 10 การ์ด itemsPerPage = 3 ได้ 4 หน้า หน้าสุดท้ายเหลือการ์ดเดียว
        </div>
        <DragScroll
          v-model:page="lastPageDemoPage"
          :items-per-page="4"
          :gap="8"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="box-border flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg bg-main-1/10 text-center"
          >
            <div class="text-20 font-bold text-main-1">{{ card.title }}</div>
            <div class="text-14 text-gray-500">{{ card.description }}</div>
          </div>
        </DragScroll>
        <span class="text-16 text-gray-500">
          ลากไปหน้าสุดท้าย (จุดที่ 4) — จะเห็นแค่การ์ด 10 ใบเดียวชิดซ้าย ไม่ดึงการ์ด 8-9
          มาโชว์เต็มหน้า ปัจจุบันอยู่หน้า: {{ lastPageDemoPage + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface DemoCard {
    id: number
    title: string
    description: string
  }

  const cards: DemoCard[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `การ์ด ${i + 1}`,
    description: 'ลากเลื่อนดูได้เลย',
  }))

  const scrollX = ref(0)
  const currentPage = ref(0)
  const lastPageDemoPage = ref(0)
</script>

<style scoped lang="scss">
  [id^='demo-'] {
    scroll-margin-top: 72px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example'
    title: 'DragScroll Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
