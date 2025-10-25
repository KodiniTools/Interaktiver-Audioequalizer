<template>
  <div class="glass-card equalizer-section">
    <div class="equalizer-header">
      <h2 class="equalizer-title">{{ t('equalizer.title') }}</h2>
      <button class="reset-btn" @click="handleReset">
        <i class="fas fa-undo"></i>
        <span>{{ t('equalizer.reset') }}</span>
      </button>
    </div>
    
    <div class="eq-sliders">
      <div 
        v-for="(freq, index) in frequencies" 
        :key="freq" 
        class="eq-slider"
      >
        <div class="gain-indicator" :id="`gain${freq}`">{{ eqValues[index] }} dB</div>
        <label class="eq-slider-label">{{ formatFrequency(freq) }}</label>
        <input 
          type="range" 
          :id="`freq${freq}`"
          min="-40" 
          max="40" 
          step="1"
          :value="eqValues[index]"
          :aria-label="`${formatFrequency(freq)} frequency control`"
          @input="updateEQ(index, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18nStore } from '../stores/i18n'
import { useAudioEqualizer } from '../composables/useAudioEqualizer'

const i18nStore = useI18nStore()
const t = i18nStore.t

const { frequencies, setEQBand, resetEqualizer } = useAudioEqualizer()

// EQ values for each band
const eqValues = ref(new Array(frequencies.length).fill(0))

/**
 * Format frequency for display
 */
const formatFrequency = (freq) => {
  if (freq >= 1000) {
    const kHz = freq / 1000
    return `${kHz.toFixed(1)} kHz`.replace('.', ',')
  }
  return `${freq} Hz`
}

/**
 * Update EQ band
 */
const updateEQ = (index, event) => {
  const gainDB = parseFloat(event.target.value)
  const actualGain = setEQBand(index, gainDB)
  eqValues.value[index] = actualGain
}

/**
 * Reset all EQ bands
 */
const handleReset = () => {
  resetEqualizer()
  eqValues.value = new Array(frequencies.length).fill(0)
}
</script>
