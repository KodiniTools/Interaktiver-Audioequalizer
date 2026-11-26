import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { splitTitle } from '../src/config/landingCopy.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')
const css = read('src/assets/kodini-layout-stage1.css')

test('splitTitle teilt am ersten Leerzeichen (DE/EN) und ist robust', () => {
  assert.deepEqual(splitTitle('Interaktiver Audio-Equalizer'), {
    lead: 'Interaktiver',
    accent: 'Audio-Equalizer',
  })
  assert.deepEqual(splitTitle('Interactive Audio Equalizer'), {
    lead: 'Interactive',
    accent: 'Audio Equalizer',
  })
  assert.deepEqual(splitTitle('  Equalizer  '), { lead: 'Equalizer', accent: '' })
  assert.deepEqual(splitTitle(undefined), { lead: '', accent: '' })
})

test('Titel zweifarbig: Gold und Logo-Blau, je Modus', () => {
  const landing = read('src/components/LandingPage.vue')
  assert.match(landing, /<span class="eq-title-lead">\{\{ titleParts\.lead \}\}<\/span>/)
  assert.match(landing, /<span class="eq-title-accent">\{\{ titleParts\.accent \}\}<\/span>/)
  const [dark, light] = css.split(".kodini-equalizer[data-theme='light'] {")
  assert.match(dark, /--landing-title-gold:\s*#e6bc76;/)
  assert.match(dark, /--landing-title-blue:\s*#48a0d8;/)
  assert.match(light, /--landing-title-gold:\s*#775115;/)
  assert.match(light, /--landing-title-blue:\s*#0058a0;/)
  assert.match(css, /\.eq-title-lead\s*\{[^}]*color:\s*var\(--landing-title-gold\);/)
  assert.match(css, /\.eq-title-accent\s*\{[^}]*color:\s*var\(--landing-title-blue\);/)
})

test('Typografie von Hauptüberschrift und Untertitel', () => {
  assert.match(
    css,
    /\.eq-landing h1\s*\{[^}]*font-size:\s*clamp\(2\.25rem, 5\.25vw, 4\.5rem\);[^}]*line-height:\s*1\.05;[^}]*letter-spacing:\s*-0\.045em;/
  )
  assert.match(
    css,
    /\.eq-landing-kicker\s*\{[^}]*color:\s*var\(--landing-kicker\);[^}]*font-size:\s*16px;/
  )
  const [dark, light] = css.split(".kodini-equalizer[data-theme='light'] {")
  assert.match(dark, /--landing-kicker:\s*#69d7e9;/)
  assert.match(light, /--landing-kicker:\s*#086a80;/)
})

test('Hintergrund der Landingpage: Grundfarbe und zwei Lichtverläufe über 42rem', () => {
  const [dark, light] = css.split(".kodini-equalizer[data-theme='light'] {")
  assert.match(dark, /--primary-bg:\s*#0a1324;/)
  assert.match(light, /--primary-bg:\s*#f6f5f1;/)
  const rule = css.match(/\.kodini-equalizer:not\(\.eq-workspace\)\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.match(rule, /radial-gradient\([^)]*42rem at 85% 0, var\(--landing-light-cyan\)/)
  assert.match(rule, /radial-gradient\([^)]*42rem at 15% 0, var\(--landing-light-blue\)/)
  assert.match(rule, /var\(--primary-bg\);/)
})
