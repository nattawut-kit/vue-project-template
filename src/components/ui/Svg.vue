<!-- eslint-disable vue/multi-word-component-names -- kept as `Svg` to match the source component this was ported from -->
<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'

type DimensionValue = number | string | null

const {
  src,
  width = null,
  height = null,
  color = null,
  colorGradient = null,
  alt = undefined,
  allowedOrigins = [],
} = defineProps<{
  src: string
  width?: DimensionValue
  height?: DimensionValue
  /** Recolors fill/stroke with a flat color (hex, named color, `currentColor`, ...). */
  color?: string | null
  /**
   * Recolors fill/stroke with a gradient instead — 2+ stops, evenly spaced top to bottom.
   * SVG paint can't take a CSS `linear-gradient()` value, only `url(#id)` pointing at a
   * <linearGradient>, so this renders one inside this icon's own <svg> (scoped via `useId()`,
   * so multiple gradient icons on the same page never collide). Takes precedence over `color`
   * when both are set.
   */
  colorGradient?: string[] | null
  alt?: string
  // `src` set to an absolute http(s) URL is only fetched when its origin is in this list — empty
  // (default) blocks every remote URL, since fetching and inline-rendering (via v-dompurify-html)
  // whatever content lives at a caller-supplied URL is an SSRF/content-injection surface the moment
  // that URL comes from data this app doesn't control (e.g. a merchant-supplied icon URL from an API).
  allowedOrigins?: string[]
}>()

const gradientId = useId()

const resolvedColor = computed(() =>
  colorGradient && colorGradient.length >= 2 ? `url(#${gradientId})` : color,
)

const gradientDefsMarkup = computed(() => {
  if (!colorGradient || colorGradient.length < 2) return null

  const stops = colorGradient
    .map((stopColor, i) => {
      const offset = (i / (colorGradient.length - 1)) * 100
      return `<stop offset="${offset}%" style="stop-color: ${stopColor}" />`
    })
    .join('')

  return `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">${stops}</linearGradient></defs>`
})

const emit = defineEmits<{
  load: []
  error: [error: Error]
}>()

const svgContent = ref<string | null>(null)
const originalWidth = ref<string | null>(null)
const originalHeight = ref<string | null>(null)
const isLoading = ref(false)

// A bare HTML attribute like `width="20"` arrives here as the string "20", not the number 20 —
// Vue doesn't cast attrs to a prop's declared type. A unitless number needs "px" appended, same
// as the numeric SVG `width`/`height` attributes read into originalWidth/originalHeight below.
const toCssLength = (value: string | number): string =>
  typeof value === 'number' || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value

// Neither a `width`/`height` prop nor the file's own attribute — fall back to a sensible icon
// size instead of leaving the browser's replaced-element default (300x150) in charge.
const DEFAULT_ICON_LENGTH = '20px'

const containerStyle = computed(() => {
  const style: Record<string, string> = {}

  const widthSource = width ?? originalWidth.value
  style.width = widthSource ? toCssLength(widthSource) : DEFAULT_ICON_LENGTH

  const heightSource = height ?? originalHeight.value
  style.height = heightSource ? toCssLength(heightSource) : DEFAULT_ICON_LENGTH

  return style
})

// The root <svg> tag's own attribute list, e.g. ` viewBox="0 0 24 24" stroke-width="2"` — every
// width/height lookup below searches only this, never the full markup. A whole-string search
// would also match `stroke-width="2"` (substring "width=") or a nested `<rect width="18" .../>`.
function getSvgTagAttrs(svg: string): string {
  return svg.match(/<svg([^>]*)>/)?.[1] ?? ''
}

function hasSvgAttr(svg: string, attr: 'width' | 'height'): boolean {
  return new RegExp(`(?:^|\\s)${attr}=["']`).test(getSvgTagAttrs(svg))
}

function setSvgDimension(svg: string, attr: 'width' | 'height', value: number | string): string {
  return hasSvgAttr(svg, attr)
    ? svg.replace(new RegExp(`(<svg[^>]*)\\s${attr}=["'][^"']*["']`, 'i'), `$1 ${attr}="${value}"`)
    : svg.replace(/<svg/, `<svg ${attr}="${value}"`)
}

