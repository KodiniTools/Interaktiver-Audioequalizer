<template>
  <div :data-theme="currentTheme" class="app-wrapper">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content: App-Shell layout -->
    <main class="container app-shell">
      <!-- Visualizer as hero element -->
      <AudioVisualizer class="visualizer-hero" />

      <!-- Bento grid: Equalizer + collapsible Playlist -->
      <div class="bento-grid">
        <AudioEqualizer class="bento-main" />
        <AudioPlaylist class="bento-side" />
      </div>
    </main>

    <!-- Tools Section -->
    <ToolsSection />

    <!-- FAQ Section -->
    <FAQSection />

    <!-- Persistent player bar (sticky bottom) -->
    <AudioPlayer />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useThemeStore } from './stores/theme'
  import AppHeader from './components/AppHeader.vue'
  import AudioVisualizer from './components/AudioVisualizer.vue'
  import AudioEqualizer from './components/AudioEqualizer.vue'
  import AudioPlaylist from './components/AudioPlaylist.vue'
  import ToolsSection from './components/ToolsSection.vue'
  import FAQSection from './components/FAQSection.vue'
  import AudioPlayer from './components/AudioPlayer.vue'

  const themeStore = useThemeStore()
  const currentTheme = computed(() => themeStore.currentTheme)
</script>

<style>
  /* Global app styles will be in main.css */
  .app-wrapper {
    min-height: 100vh;
    /* Breathing room so content is never hidden behind the sticky player bar */
    padding-bottom: 2rem;
  }
</style>
