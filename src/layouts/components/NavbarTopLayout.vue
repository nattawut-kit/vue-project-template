<template>
  <div class="navbar-container">
    <div
      class="navbar-content"
      :class="
        route.meta.navbottom.current == 'privilege' && scrollY > 220
          ? 'navbar-content scroll noblur'
          : scrollY > 23
          ? 'navbar-content scroll'
          : ''
      "
    >
      <!-- ปุ่มย้อนกลับ -->
      <div class="button-back">
        <q-btn v-if="route.meta.navtop.back_to" class="back-btn" @click="handleBackToPage()">
          <!-- <img src="@/assets/images/icons/elements/arrow-left.png" /> -->
        </q-btn>
      </div>

      <!-- Title or image -->
      <div class="content">
        <img
          v-if="!route.meta.navtop.title"
          class="image"
          src="@/assets/images/logo-chuahahaseng.png"
          alt="img-logo"
        />
        <div
          class="text"
          :class="{ 'text-two-line': route.meta.navtop.title.includes('<br>') }"
          v-if="route.meta.navtop.title"
          v-dompurify-html="route.meta.navtop.title"
        ></div>
      </div>

      <!-- Show Point-->
      <div v-if="route.meta.navtop.show_point" class="show-point">
        <div v-if="route.meta.navtop.type_point == 'สิทธิ์สะสม'" class="text">สิทธิ์สะสม</div>
        <div v-if="route.meta.navtop.type_point == 'คะแนนสะสม'" class="text">คะแนนสะสม</div>
        <div class="point-info">
          <!-- <img
            v-if="route.meta.navtop.type_point == 'สิทธิ์สะสม'"
            src="@/assets/images/icons/elements/coin.png"
            alt="img-coin"
          /> -->
          <!-- <img
            v-if="route.meta.navtop.type_point == 'คะแนนสะสม'"
            src="@/assets/images/icons/elements/coin-border.png"
            alt="img-coin"
          /> -->
          <div class="point">
            <!-- {{ showPoint?.point_balance ? showPoint.point_balance.toLocaleString() : 0 }} -->
          </div>
        </div>
      </div>
      <div v-else class="empty"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import type { IPoint } from '@/interface/customer/customer_info'

const route: any = useRoute()
const router: any = useRouter()

const scrollY = ref<number>(0)

// const customerStore = useCustomerStore()
// const showPoint = ref<IPoint>({ point_balance: 0 })

window.addEventListener(
  'scroll',
  (event) => {
    scrollY.value = window.scrollY
  },
  { passive: true }
)

const handleBackToPage = (): void => {
  router.push(String(route.meta.navtop.back_to))
}

// watch(
//   () => customerStore.customerPoint?.point_balance,
//   async () => {
//     await customerStore.fetchCustomerPoint()
//     showPoint.value = (await customerStore.getCustomerPoint) || { point_balance: 0 }
//   }
// )

// onMounted(async () => {
//   await customerStore.fetchCustomerPoint()
//   showPoint.value = (await customerStore.getCustomerPoint) || { point_balance: 0 }
// })
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  z-index: 6000;

  & .navbar-content {
    width: 600px;
    height: 84px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;

    & .button-back {
      width: 50px;
    }

    & .content {
      & img {
        width: 49px;
        height: 58px;
      }

      & .text {
        font-size: 20px;
        font-weight: 400;
        line-height: 22px;
        text-align: center;
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
  background-color: rgba(0, 51, 160, 0.8);
  backdrop-filter: blur(20px);
}

.navbar-content.scroll.noblur {
  background-color: rgba(0, 51, 160, 1);
}
</style>
