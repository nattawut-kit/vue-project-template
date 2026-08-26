<template>
  <div class="container">
    <div>Img Demo</div>

    <ImgDocs class="mb-4" />

    <hr />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-18 font-bold">
          basic (src / alt) — กดปุ่มเพื่อดู spinner ตอนโหลดรูปใหม่
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Img
            :src="basicSrc"
            alt="รูปตัวอย่างพื้นฐาน"
            class="size-32"
            round="lg"
          />
          <Button
            variant="secondary"
            label="โหลดรูปใหม่"
            @click="reloadBasicImage"
          />
        </div>
      </div>

      <hr />

      <div id="demo-width-height">
        <div class="mb-2 text-18 font-bold">width / height</div>
        <div class="flex flex-wrap items-end gap-3">
          <Img
            src="https://picsum.photos/seed/img-demo-wh-1/400/300"
            :width="80"
            :height="80"
          />
          <Img
            src="https://picsum.photos/seed/img-demo-wh-2/400/300"
            width="120px"
            height="60px"
          />
        </div>
      </div>

      <hr />

      <div id="demo-aspect-ratio">
        <div class="mb-2 text-18 font-bold">aspectRatio (ตัด layout shift ตอนโหลด)</div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="ratioOption in aspectRatioOptions"
            :key="ratioOption.value"
            class="flex flex-col items-center gap-1"
          >
            <Img
              :src="`https://picsum.photos/seed/img-demo-ar/600/600`"
              :aspect-ratio="ratioOption.value"
              round="md"
              class="w-full"
            />
            <span class="text-18 text-gray-500">{{ ratioOption.label }}</span>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-fit">
        <div class="mb-2 text-18 font-bold">fit</div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="fitOption in fitOptions"
            :key="fitOption"
            class="flex flex-col items-center gap-1"
          >
            <Img
              src="https://picsum.photos/seed/img-demo-fit/300/450"
              :fit="fitOption"
              class="size-20 bg-gray-100"
            />
            <span class="text-18 text-gray-500">{{ fitOption }}</span>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-position">
        <div class="mb-2 text-18 font-bold">position (คู่กับ fit="cover")</div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="positionOption in positionOptions"
            :key="positionOption"
            class="flex flex-col items-center gap-1"
          >
            <Img
              src="https://picsum.photos/seed/img-demo-position/450/450"
              fit="cover"
              :position="positionOption"
              class="size-20"
            />
            <span class="text-18 text-gray-500">{{ positionOption }}</span>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-round">
        <div class="mb-2 text-18 font-bold">round</div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="roundOption in roundOptions"
            :key="roundOption"
            class="flex flex-col items-center gap-1"
          >
            <Img
              src="https://picsum.photos/seed/img-demo-round/300/300"
              :round="roundOption"
              class="size-20"
            />
            <span class="text-18 text-gray-500">{{ roundOption }}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <Img
              src="https://picsum.photos/seed/img-demo-round-custom/300/300"
              round="10px"
              class="size-20"
            />
            <span class="text-18 text-gray-500">10px</span>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-img-class-style">
        <div class="mb-2 text-18 font-bold">
          imgClass / imgStyle (สไตล์เฉพาะ &lt;img&gt; แยกจาก container)
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex flex-col items-center gap-1">
            <Img
              src="https://picsum.photos/seed/img-demo-imgclass-normal/300/300"
              round="lg"
              class="ring-main-1 size-20 ring-2"
            />
            <span class="text-18 text-gray-500">ปกติ (class ที่ส่งเข้ามาลง container)</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              src="https://picsum.photos/seed/img-demo-imgclass-gray/300/300"
              img-class="grayscale"
              round="lg"
              class="ring-main-1 size-20 ring-2"
            />
            <span class="text-18 text-gray-500">imgClass="grayscale"</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              src="https://picsum.photos/seed/img-demo-imgclass-blur/300/300"
              :img-style="{ filter: 'blur(2px)' }"
              round="lg"
              class="ring-main-1 size-20 ring-2"
            />
            <span class="text-18 text-gray-500">imgStyle="{ filter: 'blur(2px)' }"</span>
          </div>
        </div>
        <span class="text-18 text-gray-500">
          ring (ring-main-1) ยังอยู่ที่ container ปกติ — grayscale/blur โดน "เฉพาะ" ตัว &lt;img&gt;
          เท่านั้น
        </span>
      </div>

      <hr />

      <div id="demo-loading">
        <div class="mb-2 text-18 font-bold">
          loading state — pulse default / placeholder slot ที่ปรับเอง / placeholderSrc
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcDefault"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">default (pulse)</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcCustom"
              class="size-24"
              round="lg"
              :reveal="false"
            >
              <template #placeholder>
                <div
                  class="flex h-full w-full items-center justify-center bg-main-1/10 text-14 font-bold text-main-1"
                >
                  กำลังโหลด...
                </div>
              </template>
            </Img>
            <span class="text-18 text-gray-500">placeholder slot ที่ปรับเอง</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcPlaceholder"
              :placeholder-src="placeholderSrcExample"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">placeholderSrc (โชว์รูปสำรองต่ำก่อน)</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcSpinnerColor"
              :spinner="{ color: '#0d6efd', size: '28px' }"
              :reveal="false"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">spinner="{{ '{ color, size }' }}"</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcSpinnerFalse"
              :spinner="false"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">spinner: false</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcSpinnerPulse"
              spinner="pulse"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">spinner: 'pulse'</span>
          </div>

          <div class="flex flex-col items-center gap-1">
            <Img
              :src="loadingSrcReveal"
              :reveal="false"
              class="size-24"
              round="lg"
            />
            <span class="text-18 text-gray-500">reveal: false (โชว์รูปตั้งแต่เริ่มโหลด)</span>
          </div>

          <Button
            variant="secondary"
            label="โหลดใหม่"
            @click="reloadLoadingDemo"
          />
        </div>
      </div>

      <hr />

      <div id="demo-pulse-real">
        <div class="mb-2 text-18 font-bold">
          ตัวอย่างจริง — การ์ดสมาชิก (aspect-ratio 1.32/1, spinner="pulse")
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Img
            :key="realCardKey"
            :src="REAL_CARD_SRC"
            aspect-ratio="1.32/1"
            round="16px"
            class="w-full"
          />
          <Button
            variant="secondary"
            label="โหลดใหม่"
            @click="reloadRealCard"
          />
        </div>
        <span class="text-18 text-gray-500">
          รูปจริงจาก Azure Blob Storage — ปุ่มโหลดใหม่รีเมาท์ Img ด้วย :key เพื่อดู pulse ซ้ำ
          (หลังครั้งแรก browser cache อาจทำให้โหลดเร็วจนแทบไม่เห็น pulse)
        </span>
      </div>

      <hr />

      <div id="demo-responsive">
        <div class="mb-2 text-18 font-bold">srcset / sizes (responsive — browser เลือกรูปเอง)</div>
        <Img
          src="https://picsum.photos/seed/img-demo-responsive/400/300"
          srcset="https://picsum.photos/seed/img-demo-responsive/400/300 400w, https://picsum.photos/seed/img-demo-responsive/800/600 800w, https://picsum.photos/seed/img-demo-responsive/1200/900 1200w"
          sizes="(max-width: 640px) 100vw, 400px"
          aspect-ratio="4/3"
          round="lg"
          class="w-full"
        />
        <span class="text-18 text-gray-500"
          >ลอง resize หน้าจอ — เปิด DevTools ดู request ที่ยิงจริงจะเห็นว่า browser เลือก
          400w/800w/1200w ตาม viewport</span
        >
      </div>

      <hr />

      <div id="demo-fallback">
        <div class="mb-2 text-18 font-bold">fallbackSrc (src หลักโหลดไม่ผ่าน)</div>
        <div class="flex flex-wrap items-center gap-3">
          <Img
            src="https://picsum.photos/broken-url-for-demo"
            fallback-src="https://picsum.photos/seed/img-demo-fallback/300/300"
            class="size-20"
            round="lg"
          />
          <span class="text-14 text-gray-500">src หลักพัง → สลับไป fallbackSrc อัตโนมัติ</span>
        </div>
      </div>

      <hr />

      <div id="demo-error-slot">
        <div class="mb-2 text-18 font-bold">error slot (ไม่มี fallbackSrc)</div>
        <div class="flex flex-wrap items-center gap-3">
          <Img
            src="https://picsum.photos/another-broken-url-for-demo"
            class="size-20"
            round="lg"
          >
            <template #error>
              <div
                class="flex h-full w-full items-center justify-center bg-gray-100 text-14 text-gray-400"
              >
                โหลดไม่สำเร็จ
              </div>
            </template>
          </Img>
        </div>
      </div>

      <hr />

      <div id="demo-lazy">
        <div class="mb-2 text-18 font-bold">lazy (default true — false = โหลดทันที)</div>
        <div class="flex flex-wrap gap-3">
          <Img
            src="https://picsum.photos/seed/img-demo-lazy-1/300/300"
            class="size-20"
            round="lg"
          />
          <Img
            src="https://picsum.photos/seed/img-demo-lazy-2/300/300"
            :lazy="false"
            class="size-20"
            round="lg"
          />
        </div>
      </div>

      <hr />

      <div id="demo-draggable">
        <div class="mb-2 text-18 font-bold">
          draggable (default true — false = ลากรูปด้วยเมาส์ไม่ได้)
        </div>
        <div class="flex flex-wrap gap-3">
          <Img
            src="https://picsum.photos/seed/img-demo-draggable-1/300/300"
            class="size-20"
            round="lg"
          />
          <Img
            src="https://picsum.photos/seed/img-demo-draggable-2/300/300"
            :draggable="false"
            class="size-20"
            round="lg"
          />
        </div>
        <span class="text-18 text-gray-500">
          ลองกดค้างแล้วลากรูปทั้งสอง — รูปที่ 2 (draggable false) จะลากไม่ได้
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ImgDocs from './_components/ImgDocs.vue'

  const fitOptions = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const
  const positionOptions = [
    'center',
    'top',
    'bottom',
    'left',
    'right',
    'left-top',
    'right-bottom',
  ] as const
  const roundOptions = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const

  const aspectRatioOptions = [
    { value: '16/9', label: '16/9' },
    { value: '1/1', label: '1/1' },
    { value: '4/3', label: '4/3' },
  ] as const

  const basicSeed = ref(0)
  const basicSrc = computed(
    () => `https://picsum.photos/seed/img-demo-basic-${basicSeed.value}/400/300`
  )
  const reloadBasicImage = (): void => {
    basicSeed.value += 1
  }

  const loadingSeed = ref(0)
  const loadingSrcDefault = computed(
    () => `https://picsum.photos/seed/img-demo-loading-default-${loadingSeed.value}/500/500`
  )
  const loadingSrcCustom = computed(
    () => `https://picsum.photos/seed/img-demo-loading-custom-${loadingSeed.value}/500/500`
  )
  const loadingSrcPlaceholder = computed(
    () => `https://picsum.photos/seed/img-demo-loading-placeholder-${loadingSeed.value}/500/500`
  )
  const loadingSrcSpinnerColor = computed(
    () => `https://picsum.photos/seed/img-demo-loading-spinner-color-${loadingSeed.value}/500/500`
  )
  const loadingSrcSpinnerFalse = computed(
    () => `https://picsum.photos/seed/img-demo-loading-spinner-false-${loadingSeed.value}/500/500`
  )
  const loadingSrcSpinnerPulse = computed(
    () => `https://picsum.photos/seed/img-demo-loading-spinner-pulse-${loadingSeed.value}/500/500`
  )
  const loadingSrcReveal = computed(
    () => `https://picsum.photos/seed/img-demo-loading-reveal-${loadingSeed.value}/500/500`
  )
  const reloadLoadingDemo = (): void => {
    loadingSeed.value += 1
  }

  const REAL_CARD_SRC =
    'https://devbcrmdata.blob.core.windows.net/bcrm-245-b3wdpdworwmd/AJAYT7XH1HMV_app-bo-cust/Card/20260526_050036_20260526_170036_Card_Image_540265.png_LYTKFDD.png?sv=2026-04-06&se=2031-04-30T10%3A00%3A37Z&sr=b&sp=r&sig=52XH3MXorzAij8uPbSBBsJXkP7uhZm%2BwmbmGW%2FZvufA%3D'
  const realCardKey = ref(0)
  const reloadRealCard = (): void => {
    realCardKey.value += 1
  }

  // ตัวอย่าง placeholderSrc — ปกติจะเป็นรูป base64 ความละเอียดต่ำ/เบลอของรูปจริง ในที่นี้ใช้สี่เหลี่ยมสีเทาแทน
  const placeholderSrcExample =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDk2IDk2Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjREREREREIi8+PHBhdGggZmlsbD0iIzk5OTk5OSIgZD0iTTIwLjQyNSA0NS40cTAgMS4wOS41NiAxLjY2dDEuNi41N3EuNTQgMCAuOTYtLjE3dC43MS0uNDdxLjI5LS4yOS40NC0uNy4xNC0uNC4xNC0uODcgMC0uNTMtLjE2LS45NXQtLjQ2LS43MXEtLjI5LS4yOC0uNy0uNDQtLjQxLS4xNS0uOS0uMTUtLjUgMC0uOTEuMTctLjQuMTYtLjY5LjQ2dC0uNDQuNzEtLjE1Ljg5bS0xLjA5IDkuMTEgNC4wNC01LjA1LjI5LS4zNy4yNi0uMzZxLS40NS4yOS0uOTkuNDR0LTEuMTQuMTVxLS42NyAwLTEuMzItLjI0LS42NS0uMjMtMS4xNS0uNy0uNTEtLjQ4LS44Mi0xLjE3LS4zMS0uNy0uMzEtMS42NCAwLS44Ny4zMy0xLjY0LjMyLS43Ni45MS0xLjM0LjU4LS41NyAxLjQtLjkxLjgyLS4zMyAxLjgxLS4zMyAxIDAgMS43OS4zMi44LjMxIDEuMzYuODguNTcuNTcuODcgMS4zNnQuMyAxLjczcTAgLjYxLS4xIDEuMTUtLjExLjU0LS4zIDEuMDR0LS40Ni45N3EtLjI3LjQ4LS42Ljk1TDIyLjUyNSA1NHEtLjE1LjIxLS40Ni4zNi0uMy4xNS0uNjkuMTV6bTE3LjExLTEzLjAxLTMuODYgNC43Mi0uNDUuNTZxLjM4LS4xOS44Mi0uMjkuNDMtLjExLjk0LS4xMS43NCAwIDEuNDMuMjUuNy4yNCAxLjIzLjczdC44NiAxLjIycS4zMi43My4zMiAxLjcgMCAuOTEtLjMzIDEuNzEtLjMzLjc5LS45NCAxLjM5LS42LjU5LTEuNDUuOTN0LTEuODguMzRxLTEuMDQgMC0xLjg3LS4zM3QtMS40MS0uOTNxLS41OS0uNi0uOS0xLjQ0dC0uMzEtMS44N3EwLS45Mi4zOC0xLjg4LjM3LS45NyAxLjE1LTIuMDJsMy4xMS00LjE2cS4xNi0uMjIuNDctLjM3dC43MS0uMTV6bS0zLjM1IDExLjM0cS41MyAwIC45Ny0uMTguNDUtLjE4Ljc3LS41MS4zMi0uMzIuNS0uNzZ0LjE4LS45NXEwLS41Ni0uMTctMS0uMTctLjQ1LS40OS0uNzYtLjMxLS4zMS0uNzUtLjQ3LS40NS0uMTYtLjk4LS4xNnQtLjk2LjE4LS43NC41cS0uMy4zMi0uNDcuNzUtLjE4LjQ0LS4xOC45NCAwIC41NC4xNS45OS4xNS40NC40NC43Ni4zLjMxLjczLjQ5dDEgLjE4bTE5LjA4LTEuMzEtMS4xOCAxLjE2LTMuMDUtMy4wNS0zLjA4IDMuMDctMS4xOC0xLjE2IDMuMDgtMy4wOS0yLjk0LTIuOTMgMS4xNy0xLjE3IDIuOTQgMi45MyAyLjkyLTIuOTEgMS4xOCAxLjE3LTIuOTIgMi45MnptOC4zMS02LjEzcTAgMS4wOS41NyAxLjY2LjU2LjU3IDEuNTkuNTcuNTQgMCAuOTctLjE3LjQyLS4xNy43MS0uNDcuMjktLjI5LjQzLS43LjE1LS40LjE1LS44NyAwLS41My0uMTYtLjk1dC0uNDYtLjcxcS0uMjktLjI4LS43LS40NC0uNDEtLjE1LS45LS4xNS0uNSAwLS45MS4xNy0uNC4xNi0uNjkuNDZ0LS40NC43MXEtLjE2LjQxLS4xNi44OW0tMS4wOCA5LjExIDQuMDQtNS4wNXEuMTUtLjE5LjI4LS4zNy4xNC0uMTguMjctLjM2LS40NS4yOS0uOTkuNDR0LTEuMTQuMTVxLS42NyAwLTEuMzItLjI0LS42NS0uMjMtMS4xNS0uNy0uNTEtLjQ4LS44Mi0xLjE3LS4zMS0uNy0uMzEtMS42NCAwLS44Ny4zMy0xLjY0LjMyLS43Ni45LTEuMzQuNTktLjU3IDEuNDEtLjkxLjgyLS4zMyAxLjgxLS4zMyAxIDAgMS43OS4zMi44LjMxIDEuMzYuODh0Ljg3IDEuMzZxLjMuNzkuMyAxLjczIDAgLjYxLS4xMSAxLjE1LS4xLjU0LS4yOSAxLjA0dC0uNDYuOTdxLS4yNy40OC0uNi45NUw2Mi41OTUgNTRxLS4xNS4yMS0uNDYuMzYtLjMuMTUtLjY5LjE1em0xNy4xMS0xMy4wMS0zLjg2IDQuNzItLjQ1LjU2cS4zOC0uMTkuODItLjI5LjQzLS4xMS45NC0uMTEuNzQgMCAxLjQzLjI1LjcuMjQgMS4yMy43M3QuODYgMS4yMnEuMzIuNzMuMzIgMS43IDAgLjkxLS4zMyAxLjcxLS4zNC43OS0uOTQgMS4zOS0uNi41OS0xLjQ1LjkzdC0xLjg4LjM0cS0xLjA0IDAtMS44Ny0uMzN0LTEuNDEtLjkzcS0uNTktLjYtLjktMS40NHQtLjMxLTEuODdxMC0uOTIuMzctMS44OC4zOC0uOTcgMS4xNi0yLjAybDMuMTEtNC4xNnEuMTYtLjIyLjQ3LS4zN3QuNzEtLjE1em0tMy4zNSAxMS4zNHEuNTMgMCAuOTctLjE4LjQ1LS4xOC43Ny0uNTEuMzItLjMyLjUtLjc2dC4xOC0uOTVxMC0uNTYtLjE3LTEtLjE3LS40NS0uNDktLjc2LS4zMS0uMzEtLjc2LS40Ny0uNDQtLjE2LS45Ny0uMTZ0LS45Ni4xOC0uNzQuNXEtLjMuMzItLjQ4Ljc1LS4xNy40NC0uMTcuOTQgMCAuNTQuMTUuOTkuMTUuNDQuNDQuNzYuMy4zMS43My40OXQxIC4xOCIvPjwvc3ZnPg=='
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
    title: 'Img Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
