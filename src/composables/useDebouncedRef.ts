import { onScopeDispose, ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onScopeDispose(() => clearTimeout(timeout))

  return debounced
}
