<template>
  <div :data-theme="currentTheme" class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <div class="container">
      <div class="main-content">
        <!-- Player Controls -->
        <AudioPlayer />
        
        <!-- Visualizer -->
        <AudioVisualizer />
        
        <!-- Equalizer -->
        <AudioEqualizer />
      </div>
      
      <!-- Sidebar -->
      <div class="sidebar">
        <AudioPlaylist />
      </div>
    </div>
    
    <!-- Tools Section -->
    <ToolsSection />
    
    <!-- FAQ Section -->
    <FAQSection />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from './stores/theme'
import AppHeader from './components/AppHeader.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import AudioVisualizer from './components/AudioVisualizer.vue'
import AudioEqualizer from './components/AudioEqualizer.vue'
import AudioPlaylist from './components/AudioPlaylist.vue'
import ToolsSection from './components/ToolsSection.vue'
import FAQSection from './components/FAQSection.vue'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)
</script>

<style>
/* Global app styles will be in main.css */
.app-wrapper {
  min-height: 100vh;
}
</style>
