<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button
      type="button"
      @click="count++"
    >
      count is {{ count }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a
      href="https://vuejs.org/guide/quick-start.html#local"
      target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>

  <div v-dompurify-html="rawHtml"></div>
  <div>{{ formatDate('2025-09-25T22:37:18.179822', 'dddd DD-MM-YYYY hh:mm:ss', 'en') }}</div>
</template>

<script setup lang="ts">
  defineProps<{ msg: string }>()

  const count = ref(0)
  const rawHtml = ref('<span style="color: red">This should be red.</span>')
</script>

<style scoped>
  .read-the-docs {
    color: #888;
  }
</style>
