# CONTEXT.md - Projektdokumentation

> Automatisch generierte Dokumentation der Codebase für Entwickler und KI-Assistenten.

---

## Projektübersicht

**Interaktiver Audioequalizer** - Eine professionelle Web-Anwendung für Echtzeit-Audioverarbeitung mit 15-Band-Equalizer und visueller Darstellung. Die Anwendung läuft vollständig clientseitig im Browser ohne Backend oder Datenbank.

---

## Tech-Stack

### Frontend Framework & Build-Tools

| Technologie | Version | Zweck |
|------------|---------|-------|
| **Vue 3** | 3.4.21 | Progressive JavaScript Framework mit Composition API |
| **Vite** | 5.1.6 | Build-Tool mit Hot Module Replacement |
| **@vitejs/plugin-vue** | 5.0.4 | Vue 3 Integration für Vite |

### State Management

| Technologie | Version | Zweck |
|------------|---------|-------|
| **Pinia** | 2.1.7 | Offizielles State Management für Vue 3 |

### Kern-Technologien (Browser APIs)

| Technologie | Zweck |
|------------|-------|
| **Web Audio API** | Audioverarbeitung und Echtzeit-Frequenzanalyse |
| **Canvas API** | GPU-beschleunigte Audio-Visualisierungen |
| **HTML5 Audio Element** | Native Audio-Wiedergabe |
| **localStorage** | Client-seitige Persistenz für Einstellungen |

### Entwicklungs-Tools

| Technologie | Version | Zweck |
|------------|---------|-------|
| **ESLint** | - | Code-Linting mit Vue-Unterstützung |
| **Terser** | 5.44.0 | JavaScript-Minifizierung |

### UI/UX

| Technologie | Version | Zweck |
|------------|---------|-------|
| **Font Awesome** | 6.5.1 | Icon-Bibliothek |
| **CSS Grid & Flexbox** | - | Responsive Layouts |
| **CSS Variables** | - | Design-System & Theming |

### Browser-Unterstützung

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Ordnerstruktur

```
/Interaktiver-Audioequalizer/
│
├── src/                              # Quellcode
│   ├── assets/
│   │   └── main.css                  # Globale Styles (CSS-Variablen, Design-System)
│   │
│   ├── components/                   # Vue Single-File Components
│   │   ├── AppControls.vue           # Theme- & Sprach-Toggle
│   │   ├── AppHeader.vue             # Seiten-Header
│   │   ├── AudioPlayer.vue           # Audio-Player (Hauptkomponente)
│   │   ├── AudioVisualizer.vue       # Canvas-basierte Visualisierung
│   │   ├── AudioEqualizer.vue        # 15-Band EQ Slider-Interface
│   │   ├── AudioPlaylist.vue         # Playlist-Verwaltung
│   │   ├── ToolsSection.vue          # Weitere Tools Sektion
│   │   └── FAQSection.vue            # FAQ-Inhalt
│   │
│   ├── composables/                  # Wiederverwendbare Vue Composables
│   │   ├── useAudioEqualizer.js      # Web Audio API Engine (436 Zeilen)
│   │   └── useVisualizer.js          # Canvas Animation Engine (555 Zeilen)
│   │
│   ├── stores/                       # Pinia State Management
│   │   ├── audio.js                  # Playlist & Wiedergabe-State
│   │   ├── theme.js                  # Dark/Light Theme Verwaltung
│   │   └── i18n.js                   # Internationalisierung (DE/EN)
│   │
│   ├── App.vue                       # Root-Komponente
│   └── main.js                       # Anwendungs-Einstiegspunkt
│
├── index.html                        # HTML-Einstiegspunkt (SEO-optimiert)
├── vite.config.js                    # Vite Build-Konfiguration
├── package.json                      # Dependencies & Scripts
├── package-lock.json                 # Dependency Lock-Datei
├── README.md                         # Deutsche Dokumentation
├── SETUP.md                          # Setup-Anweisungen
├── CONTEXT.md                        # Diese Datei
├── LICENSE                           # MIT-Lizenz
├── deploy.ps1                        # PowerShell Deployment-Script
└── .gitignore                        # Git-Ausschlüsse
```

---

## Datenmodelle & State-Architektur

> **Hinweis:** Diese Anwendung hat keine Datenbank. Alle Daten werden clientseitig verarbeitet und bei Bedarf im localStorage persistiert.

### Pinia Stores

#### 1. Audio Store (`/src/stores/audio.js`)

Verwaltet Playlist und Wiedergabe-Status:

```javascript
{
  // State
  audioFiles: File[]              // Array der hochgeladenen Audio-Dateien
  currentIndex: number            // Aktueller Track-Index
  isPlaying: boolean              // Wiedergabe-Status
  isPaused: boolean               // Pause-Status
  isShuffle: boolean              // Zufallswiedergabe aktiv
  isLoop: boolean                 // Wiederholung aktiv
  volume: number                  // Master-Lautstärke (0-100)
  currentTime: number             // Aktuelle Wiedergabeposition (Sekunden)
  duration: number                // Gesamtdauer des Tracks (Sekunden)
  audioElement: HTMLAudioElement  // DOM Audio-Element Referenz

  // Computed Getters
  currentTrack: File | null       // Aktueller Track oder null
  hasFiles: boolean               // Ob Dateien vorhanden sind
  trackCount: number              // Anzahl der Tracks
}
```

#### 2. Theme Store (`/src/stores/theme.js`)

Verwaltet das visuelle Erscheinungsbild:

