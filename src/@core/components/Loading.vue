<template>
  <div v-if="show" class="loading-container">
    <!-- <img src="@/assets/images/logo-pasaya.png" alt="img-logo" /> -->
    <img
      :src="'https://www.internetconsultancy.pro/wp-content/uploads/2018/05/NASA_Worm_logo.svg-750x207.png'"
      alt="img-logo"
    />
    <div class="text-loading">
      <div>กำลังโหลด</div>
      <div class="text-dot">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useLoadingStore } from '@/stores/loading'

const loading = useLoadingStore()

const show = computed(() => loading.show)

watch(show, newValue => {
  if (newValue) {
    // Disable scroll
    document.body.style.overflowY = 'hidden'
  } else {
    // Enable scroll
    document.body.style.overflowY = 'auto'
  }
})
</script>

<style lang="scss" scoped>
.loading-container {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 99999;
  background-color: rgb(161 161 161 / 50%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  & img {
    width: 140px;
  }

  & .text-loading {
    display: flex;
    margin-top: 5px;
    align-items: flex-end;
  }

  & .text-dot {
    display: flex;
    span {
      // font-size: 1.5em;
      margin-left: 2px;
      opacity: 0;
      animation: showDot 1.5s steps(1) infinite;
    }
    span:nth-child(1) {
      animation-delay: 0.3s;
    }
    span:nth-child(2) {
      animation-delay: 0.6s;
    }
    span:nth-child(3) {
      animation-delay: 0.9s;
    }
  }
}

@keyframes showDot {
  0%,
  100% {
    opacity: 0;
  }
  30%,
  90% {
    opacity: 1;
  }
}

@supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
  .loading-container {
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    background-color: rgb(161 161 161 / 50%);
  }
}
</style>
