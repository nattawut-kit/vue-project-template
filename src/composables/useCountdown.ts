import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

const TICK_MS = 1000

export function getRemainingSeconds(expiresAt: string | Date, now = Date.now()): number {
  const expiresAtMs = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) return 0

  return Math.max(0, Math.ceil((expiresAtMs - now) / TICK_MS))
}

const SECONDS_PER_HOUR = 3600

// hh:mm:ss once an hour or more is left, mm:ss below that.
export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR)
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / 60)
  const seconds = totalSeconds % 60

  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${mmss}` : mmss
}

export function useCountdown(expiresAt: MaybeRefOrGetter<string | Date>) {
  const now = ref<number>(Date.now())

  const remainingSeconds = computed(() => getRemainingSeconds(toValue(expiresAt), now.value))
  const isExpired = computed(() => remainingSeconds.value === 0)
  const formatted = computed(() => formatCountdown(remainingSeconds.value))

  let interval: ReturnType<typeof setInterval> | undefined

  function stop(): void {
    clearInterval(interval)
    interval = undefined
  }

  function tick(): void {
    now.value = Date.now()
    if (isExpired.value) stop()
  }

  // A new expiry (e.g. a resent OTP) restarts the ticking, which stopped itself when the old one ran out.
  watch(
    () => toValue(expiresAt),
    () => {
      stop()
      now.value = Date.now()
      if (!isExpired.value) interval = setInterval(tick, TICK_MS)
    },
    { immediate: true },
  )

  onScopeDispose(stop)

  return { remainingSeconds, isExpired, formatted }
}
