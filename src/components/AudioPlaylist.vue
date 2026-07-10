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
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: left;
  }

  .playlist-title-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .playlist-title-icon {
    color: var(--accent-color);
    font-size: 0.85rem;
  }

  .playlist-header-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .playlist-chevron {
    color: var(--text-secondary);
    font-size: 0.75rem;
    transition: transform var(--transition-normal);
  }

  .playlist-chevron.rotated {
    transform: rotate(-90deg);
  }

  .playlist-card.collapsed {
    padding-bottom: var(--spacing-sm);
  }

  .playlist-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--glass-border);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .playlist-item:hover {
    background: rgba(110, 168, 254, 0.1);
    transform: translateX(5px);
  }

  .playlist-item:hover .playlist-item-delete {
    opacity: 1;
  }

  .playlist-item.active {
    background: linear-gradient(90deg, rgba(110, 168, 254, 0.2), rgba(34, 197, 94, 0.1));
    border-left: 3px solid var(--accent-color);
  }

  .playlist-item-icon {
    color: var(--accent-color);
    width: 20px;
    transition: color var(--transition-normal);
  }

  .playlist-item.active .playlist-item-icon {
    color: var(--base-green);
  }

  .playlist-item-name {
    flex: 1;
    font-size: 0.95rem;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .playlist-item-delete {
    opacity: 0;
    background: transparent;
    border: none;
    color: var(--danger-color);
    cursor: pointer;
    padding: 4px;
    transition: all var(--transition-normal);
  }

  .playlist-item-delete:hover {
    color: var(--base-red);
    transform: scale(1.2);
  }

  .playlist-empty {
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
  }
</style>
