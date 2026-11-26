/**
 * Texte der Landingpage (Etappe 1) in DE/EN.
 * Reine Daten ohne Vue-Abhängigkeit, damit sie per `node --test` prüfbar sind.
 */

/** id der Equalizer-Section in App.vue (Werkzeugseite, siehe utils/pageRoutes.js). */
export const EQUALIZER_ANCHOR_ID = 'equalizer'

export const LANDING_COPY = {
  de: {
    kicker: '15 Frequenzbänder für deinen Sound',
    description:
      'Stimme Bässe, Mitten und Höhen auf deine Musik ab. Mit Presets, Live-Spektrum und Playlist direkt im Browser.',
    cta: 'Equalizer ausprobieren',
    imageAlt: 'Blau-cyanfarbenes Frequenzspektrum über 15 goldenen Reglergriffen',
    featuresTitle: 'Funktionen',
    features: [
      {
        title: '15-Band-Equalizer',
        description:
          'Regle Frequenzen von 32 Hz bis 16 kHz. Wähle ein Preset oder speichere deine eigenen Einstellungen.',
      },
      {
        title: 'Live-Spektrum',
        description: 'Sieh die Frequenzverteilung deiner Musik und behalte den Pegel im Blick.',
      },
      {
        title: 'Player und Playlist',
        description:
          'Öffne lokale Audiodateien und wechsle zwischen deinen Titeln direkt im Browser.',
      },
    ],
  },
  en: {
    kicker: '15 frequency bands to shape your sound',
    description:
      'Fine-tune the bass, mids and treble in your music with presets, a live spectrum and a playlist right in your browser.',
    cta: 'Try the equalizer',
    imageAlt: 'Blue and cyan frequency spectrum above 15 gold slider handles',
    featuresTitle: 'Features',
    features: [
      {
        title: '15-band equalizer',
        description:
          'Adjust frequencies from 32 Hz to 16 kHz. Choose a preset or save your own settings.',
      },
      {
        title: 'Live spectrum',
        description: 'See the frequency distribution of your music and keep an eye on levels.',
      },
      {
        title: 'Player and playlist',
        description: 'Open local audio files and switch between tracks right in your browser.',
      },
    ],
  },
}

/**
 * Teilt den Seitentitel am ersten Leerzeichen: «Interaktiver» | «Audio-Equalizer».
 * Ohne Leerzeichen steht alles im ersten Teil.
 */
export function splitTitle(title) {
  const text = String(title ?? '').trim()
  const i = text.indexOf(' ')
  return i === -1
    ? { lead: text, accent: '' }
    : { lead: text.slice(0, i), accent: text.slice(i + 1) }
}
