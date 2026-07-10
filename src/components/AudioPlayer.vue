<template>
  <div class="player-bar" :class="{ 'is-active': audioStore.hasFiles }">
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

    <!-- Full-width seek/progress line at the top of the bar -->
    <div
      v-if="audioStore.hasFiles"
      class="progress-bar-container player-bar-progress"
      @click="seekTo"
    >
      <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
    </div>

    <div class="player-bar-body">
      <!-- Left: track info -->
      <div class="pb-track">
        <span class="track-title">{{ currentTrackName }}</span>
        <span v-if="audioStore.hasFiles" class="track-time">
          {{ formatTime(audioStore.currentTime) }} / {{ formatTime(audioStore.duration) }}
        </span>
      </div>

      <!-- Center: transport controls -->
      <div class="pb-transport audio-controls">
        <button
          class="control-btn"
          :title="t('controls.backward')"
          aria-label="Previous track"
          :disabled="!audioStore.hasFiles"
          @click="previousTrack"
        >
          <i class="fas fa-backward-step"></i>
        </button>

        <button
          class="control-btn primary"
          :class="{ playing: audioStore.isPlaying }"
          :title="t('controls.playPause')"
          aria-label="Play or pause"
          :disabled="!audioStore.hasFiles"
          @click="togglePlayPause"
        >
          <i :class="audioStore.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>

        <button
          class="control-btn"
          :title="t('controls.forward')"
          aria-label="Next track"
          :disabled="!audioStore.hasFiles"
          @click="nextTrack"
        >
          <i class="fas fa-forward-step"></i>
        </button>

        <button
          class="control-btn"
          :class="{ active: audioStore.isShuffle }"
          :title="t('controls.shuffle')"
          aria-label="Shuffle playlist"
          :disabled="!audioStore.hasFiles"
          @click="audioStore.toggleShuffle"
        >
          <i class="fas fa-shuffle"></i>
        </button>

        <button
          class="control-btn"
          :class="{ active: audioStore.isLoop }"
          :title="t('controls.loop')"
          aria-label="Loop playlist"
          :disabled="!audioStore.hasFiles"
          @click="audioStore.toggleLoop"
        >
          <i class="fas fa-repeat"></i>
        </button>
      </div>

      <!-- Right: upload, volume, delete -->
      <div class="pb-meta">
        <div class="file-upload">
          <input
            id="audioFile"
            ref="fileInput"
            type="file"
            accept="audio/*"
            multiple
            aria-label="Choose audio files"
            @change="handleFileUpload"
          />
          <label for="audioFile" class="file-upload-label">
            <i class="fas fa-folder-open"></i>
            <span>{{ t('controls.chooseFiles') }}</span>
          </label>
        </div>

        <div class="volume-section">
          <button
            class="volume-icon-btn"
            :class="{ muted: isMuted }"
            :title="isMuted ? t('controls.unmute') : t('controls.mute')"
            :aria-label="isMuted ? t('controls.unmute') : t('controls.mute')"
            :aria-pressed="isMuted"
            @click="toggleMute"
          >
            <i :class="volumeIconClass"></i>
          </button>
          <div class="volume-slider">
            <input
              id="volume"
              v-model="volume"
              type="range"
              min="0"
              max="100"
              aria-label="Volume control"
              @input="updateVolume"
            />
          </div>
          <div class="volume-display">{{ volume }}%</div>
        </div>

        <button
          class="control-btn danger"
          :title="t('controls.deleteAll')"
          aria-label="Delete all files"
          :disabled="!audioStore.hasFiles"
          @click="deleteAllFiles"
        >
          <i class="fas fa-trash-can"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useAudioStore } from '../stores/audio'
  import { useI18nStore } from '../stores/i18n'
  import { useAudioEqualizer } from '../composables/useAudioEqualizer'

  const audioStore = useAudioStore()
  const i18nStore = useI18nStore()
  const t = i18nStore.t

  const { initAudioContext, connectAudioElement, play, pause, stop, setVolume } =
    useAudioEqualizer()

  const fileInput = ref(null)
  const audioElement = ref(null)
  const volume = ref(audioStore.volume)
  const initialized = ref(false)
  const currentObjectURL = ref(null)
  const isMuted = ref(false)
  const volumeBeforeMute = ref(audioStore.volume)

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

    // Add files to store. The currentTrack watcher loads the first track when
    // the playlist goes from empty → populated; appending more files while a
    // track is already loaded does not interrupt playback.
    audioStore.addFiles(files)
    console.log(`📋 Total tracks: ${audioStore.trackCount}`)
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
      await new Promise((resolve) => setTimeout(resolve, 500))
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
    // Dragging the slider takes over from mute state
    isMuted.value = newVolume === 0
  }

  // Volume icon reflects mute state and level
  const volumeIconClass = computed(() => {
    if (isMuted.value || volume.value == 0) return 'fas fa-volume-xmark'
    if (volume.value < 50) return 'fas fa-volume-low'
    return 'fas fa-volume-high'
  })

  const toggleMute = () => {
    if (isMuted.value) {
      // Unmute → restore the previous level (fall back to 50% if it was 0)
      isMuted.value = false
      const restored = volumeBeforeMute.value > 0 ? volumeBeforeMute.value : 50
      volume.value = restored
      setVolume(restored)
    } else {
      // Mute → remember the current level and drop to 0
      volumeBeforeMute.value = parseInt(volume.value) || 0
      isMuted.value = true
      volume.value = 0
      setVolume(0)
    }
  }

  // Watch the actual current track (single entry point for upload, next/prev,
  // playlist selection AND removal). Watching the track identity — rather than
  // the index — also catches the case where a track is removed and the index
  // stays numerically the same but now points at a different file.
  watch(
    () => audioStore.currentTrack,
    async (newTrack, oldTrack) => {
      if (newTrack === oldTrack) return

      // No track left (e.g. the playing track was removed and the list is empty)
      if (!newTrack) {
        console.log('⏹️ No current track — stopping playback')
        stop()
        audioStore.setPlaying(false)
        if (currentObjectURL.value) {
          URL.revokeObjectURL(currentObjectURL.value)
          currentObjectURL.value = null
        }
        if (audioElement.value) {
          audioElement.value.src = ''
          audioElement.value.load()
        }
        return
      }

      const wasPlaying = audioStore.isPlaying
      await loadCurrentTrack()
      if (wasPlaying) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        await play()
      }
    }
  )

  // Watch for volume changes from store
  watch(
    () => audioStore.volume,
    (newVolume) => {
      volume.value = newVolume
    }
  )

  // Watch for loop changes
  watch(
    () => audioStore.isLoop,
    (isLoop) => {
      if (audioElement.value) {
        audioElement.value.loop = isLoop
        console.log('🔁 Loop mode changed to:', isLoop)
      }
    }
  )
</script>
