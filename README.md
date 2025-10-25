# Audio Equalizer Vue 3 🎵

Eine moderne, professionelle Audio-Equalizer-Anwendung gebaut mit Vue 3, Vite und der Web Audio API.

## ✨ Features

- **15-Band Equalizer** mit präziser Frequenzkontrolle (25 Hz - 16.7 kHz)
- **Audio-Visualisierung** mit mehreren Modi (Spectrum, Waveform, Circular, 3D Bars)
- **Playlist-Management** mit Shuffle und Loop
- **Dynamische Pegelanpassung** für konsistente Lautstärke
- **Dark/Light Theme** Support
- **Mehrsprachigkeit** (Deutsch/English)
- **Vollständig Responsive** Design
- **Lokale Verarbeitung** - Alle Daten bleiben auf Ihrem Gerät

## 🚀 Installation

```bash
# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Production-Build erstellen
npm run build

# Production-Preview
npm run preview
```

## 📁 Projektstruktur

```
audio-equalizer-vue/
├── src/
│   ├── assets/          # CSS und statische Assets
│   ├── components/      # Vue-Komponenten
│   │   ├── AppControls.vue
│   │   ├── AppHeader.vue
│   │   ├── AudioPlayer.vue
│   │   ├── AudioVisualizer.vue
│   │   ├── AudioEqualizer.vue
│   │   ├── AudioPlaylist.vue
│   │   ├── ToolsSection.vue
│   │   └── FAQSection.vue
│   ├── composables/     # Vue Composables
│   │   ├── useAudioEqualizer.js
│   │   └── useVisualizer.js
│   ├── stores/          # Pinia Stores
│   │   ├── theme.js
│   │   ├── i18n.js
│   │   └── audio.js
│   ├── App.vue          # Haupt-App-Komponente
│   └── main.js          # App-Einstiegspunkt
├── index.html
├── vite.config.js
└── package.json
```

## 🛠️ Technologien

- **Vue 3** - Progressive JavaScript Framework
- **Vite** - Next Generation Frontend Tooling
- **Pinia** - State Management
- **Web Audio API** - Audio-Verarbeitung
- **Canvas API** - Visualisierung
- **Composition API** - Moderne Vue-Syntax

## 🎨 Architektur

### Composables

Die Business-Logik ist in wiederverwendbare Composables ausgelagert:

- `useAudioEqualizer`: Audio-Verarbeitung, EQ-Kontrolle, Dynamikkompression
- `useVisualizer`: Canvas-basierte Audio-Visualisierung

### Stores (Pinia)

Globaler State-Management:

- `theme`: Dark/Light Theme-Verwaltung
- `i18n`: Internationalisierung und Übersetzungen
- `audio`: Audio-Dateien, Playlist, Playback-State

### Komponenten

Modulare, wiederverwendbare Vue-Komponenten für jeden UI-Bereich.

## 🎵 Audio-Features

### 15-Band Equalizer

Frequenzbänder:
- 25 Hz, 41 Hz, 65 Hz, 103 Hz, 164 Hz
- 230 Hz, 413 Hz, 657 Hz
- 1.0 kHz, 1.6 kHz, 2.7 kHz, 4.2 kHz
- 6.6 kHz, 10.5 kHz, 16.7 kHz

Jedes Band: ±40 dB Anpassung

### Dynamische Verarbeitung

- Automatische Pegelanpassung (Dynamic Level Controller)
- Kompressor für konsistente Lautstärke
- Limiter für Übersteuerungsschutz
- RMS-basierte Normalisierung

### Visualisierung

Modi:
- **Spectrum**: Frequenzspektrum mit Mirror-Mode
- **Waveform**: Zeitbasierte Wellenform
- **Circular**: Kreisförmige Visualisierung
- **3D Bars**: 3D-Balken-Effekt

Farbschemata:
- Rainbow, Fire, Ocean, Neon, Monochrome, Vintage

## 🌐 Browser-Unterstützung

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Lizenz

MIT License - Siehe LICENSE-Datei für Details

## 🤝 Contributing

Contributions sind willkommen! Bitte öffnen Sie ein Issue oder Pull Request.

## 👨‍💻 Entwicklung

### Development-Tipps

1. **Hot Module Replacement**: Vite bietet instant HMR
2. **Vue DevTools**: Installieren für besseres Debugging
3. **Console Logging**: Audio-System loggt wichtige Events

### Performance

- Canvas nutzt `requestAnimationFrame` für optimale FPS
- Audio-Verarbeitung läuft in separaten Audio-Threads
- Lazy Loading für nicht-kritische Komponenten möglich

## 🐛 Bekannte Probleme

- Safari benötigt User-Interaktion vor AudioContext-Start
- iOS limitiert gleichzeitige Audio-Kontexte
- Einige Browser limitieren FFT-Größe

## 📧 Kontakt

Bei Fragen oder Problemen öffnen Sie bitte ein Issue auf GitHub.

---

Made with ❤️ using Vue 3 and Web Audio API
