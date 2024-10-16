<template>
  <div @click="goto()">this is auth page</div>

  <HomeView />
</template>

<script lang="ts" setup>
const route = useRoute()
const router = useRouter()

const goto = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
</style>