const processedSvg = computed(() => {
  if (!svgContent.value) return null

  let processed = svgContent.value.replace(/(<[^>]*)\s*\n\s*/g, '$1 ')

  if (width || height) {
    const viewBoxMatch = processed.match(/viewBox=["']([^"']*)["']/)
    const originalDimensions =
      originalWidth.value && originalHeight.value
        ? [0, 0, parseFloat(originalWidth.value), parseFloat(originalHeight.value)]
        : null
    const viewBox = viewBoxMatch ? viewBoxMatch[1]!.split(/\s+/).map(Number) : originalDimensions

    if (viewBox?.length === 4) {
      const aspectRatio = viewBox[2]! / viewBox[3]!

      if (!processed.includes('preserveAspectRatio')) {
        processed = processed.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')
      }

      const updateDimensions = (dimWidth: number | string, dimHeight: number | string): void => {
        processed = setSvgDimension(processed, 'width', dimWidth)
        processed = setSvgDimension(processed, 'height', dimHeight)
      }

      if (width && !height) {
        const widthValue = typeof width === 'number' ? width : parseFloat(width)
        if (!isNaN(widthValue)) {
          updateDimensions(widthValue, widthValue / aspectRatio)
        }
      } else if (height && !width) {
        const heightValue = typeof height === 'number' ? height : parseFloat(height)
        if (!isNaN(heightValue)) {
          updateDimensions(heightValue * aspectRatio, heightValue)
        }
      } else if (width && height) {
        updateDimensions(width, height)
      }
    } else {
      if (width) {
        const widthValue = typeof width === 'number' ? `${width}px` : width
        processed = setSvgDimension(processed, 'width', widthValue)
      }
      if (height) {
        const heightValue = typeof height === 'number' ? `${height}px` : height
        processed = setSvgDimension(processed, 'height', heightValue)
      }
    }
  }

  const paint = resolvedColor.value

  if (paint) {
    const hasFillNone = processed.includes('fill="none"')
    const colorReplacements = [
      [/fill="[^"]*"/g, `fill="${paint}"`],
      [/stroke="[^"]*"/g, `stroke="${paint}"`],
      [/fill='[^']*'/g, `fill='${paint}'`],
      [/stroke='[^']*'/g, `stroke='${paint}'`],
      [/style="([^"]*)fill:[^;]*;([^"]*)"/g, `style="$1fill:${paint};$2"`],
      [/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${paint};$2"`],
      [/style='([^']*)fill:[^;]*;([^']*)'/g, `style='$1fill:${paint};$2'`],
      [/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${paint};$2'`],
      [/fill=#[0-9a-fA-F]{3,6}/g, `fill=${paint}`],
      [/stroke=#[0-9a-fA-F]{3,6}/g, `stroke=${paint}`],
    ] as const

    processed = colorReplacements.reduce(
      (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
      processed,
    )

    if (hasFillNone) {
      processed = processed.replace(/fill="[^"]*"/, 'fill="none"')
    }

    if (
      !processed.includes('fill=') &&
      !processed.includes('stroke=') &&
      !processed.includes('style=')
    ) {
      processed = processed.replace('<svg', `<svg fill="${paint}"`)
    }

    processed = processed.replace(/<style>([^<]*)<\/style>/g, (_, styleContent) => {
      const updatedStyle = styleContent
        .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill: ${paint}`)
        .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke: ${paint}`)
      return `<style>${updatedStyle}</style>`
    })

    if (processed.includes('<path') && processed.includes('stroke=')) {
      processed = processed.replace(
        /(<path[^>]*)(stroke=)("[^"]*"|'[^']*')/g,
        (_, prefix, attr) => `${prefix}${attr}"${paint}"`,
      )
    }
  }

  if (gradientDefsMarkup.value) {
    processed = processed.replace(/(<svg[^>]*>)/, `$1${gradientDefsMarkup.value}`)
  }

  return processed
})

const isSvgContent = (text: string): boolean =>
  text.includes('<svg') && (text.includes('</svg>') || text.includes('/>'))

function extractSvgDimensions(text: string): void {
  const attrs = getSvgTagAttrs(text)
  const widthMatch = attrs.match(/(?:^|\s)width=["']([^"']*)["']/)
  const heightMatch = attrs.match(/(?:^|\s)height=["']([^"']*)["']/)

  originalWidth.value = widthMatch?.[1] ?? null
  originalHeight.value = heightMatch?.[1] ?? null
}

const svgModules = import.meta.glob('@/assets/icons/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: false,
})

async function loadSvg(): Promise<void> {
  if (isLoading.value || !src) return

  isLoading.value = true
  svgContent.value = null

  let srcPath = src
  if (
    !srcPath.startsWith('@/') &&
    !srcPath.startsWith('/') &&
    !srcPath.startsWith('http://') &&
    !srcPath.startsWith('https://')
  ) {
    if (!srcPath.endsWith('.svg')) {
      srcPath = `${srcPath}.svg`
    }
    srcPath = `@/assets/icons/${srcPath}`
  }

  try {
    let svgText: string | null = null

    if (srcPath.startsWith('@/')) {
      const modulePath = `/src${srcPath.substring(1)}`

      if (svgModules[modulePath]) {
        try {
          svgText = (await svgModules[modulePath]()) as string
        } catch {
          throw new Error(`Failed to dynamically import SVG: ${srcPath}`)
        }
      } else {
        throw new Error(`SVG not found at path: ${srcPath}`)
      }
    } else {
      if (!allowedOrigins.includes(new URL(srcPath).origin)) {
        throw new Error(`Blocked fetching SVG from a non-allowlisted origin: ${srcPath}`)
      }

      try {
        const response = await fetch(srcPath)
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG (${response.status}): ${response.statusText}`)
        }
        svgText = await response.text()
      } catch {
        throw new Error(`Failed to load SVG from URL: ${srcPath}`)
      }
    }

    if (svgText && isSvgContent(svgText)) {
      extractSvgDimensions(svgText)
      svgContent.value = svgText
      emit('load')
    } else if (svgText) {
      throw new Error('Invalid SVG content')
    } else {
      throw new Error(`No SVG content could be loaded for ${srcPath}`)
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Unknown error loading SVG')
    emit('error', err)
    svgContent.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (src) {
    loadSvg()
  }
})

watch(
  () => src,
  (newSrc) => {
    if (newSrc) {
      loadSvg()
    } else {
      svgContent.value = null
    }
  },
)
</script>

<template>
  <div
    v-if="svgContent"
    class="svg-container"
    :style="containerStyle"
    v-dompurify-html:svg="processedSvg"
    role="img"
    :aria-label="alt || undefined"
  ></div>
  <div
    v-else
    class="svg-container"
    :style="containerStyle"
    role="img"
    :aria-label="isLoading ? 'Loading SVG' : 'SVG failed to load'"
  >
    <slot name="placeholder">
      <div class="svg-placeholder" :class="{ 'is-loading': isLoading }" />
    </slot>
  </div>
</template>

<style scoped>
.svg-container {
  display: inline-block;
  line-height: 0;
}

.svg-container :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.svg-placeholder {
  display: inline-block;
  width: 100%;
  height: 100%;
  min-width: 24px;
  min-height: 24px;
  background-color: transparent;
}

.svg-placeholder.is-loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
