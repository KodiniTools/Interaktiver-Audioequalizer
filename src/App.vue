<template>
  <div :data-theme="currentTheme" class="app-wrapper kodini-equalizer">
    <PageNavigation :workspace="workspace" />
    <main>
      <template v-if="!workspace">
        <LandingPage />
        <ToolsSection />
        <FAQSection id="faq" />
      </template>

      <section
        v-else
        id="equalizer"
        class="container app-shell"
        tabindex="-1"
        aria-labelledby="equalizer-title"
      >
        <AppHeader />
        <AudioVisualizer class="visualizer-hero" />

        <div class="bento-grid">
          <AudioEqualizer class="bento-main" />
          <AudioPlaylist class="bento-side" />
        </div>
      </section>
    </main>

    <AudioPlayer v-if="workspace" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { isWorkspacePath } from './utils/pageRoutes'
  import { useThemeStore } from './stores/theme'
  import LandingPage from './components/LandingPage.vue'
  import PageNavigation from './components/PageNavigation.vue'
  import AppHeader from './components/AppHeader.vue'
  import AudioVisualizer from './components/AudioVisualizer.vue'
  import AudioEqualizer from './components/AudioEqualizer.vue'
  import AudioPlaylist from './components/AudioPlaylist.vue'
  import ToolsSection from './components/ToolsSection.vue'
  import FAQSection from './components/FAQSection.vue'
  import AudioPlayer from './components/AudioPlayer.vue'

  const workspace = isWorkspacePath(window.location.pathname)
  const themeStore = useThemeStore()
  const currentTheme = computed(() => themeStore.currentTheme)
</script>
