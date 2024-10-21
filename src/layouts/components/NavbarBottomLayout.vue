<template>
  <div v-if="route.meta.navbottom.active" class="navbar-container">
    <!-- <div class="navbar-wrapper"> -->
    <div class="navbar-content">
      <div class="content">
        <div class="menu-container">
          <div class="menu-wrapper" @click="handleNamePage('rewards-collection')">
            <!-- <img
              v-if="route.meta.navbottom.current == 'rewards-collection'"
              src="@/assets/images/icons/elements/menu-qr-code-active.png"
              alt="img-qr-code"
            />
            <img
              v-else
              class="no-active"
              src="@/assets/images/icons/elements/menu-qr-code.png"
              alt="img-qr-code"
            /> -->
            <div :class="{ 'text-active': route.meta.navbottom.current == 'rewards-collection' }">
              สะสมสิทธิ์
            </div>
          </div>

          <div class="menu-wrapper" @click="handleNamePage('privilege')">
            <!-- <img
              v-if="route.meta.navbottom.current == 'privilege'"
              src="@/assets/images/icons/elements/menu-gift-active.png"
              alt="img-gift"
            />
            <img
              v-else
              class="no-active"
              src="@/assets/images/icons/elements/menu-gift.png"
              alt="img-gift"
            /> -->
            <div :class="{ 'text-active': route.meta.navbottom.current == 'privilege' }">
              สิทธิพิเศษ
            </div>
          </div>

          <div class="menu-wrapper" @click="handleNamePage('profile')">
            <!-- <img
              v-if="route.meta.navbottom.current == 'profile'"
              src="@/assets/images/icons/elements/menu-user-sharing-active.png"
              alt="img-user"
            />
            <img
              v-else
              class="no-active"
              src="@/assets/images/icons/elements/menu-user-sharing.png"
              alt="img-user"
            /> -->
            <div :class="{ 'text-active': route.meta.navbottom.current == 'profile' }">โปรไฟล์</div>
          </div>
        </div>
      </div>
    </div>
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
const route: any = useRoute()
const router: any = useRouter()

const nameSelect = ref<string>('collect')

const handleNamePage = (name: string) => {
  nameSelect.value = name

  router.push({
    name: name
  })
}
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  bottom: 0;
  // position: absolute;
  // bottom: 0;
  z-index: 6000;

  & .navbar-content {
    width: 600px;
    max-width: 600px;
    height: 96px;
    display: flex;
    align-items: center;
    color: rgba(0, 51, 160, 0.4);
    background-image: url('@/assets/images/background-bottom.png');
    background-size: cover;

    & .content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;

      & .menu-container {
        display: flex;
        justify-content: space-around;
        width: 100%;

        & .menu-wrapper {
          display: flex;
          width: 90px;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;

          & img.no-active {
            width: 24px;
            height: 24px;
            filter: brightness(0) saturate(100%) invert(14%) sepia(83%) saturate(2863%)
              hue-rotate(209deg) brightness(104%) contrast(122%);
            opacity: 40%;
          }

          & img {
            width: 24px;
            height: 24px;
          }

          & .text-active {
            color: var(--blue-color);
          }
        }
      }
    }
  }

  // & .navbar-wrapper {
  //   width: 100%;
  //   display: flex;
  //   justify-content: center;

  //   & .navbar-content {
  //     width: 100%;
  //     max-width: 600px;
  //     height: 96px;
  //     display: flex;
  //     align-items: center;
  //     color: rgba(0, 51, 160, 0.4);
  //     background-image: url('@/assets/images/background-bottom.png');
  //     background-size: cover;

  //     & .content {
  //       width: 100%;
  //       height: 100%;
  //       display: flex;
  //       align-items: center;

  //       & .menu-container {
  //         display: flex;
  //         justify-content: space-around;
  //         width: 100%;

  //         & .menu-wrapper {
  //           display: flex;
  //           width: 90px;
  //           flex-direction: column;
  //           align-items: center;
  //           gap: 4px;
  //           cursor: pointer;

  //           & img.no-active {
  //             width: 24px;
  //             height: 24px;
  //             filter: brightness(0) saturate(100%) invert(14%) sepia(83%) saturate(2863%)
  //               hue-rotate(209deg) brightness(104%) contrast(122%);
  //             opacity: 40%;
  //           }

  //           & img {
  //             width: 24px;
  //             height: 24px;
  //           }

  //           & .text-active {
  //             color: var(--blue-color);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}
</style>
