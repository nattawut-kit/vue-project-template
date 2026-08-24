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
      <div
        class="svg-placeholder"
        :class="{ 'is-loading': isLoading }"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
  type DimensionValue = number | string | null

  interface Props {
    src: string
    width?: DimensionValue
    height?: DimensionValue
    color?: string | null
    alt?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    width: null,
    height: null,
    color: null,
    alt: undefined,
  })

  const emit = defineEmits<{
    load: []
    error: [error: Error]
  }>()

  const svgContent = ref<string | null>(null)
  const originalWidth = ref<string | null>(null)
  const originalHeight = ref<string | null>(null)
  const isLoading = ref(false)

  const containerStyle = computed(() => {
    const style: Record<string, string> = {}

    if (props.width) {
      style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    } else if (originalWidth.value) {
      style.width = originalWidth.value
    }

    if (props.height) {
      style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
    } else if (originalHeight.value) {
      style.height = originalHeight.value
    }

    return style
  })

  const processedSvg = computed(() => {
    if (!svgContent.value) return null

    let processed = svgContent.value.replace(/(<[^>]*)\s*\n\s*/g, '$1 ')

    if (props.width || props.height) {
      const viewBoxMatch = processed.match(/viewBox=["']([^"']*)["']/)
      const originalDimensions =
        originalWidth.value && originalHeight.value
          ? [0, 0, parseFloat(originalWidth.value), parseFloat(originalHeight.value)]
          : null
      const viewBox = viewBoxMatch ? viewBoxMatch[1].split(/\s+/).map(Number) : originalDimensions

      if (viewBox?.length === 4) {
        const aspectRatio = viewBox[2] / viewBox[3]

        if (!processed.includes('preserveAspectRatio')) {
          processed = processed.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')
        }

        const updateDimensions = (width: number | string, height: number | string): void => {
          processed = processed
            .replace(/<svg([^>]*)width=["'][^"']*["']/i, `<svg$1width="${width}"`)
            .replace(/<svg([^>]*)height=["'][^"']*["']/i, `<svg$1height="${height}"`)

          if (!processed.includes('width=')) {
            processed = processed.replace(/<svg/, `<svg width="${width}"`)
          }
          if (!processed.includes('height=')) {
            processed = processed.replace(/<svg/, `<svg height="${height}"`)
          }
        }

        if (props.width && !props.height) {
          const widthValue = typeof props.width === 'number' ? props.width : parseFloat(props.width)
          if (!isNaN(widthValue)) {
            updateDimensions(widthValue, widthValue / aspectRatio)
          }
        } else if (props.height && !props.width) {
          const heightValue =
            typeof props.height === 'number' ? props.height : parseFloat(props.height)
          if (!isNaN(heightValue)) {
            updateDimensions(heightValue * aspectRatio, heightValue)
          }
        } else if (props.width && props.height) {
          updateDimensions(props.width, props.height)
        }
      } else {
        if (props.width) {
          const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width
          processed = processed.replace(
            /<svg([^>]*)width=["'][^"']*["']/i,
            `<svg$1width="${widthValue}"`
          )
          if (!processed.includes('width=')) {
            processed = processed.replace(/<svg/, `<svg width="${widthValue}"`)
          }
        }
        if (props.height) {
          const heightValue = typeof props.height === 'number' ? `${props.height}px` : props.height
          processed = processed.replace(
            /<svg([^>]*)height=["'][^"']*["']/i,
            `<svg$1height="${heightValue}"`
          )
          if (!processed.includes('height=')) {
            processed = processed.replace(/<svg/, `<svg height="${heightValue}"`)
          }
        }
      }
    }

    if (props.color) {
      const hasFillNone = processed.includes('fill="none"')
      const colorReplacements = [
        [/fill="[^"]*"/g, `fill="${props.color}"`],
        [/stroke="[^"]*"/g, `stroke="${props.color}"`],
        [/fill='[^']*'/g, `fill='${props.color}'`],
        [/stroke='[^']*'/g, `stroke='${props.color}'`],
        [/style="([^"]*)fill:[^;]*;([^"]*)"/g, `style="$1fill:${props.color};$2"`],
        [/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${props.color};$2"`],
        [/style='([^']*)fill:[^;]*;([^']*)'/g, `style='$1fill:${props.color};$2'`],
        [/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${props.color};$2'`],
        [/fill=#[0-9a-fA-F]{3,6}/g, `fill=${props.color}`],
        [/stroke=#[0-9a-fA-F]{3,6}/g, `stroke=${props.color}`],
      ] as const

      processed = colorReplacements.reduce(
        (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
        processed
      )

      if (hasFillNone) {
        processed = processed.replace(/fill="[^"]*"/, 'fill="none"')
      }

      if (
        !processed.includes('fill=') &&
        !processed.includes('stroke=') &&
        !processed.includes('style=')
      ) {
        processed = processed.replace('<svg', `<svg fill="${props.color}"`)
      }

      processed = processed.replace(/<style>([^<]*)<\/style>/g, (_, styleContent) => {
        const updatedStyle = styleContent
          .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill: ${props.color}`)
          .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke: ${props.color}`)
        return `<style>${updatedStyle}</style>`
      })

      if (processed.includes('<path') && processed.includes('stroke=')) {
        processed = processed.replace(
          /(<path[^>]*)(stroke=)("[^"]*"|'[^']*')/g,
          (_, prefix, attr) => `${prefix}${attr}"${props.color}"`
        )
      }
    }

    return processed
  })

  const isSvgContent = (text: string): boolean =>
    text.includes('<svg') && (text.includes('</svg>') || text.includes('/>'))

  const extractSvgDimensions = (text: string): void => {
    const [widthMatch, heightMatch] = [
      text.match(/width="([^"]*)"/),
      text.match(/height="([^"]*)"/),
    ]

    originalWidth.value = widthMatch?.[1] ?? null
    originalHeight.value = heightMatch?.[1] ?? null
  }

  // Vite's import.meta.glob for dynamic asset imports
  const svgModules = import.meta.glob('@/assets/icons/**/*.svg', {
    query: '?raw',
    import: 'default',
    eager: false,
  })

  const loadSvg = async (): Promise<void> => {
    if (isLoading.value || !props.src) return

    isLoading.value = true
    svgContent.value = null

    let srcPath = props.src
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
          } catch (importError) {
            console.error(`Error importing SVG module: ${modulePath}`, importError)
            throw new Error(`Failed to dynamically import SVG: ${srcPath}`, { cause: importError })
          }
        } else {
          console.warn(
            `SVG module not found for path: ${modulePath}. Available modules:`,
            Object.keys(svgModules)
          )
          throw new Error(`SVG not found at path: ${srcPath}`)
        }
      } else {
        try {
          const response = await fetch(srcPath)
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG (${response.status}): ${response.statusText}`)
          }
          svgText = await response.text()
        } catch (fetchError) {
          console.error(`Error fetching SVG from URL: ${srcPath}`, fetchError)
          throw new Error(`Failed to load SVG from URL: ${srcPath}`, { cause: fetchError })
        }
      }

      if (svgText && isSvgContent(svgText)) {
        extractSvgDimensions(svgText)
        svgContent.value = svgText
        emit('load')
      } else if (svgText) {
        console.warn(`Content loaded from ${srcPath} might not be valid SVG.`)
        throw new Error('Invalid SVG content')
      } else {
        throw new Error(`No SVG content could be loaded for ${srcPath}`)
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error loading SVG')
      emit('error', err)
      svgContent.value = null
      console.error(`Error in loadSvg for ${srcPath}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (props.src) {
      loadSvg()
    }
  })

  watch(
    () => props.src,
    newSrc => {
      if (newSrc) {
        loadSvg()
      } else {
        svgContent.value = null
      }
    }
  )
</script>

<style scoped lang="scss">
  .svg-container {
    display: inline-block;
    line-height: 0;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .svg-placeholder {
    display: inline-block;
    width: 100%;
    height: 100%;
    min-width: 24px;
    min-height: 24px;
    background-color: transparent;

    &.is-loading {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
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
