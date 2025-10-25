<template>
  <div class="glass-card">
    <div class="equalizer-header">
      <h2 class="equalizer-title">{{ t('visualizer.title') }}</h2>
      <div v-if="debugMode" class="debug-info" style="font-size: 11px; color: #888; margin-top: 5px;">
        Canvas: {{ canvasReady ? '✅' : '❌' }} | 
        Analyser: {{ analyserReady ? '✅' : '❌' }} | 
        Running: {{ isRunning ? '✅' : '❌' }} |
        Size: {{ canvasWidth }}x{{ canvasHeight }}
      </div>
    </div>
    
    <div class="visualizer-container">
      <div class="visualizer-controls">
        <select 
          v-model="selectedVisualizationType"
          class="visualizer-select"
          @change="changeVisualizationType"
        >
          <option value="spectrum">Spectrum</option>
          <option value="waveform">Waveform</option>
          <option value="circular">Circular</option>
          <option value="bars3d">3D Bars</option>
        </select>
        
        <select 
          v-model="selectedColorScheme"
          class="visualizer-select"
          @change="changeColorScheme"
        >
          <option value="rainbow">Rainbow</option>
          <option value="fire">Fire</option>
          <option value="ocean">Ocean</option>
          <option value="neon">Neon</option>
          <option value="monochrome">Monochrome</option>
          <option value="vintage">Vintage</option>
        </select>
        
        <button 
          v-if="debugMode"
          @click="forceRestart"
          class="visualizer-select"
          style="padding: 5px 10px; cursor: pointer;"
        >
          🔄 Restart
        </button>
      </div>
      
      <canvas 
        ref="canvasRef" 
        id="visualizer" 
        class="visualizer-canvas" 
        aria-label="Audio frequency visualization"
        style="display: block; width: 100%; height: 300px; background: #000;"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18nStore } from '../stores/i18n'
import { useVisualizer } from '../composables/useVisualizer'
import { useAudioEqualizer } from '../composables/useAudioEqualizer'
import { useAudioStore } from '../stores/audio'

const i18nStore = useI18nStore()
const t = i18nStore.t

const { initCanvas, setAnalyser, start, stop, setVisualizationType, setColorScheme, isRunning } = useVisualizer()
const { analyser } = useAudioEqualizer()
const audioStore = useAudioStore()

const canvasRef = ref(null)
const selectedVisualizationType = ref('spectrum')
const selectedColorScheme = ref('rainbow')
const checkInterval = ref(null)
const debugMode = ref(true) // Set to false to hide debug info

// Debug state
const canvasReady = ref(false)
const analyserReady = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

let initAttempts = 0
const MAX_INIT_ATTEMPTS = 50

const tryInitialize = () => {
  initAttempts++
  
  console.log(`🎨 Visualizer init attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}`)
  
  // Check canvas
  if (!canvasRef.value) {
    console.log('⏳ Canvas ref not ready yet')
    return false
  }
  
  // Initialize canvas
  if (!canvasReady.value) {
    console.log('🎨 Attempting to initialize canvas...')
    const success = initCanvas(canvasRef.value)
    if (success) {
      canvasReady.value = true
      canvasWidth.value = canvasRef.value.width
      canvasHeight.value = canvasRef.value.height
      console.log('✅ Canvas initialized:', canvasWidth.value, 'x', canvasHeight.value)
    } else {
      console.error('❌ Canvas initialization failed')
      return false
    }
  }
  
  // Check analyser
  if (analyser.value) {
    if (!analyserReady.value) {
      console.log('🔗 Analyser available, connecting...')
      const success = setAnalyser(analyser.value)
      if (success) {
        analyserReady.value = true
        console.log('✅ Analyser connected')
      } else {
        console.error('❌ Analyser connection failed')
        return false
      }
    }
    
    // Both ready, start visualizer
    if (canvasReady.value && analyserReady.value && !isRunning.value) {
      console.log('▶️ Starting visualizer...')
      const success = start()
      if (success) {
        console.log('✅ Visualizer started successfully')
        return true
      } else {
        console.error('❌ Visualizer start failed')
        return false
      }
    }
  } else {
    console.log('⏳ Waiting for analyser...')
  }
  
  return false
}

onMounted(async () => {
  console.log('🎨 AudioVisualizer component mounted')
  
  // Wait for next tick to ensure DOM is ready
  await nextTick()
  
  // Try immediate initialization
  if (tryInitialize()) {
    console.log('✅ Immediate initialization successful')
    return
  }
  
  // Set up periodic checks
  console.log('⏳ Starting periodic initialization checks...')
  checkInterval.value = setInterval(() => {
    if (initAttempts >= MAX_INIT_ATTEMPTS) {
      console.error('❌ Max initialization attempts reached')
      clearInterval(checkInterval.value)
      return
    }
    
    if (tryInitialize()) {
      console.log('✅ Delayed initialization successful')
      clearInterval(checkInterval.value)
    }
  }, 200)
})

onUnmounted(() => {
  console.log('🎨 AudioVisualizer component unmounting')
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
  }
  stop()
})

const changeVisualizationType = () => {
  console.log('🎨 User changed visualization type to:', selectedVisualizationType.value)
  setVisualizationType(selectedVisualizationType.value)
}

const changeColorScheme = () => {
  console.log('🎨 User changed color scheme to:', selectedColorScheme.value)
  setColorScheme(selectedColorScheme.value)
}

const forceRestart = () => {
  console.log('🔄 Force restart requested')
  stop()
  canvasReady.value = false
  analyserReady.value = false
  initAttempts = 0
  
  setTimeout(() => {
    tryInitialize()
  }, 100)
}

// Watch for analyser changes
watch(analyser, (newAnalyser) => {
  console.log('🔄 Analyser watch triggered')
  if (newAnalyser) {
    console.log('✅ New analyser available')
    analyserReady.value = false // Reset to reconnect
    tryInitialize()
  }
})

// Watch for audio playing state
watch(() => audioStore.isPlaying, (playing) => {
  console.log('🎵 Audio playing state changed:', playing)
  if (playing && !isRunning.value && canvasReady.value && analyserReady.value) {
    console.log('▶️ Audio started playing, ensuring visualizer is running')
    start()
  }
})

// Watch for canvas size changes
watch([canvasWidth, canvasHeight], ([w, h]) => {
  console.log('📐 Canvas size updated:', w, 'x', h)
})

// Watch for running state
watch(isRunning, (running) => {
  console.log('🎨 Visualizer running state:', running ? '▶️ RUNNING' : '⏸️ STOPPED')
})
</script>

<style scoped>
.debug-info {
  padding: 5px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  font-family: monospace;
}

.visualizer-canvas {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
}

.visualizer-select {
  background: rgba(0,0,0,0.3);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
}
</style>
