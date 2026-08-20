<template>
  <div class="container">
    <div>Dynamic Header Demo</div>
    <br />
    <div v-if="titleLoading">กำลังเรียก API...</div>
    <div v-else-if="error">โหลดไม่สำเร็จ: {{ error }}</div>
    <div v-else>ข้อความที่ดึงมาจาก API ({{ fetchedText }}) ถูกเซ็ตเป็น header title ด้านบนแล้ว</div>
  </div>
</template>

<script setup lang="ts">
  const { setHeaderTitle, titleLoading } = useHeaderTitle()

  const error = ref<string | null>(null)
  const fetchedText = ref('')

  const api = async () => {
    titleLoading.value = true

    try {
      const words = await apiRaw<string[]>({
        method: 'GET',
        url: 'https://random-word-api.herokuapp.com/word',
        skipAuth: true,
      })
      fetchedText.value = words[0]
      setHeaderTitle(fetchedText.value)
    } catch (e) {
      error.value = getErrorDisplay(e).message
      setHeaderTitle(null)
    } finally {
      titleLoading.value = false
    }
  }

  onMounted(async () => {
    await api()
  })
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/home'
    title: 'นนนนน'
  main:
    image: true
  navbottom:
    active: false
    current: 'home'
</route>
