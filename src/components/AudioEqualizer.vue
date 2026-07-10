<template>
  <div class="glass-card equalizer-section">
    <div class="equalizer-header">
      <h2 class="equalizer-title">{{ t('equalizer.title') }}</h2>

      <div class="eq-actions">
        <select
          v-model="selectedPresetId"
          class="preset-select"
          :aria-label="t('equalizer.presets.choose')"
          @change="onPresetChange"
        >
          <option value="">{{ t('equalizer.presets.choose') }}</option>
          <optgroup :label="t('equalizer.presets.factory')">
            <option v-for="preset in factoryPresets" :key="preset.id" :value="preset.id">
              {{ presetLabel(preset) }}
            </option>
          </optgroup>
          <optgroup v-if="customPresets.length" :label="t('equalizer.presets.custom')">
            <option v-for="preset in customPresets" :key="preset.id" :value="preset.id">
              {{ preset.name }}
            </option>
          </optgroup>
        </select>

        <button class="reset-btn" :title="t('equalizer.presets.save')" @click="handleSave">
          <i class="fas fa-floppy-disk"></i>
          <span>{{ t('equalizer.presets.save') }}</span>
        </button>

        <button
          v-if="isCustomSelected"
          class="reset-btn danger-btn"
          :title="t('equalizer.presets.delete')"
          @click="handleDeletePreset"
        >
          <i class="fas fa-trash-can"></i>
        </button>

        <button class="reset-btn" :title="t('equalizer.reset')" @click="handleReset">
          <i class="fas fa-undo"></i>
          <span>{{ t('equalizer.reset') }}</span>
        </button>
      </div>
    </div>

    <div class="eq-sliders">
      <div v-for="(freq, index) in frequencies" :key="freq" class="eq-slider">
        <div :id="`gain${freq}`" class="gain-indicator">{{ currentGains[index] }} dB</div>
        <label class="eq-slider-label">{{ formatFrequency(freq) }}</label>
        <input
          :id="`freq${freq}`"
          type="range"
          min="-40"
          max="40"
          step="1"
          :value="currentGains[index]"
          :aria-label="`${formatFrequency(freq)} frequency control`"
          @input="updateEQ(index, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18nStore } from '../stores/i18n'
  import { usePresetsStore } from '../stores/presets'
  import { useAudioEqualizer } from '../composables/useAudioEqualizer'

  const i18nStore = useI18nStore()
  const t = i18nStore.t

  const presetsStore = usePresetsStore()
  const factoryPresets = presetsStore.factoryPresets
  const customPresets = computed(() => presetsStore.customPresets)

  const { frequencies, currentGains, setEQBand, applyPreset, resetEqualizer } = useAudioEqualizer()

  const selectedPresetId = ref('')

  const isCustomSelected = computed(() => presetsStore.isCustom(selectedPresetId.value))

  /**
   * Localized label for a factory preset
   */
  const presetLabel = (preset) => {
    return i18nStore.currentLang === 'de' ? preset.name.de : preset.name.en
  }

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
   * Update a single EQ band (manual slider change → no preset selected)
   */
  const updateEQ = (index, event) => {
    const gainDB = parseFloat(event.target.value)
    setEQBand(index, gainDB)
    selectedPresetId.value = ''
  }

  /**
   * Apply the selected preset
   */
  const onPresetChange = () => {
    if (!selectedPresetId.value) return
    const preset = presetsStore.findById(selectedPresetId.value)
    if (preset) applyPreset(preset.values)
  }

  /**
   * Save the current EQ curve as a custom preset
   */
  const handleSave = () => {
    const name = window.prompt(t('equalizer.presets.savePrompt'))
    if (!name || !name.trim()) return
    const preset = presetsStore.saveCustom(name, currentGains.value)
    if (preset) selectedPresetId.value = preset.id
  }

  /**
   * Delete the currently selected custom preset
   */
  const handleDeletePreset = () => {
    if (!isCustomSelected.value) return
    if (window.confirm(t('equalizer.presets.deleteConfirm'))) {
      presetsStore.deleteCustom(selectedPresetId.value)
      selectedPresetId.value = ''
    }
  }

  /**
   * Reset all EQ bands to 0
   */
  const handleReset = () => {
    resetEqualizer()
    selectedPresetId.value = ''
  }
</script>

<style scoped>
  .eq-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .preset-select {
    background: var(--color-slate);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: 6px 10px;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    max-width: 180px;
  }

  .preset-select:hover {
    border-color: var(--accent-color);
  }

  .danger-btn {
    color: var(--danger-color);
  }

  .danger-btn:hover {
    background: var(--base-red);
    color: #fff;
  }

  :global(body[data-theme='light']) .preset-select {
    background: #f8e1a9;
    color: #003971;
    border-color: rgba(1, 79, 153, 0.18);
  }
</style>
