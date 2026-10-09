<template>
  <div class="visualization">
    <canvas
      ref="canvasRef"
      class="visualizer-canvas"
      role="img"
      :aria-label="t('visualizer.ariaLabel')"
    ></canvas>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { useI18nStore } from '../stores/i18n'
  import { useVisualizer } from '../composables/useVisualizer'
  import { useAudioEqualizer } from '../composables/useAudioEqualizer'

  const i18nStore = useI18nStore()
  const t = i18nStore.t

  const { initCanvas, setAnalyser, setEmptyText, start, cleanup } = useVisualizer()
  const { analyser } = useAudioEqualizer()

  const canvasRef = ref(null)

  // Empty-state text follows the active language
  watch(
    () => i18nStore.currentLang,
    () => setEmptyText(t('visualizer.empty')),
    { immediate: true }
  )

  // The analyser is created lazily on the first user interaction
  watch(
    analyser,
    (node) => {
      if (node) setAnalyser(node)
    },
    { immediate: true }
  )

  onMounted(() => {
    if (initCanvas(canvasRef.value)) start()
  })

  onUnmounted(() => {
    cleanup()
  })
</script>
