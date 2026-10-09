<template>
  <div class="glass-card playlist-card" :class="{ collapsed: isCollapsed }">
    <button
      class="playlist-header playlist-toggle"
      :aria-expanded="!isCollapsed"
      aria-controls="playlistItems"
      @click="isCollapsed = !isCollapsed"
    >
      <span class="playlist-title-group">
        <i class="fas fa-list-ul playlist-title-icon"></i>
        <h2 class="playlist-title">{{ t('playlist.title') }}</h2>
      </span>
      <span class="playlist-header-meta">
        <span class="playlist-count"> {{ audioStore.trackCount }} {{ t('playlist.tracks') }} </span>
        <i class="fas fa-chevron-down playlist-chevron" :class="{ rotated: isCollapsed }"></i>
      </span>
    </button>

    <div v-show="!isCollapsed" class="playlist-container">
      <div v-if="audioStore.hasFiles" id="playlistItems">
        <div
          v-for="(file, index) in audioStore.audioFiles"
          :key="index"
          class="playlist-item"
          :class="{ active: index === audioStore.currentIndex }"
          @click="selectTrack(index)"
        >
          <i class="playlist-item-icon fas fa-music"></i>
          <span class="playlist-item-name" :title="file.name">{{ file.name }}</span>
          <button
            class="playlist-item-delete"
            aria-label="Remove track"
            @click.stop="removeTrack(index)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div v-else class="playlist-empty">
        {{ currentLang === 'de' ? 'Keine Titel in der Wiedergabeliste' : 'No tracks in playlist' }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useAudioStore } from '../stores/audio'
  import { useI18nStore } from '../stores/i18n'

  const audioStore = useAudioStore()
  const i18nStore = useI18nStore()
  const t = i18nStore.t
  const currentLang = computed(() => i18nStore.currentLang)

  const isCollapsed = ref(false)

  const selectTrack = (index) => {
    audioStore.setCurrentIndex(index)
  }

  const removeTrack = (index) => {
    if (confirm(currentLang.value === 'de' ? 'Titel entfernen?' : 'Remove track?')) {
      audioStore.removeTrack(index)
    }
  }
</script>

<style scoped>
  /* Collapsible header acts as a full-width toggle button */
  .playlist-toggle {
    width: 100%;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: left;
  }

  .playlist-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .playlist-title-icon {
    color: var(--accent-primary);
    font-size: 13px;
  }

  .playlist-header-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .playlist-chevron {
    color: var(--text-muted);
    font-size: 12px;
    transition: transform 0.2s ease;
  }

  .playlist-chevron.rotated {
    transform: rotate(-90deg);
  }

  .playlist-card.collapsed {
    padding-bottom: 12px;
  }

  .playlist-card.collapsed .playlist-header {
    margin-bottom: 0;
  }

  .playlist-item:hover .playlist-item-delete {
    opacity: 1;
  }

  .playlist-item-delete {
    opacity: 0;
    background: transparent;
    border: none;
    color: var(--error);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease;
  }

  .playlist-item-delete:hover {
    background: color-mix(in srgb, var(--error) 14%, transparent);
  }
</style>
