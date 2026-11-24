/**
 * Seiten-URLs der Anwendung: Landingpage (`<base>`) und Werkzeugseite (`<base>app`).
 * Kein Vue Router: Seitenwechsel sind echte Seitenaufrufe, dadurch endet beim Verlassen
 * des Werkzeugs die laufende Audiositzung. nginx muss `<base>app` auf dieselbe
 * index.html abbilden wie `<base>`.
 */

// Unter Vite der konfigurierte `base`; der Fallback gilt nur ausserhalb von Vite (node --test).
const base = import.meta.env?.BASE_URL ?? '/audioequalizer/'

export const landingPath = base
export const workspacePath = base + 'app'

/** true für `<base>app` und `<base>app/`. */
export function isWorkspacePath(pathname) {
  return pathname === workspacePath || pathname === workspacePath + '/'
}

/** Seitenlink in der gewählten Sprache: Deutsch ohne Parameter, Englisch mit `?lang=en`. */
export function pageHref(path, locale) {
  return locale === 'en' ? path + '?lang=en' : path
}
