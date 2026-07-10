import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'eq-custom-presets'

// Factory presets: one gain value per band, matching the 15 frequencies in
// useAudioEqualizer (32, 64, 125, 250, 500, 1k, 2k, 3k, 4k, 6k, 8k, 10k, 12k, 14k, 16k Hz).
// Values are kept musical (roughly -12..+12 dB).
const FACTORY_PRESETS = [
  {
    id: 'flat',
    name: { de: 'Neutral', en: 'Flat' },
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'rock',
    name: { de: 'Rock', en: 'Rock' },
    values: [5, 4, 3, 1, -1, -1, 0, 1, 2, 3, 3, 4, 4, 3, 3],
  },
  {
    id: 'pop',
    name: { de: 'Pop', en: 'Pop' },
    values: [-1, 0, 1, 2, 3, 3, 2, 1, 0, 1, 2, 2, 2, 1, 1],
  },
  {
    id: 'jazz',
    name: { de: 'Jazz', en: 'Jazz' },
    values: [3, 2, 1, 2, 1, 0, 0, 1, 1, 2, 2, 1, 1, 2, 2],
  },
  {
    id: 'classical',
    name: { de: 'Klassik', en: 'Classical' },
    values: [3, 3, 2, 1, 0, 0, 0, 0, -1, 0, 1, 2, 2, 3, 3],
  },
  {
    id: 'bass-boost',
    name: { de: 'Bass-Boost', en: 'Bass Boost' },
    values: [8, 7, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'treble-boost',
    name: { de: 'Höhen-Boost', en: 'Treble Boost' },
    values: [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 6, 7, 7],
  },
  {
    id: 'vocal',
    name: { de: 'Stimme', en: 'Vocal' },
    values: [-2, -2, -1, 0, 2, 4, 4, 4, 3, 2, 1, 0, -1, -1, -1],
  },
  {
    id: 'electronic',
    name: { de: 'Elektronisch', en: 'Electronic' },
    values: [6, 5, 3, 1, -2, -3, -2, 0, 1, 2, 3, 4, 5, 5, 5],
  },
  {
    id: 'acoustic',
    name: { de: 'Akustik', en: 'Acoustic' },
    values: [4, 4, 3, 1, 1, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1],
  },
]

export const usePresetsStore = defineStore('presets', () => {
  const factoryPresets = ref(FACTORY_PRESETS)
  const customPresets = ref(loadCustom())

  function loadCustom() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn('⚠️ Could not read custom presets from localStorage:', error)
      return []
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets.value))
    } catch (error) {
      console.warn('⚠️ Could not persist custom presets:', error)
    }
  }

  /**
   * Save the given gains as a custom preset. Overwrites a preset with the
   * same (case-insensitive) name if one already exists.
   */
  function saveCustom(name, values) {
    const trimmed = String(name || '').trim()
    if (!trimmed) return null

    const preset = {
      id: 'custom-' + Date.now(),
      name: trimmed,
      values: Array.from(values).slice(0, 15),
    }

    const idx = customPresets.value.findIndex((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    if (idx >= 0) {
      preset.id = customPresets.value[idx].id
      customPresets.value[idx] = preset
    } else {
      customPresets.value.push(preset)
    }
    persist()
    return preset
  }

  function deleteCustom(id) {
    customPresets.value = customPresets.value.filter((p) => p.id !== id)
    persist()
  }

  function findById(id) {
    return (
      factoryPresets.value.find((p) => p.id === id) ||
      customPresets.value.find((p) => p.id === id) ||
      null
    )
  }

  function isCustom(id) {
    return customPresets.value.some((p) => p.id === id)
  }

  return {
    factoryPresets,
    customPresets,
    saveCustom,
    deleteCustom,
    findById,
    isCustom,
  }
})
