<template>
  <section class="eq-landing" aria-labelledby="eq-landing-title">
    <div class="eq-landing-hero">
      <div class="eq-landing-wrap eq-landing-grid">
        <div>
          <h1 id="eq-landing-title">{{ t('header.title') }}</h1>
          <p class="eq-landing-kicker">{{ copy.kicker }}</p>
          <p class="eq-landing-description">{{ copy.description }}</p>
          <a class="eq-landing-cta" :href="ctaHref">{{ copy.cta }}</a>
        </div>
        <img
          class="eq-landing-image"
          :src="heroImage"
          :alt="copy.imageAlt"
          width="960"
          height="540"
          fetchpriority="high"
        />
      </div>
    </div>

    <div class="eq-landing-features" aria-labelledby="eq-features-title">
      <div class="eq-landing-wrap">
        <h2 id="eq-features-title">{{ copy.featuresTitle }}</h2>
        <div class="eq-landing-cards">
          <article v-for="feature in copy.features" :key="feature.title">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { computed } from 'vue'
  import heroImage from '../assets/equalizer-hero.webp'
  import { useI18nStore } from '../stores/i18n'
  import { LANDING_COPY, EQUALIZER_ANCHOR_ID } from '../config/landingCopy'

  const i18n = useI18nStore()
  const t = i18n.t
  const copy = computed(() => LANDING_COPY[i18n.currentLang] ?? LANDING_COPY.de)
  const ctaHref = `#${EQUALIZER_ANCHOR_ID}`
</script>
