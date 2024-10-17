<template>
  <div @click="goto()">this is auth page</div>

  <div class="container">
    <div class="item">test</div>
  </div>

  <HomeView />

  <q-btn color="deep-orange" @click="goto()" label="Home Page" />
</template>

<script lang="ts" setup>
const route = useRoute()
const router = useRouter()

const goto = () => {
  router.push('/home')
}
</script>

<style lang="scss" scoped>

.container{
  width: 200px;
  height: 200px;
  background-color: red;

  & .item{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>