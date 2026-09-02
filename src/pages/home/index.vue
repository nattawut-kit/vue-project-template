<template>
  <div class="container">
    <div>This is Home Page</div>
    <br />
    <Button @click="handleClick">Go to Example Page</Button>

    <OtpInput
      v-model="validatedOtp"
      :invalid="isInvalid"
      invalid-message="รหัส OTP ไม่ถูกต้อง"
      :expired="isExpired"
      expired-message="รหัส OTP หมดอายุแล้ว"
      @clear-invalid="isInvalid = false"
    />
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()

  const handleClick = () => {
    router.push('/example')
  }

  const validatedOtp = ref('')
  const isInvalid = ref(false)
  const isExpired = ref(false)
  // function handleValidate(): void {
  //   isInvalid.value = validatedOtp.value !== '123456'
  //   isExpired.value = false
  // }
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  # is_auth_route: true
  layout: default
  navtop:
    back_to: ''
    title: ''
  main:
    image: true
  navbottom:
    active: true
    current: 'home'
</route>
