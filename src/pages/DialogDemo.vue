<template>
  <div @click="test">555555</div>

  <!-- Dialog Logout -->
  <DefaultDialog
    v-model="dialogsDefault.isOpen"
    :title="dialogsDefault.title"
    :content="dialogsDefault.content"
    :buttons="dialogsDefault.buttons"
    @submit="dialogsDefault.submit"
    @cancel="dialogsDefault.cancel"
  />
</template>

<script setup lang="ts">
  const test = () => {
    showDefaultDialog(
      'signout',
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบ<br>Bangchak GreenMiles GOLD',
      [
        { action: 'cancel', text: 'ยกเลิก' },
        { action: 'submit', text: 'ยืนยัน' },
      ],
      async () => {
        // apiLogout()
      }
    )
  }
  onMounted(() => {})
</script>

<style scoped></style>

<route lang="yaml">
meta:
  # is_auth_route: true
  layout: blank
</route>
