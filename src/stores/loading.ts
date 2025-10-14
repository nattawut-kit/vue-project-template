import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loaderStore', {
  state: () => ({
    show: false
  }),
  actions: {
    isLoading(show: boolean) {
      this.show = show
    }
  }
})
