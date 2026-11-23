// The bottom tabs. Adding a top level destination means adding an entry here, the bar and the
// active state follow `meta.current` of each page.
export const MOBILE_TABS = [
  {
    key: 'home',
    label: 'หน้าแรก',
    routeName: '/home',
    icon: 'tab-bar/home-inactive',
    activeIcon: 'tab-bar/home-active',
  },
  {
    key: 'profile',
    label: 'โปรไฟล์',
    routeName: '/profile',
    icon: 'tab-bar/user-inactive',
    activeIcon: 'tab-bar/user-active',
  },
] as const

// Which tab a route's meta.current can point to, so a page reached from a tab (e.g. a detail
// screen opened from a tab) can still highlight that tab instead of none at all.
export type MobileTabKey = (typeof MOBILE_TABS)[number]['key']
export type MobileTab = (typeof MOBILE_TABS)[number]
