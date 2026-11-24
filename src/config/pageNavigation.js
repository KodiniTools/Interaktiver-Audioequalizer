/**
 * Seitennavigation: Anker und Beschriftungen in DE/EN.
 * Reine Daten ohne Vue-Abhängigkeit, damit sie per `node --test` prüfbar sind.
 * Die Seiten-URLs selbst stehen in utils/pageRoutes.js.
 */

/** ids der Abschnitte auf der Landingpage: LandingPage.vue und FAQSection in App.vue. */
export const OVERVIEW_ANCHOR_ID = 'uebersicht'
export const FAQ_ANCHOR_ID = 'faq'

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
