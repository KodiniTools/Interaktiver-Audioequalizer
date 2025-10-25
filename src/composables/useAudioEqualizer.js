import { ref } from 'vue'

// ✅ SINGLETON STATE - Shared across ALL components
// This is the CRITICAL FIX: State is now outside the function
// so AudioPlayer and AudioVisualizer share the SAME instances
const audioContext = ref(null)
const analyser = ref(null)
const sourceNode = ref(null)
const gainNode = ref(null)
const filters = ref([])
const currentAudioElement = ref(null)
const isInitialized = ref(false)

// Frequency bands for EQ (can stay as const, will be copied)
const frequencies = [
  32,    // Sub-Bass (Low-Shelf)
  64,    // Bass
  125,   // Bass
  250,   // Low-Mid
  500,   // Mid
  1000,  // Mid
  2000,  // Upper-Mid
  3000,  // Upper-Mid
  4000,  // Presence
  6000,  // Presence
  8000,  // Brilliance
  10000, // Brilliance
  12000, // Air
  14000, // Air
  16000  // Air (High-Shelf)
]

export function useAudioEqualizer() {
  // Now returns the shared singleton state
  
  /**
   * Initialize AudioContext (call once on first user interaction)
   */
  const initAudioContext = () => {
    if (audioContext.value) {
      console.log('ℹ️ AudioContext already initialized')
      return true
    }
    
    try {
      console.log('🎛️ Creating AudioContext...')
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported')
      }
      
      audioContext.value = new AudioContextClass()
      console.log('✅ AudioContext created')
      console.log('🔊 State:', audioContext.value.state)
      console.log('🔊 Sample Rate:', audioContext.value.sampleRate, 'Hz')
      
      // Resume context if suspended
      if (audioContext.value.state === 'suspended') {
        audioContext.value.resume().then(() => {
          console.log('✅ AudioContext resumed')
        })
      }
      
      // Create analyser
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 4096
      analyser.value.smoothingTimeConstant = 0.8
      console.log('✅ AnalyserNode created')
      console.log('📊 FFT Size:', analyser.value.fftSize)
      console.log('📊 Frequency Bins:', analyser.value.frequencyBinCount)
      
      // Create gain node (master volume)
      gainNode.value = audioContext.value.createGain()
      console.log('✅ GainNode created')
      
      // Create filters for each frequency band
      filters.value = frequencies.map((freq, index) => {
        const filter = audioContext.value.createBiquadFilter()
        
        // First filter is low-shelf, last is high-shelf
        if (index === 0) {
          filter.type = 'lowshelf'
        } else if (index === frequencies.length - 1) {
          filter.type = 'highshelf'
        } else {
          filter.type = 'peaking'
        }
        
        filter.frequency.value = freq
        filter.Q.value = 1.0
        filter.gain.value = 0
        
        return filter
      })
      
      console.log('✅ 15-band professional EQ created')
      
      // Make globally accessible for debugging
      window._audioContext = audioContext.value
      window._analyser = analyser.value
      console.log('💡 Debug: AudioContext at window._audioContext')
      console.log('💡 Debug: Analyser at window._analyser')
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error)
      return false
    }
  }
  
  /**
   * Connect audio element to audio context
   * CALL THIS ONLY ONCE with the persistent audio element!
   */
  const connectAudioElement = (audioElement) => {
    if (!audioContext.value) {
      console.error('❌ AudioContext not initialized! Call initAudioContext() first')
      return false
    }
    
    if (!audioElement) {
      console.error('❌ Audio element is null')
      return false
    }
    
    if (isInitialized.value) {
      console.log('ℹ️ Audio element already connected')
      return true
    }
    
    try {
      console.log('🔗 Connecting audio element to Professional Audio Pipeline...')
      
      // Create source from audio element
      sourceNode.value = audioContext.value.createMediaElementSource(audioElement)
      console.log('✅ MediaElementSource created')
      
      currentAudioElement.value = audioElement
      
      // Connect audio graph
      console.log('🔗 Connecting Professional 15-Band EQ Chain...')
      
      let previousNode = sourceNode.value
      
      // Connect all EQ filters in series
      filters.value.forEach((filter, index) => {
        previousNode.connect(filter)
        previousNode = filter
      })
      console.log('✅ All 15 professional filters connected')
      
      // Connect to analyser
      previousNode.connect(analyser.value)
      console.log('✅ Connected to High-Resolution Analyser')
      
      // Connect to gain
      analyser.value.connect(gainNode.value)
      console.log('✅ Connected to Master Gain')
      
      // Connect to destination
      gainNode.value.connect(audioContext.value.destination)
      console.log('✅ Connected to Audio Output')
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ Professional Audio Pipeline Complete')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      isInitialized.value = true
      
      // Test analyser
      setTimeout(() => {
        testAnalyserData()
      }, 1000)
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to connect audio element:', error)
      if (error.name === 'InvalidStateError') {
        console.error('💡 Audio element may already be connected to another context')
      }
      return false
    }
  }
  
  /**
   * BACKWARD COMPATIBILITY: Old loadAudioFile function
   */
  const loadAudioFile = (audioElement) => {
    console.warn('⚠️ loadAudioFile() is deprecated. Use connectAudioElement() instead.')
    
    // If not initialized yet, do the connection
    if (!isInitialized.value) {
      if (!audioContext.value) {
        initAudioContext()
      }
      return connectAudioElement(audioElement)
    }
    
    // Already initialized, just return true
    return true
  }
  
  /**
   * Test if analyser is receiving data
   */
  const testAnalyserData = () => {
    if (!analyser.value) return
    
    const bufferLength = analyser.value.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.value.getByteFrequencyData(dataArray)
    
    const maxValue = Math.max(...dataArray)
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength
    
    if (maxValue > 0) {
      console.log('📊 Analyser receiving data: ✅ YES')
      console.log('📊 Average signal level:', avgValue.toFixed(2))
    } else {
      console.log('📊 Analyser receiving data: ⚠️ NO (audio might not be playing)')
    }
  }
  
  /**
   * Play audio
   */
  const play = async () => {
    if (!currentAudioElement.value) {
      console.error('❌ No audio element connected')
      return false
    }
    
    try {
      console.log('▶️ Playing audio...')
      
      // Resume context if suspended
      if (audioContext.value && audioContext.value.state === 'suspended') {
        await audioContext.value.resume()
        console.log('✅ AudioContext resumed')
      }
      
      await currentAudioElement.value.play()
      
      console.log('✅ Audio playing')
      console.log('📊 AudioContext state:', audioContext.value.state)
      console.log('📊 Sample Rate:', audioContext.value.sampleRate, 'Hz')
      
      // Test analyser
      setTimeout(() => {
        testAnalyserData()
      }, 500)
      
      return true
      
    } catch (error) {
      console.error('❌ Playback error:', error)
      return false
    }
  }
  
  /**
   * Pause audio
   */
  const pause = () => {
    if (!currentAudioElement.value) {
      console.error('❌ No audio element connected')
      return false
    }
    
    console.log('⏸️ Pausing audio...')
    currentAudioElement.value.pause()
    return true
  }
  
  /**
   * Stop audio
   */
  const stop = () => {
    if (!currentAudioElement.value) {
      console.error('❌ No audio element connected')
      return false
    }
    
    console.log('⏹️ Stopping audio...')
    currentAudioElement.value.pause()
    currentAudioElement.value.currentTime = 0
    return true
  }
  
  /**
   * Set master volume
   */
  const setVolume = (volume) => {
    if (!gainNode.value) {
      console.warn('⚠️ GainNode not available')
      return
    }
    
    const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100
    gainNode.value.gain.value = normalizedVolume
    
    console.log(`🔊 Volume: ${volume}% (gain: ${normalizedVolume.toFixed(3)})`)
  }
  
  /**
   * Set EQ band gain
   * @param {number} bandIndex - Index of the frequency band (0-14)
   * @param {number} gainDB - Gain in dB (-40 to +40)
   * @returns {number} - The actual gain value set (clamped)
   */
  const setEQBand = (bandIndex, gainDB) => {
    if (!filters.value || filters.value.length === 0) {
      console.warn('⚠️ Filters not initialized')
      return 0
    }
    
    if (bandIndex < 0 || bandIndex >= filters.value.length) {
      console.error('❌ Invalid band index:', bandIndex)
      return 0
    }
    
    // Clamp gain to -40 to +40 dB
    const clampedGain = Math.max(-40, Math.min(40, gainDB))
    filters.value[bandIndex].gain.value = clampedGain
    
    console.log(`🎛️ Band ${bandIndex} (${filters.value[bandIndex].frequency.value}Hz): ${clampedGain}dB`)
    
    return clampedGain
  }
  
  /**
   * Reset all EQ bands to 0
   * BACKWARD COMPATIBILITY: Named resetEqualizer for AudioEqualizer.vue
   */
  const resetEqualizer = () => {
    if (!filters.value || filters.value.length === 0) {
      console.warn('⚠️ Filters not initialized')
      return
    }
    
    filters.value.forEach((filter) => {
      filter.gain.value = 0
    })
    console.log('🎛️ All EQ bands reset to 0dB')
  }
  
  /**
   * Reset all EQ bands (alias)
   */
  const resetEQ = resetEqualizer
  
  /**
   * Get frequency data
   */
  const getFrequencyData = () => {
    if (!analyser.value) return null
    
    const bufferLength = analyser.value.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.value.getByteFrequencyData(dataArray)
    
    return dataArray
  }
  
  /**
   * Get time domain data
   */
  const getTimeDomainData = () => {
    if (!analyser.value) return null
    
    const bufferLength = analyser.value.fftSize
    const dataArray = new Uint8Array(bufferLength)
    analyser.value.getByteTimeDomainData(dataArray)
    
    return dataArray
  }
  
  /**
   * Cleanup
   */
  const cleanup = () => {
    console.log('🧹 Cleaning up audio equalizer...')
    
    if (sourceNode.value) {
      sourceNode.value.disconnect()
    }
    
    if (filters.value) {
      filters.value.forEach(filter => filter.disconnect())
    }
    
    if (analyser.value) {
      analyser.value.disconnect()
    }
    
    if (gainNode.value) {
      gainNode.value.disconnect()
    }
    
    if (audioContext.value && audioContext.value.state !== 'closed') {
      audioContext.value.close()
    }
    
    isInitialized.value = false
    console.log('✅ Cleanup complete')
  }
  
  return {
    // State
    analyser,
    audioContext,
    isInitialized,
    filters,
    frequencies,  // IMPORTANT: Export for AudioEqualizer.vue
    
    // Methods
    initAudioContext,
    connectAudioElement,
    loadAudioFile,  // BACKWARD COMPATIBILITY
    play,
    pause,
    stop,
    setVolume,
    setEQBand,
    resetEQ,
    resetEqualizer,  // IMPORTANT: Export for AudioEqualizer.vue
    getFrequencyData,
    getTimeDomainData,
    testAnalyserData,
    cleanup
  }
}
