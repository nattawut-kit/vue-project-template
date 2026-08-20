<template>
  <RouterView v-slot="{ Component, route }">
    <component
      :is="Component"
      :key="route.path"
    />
  </RouterView>

  <!-- ที่เดียวที่ต้อง mount — dialog ทุกตัวที่เปิดด้วย Dialog.create() ขึ้นที่นี่ -->
  <DialogHost />
</template>

<style scoped lang="scss"></style>
