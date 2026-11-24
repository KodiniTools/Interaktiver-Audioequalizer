<template>
  <header class="header eq-workspace-header">
    <h2 id="equalizer-title">{{ t('header.title') }}</h2>
    <p class="subtitle">{{ t('header.subtitle') }}</p>
  </header>
</template>

<script setup>
  import { useI18nStore } from '../stores/i18n'

  const i18nStore = useI18nStore()
  const t = i18nStore.t
</script>
