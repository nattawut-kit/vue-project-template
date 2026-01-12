<template>
  <div></div>
</template>

<script setup lang="ts">
import liff from '@line/liff'

const route = useRoute()
const router = useRouter()

const loading = useLoadingStore()

const line_token = ref<string | null>('')

const lineLogin = async () => {

  liff.ready
    .then(async () => {
      loading.show = true
      if (liff.isLoggedIn()) {
        console.log(liff.isLoggedIn());

        liff.getFriendship().then(async data => {
          if (data?.friendFlag) {
            line_token.value = liff.getAccessToken()
            if (line_token.value) {
              console.log('line_token : ', line_token.value)
              await waitLoading()

            }

            // await exchangeToken(line_token.value)
          } else {
            // showDefaultDialog(
            //   'alert',
            //   'กรุณาเพิ่มเพื่อนก่อนเข้าใช้งาน',
            //   'คุณยังไม่ได้เพิ่มเพื่อนบัญชี LINE OA<br />"บางจากแต้มแลกทอง" กรุณาเพิ่มเพื่อน<br />เพื่อรับสิทธิพิเศษ Bangchak GreenMiles GOLD',
            //   [{ action: 'submit', text: 'กดเพื่อเพิ่มเพื่อน' }],
            //   async () => {
            //     liff.openWindow({
            //       url: import.meta.env.VITE_LINE_ADD_FRIEND_URL,
            //       external: false,
            //     })
            //     setInterval(async () => {
            //       let checkFriendship = await liff.getFriendship()
            //       if (checkFriendship?.friendFlag) {
            //         window.location.reload()
            //       }
            //     }, 1000)
            //   }
            // )
          }
        })
      } else {
        const { protocol, hostname } = window.location
        if (localStorage.getItem('liff_init')) {
          liff.login({
            redirectUri: `${protocol}//${hostname}//${localStorage.getItem('liff_init')}`,
          })
        } else {
          liff.login({ redirectUri: `${protocol}//${hostname}` })
        }
      }
    })
    .catch(error => {
      console.error('Line Login error:', error)
    })
  // .finally(() => {
  //   loading.show = false
  // })


}

const waitLoading = async () => {
  await router.push('/auth')
  loading.show = false
}

onMounted(async () => {
  await lineLogin()
})
</script>

<route lang="yaml">
meta:
  is_auth_route: true
  layout: blank
</route>