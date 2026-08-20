<template>
  <div></div>
</template>

<script setup lang="ts">
  const router = useRouter()
  onMounted(() => {
    router.push('/home')
  })
</script>

<style scoped lang="scss"></style>

<route lang="yaml">
meta:
  # is_auth_route: true
  layout: blank
</route>
