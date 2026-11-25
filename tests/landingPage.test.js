import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LANDING_COPY, EQUALIZER_ANCHOR_ID } from '../src/config/landingCopy.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')

/** Liefert die Schlüsselstruktur (Arrays: Länge + Struktur des ersten Elements). */
function shape(value) {
  if (Array.isArray(value)) return [value.length, shape(value[0])]
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, shape(value[k])])
    )
  }
  return typeof value
}

function strings(value) {
  if (typeof value === 'string') return [value]
  return Object.values(value ?? {}).flatMap(strings)
}

test('Landingpage-Texte existieren auf Deutsch und Englisch mit gleicher Struktur', () => {
  assert.deepEqual(Object.keys(LANDING_COPY).sort(), ['de', 'en'])
  assert.deepEqual(shape(LANDING_COPY.en), shape(LANDING_COPY.de))
  for (const lang of ['de', 'en']) {
    for (const s of strings(LANDING_COPY[lang])) assert.ok(s.trim().length > 0, `${lang}: leer`)
  }
  assert.equal(LANDING_COPY.de.cta, 'Equalizer ausprobieren')
  assert.equal(LANDING_COPY.en.cta, 'Try the equalizer')
})

test('Startbutton führt zur Werkzeugseite, die die bestehenden Komponenten einbindet', () => {
  const app = read('src/App.vue')
  const landing = read('src/components/LandingPage.vue')
  assert.match(landing, /class="eq-landing-cta"\s+:href="ctaHref"/)
  assert.match(
    landing,
    /const ctaHref = computed\(\(\) => pageHref\(workspacePath, i18n\.currentLang\)\)/
  )
  // Die Equalizer-Section erscheint nur auf der Werkzeugseite (v-else zum Landing-Zweig).
  assert.match(app, new RegExp(`<section\\s+v-else\\s+id="${EQUALIZER_ANCHOR_ID}"`))
  for (const c of ['AppHeader', 'AudioVisualizer', 'AudioEqualizer', 'AudioPlaylist']) {
    assert.match(app, new RegExp(`<${c}\\b`), c)
  }
  // Der Player (und damit die Audiositzung) existiert nur auf der Werkzeugseite.
  assert.match(app, /<AudioPlayer v-if="workspace"\s*\/>/)
})

test('Illustration ist eine lokale WebP-Datei', () => {
  const landing = read('src/components/LandingPage.vue')
  assert.match(landing, /import heroImage from '\.\.\/assets\/equalizer-hero\.webp'/)
  const bytes = readFileSync(new URL('../src/assets/equalizer-hero.webp', import.meta.url))
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF')
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP')
})

/** WCAG-Kontrast zweier #rrggbb-Farben. */
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

test('Dunkelgoldener Startbutton mit weisser Schrift erfüllt WCAG AA', () => {
  const css = read('src/assets/kodini-layout-stage1.css')
  // Der Startbutton trägt den Button-Verlauf (wie Equalizer 19), Hover die Hover-Fassung.
  assert.match(css, /\.eq-landing-cta\s*\{[^}]*background:\s*var\(--button-grad\);/)
  assert.match(css, /\.eq-landing-cta:hover\s*\{[^}]*background:\s*var\(--button-grad-hover\);/)
  assert.match(css, /\.eq-landing-cta\s*\{[^}]*color:\s*#fff;/)
  // Jede Stufe beider Verläufe hält mit weisser Schrift 4,5:1.
  const main = read('src/assets/main.css')
  const grads = [...main.matchAll(/--button-grad(?:-hover)?:\s*(linear-gradient\([^;]+\));/g)]
  assert.equal(grads.length, 4, 'Verlauf und Hover in beiden Themes')
  for (const [, value] of grads) {
    const stops = value.match(/#[0-9a-f]{6}/gi)
    assert.equal(stops.length, 3, value)
    for (const stop of stops) {
      assert.ok(contrast(stop, '#ffffff') >= 4.5, `${stop} ${contrast(stop, '#ffffff')}`)
    }
  }
})

test('Typografie: ausschliesslich Supreme Regular', () => {
  const stage1 = read('src/assets/kodini-layout-stage1.css')
  assert.match(
    stage1,
    /\.kodini-equalizer,\s*\.kodini-equalizer :not\(i, \[class\*='fa-'\]\)\s*\{\s*font-family:\s*var\(--font-sans\) !important;\s*font-weight:\s*400 !important;\s*\}/
  )
  // Supreme steht im Schrift-Stack an erster Stelle und die Regular-Datei ist eingebunden.
  const main = read('src/assets/main.css')
  assert.match(main, /--font-sans:\s*'Supreme'/)
  assert.match(main, /url\('\.\/fonts\/Supreme-Regular\.woff2'\)[^}]*font-weight:\s*400;/)
  // Die Datei liegt im Projekt (wird von Vite gebündelt) und ist ein gültiges WOFF2.
  const font = readFileSync(new URL('../src/assets/fonts/Supreme-Regular.woff2', import.meta.url))
  assert.equal(font.subarray(0, 4).toString('ascii'), 'wOF2')
  assert.ok(font.length > 10_000, `Schriftdatei ${font.length} Bytes`)
  // Die Design-Stylesheets setzen selbst weder eine andere Schrift noch ein anderes Gewicht.
  for (const file of [
    'kodini-layout-stage1.css',
    'kodini-header-stage2.css',
    'kodini-controls-stage3.css',
    'kodini-workspace-stage4.css',
  ]) {
    const css = read(`src/assets/${file}`).replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, weight] of css.matchAll(/font-weight:\s*([^;]+);/g)) {
      assert.match(weight.trim(), /^(400|normal)( !important)?$/, `${file}: font-weight ${weight}`)
    }
    for (const [, family] of css.matchAll(/font-family:\s*([^;]+);/g)) {
      assert.match(
        family.trim(),
        /^(inherit|var\(--font-sans\)( !important)?)$/,
        `${file}: ${family}`
      )
    }
  }
  // Der Leertext im Visualizer-Canvas nutzt ebenfalls Supreme Regular.
  assert.match(
    read('src/composables/useVisualizer.js'),
    /ctx\.font = "400 14px 'Supreme', sans-serif"/
  )
})
