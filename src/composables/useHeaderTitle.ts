// Shared across the app so any page can override the current navtop title.
const dynamicTitle = ref<string | null>(null)

// Whether the current page is still fetching its dynamic title.
const titleLoading = ref<boolean>(false)

export const useHeaderTitle = () => {
  const setHeaderTitle = (title: string | null) => {
    dynamicTitle.value = title
  }

  return { dynamicTitle, titleLoading, setHeaderTitle }
}

export const resetHeaderTitle = () => {
  dynamicTitle.value = null
  titleLoading.value = false
}
