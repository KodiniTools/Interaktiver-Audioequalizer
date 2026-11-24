<template>
  <div class="header">
    <h2 id="equalizer-title">{{ t('header.title') }}</h2>
    <p class="subtitle">{{ t('header.subtitle') }}</p>
  </div>
</template>

<script setup>
  import { useI18nStore } from '../stores/i18n'

  const i18nStore = useI18nStore()
  const t = i18nStore.t
</script>
