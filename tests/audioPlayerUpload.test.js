import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')
const player = read('src/components/AudioPlayer.vue')
const label = player.match(/<label for="audioFile"[^>]*>([\s\S]*?)<\/label>/)

test('Dateiauswahl zeigt nur das Ordnersymbol, ohne sichtbare Beschriftung', () => {
  assert.ok(label, 'Label der Dateiauswahl gefunden')
  assert.match(label[1], /^\s*<i class="fas fa-folder-open" aria-hidden="true"><\/i>\s*$/)
  // Kein Stylesheet blendet wieder einen Text im Knopf ein.
  for (const file of ['kodini-controls-stage3.css', 'kodini-workspace-stage4.css']) {
    assert.doesNotMatch(read(`src/assets/${file}`), /\.file-upload-label span/, file)
  }
})

test('Dateiauswahl bleibt für Screenreader und per Tooltip in DE/EN benannt', () => {
  assert.match(
    player,
    /<input\s+id="audioFile"[^>]*:aria-label="t\('controls\.chooseFiles'\)"[^>]*@change="handleFileUpload"/
  )
  assert.match(label[0], /class="file-upload-label" :title="t\('controls\.chooseFiles'\)"/)
  const i18n = read('src/stores/i18n.js')
  assert.match(i18n, /chooseFiles: 'Audiodateien wählen'/)
  assert.match(i18n, /chooseFiles: 'Choose Audio Files'/)
})
