<template>
  <div>This is Home Page</div>
  <div
    @click="handleClick"
    style="cursor: pointer"
  >
    Back to Landing Page
    {{ route.meta.test }}
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()

  const handleClick = () => {
    router.push('/')
  }
</script>

<style scoped lang="scss"></style>
