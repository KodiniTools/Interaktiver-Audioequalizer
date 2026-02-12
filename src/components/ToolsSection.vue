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
            <SvgIcon name="play-circle" />
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
            <SvgIcon name="arrow-right" />
          </div>
        </a>

        <a href="https://kodinitools.com/playlist_generator/" class="tool-card">
          <div class="tool-icon">
            <SvgIcon name="list-ul" />
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
            <SvgIcon name="arrow-right" />
          </div>
        </a>

        <a href="https://kodinitools.com/ultimativermusikplayer/" class="tool-card">
          <div class="tool-icon">
            <SvgIcon name="compact-disc" />
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
            <SvgIcon name="arrow-right" />
          </div>
        </a>

        <a href="https://kodinitools.com/audiokonverter/" class="tool-card">
          <div class="tool-icon">
            <SvgIcon name="exchange-alt" />
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
            <SvgIcon name="arrow-right" />
          </div>
        </a>
      </div>
      
      <div class="tools-cta">
        <a href="https://kodinitools.com" class="cta-button">
          <SvgIcon name="tools" />
          <span>{{ t('tools.cta') }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18nStore } from '../stores/i18n'
import SvgIcon from './SvgIcon.vue'

const i18nStore = useI18nStore()
const t = i18nStore.t
</script>
