import { defineStore } from 'pinia'
import { ref } from 'vue'

const translations = {
  de: {
    header: {
      title: 'Interaktiver Audio-Equalizer',
      subtitle: 'Professionelle Audioverarbeitung mit Echtzeit-Visualisierung'
    },
    controls: {
      chooseFiles: 'Audiodateien wählen',
      volume: 'Lautstärke',
      backward: 'Zurück',
      playPause: 'Play/Pause',
      stop: 'Stopp',
      forward: 'Weiter',
      shuffle: 'Zufallswiedergabe',
      loop: 'Wiederholen',
      deleteAll: 'Alle Dateien löschen'
    },
    visualizer: {
      title: 'Audio-Visualisierer'
    },
    equalizer: {
      title: '15-Band-Equalizer',
      reset: 'Zurücksetzen'
    },
    playlist: {
      title: 'Wiedergabeliste',
      tracks: 'Titel'
    },
    tools: {
      title: 'Weitere Audiotools entdecken',
      subtitle: 'Professionelle Audiowerkzeuge für alle Ihre Bedürfnisse',
      cta: 'Alle Tools entdecken',
      modernPlayer: {
        title: 'Moderner Musikplayer',
        desc: 'Eleganter Audioplayer mit erweiterten Funktionen und modernem Design',
        feature1: 'Playlist-Verwaltung',
        feature2: 'Visualisierer'
      },
      playlistGen: {
        title: 'Playlist-Generator',
        desc: 'Intelligenter Generator für personalisierte Musik-Playlists',
        feature1: 'Automatische Erstellung',
        feature2: 'Genre-Filter'
      },
      ultimatePlayer: {
        title: 'Ultimativer Musikplayer',
        desc: 'Professioneller Player mit erweiterten Audioverarbeitungs-Funktionen',
        feature1: 'Profi-Funktionen',
        feature2: 'Erweiterter Equalizer'
      },
      converter: {
        title: 'Audiokonverter',
        desc: 'Konvertieren Sie Audiodateien zwischen verschiedenen Formaten',
        feature1: 'Multi-Format',
        feature2: 'Stapelverarbeitung'
      }
    },
    faq: {
      title: 'Häufig gestellte Fragen (FAQ)',
      subtitle: 'Alles, was Sie über den Audio-Equalizer wissen müssen'
    }
  },
  en: {
    header: {
      title: 'Interactive Audio Equalizer',
      subtitle: 'Professional Audio Processing with Real-time Visualization'
    },
    controls: {
      chooseFiles: 'Choose Audio Files',
      volume: 'Volume',
      backward: 'Previous',
      playPause: 'Play/Pause',
      stop: 'Stop',
      forward: 'Next',
      shuffle: 'Shuffle',
      loop: 'Loop',
      deleteAll: 'Delete All Files'
    },
    visualizer: {
      title: 'Audio Visualizer'
    },
    equalizer: {
      title: '15-Band Equalizer',
      reset: 'Reset'
    },
    playlist: {
      title: 'Playlist',
      tracks: 'Tracks'
    },
    tools: {
      title: 'Discover More Audio Tools',
      subtitle: 'Professional audio tools for all your needs',
      cta: 'Discover All Tools',
      modernPlayer: {
        title: 'Modern Music Player',
        desc: 'Elegant audio player with advanced features and modern design',
        feature1: 'Playlist Management',
        feature2: 'Visualizer'
      },
      playlistGen: {
        title: 'Playlist Generator',
        desc: 'Intelligent generator for personalized music playlists',
        feature1: 'Auto-Creation',
        feature2: 'Genre Filter'
      },
      ultimatePlayer: {
        title: 'Ultimate Music Player',
        desc: 'Professional player with advanced audio processing features',
        feature1: 'Pro Features',
        feature2: 'Advanced EQ'
      },
      converter: {
        title: 'Audio Converter',
        desc: 'Convert audio files between different formats',
        feature1: 'Multi-Format',
        feature2: 'Batch Processing'
      }
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Everything you need to know about the Audio Equalizer'
    }
  }
}

export const useI18nStore = defineStore('i18n', () => {
  const currentLang = ref(localStorage.getItem('locale') || localStorage.getItem('language') || 'de')

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[currentLang.value]

    for (const k of keys) {
      value = value?.[k]
      if (!value) return key
    }

    return value
  }

  const setLanguage = (lang) => {
    if (translations[lang]) {
      currentLang.value = lang
      localStorage.setItem('locale', lang)
      document.documentElement.lang = lang
    }
  }

  // Initialize
  setLanguage(currentLang.value)

  return {
    currentLang,
    t,
    setLanguage
  }
})
