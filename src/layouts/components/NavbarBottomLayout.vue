<template>
  <div
    v-if="route.meta.navbottom?.active"
    class="navbar-container"
  >
    <div class="navbar-content">
      <div class="content">
        <div class="menu-container">
          <template
            v-for="item in menuItems"
            :key="item.id"
          >
            <div
              class="menu-wrapper"
              :class="{ active: activeMenuItem === item.id }"
              @click="handleMenuClick(item.id)"
            >
              <Svg
                :src="item.icon"
                class="icon"
                :class="{ active: activeMenuItem === item.id }"
              />

              <div :class="getTextClass(item)">
                {{ item.labelKey }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Define menu items type
  type MenuItem = 'home' | 'privilege' | 'history' | 'profile'

  interface Props {
    activeMenuItem?: MenuItem
  }

  const props = withDefaults(defineProps<Props>(), {
    activeMenuItem: 'home',
  })
  const route = useRoute()
  const router = useRouter()

  // Active menu item state
  const activeMenuItem = computed<MenuItem>(() => {
    return (route.meta.navbottom?.current || props.activeMenuItem) as MenuItem
  })

  // Menu items configuration
  const menuItems = [
    {
      id: 'home' as MenuItem,
      labelKey: 'หน้าแรก',
      altText: 'home',
      icon: 'navbar/house',
    },
    {
      id: 'privilege' as MenuItem,
      labelKey: 'แลกรางวัล',
      altText: 'privilege',
      icon: 'navbar/gift',
    },
    {
      id: 'history' as MenuItem,
      labelKey: 'ประวัติ',
      altText: 'history',
      icon: 'navbar/clock',
    },
    {
      id: 'profile' as MenuItem,
      labelKey: 'โปรไฟล์',
      altText: 'profile',
      icon: 'navbar/user',
    },
  ]

  const getTextClass = (item: (typeof menuItems)[0]) => {
    const isActive = activeMenuItem.value === item.id
    return isActive ? 'text-active' : 'text-inactive'
  }

  const handleMenuClick = (menuId: MenuItem) => {
    router.push(`/${menuId}`)
  }
</script>

<style lang="scss" scoped>
  .navbar-container {
    width: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    bottom: 0;
    z-index: 40;

    & .navbar-content {
      width: 640px;
      max-width: 640px;
      height: 96px;
      display: flex;
      align-items: center;
      color: #9b8c4b;
      border-radius: 24px 24px 0 0;
      font-size: 12px;
      line-height: 20px;
      background-color: white;
      backdrop-filter: blur(2px);

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
            gap: 5px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &.active {
              justify-content: center;
            }

            // Icon styles
            & .icon {
              width: 24px;
              height: 24px;
              color: #888b8d;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              transform: scale(1);

              &.active {
                color: #9b8c4b;
                transform: scale(1.1);
              }
            }

            // Text styles
            & .text-active {
              color: #9b8c4b;
              font-size: 14px;
              font-weight: 700;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              opacity: 1;
              transform: translateY(0);
            }

            & .text-inactive {
              color: #888b8d;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              opacity: 0.8;
              transform: translateY(0);
            }

            // Hover effects
            &:hover:not(.active) {
              & .icon {
                color: #9b8c4b;
                transform: scale(1.05) translateY(-2px);
              }

              & .text-inactive {
                color: #9b8c4b;
                opacity: 1;
              }
            }

            // Active state hover
            &.active:hover {
              & .icon {
                transform: scale(1.15);
              }
            }
          }
        }
      }
    }
  }

  // Keyframe animations
  @keyframes bounce-in {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
