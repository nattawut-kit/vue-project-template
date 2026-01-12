<template>
  <Loading />
  <RouterView />
</template>

<script setup lang="ts">
import liff from '@line/liff'

const loading = useLoadingStore()

const init_liff = async () => {
  // Using a Promise object
  liff
    .init({
      liffId: import.meta.env.VITE_LIFF_ID,
      //withLoginOnExternalBrowser: true,
    })
    .then(() => {
      loading.show = true
      console.log('init_suscess', 'Liff Login', liff.isLoggedIn())
    })
    .catch(err => {
      // Error happens during initialization
      console.error(err.code, err.message)
    })
    .finally(() => {
      loading.show = false
    })
}

const testLoading = () => {
  loading.show = true
  setTimeout(() => {
    loading.show = true
  }, 1500)
}

onMounted(async () => {
  // try {
  //   loading.show = true
  await init_liff()
  // } catch (err) {
  //   console.error(err)
  // } finally {
  //   loading.show = false
  // }
  // testLoading()
  // clearCache()

})
</script>
