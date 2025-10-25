<template>
  <div class="glass-card player-section">
    <!-- KRITISCH: Audio-Element im DOM! -->
    <audio 
      ref="audioElement"
      preload="auto"
      crossorigin="anonymous"
      @loadedmetadata="handleMetadataLoaded"
      @canplay="handleCanPlay"
      @canplaythrough="handleCanPlayThrough"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
    ></audio>

    <div>
      <div class="file-upload">
        <input 
          type="file" 
          id="audioFile" 
          ref="fileInput"
          accept="audio/*" 
          multiple 
          aria-label="Choose audio files"
          @change="handleFileUpload"
        />
        <label for="audioFile" class="file-upload-label">
          <i class="fas fa-upload"></i>
          <span>{{ t('controls.chooseFiles') }}</span>
        </label>
      </div>
      
      <div class="volume-section">
        <label class="volume-label" for="volume">{{ t('controls.volume') }}</label>
        <div class="volume-slider">
          <input 
            id="volume" 
            type="range" 
            min="0" 
            max="100" 
            v-model="volume"
            aria-label="Volume control"
            @input="updateVolume"
          />
        </div>
        <div class="volume-display">{{ volume }}%</div>
      </div>
    </div>
    
    <div class="audio-controls">
      <button 
        class="control-btn" 
        :title="t('controls.backward')"
        aria-label="Previous track"
        @click="previousTrack"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-backward"></i>
      </button>
      
      <button 
        class="control-btn primary" 
        :class="{ playing: audioStore.isPlaying }"
        :title="t('controls.playPause')"
        aria-label="Play or pause"
        @click="togglePlayPause"
        :disabled="!audioStore.hasFiles"
      >
        <i :class="audioStore.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
      </button>
      
      <button 
        class="control-btn" 
        :title="t('controls.stop')"
        aria-label="Stop playback"
        @click="stopPlayback"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-stop"></i>
      </button>
      
      <button 
        class="control-btn" 
        :title="t('controls.forward')"
        aria-label="Next track"
        @click="nextTrack"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-forward"></i>
      </button>
      
      <button 
        class="control-btn" 
        :class="{ active: audioStore.isShuffle }"
        :title="t('controls.shuffle')"
        aria-label="Shuffle playlist"
        @click="audioStore.toggleShuffle"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-random"></i>
      </button>
      
      <button 
        class="control-btn" 
        :class="{ active: audioStore.isLoop }"
        :title="t('controls.loop')"
        aria-label="Loop playlist"
        @click="audioStore.toggleLoop"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-repeat"></i>
      </button>
      
      <button 
        class="control-btn danger" 
        :title="t('controls.deleteAll')"
        aria-label="Delete all files"
        @click="deleteAllFiles"
        :disabled="!audioStore.hasFiles"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAudioStore } from '../stores/audio'
import { useI18nStore } from '../stores/i18n'
import { useAudioEqualizer } from '../composables/useAudioEqualizer'

const audioStore = useAudioStore()
const i18nStore = useI18nStore()
const t = i18nStore.t

const { initAudioContext, connectAudioElement, play, pause, stop, setVolume } = useAudioEqualizer()

const fileInput = ref(null)
const audioElement = ref(null)
const volume = ref(audioStore.volume)
const initialized = ref(false)
const currentObjectURL = ref(null)

// Event Handlers
const handleMetadataLoaded = () => {
  if (!audioElement.value) return
  console.log('✅ Metadata loaded')
  console.log('   Duration:', audioElement.value.duration.toFixed(2), 'seconds')
  console.log('   Ready state:', audioElement.value.readyState)
  audioStore.updateDuration(audioElement.value.duration)
}

const handleCanPlay = () => {
  if (!audioElement.value) return
  console.log('✅ Audio can play (readyState:', audioElement.value.readyState, ')')
}

const handleCanPlayThrough = () => {
  console.log('✅ Audio can play through')
}

const handleTimeUpdate = () => {
  if (!audioElement.value) return
  audioStore.updateTime(audioElement.value.currentTime)
}

const handleEnded = () => {
  console.log('⏹️ Track ended')
  if (!audioStore.isLoop) {
    nextTrack()
  }
}

const handleError = (e) => {
  if (!audioElement.value) return
  console.error('❌ Audio error:', e)
  console.error('   Error code:', audioElement.value.error?.code)
  console.error('   Error message:', audioElement.value.error?.message)
}

// Initialize on mount
onMounted(() => {
  console.log('🎵 AudioPlayer mounted')
  
  if (!audioElement.value) {
    console.error('❌ Audio element ref is null!')
    return
  }
  
  console.log('✅ Audio element found in DOM:', audioElement.value)
  
  // Set loop from store
  audioElement.value.loop = audioStore.isLoop
  
  // Store reference globally for debugging
  window._audioElement = audioElement.value
  console.log('💡 Debug: Audio element available at window._audioElement')
})

