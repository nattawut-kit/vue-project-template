<!-- eslint-disable vue/multi-word-component-names -- kept as `Spinner` to match the source component this was ported from -->
<script setup lang="ts">
import { computed, useId } from 'vue'

export type SpinnerType = 'oval' | 'dots' | 'tail' | 'trio' | 'orbit'

const {
  size = 18,
  color = 'var(--app-brand)',
  type = 'oval',
  thickness = 2,
  accent = 'var(--app-brand-hover)',
} = defineProps<{
  size?: number
  color?: string
  /** Ported from Quasar's `QSpinnerOval` (a rotating ring), `QSpinnerDots` (three pulsing dots),
   * and `QSpinnerTail` (a rotating arc fading into its own tail). 'trio' is three still dots where
   * one lights up in `accent` and the light travels left to right; 'orbit' is a ring with a dot in
   * `accent` circling on its edge. */
  type?: SpinnerType
  /** Ring border width in px — 'oval' only, ignored by the other types. */
  thickness?: number
  /** 'trio' and 'orbit' only: the colour of the lit dot (trio) or the orbiting dot (orbit); `color`
   * is the trio's other two dots or the orbit's ring. */
  accent?: string
}>()

const style = computed(() => ({
  width: `${size}px`,
  height: `${size}px`,
  color,
}))

// The trio is drawn from a 64-unit-wide grid (three 16-unit dots, 24 apart), scaled so the whole
// row is `size` px wide.
const trioStyle = computed(() => ({
  '--unit': `${size / 64}px`,
  '--trio-base': color,
  '--trio-accent': accent,
}))

// The orbit ring is a 48-unit circle with a 3-unit border; its dot sits half outside the ring's edge.
const orbitStyle = computed(() => ({
  '--unit': `${size / 48}px`,
  '--orbit-ring': color,
  '--orbit-accent': accent,
}))

const ovalRingStyle = computed(() => ({
  borderWidth: `${thickness}px`,
  borderStyle: 'solid',
}))

// Scoped with useId() so two "tail" spinners on the same page never fight over the same
// <linearGradient> id, same convention as Svg.vue's colorGradient.
const gradientId = useId()
</script>

<template>
  <span class="inline-flex items-center justify-center" aria-hidden="true">
    <span v-if="type === 'oval'" class="relative inline-block" :style="style">
      <span
        class="absolute inset-0 rounded-full border-current opacity-25"
        :style="ovalRingStyle"
      />
      <span
        class="absolute inset-0 animate-spin rounded-full border-current border-t-transparent"
        :style="ovalRingStyle"
      />
    </span>

    <svg
      v-else-if="type === 'tail'"
      class="animate-spin"
      :style="style"
      viewBox="0 0 24 24"
      fill="none"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M12 2a10 10 0 0 1 10 10"
        :stroke="`url(#${gradientId})`"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>

    <span v-else-if="type === 'trio'" class="spinner-trio" :style="trioStyle" />

    <span v-else-if="type === 'orbit'" class="spinner-orbit" :style="orbitStyle" />

    <svg v-else :style="style" viewBox="0 0 120 30" fill="currentColor">
      <circle class="spinner-dot" cx="15" cy="15" r="15" style="animation-delay: -0.32s" />
      <circle class="spinner-dot" cx="60" cy="15" r="15" style="animation-delay: -0.16s" />
      <circle class="spinner-dot" cx="105" cy="15" r="15" />
    </svg>
  </span>
</template>

<style scoped>
/* Same beat as Quasar's QSpinnerDots (each dot shrinks/fades, staggered via animation-delay),
   redone as a CSS keyframe instead of the original's per-circle SMIL <animate> so it inherits
   `currentColor` and the shared timing function from one place. */
@keyframes spinner-dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.spinner-dot {
  transform-origin: center;
  transform-box: fill-box;
  animation: spinner-dot-bounce 1.2s ease-in-out infinite;
}

/* The middle dot is the element itself; the outer two are its box-shadows, so one keyframe moves the
   light across all three. */
@keyframes spinner-trio-pulse {
  33% {
    background: var(--trio-base);
    box-shadow:
      calc(-24 * var(--unit)) 0 var(--trio-accent),
      calc(24 * var(--unit)) 0 var(--trio-base);
  }

  66% {
    background: var(--trio-accent);
    box-shadow:
      calc(-24 * var(--unit)) 0 var(--trio-base),
      calc(24 * var(--unit)) 0 var(--trio-base);
  }

  100% {
    background: var(--trio-base);
    box-shadow:
      calc(-24 * var(--unit)) 0 var(--trio-base),
      calc(24 * var(--unit)) 0 var(--trio-accent);
  }
}

.spinner-trio {
  display: block;
  width: calc(16 * var(--unit));
  height: calc(16 * var(--unit));
  border-radius: 50%;
  background: var(--trio-base);
  box-shadow:
    calc(-24 * var(--unit)) 0 var(--trio-base),
    calc(24 * var(--unit)) 0 var(--trio-base);
  animation: spinner-trio-pulse 1.2s linear infinite;
}

.spinner-orbit {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: calc(48 * var(--unit));
  height: calc(48 * var(--unit));
  border: calc(3 * var(--unit)) solid var(--orbit-ring);
  border-radius: 50%;
  animation: spinner-orbit-rotate 1s linear infinite;
}

.spinner-orbit::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: calc(16 * var(--unit));
  height: calc(16 * var(--unit));
  border-radius: 50%;
  background: var(--orbit-accent);
  transform: translate(-50%, 50%);
}

@keyframes spinner-orbit-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
