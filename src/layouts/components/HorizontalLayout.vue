<template>
  <NavbarTopLayout :metaNavtopInfo="routeInfo" />
  <div class="main-container">
    <div class="background-image-container">
      <div class="background-image-inner">
        <img
          v-if="route.meta.navtop.is_background && route.meta.main.image"
          src="@/assets/images/background-pasaya.jpeg"
          alt="img-background"
          class="background-image"
        />

        <img
          v-if="!route.meta.navtop.is_background && route.meta.main.image"
          src="@/assets/images/background-pasaya.jpeg"
          alt="img-background"
          class="background-image no-top"
        />

        <img
          v-if="
            !route.meta.navtop.is_background &&
            route.meta.navtop.tier_background &&
            route.meta.main.image
          "
          src="@/assets/images/background-pasaya.jpeg"
          alt="img-background"
          class="background-image no-top"
        />

        <div v-else class="background-no-img"></div>
      </div>
    </div>

    <div :class="styleMainContent()">
      <div>
        <!-- <div
          v-if="route.meta.navtop.is_background"
          class="border-navtop-main-container"
        > -->
        <!-- <div class="border-navtop-main-wrapper">
            <div class="border-navtop-main"></div>
          </div> -->
        <!-- </div> -->
        <slot></slot>
      </div>
    </div>
  </div>
  <NavbarBottomLayout
    :activeMenuItem="currentActiveMenuItem"
    :use-images="false"
  />
</template>

<script setup lang="ts">
import NavbarTopLayout from '@/layouts/components/NavbarTopLayout.vue'
import NavbarBottomLayout from '@/layouts/components/NavbarBottomLayout.vue'

const route: any = useRoute()
const routeInfo = ref<any>(null)

const currentActiveMenuItem = computed(() => {
  const path = route.path
  if (path === '/home') return 'home'
  if (path === '/privilege') return 'privilege'
  if (path === '/history') return 'history'
  if (path === '/profile') return 'profile'
  return 'home'
})

const styleMainContent = () => {
  if (route.meta.navbottom.active) {
    if (route.meta.navtop.is_background && route.meta.main.image) {
      return 'content-container'
    } else if (!route.meta.navtop.is_background && route.meta.main.image) {
      return 'content-container no-top-background'
    } else if (route.meta.navtop.is_background && !route.meta.main.image) {
      return 'content-container no-main-background'
    } else if (!route.meta.navtop.is_background && !route.meta.main.image) {
      return 'content-container no-main-background no-top-background'
    }
  } else {
    if (route.meta.navtop.is_background && route.meta.main.image) {
      return 'content-container no-bottom'
    } else if (!route.meta.navtop.is_background && route.meta.main.image) {
      return 'content-container no-bottom no-top-background'
    } else if (route.meta.navtop.is_background && !route.meta.main.image) {
      return 'content-container no-bottom no-main-background'
    } else if (!route.meta.navtop.is_background && !route.meta.main.image) {
      return 'content-container no-bottom no-main-background no-top-bacgfround'
    }
  }
}

watch(route, () => {
  setTimeout(() => {
    routeInfo.value = route.meta.navtop
  }, 1)
})
// const loading = useLoadingStore()
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
    bottom: 0;

    & .background-image-inner {
      height: 100%;
      width: 600px;

      & img.background-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        padding-top: 56px;
      }

      & img.background-image.no-top {
        padding-top: 0;
      }

      & .background-no-img {
        width: 100%;
        height: 100%;
        // background-color: #f5f2eb;
        background-color: #f3f1ea;
      }
    }
  }

  & .content-container {
    padding: 56px 0 84px;
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &.no-top-background {
      padding: 80px 0 84px;
    }

    &.no-main-background {
      padding: 56px 0 84px;
    }

    &.no-main-background.no-top-background {
      padding: 80px 0 84px;
    }

    &.no-bottom {
      padding: 56px 0 0;
    }

    &.no-bottom.no-top-background {
      padding: 80px 0 0;
    }

    &.no-bottom.no-main-background {
      padding: 56px 0 0;
    }

    &.content-container.no-bottom.no-main-background.no-top-bacgfround {
      padding: 80px 0 0;
    }
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
</style>
