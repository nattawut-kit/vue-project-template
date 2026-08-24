<template>
  <RouterView v-slot="{ Component, route }">
    <component
      :is="Component"
      :key="route.path"
    />
  </RouterView>

  <DialogHost />
</template>

<style scoped lang="scss"></style>
