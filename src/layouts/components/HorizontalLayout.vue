<template>
  <NavbarTopLayout />
  <div class="main-container">
    <div class="background-image-container">
      <div class="background-image-inner">
        <img src="@/assets/images/background.png" alt="img-background" />
      </div>
    </div>

    <div
      :class="
        route.meta.navbottom.active && !route.meta.navbottom.footer
          ? 'content-container bottom'
          : route.meta.navbottom.active && route.meta.navbottom.footer
            ? 'content-container bottom footer'
            : 'content-container '
      "
    >
      <div>
        <!-- image header (special prize) -->
        <div v-if="route.meta.main.image_prize" class="header-img">
          <!-- <img src="@/assets/images/special-prize.png" alt="img-header" /> -->
        </div>

        <slot></slot>
      </div>

      <!-- image footer -->
      <div v-if="route.meta.navbottom.footer" class="footer-img">
        <!-- <img :src="imageFooter" alt="img-background" /> -->
      </div>
    </div>
  </div>
  <NavbarBottomLayout />
</template>

<script setup lang="ts">
import NavbarTopLayout from '@/layouts/components/NavbarTopLayout.vue'
import NavbarBottomLayout from '@/layouts/components/NavbarBottomLayout.vue'

const route: any = useRoute()
// const loading = useLoadingStore()

const imageFooter = ref<string>('')

</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  justify-content: center;

  & .background-image-container {
    position: fixed;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    z-index: -1;

    & .background-image-inner {
      width: 100%;
      height: 100%;
      width: 600px;

      & img {
        width: 100%;
        height: 100%;
      }
    }
  }

  & .content-container {
    padding: 84px 0 0;
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  & .content-container.bottom {
    padding: 84px 0 96px;
    width: 100%;
    max-width: 600px;
  }

  & .content-container.bottom.footer {
    padding: 84px 0 89px;
    width: 100%;
    max-width: 600px;
  }
}

.header-img {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 0 10px;

  img {
    object-fit: cover;
    width: 246px;
    height: 123px;
  }
}

.footer-img {
  width: 100%;
  display: flex;

  img {
    object-fit: cover;
    width: 100%;
  }
}
</style>