// File Upload Handler
const handleFileUpload = async (event) => {
  const files = event.target.files
  if (files.length === 0) {
    console.log('❌ No files selected')
    return
  }
  
  console.log(`📁 ${files.length} file(s) selected`)
  
  // Initialize audio context on first interaction
  if (!initialized.value) {
    console.log('🎵 First file upload - initializing AudioContext...')
    if (!initAudioContext()) {
      console.error('❌ Failed to initialize AudioContext')
      alert('Fehler beim Initialisieren des Audio-Systems. Bitte versuchen Sie es erneut.')
      return
    }
    
    // KRITISCH: Verbinde das Audio-Element mit dem AudioContext
    console.log('🔗 Connecting audio element to AudioContext...')
    const connected = connectAudioElement(audioElement.value)
    if (!connected) {
      console.error('❌ Failed to connect audio element')
      alert('Fehler beim Verbinden des Audio-Elements')
      return
    }
    
    initialized.value = true
    console.log('✅ AudioContext initialized and audio element connected')
  }
  
  // Add files to store
  audioStore.addFiles(files)
  console.log(`📋 Total tracks: ${audioStore.trackCount}`)
  
  // Load the first track immediately
  await loadCurrentTrack()
}

// Load current track
const loadCurrentTrack = async () => {
  const currentFile = audioStore.currentTrack
  if (!currentFile) {
    console.warn('⚠️ No current track to load')
    return
  }
  
  if (!audioElement.value) {
    console.error('❌ Audio element not available')
    return
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📀 Loading track: ${currentFile.name}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Revoke previous object URL to prevent memory leaks
    if (currentObjectURL.value) {
      URL.revokeObjectURL(currentObjectURL.value)
      console.log('🗑️ Previous object URL revoked')
    }
    
    // Create new object URL
    currentObjectURL.value = URL.createObjectURL(currentFile)
    console.log('✅ Object URL created:', currentObjectURL.value.substring(0, 50) + '...')
    
    // Set source on existing audio element
    audioElement.value.src = currentObjectURL.value
    audioElement.value.load() // Force reload
    console.log('🔗 Audio source set and loaded')
    
    // Wait for audio to be ready
    console.log('⏳ Waiting for audio to be ready...')
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for audio to load'))
      }, 5000)
      
      if (audioElement.value.readyState >= 2) {
        clearTimeout(timeout)
        console.log('✅ Audio already ready (readyState:', audioElement.value.readyState, ')')
        resolve()
      } else {
        const onCanPlay = () => {
          clearTimeout(timeout)
          console.log('✅ Audio ready after waiting (readyState:', audioElement.value.readyState, ')')
          audioElement.value.removeEventListener('canplay', onCanPlay)
          resolve()
        }
        audioElement.value.addEventListener('canplay', onCanPlay)
      }
    })
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅✅✅ TRACK FULLY LOADED ✅✅✅')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Set initial volume
    setVolume(volume.value)
    console.log('🔊 Volume set to:', volume.value + '%')
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ ERROR LOADING TRACK:', error)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error details:', error.message)
  }
}

// Player Controls
const togglePlayPause = async () => {
  console.log('🎮 Play/Pause clicked')
  
  // Initialize if needed
  if (!initialized.value) {
    console.log('⚠️ AudioContext not initialized yet')
    if (!initAudioContext()) {
      alert('Fehler beim Initialisieren des Audio-Systems')
      return
    }
    
    // Connect audio element
    const connected = connectAudioElement(audioElement.value)
    if (!connected) {
      alert('Fehler beim Verbinden des Audio-Elements')
      return
    }
    
    initialized.value = true
    console.log('✅ AudioContext initialized on play click')
  }
  
  // Load track if needed
  if (!audioElement.value.src && audioStore.currentTrack) {
    console.log('⚠️ No audio source, loading track...')
    await loadCurrentTrack()
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  if (audioStore.isPlaying) {
    console.log('⏸️ Pausing...')
    pause()
  } else {
    console.log('▶️ Playing...')
    await play()
  }
}

const stopPlayback = () => {
  console.log('⏹️ Stop clicked')
  stop()
}

const nextTrack = async () => {
  console.log('⏭️ Next track clicked')
  audioStore.nextTrack()
  await loadCurrentTrack()
  if (audioStore.isPlaying) {
    await new Promise(resolve => setTimeout(resolve, 300))
    await play()
  }
}

const previousTrack = async () => {
  console.log('⏮️ Previous track clicked')
  audioStore.previousTrack()
  await loadCurrentTrack()
  if (audioStore.isPlaying) {
    await new Promise(resolve => setTimeout(resolve, 300))
    await play()
  }
}

const deleteAllFiles = () => {
  if (confirm(t('controls.deleteAll') + '?')) {
    console.log('🗑️ Deleting all files')
    stop()
    
    // Revoke current object URL
    if (currentObjectURL.value) {
      URL.revokeObjectURL(currentObjectURL.value)
      currentObjectURL.value = null
    }
    
    audioStore.clearAll()
    initialized.value = false
  }
}

const updateVolume = () => {
  const newVolume = parseInt(volume.value)
  setVolume(newVolume)
}

// Watch for track changes
watch(() => audioStore.currentIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    console.log('📋 Track index changed from', oldIndex, 'to', newIndex)
    await loadCurrentTrack()
  }
})

// Watch for volume changes from store
watch(() => audioStore.volume, (newVolume) => {
  volume.value = newVolume
})

// Watch for loop changes
watch(() => audioStore.isLoop, (isLoop) => {
  if (audioElement.value) {
    audioElement.value.loop = isLoop
    console.log('🔁 Loop mode changed to:', isLoop)
  }
})
</script>
