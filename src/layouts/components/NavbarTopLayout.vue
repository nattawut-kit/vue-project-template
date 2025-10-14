<template>
  <div class="navbar-container">
    <div
      class="navbar-content"
      :class="[
        scrollY > 23 && route.meta.navbottom.current != 'otp'
          ? 'navbar-content scroll'
          : '',
        route.meta.navtop.is_background ? 'have-background-color' : '',
      ]"
    >
      <!-- ปุ่มย้อนกลับ -->
      <div class="button-back-container">
        <div
          v-if="route.meta.navtop.back_to"
          class="button-back"
          @click="handleBackToPage"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </div>
      </div>

      <!-- Title or image -->
      <div class="content">
        <!-- <img
          v-if="!route.meta.navtop.title"
          class="image"
          src="@/assets/images/logo-pasaya.png"
          alt="img-logo"
        /> -->
        <img
          v-if="!route.meta.navtop.title"
          class="image"
          :src="'https://www.internetconsultancy.pro/wp-content/uploads/2018/05/NASA_Worm_logo.svg-750x207.png'"
          alt="img-logo"
        />
        <div
          class="text"
          :class="{ 'text-two-line': route.meta.navtop.title.includes('<br>') }"
          v-if="route.meta.navtop.title"
          v-dompurify-html="
            metaNavtopInfo?.title
              ? metaNavtopInfo?.title
              : route.meta.navtop.title
          "
        ></div>
      </div>

      <!-- Show Point-->
      <div v-if="route.meta.navtop.show_point" class="show-point">
        <div v-if="route.meta.navtop.type_point == 'สิทธิ์สะสม'" class="text">
          สิทธิ์สะสม
        </div>
        <div v-if="route.meta.navtop.type_point == 'คะแนนสะสม'" class="text">
          คะแนนสะสม
        </div>
        <div class="point-info">
          <div class="point"></div>
        </div>
      </div>
      <div v-else class="empty"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route: any = useRoute()
const router: any = useRouter()

const scrollY = ref<number>(0)

const props = defineProps({
  metaNavtopInfo: Object,
})

window.addEventListener(
  'scroll',
  event => {
    scrollY.value = window.scrollY
  },
  { passive: true },
)

const handleBackToPage = (): void => {
  router.push(String(route.meta.navtop.back_to))
}
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  z-index: 6000;
  flex-direction: column;
  align-items: center;

  & .navbar-content {
    width: 100%;
    max-width: 600px;
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    border-top: 1px solid #e5e5e5;

    &.have-background-color {
      background-color: var(--white-color);
      height: 56px;
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

        & i {
          color: white;
          font-size: 18px;
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

.navbar-content.scroll {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-top: none;
}
</style>
