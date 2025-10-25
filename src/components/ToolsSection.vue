<template>
  <section class="tools-section">
    <div class="tools-container">
      <div class="tools-header">
        <h2>{{ t('tools.title') }}</h2>
        <p class="tools-subtitle">{{ t('tools.subtitle') }}</p>
      </div>
      
      <div class="tools-grid">
        <a href="https://kodinitools.com/modernermusikplayer/" class="tool-card">
          <div class="tool-icon">
            <i class="fas fa-play-circle"></i>
          </div>
          <div class="tool-content">
            <h3>{{ t('tools.modernPlayer.title') }}</h3>
            <p>{{ t('tools.modernPlayer.desc') }}</p>
            <div class="tool-features">
              <span class="feature-tag">{{ t('tools.modernPlayer.feature1') }}</span>
              <span class="feature-tag">{{ t('tools.modernPlayer.feature2') }}</span>
            </div>
          </div>
          <div class="tool-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </a>

        <a href="https://kodinitools.com/playlist_generator/" class="tool-card">
          <div class="tool-icon">
            <i class="fas fa-list-ul"></i>
          </div>
          <div class="tool-content">
            <h3>{{ t('tools.playlistGen.title') }}</h3>
            <p>{{ t('tools.playlistGen.desc') }}</p>
            <div class="tool-features">
              <span class="feature-tag">{{ t('tools.playlistGen.feature1') }}</span>
              <span class="feature-tag">{{ t('tools.playlistGen.feature2') }}</span>
            </div>
          </div>
          <div class="tool-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </a>

        <a href="https://kodinitools.com/ultimativermusikplayer/" class="tool-card">
          <div class="tool-icon">
            <i class="fas fa-compact-disc"></i>
          </div>
          <div class="tool-content">
            <h3>{{ t('tools.ultimatePlayer.title') }}</h3>
            <p>{{ t('tools.ultimatePlayer.desc') }}</p>
            <div class="tool-features">
              <span class="feature-tag">{{ t('tools.ultimatePlayer.feature1') }}</span>
              <span class="feature-tag">{{ t('tools.ultimatePlayer.feature2') }}</span>
            </div>
          </div>
          <div class="tool-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </a>

        <a href="https://kodinitools.com/audiokonverter/" class="tool-card">
          <div class="tool-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="tool-content">
            <h3>{{ t('tools.converter.title') }}</h3>
            <p>{{ t('tools.converter.desc') }}</p>
            <div class="tool-features">
              <span class="feature-tag">{{ t('tools.converter.feature1') }}</span>
              <span class="feature-tag">{{ t('tools.converter.feature2') }}</span>
            </div>
          </div>
          <div class="tool-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </a>
      </div>
      
      <div class="tools-cta">
        <a href="https://kodinitools.com" class="cta-button">
          <i class="fas fa-tools"></i>
          <span>{{ t('tools.cta') }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18nStore } from '../stores/i18n'

const i18nStore = useI18nStore()
const t = i18nStore.t
</script>
