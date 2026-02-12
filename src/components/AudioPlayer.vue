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

    <!-- Progress Bar with Track Info -->
    <div class="player-progress-section" v-if="audioStore.hasFiles">
      <div class="track-info">
        <span class="track-title">{{ currentTrackName }}</span>
        <span class="track-time">{{ formatTime(audioStore.currentTime) }} / {{ formatTime(audioStore.duration) }}</span>
      </div>
      <div class="progress-bar-container" @click="seekTo">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
      </div>
    </div>

    <div class="player-controls-row">
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
          <SvgIcon name="folder-open" />
          <span>{{ t('controls.chooseFiles') }}</span>
        </label>
      </div>

      <div class="audio-controls">
        <button
          class="control-btn"
          :title="t('controls.backward')"
          aria-label="Previous track"
          @click="previousTrack"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon name="backward-step" />
        </button>

        <button
          class="control-btn primary"
          :class="{ playing: audioStore.isPlaying }"
          :title="t('controls.playPause')"
          aria-label="Play or pause"
          @click="togglePlayPause"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon :name="audioStore.isPlaying ? 'pause' : 'play'" />
        </button>

        <button
          class="control-btn"
          :title="t('controls.forward')"
          aria-label="Next track"
          @click="nextTrack"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon name="forward-step" />
        </button>

        <button
          class="control-btn"
          :class="{ active: audioStore.isShuffle }"
          :title="t('controls.shuffle')"
          aria-label="Shuffle playlist"
          @click="audioStore.toggleShuffle"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon name="shuffle" />
        </button>

        <button
          class="control-btn"
          :class="{ active: audioStore.isLoop }"
          :title="t('controls.loop')"
          aria-label="Loop playlist"
          @click="audioStore.toggleLoop"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon name="repeat" />
        </button>

        <button
          class="control-btn danger"
          :title="t('controls.deleteAll')"
          aria-label="Delete all files"
          @click="deleteAllFiles"
          :disabled="!audioStore.hasFiles"
        >
          <SvgIcon name="trash-can" />
        </button>
      </div>

      <div class="volume-section">
        <SvgIcon name="volume-low" class="volume-icon" />
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAudioStore } from '../stores/audio'
import { useI18nStore } from '../stores/i18n'
import { useAudioEqualizer } from '../composables/useAudioEqualizer'
import SvgIcon from './SvgIcon.vue'

const audioStore = useAudioStore()
const i18nStore = useI18nStore()
const t = i18nStore.t

const { initAudioContext, connectAudioElement, play, pause, stop, setVolume } = useAudioEqualizer()

const fileInput = ref(null)
const audioElement = ref(null)
const volume = ref(audioStore.volume)
const initialized = ref(false)
const currentObjectURL = ref(null)

// Computed properties for progress bar
const currentTrackName = computed(() => {
  const track = audioStore.currentTrack
  if (!track) return i18nStore.currentLang === 'de' ? 'Kein Titel geladen' : 'No track loaded'
  // Remove file extension
  return track.name.replace(/\.[^/.]+$/, '')
})

const progressPercent = computed(() => {
  if (!audioStore.duration || audioStore.duration === 0) return 0
  return (audioStore.currentTime / audioStore.duration) * 100
})

// Format time helper
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Seek to position
const seekTo = (event) => {
  if (!audioElement.value || !audioStore.duration) return
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percent = clickX / rect.width
  const newTime = percent * audioStore.duration
  audioElement.value.currentTime = newTime
}

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
    // If there are more tracks, play the next one
    if (audioStore.trackCount > 1) {
      nextTrack()
    } else {
      // Single track finished, stop playing
      audioStore.setPlaying(false)
    }
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
        cleanup()
        reject(new Error('Timeout waiting for audio to load'))
      }, 5000)

      const cleanup = () => {
        clearTimeout(timeout)
        audioElement.value.removeEventListener('canplay', onCanPlay)
        audioElement.value.removeEventListener('error', onError)
      }

      const onCanPlay = () => {
        cleanup()
        console.log('✅ Audio ready (readyState:', audioElement.value.readyState, ')')
        resolve()
      }

      const onError = () => {
        cleanup()
        reject(new Error(audioElement.value.error?.message || 'Audio load error'))
      }

      if (audioElement.value.readyState >= 2) {
        cleanup()
        console.log('✅ Audio already ready (readyState:', audioElement.value.readyState, ')')
        resolve()
      } else {
        audioElement.value.addEventListener('canplay', onCanPlay)
        audioElement.value.addEventListener('error', onError)
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
    audioStore.setPlaying(false)
  } else {
    console.log('▶️ Playing...')
    const success = await play()
    if (success) {
      audioStore.setPlaying(true)
    }
  }
}

const stopPlayback = () => {
  console.log('⏹️ Stop clicked')
  stop()
  audioStore.setPlaying(false)
}

const nextTrack = async () => {
  console.log('⏭️ Next track clicked')
  audioStore.nextTrack()
}

const previousTrack = async () => {
  console.log('⏮️ Previous track clicked')
  audioStore.previousTrack()
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

    // Clear audio source but keep the audio pipeline connected
    if (audioElement.value) {
      audioElement.value.src = ''
      audioElement.value.load()
    }

    // Reset file input so the same files can be selected again
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    audioStore.clearAll()
    // NOTE: Keep initialized = true because the audio element
    // is already connected to AudioContext (can't reconnect)
  }
}

const updateVolume = () => {
  const newVolume = parseInt(volume.value)
  setVolume(newVolume)
}

// Watch for track changes (single entry point for next/prev/playlist clicks)
watch(() => audioStore.currentIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    console.log('📋 Track index changed from', oldIndex, 'to', newIndex)
    const wasPlaying = audioStore.isPlaying
    await loadCurrentTrack()
    if (wasPlaying) {
      await new Promise(resolve => setTimeout(resolve, 300))
      await play()
    }
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
