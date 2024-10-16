import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'
// import { useCustomerStore } from '@/stores/customer'

const route = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHistory(),
  routes: route,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  // const customerStore = useCustomerStore()
  next()
  // if (to.meta.is_auth_route && to.meta.is_auth_route == true) {
  //   let token = sessionStorage.getItem('token')

  //   if (!token) {
  //     // ถ้าไม่มี token ให้ไปหน้า index
  //     return next({ name: 'index' })
  //   } else if (token) {
  //     await customerStore.fetchCustomerInfo()
  //     const customerData: any = await customerStore.getCustomerInfo
  //     if (customerData && customerStore.getCustomerStatus === false) {
  //       if (
  //         !customerData.consent_status &&
  //         !customerData.pdpa_status &&
  //         !customerData.otp_status &&
  //         !customerData.register_status
  //       ) {
  //         if (to.path !== '/auth/terms-and-conditions') {
  //           return next('/auth/terms-and-conditions')
  //         } else {
  //           return next()
  //         }
  //       } else if (
  //         customerData.consent_status &&
  //         customerData.pdpa_status &&
  //         !customerData.otp_status &&
  //         !customerData.register_status
  //       ) {
  //         // return next({ name: 'auth-otp-request' })
  //         // ถ้ากำลังพยายามเข้าถึงหน้า auth-otp-request อยู่แล้ว ให้ผ่านไป
  //         if (to.name === 'auth-otp-request') {
  //           return next()
  //         }
  //         if (to.name === 'auth-otp-verify') {
  //           return next()
  //         }
  //         if (to.name === 'auth-register') {
  //           return next()
  //         }

  //         return next({ name: 'auth-otp-request' })
  //       }
  //     } else if (customerData && customerStore.getCustomerStatus === true) {
  //       if (
  //         customerData.consent_status &&
  //         customerData.pdpa_status &&
  //         customerData.otp_status &&
  //         customerData.register_status
  //       ) {
  //         const restrictedPaths = [
  //           '/auth/terms-and-conditions',
  //           '/auth/otp/request',
  //           '/auth/otp/verify',
  //           '/auth/register'
  //         ]
  //         if (restrictedPaths.includes(to.path)) {
  //           return next('/rewards-collection')
  //         }
  //       }
  //       return next()
  //     } else {
  //       return next({ name: 'index' })
  //     }
  //   }
  // } else {
  //   next()
  // }
})

export default router
