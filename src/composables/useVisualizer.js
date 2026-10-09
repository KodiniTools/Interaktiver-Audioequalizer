import { ref } from 'vue'

/**
 * Spectrum visualizer, ported 1:1 from Equalizer 19 (src/components/Visualization.vue).
 *
 * - One mode: vertical frequency bars, gradient from --accent-primary (top)
 *   to --accent-secondary (bottom), drawn on --secondary-bg.
 * - Colours are read from the design tokens on every frame, so a theme switch
 *   is picked up without a restart.
 * - Internal canvas resolution: container width - 50 x 200 (as in Equalizer 19);
 *   the displayed height comes from CSS (.visualizer-canvas).
 */

// Analyser settings of Equalizer 19 (useAudioEngine.js)
export const VISUALIZER_FFT_SIZE = 2048
export const VISUALIZER_SMOOTHING = 0.8

const CANVAS_HEIGHT = 200
const CANVAS_WIDTH_FALLBACK = 800
const CONTAINER_INSET = 50

function getThemeColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    bg: style.getPropertyValue('--secondary-bg').trim() || '#1a1a22',
    accent: style.getPropertyValue('--accent-primary').trim() || '#c9984d',
    accentAlt: style.getPropertyValue('--accent-secondary').trim() || '#014f99',
    textMuted: style.getPropertyValue('--text-muted').trim() || '#7a8da0',
  }
}

export function useVisualizer() {
  const canvas = ref(null)
  const analyserNode = ref(null)
  const isRunning = ref(false)
  let animationId = null
  let emptyText = ''

  const resizeCanvas = () => {
    if (!canvas.value) return
    const container = canvas.value.parentElement
    const width = container
      ? Math.max(container.clientWidth - CONTAINER_INSET, 100)
      : CANVAS_WIDTH_FALLBACK
    if (canvas.value.width !== width) canvas.value.width = width
    if (canvas.value.height !== CANVAS_HEIGHT) canvas.value.height = CANVAS_HEIGHT
  }

  /**
   * @param {HTMLCanvasElement} canvasElement
   * @returns {boolean} true when a 2d context is available
   */
  const initCanvas = (canvasElement) => {
    if (!canvasElement || !canvasElement.getContext('2d')) return false
    canvas.value = canvasElement
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return true
  }

  /**
   * Connects the analyser and applies the Equalizer 19 analyser settings.
   * @param {AnalyserNode} analyser
   */
  const setAnalyser = (analyser) => {
    if (!analyser) return false
    analyser.fftSize = VISUALIZER_FFT_SIZE
    analyser.smoothingTimeConstant = VISUALIZER_SMOOTHING
    analyserNode.value = analyser
    return true
  }

  /** Text drawn while no frequency data is available. */
  const setEmptyText = (text) => {
    emptyText = text || ''
  }

  const getFrequencyData = () => {
    const analyser = analyserNode.value
    if (!analyser) return new Uint8Array(0)
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    return data
  }

  const draw = () => {
    if (!isRunning.value) return
    animationId = requestAnimationFrame(draw)

    const el = canvas.value
    const ctx = el?.getContext('2d')
    if (!ctx) return

    const colors = getThemeColors()
    const dataArray = getFrequencyData()

    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, el.width, el.height)

    if (dataArray.length === 0) {
      ctx.fillStyle = colors.textMuted
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(emptyText, el.width / 2, el.height / 2)
      return
    }

    const barWidth = (el.width / dataArray.length) * 2
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * el.height

      const gradient = ctx.createLinearGradient(0, el.height - barHeight, 0, el.height)
      gradient.addColorStop(0, colors.accent)
      gradient.addColorStop(1, colors.accentAlt)

      ctx.fillStyle = gradient
      ctx.fillRect(x, el.height - barHeight, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  /** Starts the render loop; needs only the canvas (no analyser = empty state). */
  const start = () => {
    if (!canvas.value) return false
    if (isRunning.value) return true
    isRunning.value = true
    draw()
    return true
  }

  const stop = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    isRunning.value = false
  }

  const cleanup = () => {
    stop()
    window.removeEventListener('resize', resizeCanvas)
    analyserNode.value = null
    canvas.value = null
  }

  return {
    isRunning,
    initCanvas,
    setAnalyser,
    setEmptyText,
    start,
    stop,
    cleanup,
  }
}
