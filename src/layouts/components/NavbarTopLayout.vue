<template>
  <div class="navbar-top-container">
    <div class="navbar-top-wrapper">
      <div
        class="navbar-top-content"
        :class="[scrollY > 23 ? 'scroll' : '']"
      >
        <!-- ปุ่มย้อนกลับ -->
        <div class="button-back-container">
          <div
            v-if="route.meta.navtop?.back_to"
            class="button-back"
            @click="handleBackToPage"
          >
            <Svg
              src="common/arrow-left"
              class="icon"
              color="white"
            />
          </div>
        </div>

        <!-- Title or Logo -->
        <div class="content">
          <!-- <img
          v-if="!route.meta.navtop?.title"
          class="image"
          src="@/assets/images/logo-pasaya.png"
          alt="img-logo"
        /> -->
          <div
            v-if="titleLoading"
            class="text"
          >
            ...
          </div>
          <img
            v-else-if="!displayTitle"
            class="image"
            :src="'https://www.internetconsultancy.pro/wp-content/uploads/2018/05/NASA_Worm_logo.svg-750x207.png'"
            alt="img-logo"
          />
          <div
            v-else
            class="text"
            :class="{ 'text-two-line': displayTitle.includes('<br>') }"
            v-dompurify-html="displayTitle"
          ></div>
        </div>

        <!-- Show Point or Empty -->
        <div
          v-if="route.meta.navtop?.show_point"
          class="show-point"
        >
          <div
            v-if="route.meta.navtop?.type_point == 'สิทธิ์สะสม'"
            class="text"
          >
            สิทธิ์สะสม
          </div>
          <div
            v-if="route.meta.navtop?.type_point == 'คะแนนสะสม'"
            class="text"
          >
            คะแนนสะสม
          </div>
          <div class="point-info">
            <div class="point"></div>
          </div>
        </div>
        <div
          v-else
          class="empty"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NavtopMeta } from 'vue-router'

  interface Props {
    metaNavtopInfo?: NavtopMeta
  }

  const props = withDefaults(defineProps<Props>(), {
    metaNavtopInfo: () => ({}),
  })

  const route = useRoute()
  const router = useRouter()

  const scrollY = ref<number>(0)

  const { dynamicTitle, titleLoading } = useHeaderTitle()

  const displayTitle = computed<string>(() => {
    return dynamicTitle.value || props.metaNavtopInfo?.title || route.meta.navtop?.title || ''
  })

  const handleScroll = () => {
    // ตอน modal ล็อก scroll (scrollLock.ts) body จะถูกสั่ง position:fixed ทำให้ window.scrollY
    // เด้งกลับเป็น 0 เอง (document ไม่มีความสูงให้ scroll แล้ว) — ถ้าไม่กันไว้ header จะเข้าใจผิด
    // ว่า scroll กลับไปบนสุด แล้วปิดพื้นหลังขาวทั้งที่ผู้ใช้ยังไม่ได้เลื่อนขึ้นไปจริง
    if (isScrollLocked()) return
    scrollY.value = window.scrollY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  const handleBackToPage = () => {
    const backTo = route.meta.navtop?.back_to
    if (backTo) router.replace(backTo)
  }
</script>

<style lang="scss" scoped>
  .navbar-top-container {
    width: 100%;
    height: 56px;
    // ต้องระบุ top: 0 ตรงๆ — position: fixed ที่ไม่กำหนด top จะ fallback ไปใช้ static position
    // (ตำแหน่งที่ควรอยู่ถ้าไม่ fixed) ซึ่งพังทันทีที่ scrollLock.ts สั่ง body { top: -scrollY }
    // ตอนเปิด modal เพราะ static position ของ navbar จะเลื่อนตาม body ไปด้วย ทำให้หลุดจอ
    top: 0;
    display: flex;
    justify-content: center;
    // position: relative;
    position: fixed;
    z-index: 1;

    & .navbar-top-wrapper {
      position: absolute;
      width: 100%;
      height: 100%;
      max-width: 640px;
      // background-color: yellow;
      // top: 0px;

      & .navbar-top-content {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        transition: background-color 0.3s ease;

        &.scroll {
          background-color: white;
        }

        & .button-back-container {
          width: 50px;

          & .button-back {
            width: 32px;
            height: 32px;
            background-color: #6b590c;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0px 1.17px 5.83px 0px #bcbcbc57;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              transform: translateY(-1px);
            }

            &:active {
              transform: scale(0.95);
            }

            & .icon {
              color: white;
              width: 18px;
              height: 18px;
            }
          }
        }

        & .content {
          height: 100%;
          display: flex;
          align-items: center;
          & img {
            width: 88px;
            height: 34px;
          }

          & .text {
            font-size: 16px;
            font-weight: 700;
            line-height: 24px;
            text-align: center;
            color: #9b8c4b;
          }

          & .text-two-line {
            padding: 13px 0 0;
          }
        }

        & .show-point {
          width: 50px;
          display: flex;
          flex-direction: column;

          & .text {
            font-size: 15px;
            font-weight: 400;
            text-align: end;
            margin-bottom: -8px;
          }

          & .point-info {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            gap: 2px;

            & img {
              width: 16px;
              height: 16px;
            }
          }
        }

        & .empty {
          width: 50px;
        }
      }
    }
  }
</style>