```javascript
{
  // State
  currentTheme: 'dark' | 'light'  // Persistiert im localStorage

  // CSS-Variablen die gesetzt werden:
  // --primary-bg, --card-bg, --text-primary, --text-secondary
  // --glass-bg, --glass-border, --panel-highlight
  // ... und 15+ weitere Theme-Farben
}
```

#### 3. i18n Store (`/src/stores/i18n.js`)

Verwaltet die Mehrsprachigkeit:

```javascript
{
  // State
  currentLang: 'de' | 'en'        // Persistiert im localStorage

  // Übersetzungs-Struktur
  translations: {
    header: { ... }
    controls: { ... }
    visualizer: { ... }
    equalizer: { ... }
    playlist: { ... }
    tools: { ... }
    faq: { ... }
  }
}
```

---

### Audio Processing State (Composable)

#### useAudioEqualizer (`/src/composables/useAudioEqualizer.js`)

Singleton-Composable für die Web Audio API:

```javascript
{
  // Web Audio API Nodes
  audioContext: AudioContext       // Globaler Audio-Kontext
  sourceNode: MediaElementSource   // Input vom <audio> Element
  analyser: AnalyserNode          // FFT-Analyse (4096 fftSize)
  gainNode: GainNode              // Master-Lautstärkeregelung
  filters: BiquadFilter[]          // 15-Band EQ Filter

  // Frequenzbänder (15 Bänder in Hz)
  bands: [32, 64, 125, 250, 500, 1000, 2000, 3000, 4000,
          6000, 8000, 10000, 12000, 14000, 16000]

  // Jeder Filter erlaubt: -40dB bis +40dB Gain-Anpassung

  isInitialized: boolean           // Initialisierungs-Flag
}
```

**Audio-Signalkette:**

```
Audio Element
    → [15 Biquad Filter (Low-shelf bis High-shelf)]
    → Analyser
    → Gain Node
    → Audio Output
```

#### useVisualizer (`/src/composables/useVisualizer.js`)

Composable für Canvas-Visualisierung:

```javascript
{
  // Canvas State
  canvas: HTMLCanvasElement
  canvasContext: CanvasRenderingContext2D
  analyserNode: AnalyserNode      // Referenz zum Analyser
  animationId: number             // RequestAnimationFrame ID
  isRunning: boolean              // Animations-Status

  // Konfiguration
  visualizationType: 'spectrum' | 'waveform' | 'circular' | 'bars3d'
  colorScheme: 'rainbow' | 'fire' | 'ocean' | 'neon' | 'monochrome' | 'vintage'

  config: {
    barWidth: 3,
    barGap: 1,
    minBarHeight: 2
  }
}
```

---

## Design-System (CSS-Variablen)

Definiert in `/src/assets/main.css`:

```css
/* Basis-Farbpalette */
--color-gold: #F2E28E
--color-mauve: #A28680
--color-slate: #5E5F69
--color-silver: #AEAFB7
--color-night: #0C0C10

/* Dark Theme (Standard) */
--dark-bg: #0C0C10
--dark-panel: #1a1a1f
--dark-text: #f0f0f0
--dark-accent: #F2E28E

/* Light Theme */
--light-bg: #f5f5f5
--light-panel: #ffffff
--light-text: #1a1a1f
--light-accent: #B8A842
```

---

## Architektur-Übersicht

### Komponenten-Hierarchie

```
App.vue (Root)
├── AppHeader.vue
├── AppControls.vue
├── AudioPlayer.vue (Hauptsteuerung)
│   └── verwendet useAudioEqualizer Composable
├── AudioVisualizer.vue
│   └── verwendet useVisualizer Composable
├── AudioEqualizer.vue (15-Band Slider)
├── AudioPlaylist.vue
├── ToolsSection.vue
└── FAQSection.vue
```

### Datenfluss

1. Benutzer lädt Audio-Dateien hoch → AudioPlayer
2. Audio Store wird aktualisiert
3. AudioPlayer initialisiert Web Audio API
4. Audio-Element verbindet sich mit Filter-Kette
5. AnalyserNode liest kontinuierlich Frequenzdaten
6. Canvas-Animation visualisiert die Daten
7. EQ-Slider passen BiquadFilter-Gains in Echtzeit an

---

## Build & Deployment

### NPM Scripts

```bash
npm run dev      # Entwicklungsserver (Port 3000)
npm run build    # Produktions-Build (Output: /dist)
npm run preview  # Produktions-Build lokal testen
npm run lint     # ESLint ausführen
```

### Vite-Konfiguration

- **Base Path:** `/audioequalizer/` (für Subdirectory-Deployment)
- **Terser:** Aktiviert für Minifizierung
- **Sourcemaps:** Deaktiviert in Produktion

---

## Wichtige Features

| Feature | Beschreibung |
|---------|--------------|
| **15-Band Equalizer** | Professioneller EQ mit ±40dB pro Band |
| **4 Visualisierungsmodi** | Spektrum, Wellenform, Kreisförmig, 3D-Balken |
| **6 Farbschemata** | Rainbow, Fire, Ocean, Neon, Monochrome, Vintage |
| **Playlist-Verwaltung** | 150+ gleichzeitige Dateien mit Shuffle/Loop |
| **Echtzeit-Analyse** | 4096-Punkt FFT mit 2048 Frequenz-Bins |
| **Responsive Design** | Desktop, Tablet, Mobile |
| **Mehrsprachig** | Deutsch & Englisch |
| **Theme-Support** | Dark/Light Mode mit localStorage-Persistenz |

---

*Letzte Aktualisierung: Januar 2026*
