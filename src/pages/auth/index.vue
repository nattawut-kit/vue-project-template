<template>
  <div @click="goto()">this is auth page</div>

  <div class="container">
    <div class="item">test</div>

    <div v-dompurify-html="rawHtml"></div>
  </div>

  <!-- <HomeView /> -->

  <q-btn color="deep-orange" @click="goto()" label="Home Page" />
</template>

<script lang="ts" setup>
const route = useRoute()
const router = useRouter()

const rawHtml = ref('<span style="color: red">This should be red.</span>')

const goto = () => {
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.container {
  width: 200px;
  height: 200px;
  background-color: red;

  & .item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

<route lang="yaml">
meta:
  is_auth_route: true
  layout: default
  navtop:
    is_background: true
    back_to: '/privilege'
    title: 'รายละเอียด'
  main:
    #ถ้า image เป็น true ก็ต่อเมื่อ navtop: is_background เป็น true
    image: true
  navbottom:
    active: false
    current: 'privilege'
</route>
