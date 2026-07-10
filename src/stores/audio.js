import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // State
  const audioFiles = ref([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const isShuffle = ref(false)
  const isLoop = ref(false)
  const volume = ref(50)
  const currentTime = ref(0)
  const duration = ref(0)
  const audioElement = ref(null)

  // Computed
  const currentTrack = computed(() => audioFiles.value[currentIndex.value] || null)
  const hasFiles = computed(() => audioFiles.value.length > 0)
  const trackCount = computed(() => audioFiles.value.length)

  // Actions
  const addFiles = (files) => {
    audioFiles.value = [...audioFiles.value, ...Array.from(files)]
  }

  const removeTrack = (index) => {
    if (index < 0 || index >= audioFiles.value.length) return

    const wasCurrent = index === currentIndex.value
    audioFiles.value.splice(index, 1)

    if (audioFiles.value.length === 0) {
      // Nothing left to play
      currentIndex.value = 0
      isPlaying.value = false
      isPaused.value = false
      currentTime.value = 0
      duration.value = 0
      return
    }

    if (index < currentIndex.value) {
      // Removed a track before the current one → shift index so the
      // currently playing track keeps playing uninterrupted.
      currentIndex.value = currentIndex.value - 1
    } else if (wasCurrent) {
      // Removed the current track → clamp to the last valid index.
      // currentTrack now points at a different file, which the player
      // watches to load and (if it was playing) continue playback.
      currentIndex.value = Math.min(currentIndex.value, audioFiles.value.length - 1)
    }
  }

  const clearAll = () => {
    audioFiles.value = []
    currentIndex.value = 0
    isPlaying.value = false
    isPaused.value = false
    currentTime.value = 0
    duration.value = 0
  }

  const setCurrentIndex = (index) => {
    if (index >= 0 && index < audioFiles.value.length) {
      currentIndex.value = index
    }
  }

  const nextTrack = () => {
    if (isShuffle.value) {
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * audioFiles.value.length)
      } while (randomIndex === currentIndex.value && audioFiles.value.length > 1)
      currentIndex.value = randomIndex
    } else {
      currentIndex.value = (currentIndex.value + 1) % audioFiles.value.length
    }
  }

  const previousTrack = () => {
    currentIndex.value =
      currentIndex.value === 0 ? audioFiles.value.length - 1 : currentIndex.value - 1
  }

  const toggleShuffle = () => {
    isShuffle.value = !isShuffle.value
  }

  const toggleLoop = () => {
    isLoop.value = !isLoop.value
    if (audioElement.value) {
      audioElement.value.loop = isLoop.value
    }
  }

  const setVolume = (val) => {
    volume.value = Math.max(0, Math.min(100, val))
  }

  const setPlaying = (val) => {
    isPlaying.value = val
  }

  const setPaused = (val) => {
    isPaused.value = val
  }

  const updateTime = (time) => {
    currentTime.value = time
  }

  const updateDuration = (dur) => {
    duration.value = dur
  }

  const setAudioElement = (element) => {
    audioElement.value = element
  }

  return {
    // State
    audioFiles,
    currentIndex,
    isPlaying,
    isPaused,
    isShuffle,
    isLoop,
    volume,
    currentTime,
    duration,
    audioElement,

    // Computed
    currentTrack,
    hasFiles,
    trackCount,

    // Actions
    addFiles,
    removeTrack,
    clearAll,
    setCurrentIndex,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleLoop,
    setVolume,
    setPlaying,
    setPaused,
    updateTime,
    updateDuration,
    setAudioElement,
  }
})
