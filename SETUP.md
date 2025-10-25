# Setup-Anleitung für Audio Equalizer Vue

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
cd /home/claude/audio-equalizer-vue
npm install
```

### 2. Development-Server starten

```bash
npm run dev
```

Die App läuft dann auf `http://localhost:3000`

### 3. Production-Build erstellen

```bash
npm run build
```

Die Build-Ausgabe wird in `dist/` gespeichert.

## 📋 Was wurde umgewandelt?

### Von Vanilla JS zu Vue 3

Die ursprüngliche JavaScript-Anwendung wurde vollständig in eine moderne Vue 3-Anwendung umgewandelt:

#### Vorher (Vanilla JS)
- Manuelle DOM-Manipulation
- Globale Variablen und Event-Listener
- Verstreute Business-Logik
- Schwer wartbar und testbar

#### Nachher (Vue 3)
- Reaktive Komponenten
- Zentrales State-Management (Pinia)
- Wiederverwendbare Composables
- Modulare Architektur
- TypeScript-ready
- Bessere Performance durch Virtual DOM

## 🏗️ Architektur-Übersicht

### Stores (Pinia)

**theme.js** - Theme-Verwaltung
- Dark/Light Mode Toggle
- Automatische System-Theme-Erkennung
- Persistierung in localStorage

**i18n.js** - Internationalisierung
- Deutsch/English Support
- Reaktive Übersetzungen
- Meta-Tag-Updates

**audio.js** - Audio-State
- Playlist-Verwaltung
- Playback-State
- Track-Navigation
- Shuffle/Loop-Modi

### Composables

**useAudioEqualizer.js** - Audio-Engine
- Web Audio API Integration
- 15-Band-Equalizer
- Dynamische Kompression
- Limiter und Normalisierung
- RMS/Peak-Analyse

**useVisualizer.js** - Visualisierung
- Canvas-basierte Rendering
- Mehrere Visualisierungs-Modi
- Performance-optimiert
- Farbschema-System

### Komponenten

**AppControls.vue** - Theme/Language Toggle
**AppHeader.vue** - Titel und Untertitel
**AudioPlayer.vue** - Player-Steuerung und File-Upload
**AudioVisualizer.vue** - Canvas-Visualisierung
**AudioEqualizer.vue** - 15-Band-EQ-Interface
**AudioPlaylist.vue** - Playlist-Verwaltung
**ToolsSection.vue** - Related Tools
**FAQSection.vue** - Häufige Fragen

## 🎯 Verbesserungen gegenüber Original

### Performance

1. **Virtual DOM**: Effizientere Updates durch Vue's Reactivity System
2. **Component Caching**: Komponenten werden nur bei Bedarf neu gerendert
3. **Lazy Loading**: Möglichkeit für Code-Splitting
4. **Optimized Bundles**: Vite erstellt optimierte Production-Builds

### Wartbarkeit

1. **Modulare Struktur**: Jede Funktion in eigener Datei
2. **Single Responsibility**: Komponenten mit klarer Aufgabe
3. **Wiederverwendbarkeit**: Composables können überall genutzt werden
4. **Testbarkeit**: Einfaches Unit-Testing durch isolierte Logik

### Developer Experience

1. **Hot Module Replacement**: Instant Feedback während Entwicklung
2. **Type Safety**: Bereit für TypeScript
3. **Vue DevTools**: Debugging und State-Inspection
4. **Better IDE Support**: Autocomplete und IntelliSense

### Code-Qualität

1. **Reactive Programming**: Automatische UI-Updates
2. **Computed Properties**: Effiziente abgeleitete Werte
3. **Watchers**: Saubere Side-Effect-Behandlung
4. **Lifecycle Hooks**: Klare Komponenten-Lifecycle-Verwaltung

## 🔧 Konfiguration

### Vite Config

Die `vite.config.js` enthält:
- Vue Plugin
- Path Aliases (`@` für `src/`)
- Build-Optimierungen
- Code-Splitting-Strategien

### Package.json

Scripts verfügbar:
- `dev`: Development-Server
- `build`: Production-Build
- `preview`: Preview des Builds

## 📦 Dependencies

### Production
- `vue@^3.4.21`: Core Framework
- `pinia@^2.1.7`: State Management

### Development
- `vite@^5.1.6`: Build Tool
- `@vitejs/plugin-vue@^5.0.4`: Vue-Support für Vite

## 🎨 Styling

Das CSS bleibt größtenteils identisch zum Original:
- CSS Custom Properties für Theming
- Glass-Morphism Design
- Responsive Layout
- Barrierefreiheit

## 🐛 Debugging

### Vue DevTools

Installieren Sie Vue DevTools für Chrome/Firefox:
- Inspect Components
- View Store State
- Time-Travel Debugging
- Performance Profiling

### Console Logging

Die App loggt wichtige Events:
- Audio Context Initialization
- Track Loading
- Equalizer Adjustments
- Visualizer State

### Common Issues

**Audio Context nicht initialisiert**
- Lösung: Erst nach User-Interaktion (Button-Click)

**Visualizer startet nicht**
- Lösung: Prüfen ob Analyser gesetzt ist
- Debug: `window.visualizer.getStatus()`

**Theme wechselt nicht**
- Lösung: CSS Custom Properties prüfen
- Debug: DevTools → Computed Styles

## 🚀 Deployment

### Build für Production

```bash
npm run build
```

### Deploy zu Netlify/Vercel

1. Repository verbinden
2. Build Command: `npm run build`
3. Publish Directory: `dist`

### Deploy zu GitHub Pages

```bash
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:username/repo.git master:gh-pages
```

## 📝 Nächste Schritte

### Mögliche Erweiterungen

1. **TypeScript Migration**
   - Type-Safety für alle Komponenten
   - Interface-Definitionen

2. **Testing Setup**
   - Vitest für Unit Tests
   - Cypress für E2E Tests

3. **PWA Features**
   - Service Worker Integration
   - Offline-Funktionalität
   - Install Prompt

4. **Advanced Features**
   - EQ-Presets speichern
   - Audio-Recording
   - Spectrum-Analyzer-Tools
   - Export-Funktionen

5. **Performance Optimizations**
   - Web Workers für Audio-Processing
   - Virtual Scrolling für große Playlists
   - Image Lazy Loading

## 💡 Best Practices

### Vue 3 Composition API

```javascript
// ✅ DO: Use Composition API
import { ref, computed, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    watch(count, (newVal) => {
      console.log('Count changed:', newVal)
    })
    
    return { count, doubled }
  }
}

// ❌ DON'T: Mix Options and Composition API
```

### State Management

```javascript
// ✅ DO: Use Pinia Stores for global state
import { useAudioStore } from '@/stores/audio'

const audioStore = useAudioStore()
audioStore.addFiles(files)

// ❌ DON'T: Use component state for shared data
```

### Composables

```javascript
// ✅ DO: Extract reusable logic to composables
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// ❌ DON'T: Duplicate logic across components
```

## 📚 Ressourcen

- [Vue 3 Dokumentation](https://vuejs.org/)
- [Pinia Dokumentation](https://pinia.vuejs.org/)
- [Vite Dokumentation](https://vitejs.dev/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)

---

Bei Fragen oder Problemen: Issue auf GitHub öffnen! 🚀
