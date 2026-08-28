<template>
  <div>
    <div>Carousel Demo</div>

    <div class="px-4">
      <CarouselDocs class="mb-4" />
    </div>

    <hr />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-18 font-bold">basic (items + default slot)</div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
      </div>

      <hr />

      <div id="demo-autoplay">
        <div class="mb-2 text-18 font-bold">autoplay (duration 2000ms)</div>
        <Carousel
          :items="banners"
          autoplay
          :infinity="false"
          :duration="2000"
          aspect-ratio="2/1"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
      </div>

      <hr />

      <div id="demo-peek-amount">
        <div class="mb-2 text-18 font-bold">
          peekAmount = 14 — สไลด์แรกเว้นซ้าย 14, สไลด์สุดท้ายเว้นขวา 14
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          :peek-amount="14"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
      </div>

      <hr />

      <div id="demo-peek-scale">
        <div class="mb-2 text-18 font-bold">
          peekScale = 0.85 — ใบข้างๆ เล็กกว่า แล้วค่อยๆ ขยายเต็มตอนเลื่อนมาถึง
        </div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :peek-scale="0.85"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            ระยะ peek ที่โผล่ยังเท่า peekAmount เหมือนเดิม (16px) เปลี่ยนแค่ขนาดใบ — เลื่อนดู ใบที่
            peek อยู่จะย่อไว้ พอกลายเป็นใบที่ focus ก็ขยายเต็มพร้อมกับที่ track เลื่อน
          </span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :peek-scale="0.7"
            :peek-amount="32"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            peekScale = 0.7 คู่กับ peekAmount = 32 — ย่อเยอะขึ้นและโผล่มากขึ้น เห็นผลชัดกว่า
          </span>
        </div>
      </div>

      <hr />

      <div id="demo-infinity">
        <div class="mb-2 text-18 font-bold">
          infinity = true — เลยใบสุดท้ายแล้วเลื่อนต่อเป็นใบแรกแบบไม่ย้อนกลับ
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          infinity
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
        <span class="text-16 text-gray-500">
          ลากไปข้างหน้าเรื่อยๆ ผ่านใบสุดท้าย — จะเห็นเป็นใบแรกเลื่อนเข้ามาต่อ
          ไม่ใช่รูดถอยกลับไปใบแรก เทียบกับตัวที่ตั้ง infinity = false ที่ลากถึงใบสุดท้ายแล้วจะตัน
          มีแรงหน่วง ต้องลากย้อนกลับเท่านั้น
        </span>
      </div>

      <hr />

      <div id="demo-v-model">
        <div class="mb-2 text-18 font-bold">v-model — อ่าน/สั่ง index สไลด์จากข้างนอก</div>
        <Carousel
          v-model="currentBanner"
          :items="banners"
          aspect-ratio="2/1"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Button
            v-for="(banner, index) in banners"
            :key="banner.id"
            variant="secondary"
            size="sm"
            :label="`ไปสไลด์ ${index + 1}`"
            @click="currentBanner = index"
          />
          <span class="text-16 text-gray-500">
            ค่าใน v-model ตอนนี้: {{ currentBanner }} ({{ banners[currentBanner]?.title }})
          </span>
        </div>
        <span class="text-16 text-gray-500">
          ลาก/กดจุด แล้วดูตัวเลขข้างบนอัปเดตตาม — และกดปุ่มสั่งให้ carousel เลื่อนจากข้างนอกก็ได้
        </span>
      </div>

      <hr />

      <div id="demo-drag-follow">
        <div class="mb-2 text-18 font-bold">
          dragFollow = true — ลากแล้วรูปวิ่งตามเมาส์/นิ้วแบบ real-time
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          drag-follow
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
        <span class="text-16 text-gray-500">
          ลองลากเทียบกับตัวอื่นในหน้านี้ (default = false ที่รูปอยู่นิ่งจนปล่อยแล้วค่อยเลื่อน) —
          ทั้งสองแบบลากเปลี่ยนสไลด์ได้เหมือนกัน ต่างแค่ระหว่างลากเห็นภาพขยับตามมือไหม
        </span>
      </div>

      <hr />

      <div
        id="demo-no-peek"
        class="px-4"
      >
        <div class="mb-2 text-18 font-bold">
          peek = false — สไลด์เต็มความกว้าง ไม่เห็นสไลด์ข้างๆ
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          infinity
          :peek="false"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
      </div>

      <hr />

      <div id="demo-click">
        <div class="mb-2 text-18 pl-6 font-bold">click event — ปัด/ลากแล้วปล่อยจะไม่ยิง click</div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          @click="onBannerClick"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
        <span class="text-16 text-gray-500">{{ lastClicked || 'ยังไม่ได้กดสไลด์ไหนเลย' }}</span>
      </div>

      <hr />

      <div id="demo-slide-style">
        <div class="mb-2 text-18 font-bold">
          slideClass / slideStyle — border / shadow / อะไรก็ได้
        </div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            slide-class="border-2 border-main-1 shadow-lg"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            slideClass — ใช้ utility ปกติ (border-2 border-main-1 shadow-lg)
          </span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :slide-style="{
              border: '2px solid var(--color-main-1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            border + boxShadow — ไม่ต้องใส่ ! เพราะเป็น inline style ชนะ class เดิมอยู่แล้ว
          </span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            round="none"
            :slide-style="{ borderRadius: '4px 24px', outline: '3px dashed var(--color-main-4)' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            ใส่ borderRadius เองก็ทับ prop round ได้ (อันนี้ round="none" แต่ style
            สั่งมุมไม่เท่ากัน)
          </span>
        </div>
      </div>

      <hr />

      <div id="demo-round">
        <div class="mb-2 text-18 font-bold">round</div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            round="full"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">round="full"</span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            round="none"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">round="none"</span>
        </div>
      </div>

      <hr />

      <div id="demo-flags">
        <div class="mb-2 text-18 font-bold">showIndicators / clickable</div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :show-indicators="false"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">showIndicators = false</span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :clickable="false"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">clickable = false</span>
        </div>
      </div>

      <hr />

      <div id="demo-indicators-inside">
        <div class="mb-2 text-18 font-bold">indicatorsInside = true — จุดลอยทับอยู่บนรูปเลย</div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          indicators-inside
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>
        </Carousel>
        <span class="text-16 text-gray-500">
          จุดที่ยังไม่ active เปลี่ยนเป็นขาวโปร่งอัตโนมัติ (เทาเดิมจะจมไปกับภาพ) — ใช้คู่กับ slot
          indicators ได้ ตัว custom ก็จะไปลอยทับบนรูปเหมือนกัน
        </span>
      </div>

      <hr />

      <div id="demo-indicators-inside-custom">
        <div class="mb-2 text-18 font-bold">indicatorsInside แบบ object — ปรับตำแหน่งเองได้</div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :indicators-inside="{ offset: '24px' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">{{ "{ offset: '24px' }" }} — ถอยขึ้นจากขอบล่าง</span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :indicators-inside="{ position: 'top', align: 'end' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            {{ "{ position: 'top', align: 'end' }" }} — ไปเกาะมุมขวาบน
          </span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :indicators-inside="{ align: 'start' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">{{ "{ align: 'start' }" }} — ชิดซ้ายล่าง</span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :peek="false"
            :indicators-inside="{ position: 'top', align: 'start' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            peek = false + {{ "{ position: 'top', align: 'start' }" }} — ไม่มี peek ก็ไม่หักระยะ
            จุดชิดขอบ container ตรงๆ
          </span>
        </div>
      </div>

      <hr />

      <div id="demo-indicators-vertical">
        <div class="mb-2 text-18 font-bold">position left / right — จุดเรียงแนวตั้งเกาะข้างรูป</div>
        <div class="flex flex-col gap-4">
          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :indicators-inside="{ position: 'right' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            {{ "{ position: 'right' }" }} — เกาะขวา กึ่งกลางแนวตั้ง
          </span>

          <Carousel
            :items="banners"
            aspect-ratio="2/1"
            :indicators-inside="{ position: 'left', align: 'end' }"
          >
            <template #default="{ item }">
              <Img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full"
              />
            </template>
          </Carousel>
          <span class="text-16 text-gray-500">
            {{ "{ position: 'left', align: 'end' }" }} — เกาะซ้าย ชิดล่าง
          </span>
        </div>
      </div>

      <hr />

      <div id="demo-indicators-slot">
        <div class="mb-2 text-18 font-bold">
          slot #indicators — เปลี่ยนตัว navigate เป็นปุ่มลูกศร + ตัวนับเอง
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>

          <template #indicators="{ current, count, prev, next, first, last }">
            <div class="mt-3 flex items-center justify-center gap-4">
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
        </Carousel>
        <span class="text-16 text-gray-500">
          ปุ่มใน slot ใช้ next/prev ชุดเดียวกับการลาก เลยตัน/วนตาม infinity เหมือนกัน (อันนี้
          infinity = false ปุ่มเลย disabled ตอนสุดทาง)
        </span>
      </div>

      <hr />

      <div id="demo-indicators-inside-slot">
        <div class="mb-2 text-18 font-bold">
          indicatorsInside + slot #indicators — custom nav ลอยทับบนรูป
        </div>
        <Carousel
          :items="banners"
          aspect-ratio="2/1"
          :indicators-inside="{ align: 'end', offset: '10px' }"
        >
          <template #default="{ item }">
            <Img
              :src="item.image"
              :alt="item.title"
              class="h-full w-full"
            />
          </template>

          <template #indicators="{ current, count }">
            <div class="mr-3 rounded-full bg-black/50 px-3 py-1 text-14 text-white">
              {{ current + 1 }} / {{ count }}
            </div>
          </template>
        </Carousel>
        <span class="text-16 text-gray-500">
          slot คุมหน้าตา (pill ดำโปร่ง) ส่วน indicatorsInside คุมตำแหน่ง (มุมขวาล่าง ห่างขอบ 10px) —
          align/offset/position ลงที่ wrapper เลยมีผลกับของใน slot ด้วย
        </span>
      </div>

      <hr />

      <div id="demo-generic">
        <div class="mb-2 text-18 font-bold">
          slot ไม่ผูกกับรูป — สไลด์เป็น card เนื้อหาอะไรก็ได้
        </div>
        <Carousel
          :items="promoCards"
          aspect-ratio="3/2"
          round="lg"
        >
          <template #default="{ item }">
            <div
              class="flex h-full w-full flex-col items-center justify-center gap-1 bg-main-1/10 p-4 text-center"
            >
              <div class="text-20 font-bold text-main-1">{{ item.title }}</div>
              <div class="text-14 text-gray-500">{{ item.description }}</div>
            </div>
          </template>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import CarouselDocs from './_components/CarouselDocs.vue'

  interface DemoBanner {
    id: number
    title: string
    image: string
  }

  const banners: DemoBanner[] = [
    { id: 1, title: 'โปรโมชั่น 1', image: 'https://picsum.photos/seed/carousel-demo-1/800/400' },
    { id: 2, title: 'โปรโมชั่น 2', image: 'https://picsum.photos/seed/carousel-demo-2/800/400' },
    { id: 3, title: 'โปรโมชั่น 3', image: 'https://picsum.photos/seed/carousel-demo-3/800/400' },
  ]

  const currentBanner = ref(0)

  const lastClicked = ref('')
  const onBannerClick = (item: DemoBanner, index: number): void => {
    lastClicked.value = `กดสไลด์ index ${index}: ${item.title}`
  }

  interface DemoCard {
    title: string
    description: string
  }

  const promoCards: DemoCard[] = [
    { title: 'การ์ด 1', description: 'ตัวอย่างเนื้อหาที่ไม่ใช่รูปภาพ' },
    { title: 'การ์ด 2', description: 'สไลด์อะไรก็ได้ผ่าน default slot' },
  ]
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }

  [id^='demo-'] {
    scroll-margin-top: 72px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example'
    title: 'Carousel Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
