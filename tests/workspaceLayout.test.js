import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')
const app = read('src/App.vue')
const css = read('src/assets/kodini-workspace-stage4.css')

test('Werkzeugseite: Spektrum steht mit eigener Überschrift über EQ und Wiedergabeliste', () => {
  assert.match(app, /:class="\{ 'eq-workspace': workspace \}"/)
  const spectrum = app.indexOf('<section class="eq-spectrum"')
  const grid = app.indexOf('<div class="bento-grid">')
  assert.ok(spectrum > -1 && grid > spectrum, 'Reihenfolge Spektrum vor Bento-Grid')
  assert.match(
    app,
    /<section class="eq-spectrum" aria-labelledby="eq-spectrum-title">\s*<h2 id="eq-spectrum-title">\{\{ i18n\.t\('visualizer\.title'\) \}\}<\/h2>\s*<AudioVisualizer class="visualizer-hero" \/>/
  )
  assert.match(
    app,
    /<div class="bento-grid">\s*<AudioEqualizer class="bento-main" \/>\s*<AudioPlaylist class="bento-side" \/>/
  )
})

test('Stylesheet ist eingebunden und auf die Werkzeugseite begrenzt', () => {
  assert.match(read('src/main.js'), /import '\.\/assets\/kodini-workspace-stage4\.css'/)
  const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(^|\})\s*([^{}@]+)\{/g)]
    .map((m) => m[2].trim())
    .filter(Boolean)
  assert.ok(selectors.length > 10)
  for (const selector of selectors) {
    for (const part of selector.split(/,\s*(?![^()]*\))/)) {
      assert.match(part.trim(), /^\.eq-workspace\b/, part)
    }
  }
})

test('Aktueller Titel ist goldfarben markiert', () => {
  assert.match(
    css,
    /\.eq-workspace \.playlist-item\.active\s*\{[^}]*box-shadow:\s*inset 3px 0 var\(--landing-gold\);/
  )
  assert.match(
    css,
    /\.playlist-item\.active :is\(\.playlist-item-icon, \.playlist-item-name\)\s*\{\s*color:\s*var\(--landing-gold\);/
  )
  // Die Klassen existieren in der bestehenden Playlist-Komponente.
  const playlist = read('src/components/AudioPlaylist.vue')
  for (const cls of ['playlist-item', 'playlist-item-icon', 'playlist-item-name', 'active']) {
    assert.match(playlist, new RegExp(`\\b${cls}\\b`), cls)
  }
})

test('Schmale Bildschirme: Panels untereinander, EQ-Bänder horizontal scrollbar', () => {
  assert.match(
    css,
    /@media \(max-width: 1024px\)\s*\{\s*\.eq-workspace \.bento-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);/
  )
  assert.match(css, /\.eq-workspace \.eq-slider\s*\{[^}]*min-width:\s*40px;/)
})
