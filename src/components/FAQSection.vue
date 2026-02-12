<template>
  <section class="faq-section">
    <div class="faq-container">
      <div class="faq-header">
        <h2>{{ t('faq.title') }}</h2>
        <p class="faq-subtitle">{{ t('faq.subtitle') }}</p>
      </div>
      
      <div class="faq-grid">
        <div 
          v-for="(item, index) in faqItems" 
          :key="index"
          class="faq-item"
          :class="{ active: activeIndex === index }"
        >
          <div class="faq-question" @click="toggleFAQ(index)">
            <SvgIcon :name="item.icon" />
            <span>{{ item.question }}</span>
            <SvgIcon name="chevron-down" class="faq-arrow" />
          </div>
          <div class="faq-answer">
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18nStore } from '../stores/i18n'
import SvgIcon from './SvgIcon.vue'

const i18nStore = useI18nStore()
const t = i18nStore.t

const activeIndex = ref(null)

const faqItems = computed(() => {
  const lang = i18nStore.currentLang
  
  if (lang === 'de') {
    return [
      {
        icon: 'file-audio',
        question: 'Welche Audioformate werden unterstützt?',
        answer: 'Der Audio-Equalizer unterstützt alle gängigen Audioformate, die von modernen Webbrowsern unterstützt werden, einschließlich MP3, WAV, FLAC, OGG, M4A und AAC. Die Anwendung nutzt die HTML5-Audio-API für optimale Kompatibilität.'
      },
      {
        icon: 'sliders-h',
        question: 'Wie funktioniert der 15-Band-Equalizer?',
        answer: 'Der Equalizer arbeitet mit 15 präzisen Frequenzbändern von 25 Hz bis 16,7 kHz. Jeder Regler kann um ±40 dB angepasst werden. Die Einstellungen werden in Echtzeit auf das Audio angewendet, ohne Latenz oder Qualitätsverlust.'
      },
      {
        icon: 'chart-line',
        question: 'Was zeigt der Audio-Visualisierer an?',
        answer: 'Der Visualisierer zeigt Frequenzspektrum-Balken in Echtzeit an, gespiegelt für einen symmetrischen Effekt. Zusätzlich werden RMS-Pegel (grün-blauer Balken) und Peak-Werte (rote Linie) angezeigt, um die Audiodynamik zu visualisieren.'
      },
      {
        icon: 'list',
        question: 'Kann ich mehrere Dateien gleichzeitig laden?',
        answer: 'Ja, Sie können mehrere Audiodateien gleichzeitig auswählen. Diese werden automatisch zur Wiedergabeliste hinzugefügt und können in der Seitenleiste verwaltet werden. Die Wiedergabe erfolgt nacheinander oder im Zufallsmodus.'
      },
      {
        icon: 'mobile-alt',
        question: 'Funktioniert der Equalizer auf mobilen Geräten?',
        answer: 'Ja, die Anwendung ist vollständig responsive und funktioniert auf Smartphones und Tablets. Das Interface passt sich automatisch an kleinere Bildschirme an, wobei alle Funktionen erhalten bleiben.'
      },
      {
        icon: 'database',
        question: 'Werden meine Audiodateien gespeichert oder übertragen?',
        answer: 'Nein, alle Audiodateien bleiben vollständig auf Ihrem Gerät. Die Verarbeitung erfolgt lokal im Browser mit der Web-Audio-API. Es werden keine Daten übertragen oder auf Servern gespeichert – maximale Privatsphäre und Sicherheit.'
      }
    ]
  } else {
    return [
      {
        icon: 'file-audio',
        question: 'Which audio formats are supported?',
        answer: 'The Audio Equalizer supports all common audio formats supported by modern web browsers, including MP3, WAV, FLAC, OGG, M4A, and AAC. The application uses the HTML5 Audio API for optimal compatibility.'
      },
      {
        icon: 'sliders-h',
        question: 'How does the 15-band equalizer work?',
        answer: 'The equalizer works with 15 precise frequency bands from 25 Hz to 16.7 kHz. Each control can be adjusted by ±40 dB. Settings are applied to audio in real-time without latency or quality loss.'
      },
      {
        icon: 'chart-line',
        question: 'What does the Audio Visualizer display?',
        answer: 'The visualizer displays frequency spectrum bars in real-time, mirrored for a symmetrical effect. Additionally, RMS levels (green-blue bar) and peak values (red line) are shown to visualize audio dynamics.'
      },
      {
        icon: 'list',
        question: 'Can I load multiple files simultaneously?',
        answer: 'Yes, you can select multiple audio files at once. They are automatically added to the playlist and can be managed in the sidebar. Playback occurs sequentially or in shuffle mode.'
      },
      {
        icon: 'mobile-alt',
        question: 'Does the equalizer work on mobile devices?',
        answer: 'Yes, the application is fully responsive and works on smartphones and tablets. The interface automatically adapts to smaller screens while retaining all features.'
      },
      {
        icon: 'database',
        question: 'Are my audio files stored or transmitted?',
        answer: 'No, all audio files remain completely on your device. Processing occurs locally in the browser using the Web Audio API. No data is transmitted or stored on servers - maximum privacy and security.'
      }
    ]
  }
})

const toggleFAQ = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>
