<template>
  <div v-if="route.meta.navbottom.active" class="navbar-container">
    <div class="navbar-content">
      <div class="content">
        <div class="menu-container">
          <template v-for="item in menuItems" :key="item.id">
            <div
              class="menu-wrapper"
              :class="{ active: activeMenuItem === item.id }"
              @click="handleMenuClick(item.id)"
            >
              <!-- Use icon by default, image if provided -->
              <img
                v-if="item.image"
                :src="getIconSrc(item)"
                :alt="item.altText"
                width="28"
                height="28"
                :class="{ active: activeMenuItem === item.id }"
              />

              <i
                v-else
                :class="[
                  getIconClass(item),
                  { active: activeMenuItem === item.id },
                ]"
              ></i>

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
import HomeInActive from '../../assets/images/navbar-bottom/menu-home.png'
import HomeActive from '../../assets/images/navbar-bottom/menu-home-active.png'
import PrivilegeInActive from '../../assets/images/navbar-bottom/menu-privilege.png'
import PrivilegeActive from '../../assets/images/navbar-bottom/menu-privilege-active.png'
import HistoryInActive from '../../assets/images/navbar-bottom/menu-history.png'
import HistoryActive from '../../assets/images/navbar-bottom/menu-history-active.png'
import ProfileInActive from '../../assets/images/navbar-bottom/menu-profile.png'
import ProfileActive from '../../assets/images/navbar-bottom/menu-profile-active.png'
// Define menu items type
type MenuItem = 'home' | 'privilege' | 'history' | 'profile'

interface Props {
  activeMenuItem?: MenuItem
  useImages?: boolean // Option to use images instead of icons
}

const route: any = useRoute()
const router: any = useRouter()

const props = withDefaults(defineProps<Props>(), {
  activeMenuItem: 'home',
  useImages: false,
})

// Active menu item state
const activeMenuItem = computed<MenuItem>(() => {
  return (route.meta.navbottom?.current || props.activeMenuItem) as MenuItem
})

// Icons mapping (for images if needed)
const iconMap: any = {
  home: {
    inactive: HomeInActive,
    active: HomeActive,
  },
  privilege: {
    inactive: PrivilegeInActive,
    active: PrivilegeActive,
  },
  history: {
    inactive: HistoryInActive,
    active: HistoryActive,
  },
  profile: {
    inactive: ProfileInActive,
    active: ProfileActive,
  },
}

// Menu items configuration
const menuItems = [
  {
    id: 'home' as MenuItem,
    labelKey: 'หน้าแรก',
    altText: 'home',
    iconActive: 'fa-solid fa-house',
    iconInactive: 'fa-regular fa-house',
    image: props.useImages ? iconMap.home : null,
  },
  {
    id: 'privilege' as MenuItem,
    labelKey: 'แลกรางวัล',
    altText: 'privilege',
    iconActive: 'fa-solid fa-gift',
    iconInactive: 'fa-regular fa-gift',
    image: props.useImages ? iconMap.privilege : null,
  },
  {
    id: 'history' as MenuItem,
    labelKey: 'ประวัติ',
    altText: 'history',
    iconActive: 'fa-solid fa-clock-rotate-left',
    iconInactive: 'fa-regular fa-clock-rotate-left',
    image: props.useImages ? iconMap.history : null,
  },
  {
    id: 'profile' as MenuItem,
    labelKey: 'โปรไฟล์',
    altText: 'profile',
    iconActive: 'fa-solid fa-user',
    iconInactive: 'fa-regular fa-user',
    image: props.useImages ? iconMap.profile : null,
  },
]

// Computed properties for each menu item
const getIconClass = (item: (typeof menuItems)[0]) => {
  const isActive = activeMenuItem.value === item.id
  return isActive ? item.iconActive : item.iconInactive
}

const getIconSrc = (item: (typeof menuItems)[0]) => {
  const isActive = activeMenuItem.value === item.id
  return item.image ? item.image[isActive ? 'active' : 'inactive'] : ''
}

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
    width: 600px;
    max-width: 600px;
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
          & i {
            font-size: 24px;
            color: #888b8d;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(1);

            &.active {
              font-size: 24px;
              color: #9b8c4b;
              transform: scale(1.1);
            }
          }

          // Image styles
          & img {
            width: 24px;
            height: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(1);

            &.active {
              width: 24px;
              height: 24px;
              transform: scale(1);
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
            & i {
              color: #9b8c4b;
              transform: scale(1.05) translateY(-2px);
            }

            & img {
              transform: scale(1.05) translateY(-2px);
            }

            & .text-inactive {
              color: #9b8c4b;
              opacity: 1;
            }
          }

          // Active state hover
          &.active:hover {
            & i {
              transform: scale(1.15);
            }

            & img {
              transform: scale(1.05);
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
