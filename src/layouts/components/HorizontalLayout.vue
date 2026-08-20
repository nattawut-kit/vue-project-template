<template>
  <NavbarTopLayout :meta-navtop-info="routeInfo" />
  <div class="main-container">
    <div
      class="main-container-wrapper"
      :class="{ 'has-navbottom': route.meta.navbottom?.active }"
    >
      <slot></slot>
    </div>
  </div>
  <NavbarBottomLayout :active-menu-item="currentActiveMenuItem" />
</template>

<script setup lang="ts">
  import NavbarTopLayout from '../components/NavbarTopLayout.vue'
  import NavbarBottomLayout from '../components/NavbarBottomLayout.vue'

  const route = useRoute()
  const routeInfo = computed(() => route.meta.navtop)

  const currentActiveMenuItem = computed(() => {
    const path = route.path
    if (path === '/home') return 'home'
    if (path === '/privilege') return 'privilege'
    if (path === '/history') return 'history'
    if (path === '/profile') return 'profile'
    return 'home'
  })
</script>

<style lang="scss" scoped>
  .main-container {
    width: 100%;
    height: 100dvh;
    display: flex;
    justify-content: center;
    // position: absolute;
    // top: 0;
    // overflow: scroll;

    & .main-container-wrapper {
      width: 100%;
      max-width: 640px;
      background-color: #f3f1ea;
      overflow: scroll;
      padding: 56px 0 0;

      &.has-navbottom {
        padding-bottom: 96px;
      }
    }
  }
</style>
