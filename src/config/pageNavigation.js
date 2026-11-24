/**
 * Seitennavigation (Etappe 2): Anker und Beschriftungen in DE/EN.
 * Reine Daten ohne Vue-Abhängigkeit, damit sie per `node --test` prüfbar sind.
 */
import { EQUALIZER_ANCHOR_ID } from './landingCopy.js'

/** ids der Zielabschnitte: LandingPage.vue, Equalizer-Section und FAQSection in App.vue. */
export const OVERVIEW_ANCHOR_ID = 'uebersicht'
export const FAQ_ANCHOR_ID = 'faq'

/** Reihenfolge der Links; `label` ist der Schlüssel in PAGE_NAV_COPY. */
export const PAGE_NAV_LINKS = [
  { id: OVERVIEW_ANCHOR_ID, label: 'overview' },
  { id: EQUALIZER_ANCHOR_ID, label: 'equalizer' },
  { id: FAQ_ANCHOR_ID, label: 'faq' },
]

export const PAGE_NAV_COPY = {
  de: {
    navigation: 'Navigation im Audio Equalizer',
    overview: 'Übersicht',
    equalizer: 'Equalizer öffnen',
    faq: 'FAQ',
    darkMode: 'Dunkelmodus',
  },
  en: {
    navigation: 'Audio Equalizer navigation',
    overview: 'Overview',
    equalizer: 'Open equalizer',
    faq: 'FAQ',
    darkMode: 'Dark mode',
  },
}
