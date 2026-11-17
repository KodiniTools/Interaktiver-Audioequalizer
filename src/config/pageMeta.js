// Titel und Beschreibung je Sprache, ohne Laufzeit-Abhängigkeiten (kein Pinia, kein DOM),
// damit auch der Build (vite.config.js) sie importieren kann.

/** Öffentliche URL der deutschen Hauptfassung (Englisch: `?lang=en`). */
export const SITE_URL = 'https://kodinitools.com/audioequalizer/'

/**
 * Deutsch steht zusätzlich statisch in index.html, Englisch schreibt der Build in
 * dist/index.en.html (siehe utils/localizeHtml.js).
 */
export const PAGE_META = {
  de: {
    title: 'Audio Equalizer online – 15-Band-EQ kostenlos | KodiniTools',
    description:
      'Kostenloser 15-Band-Equalizer im Browser: Frequenzen in Echtzeit anpassen, Presets, Visualisierung und Playlist. Ohne Installation und Registrierung.',
  },
  en: {
    title: 'Online Audio Equalizer – Free 15-Band EQ | KodiniTools',
    description:
      'Free 15-band equalizer in your browser: adjust frequencies in real time, with presets, visualization and playlist. No installation, no sign-up.',
  },
}
