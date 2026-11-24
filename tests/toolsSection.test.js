import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')
const component = read('src/components/ToolsSection.vue')
const i18n = read('src/stores/i18n.js')

const cards = [...component.matchAll(/<a href="([^"]+)" class="tool-card">([\s\S]*?)<\/a>/g)].map(
  ([, href, body]) => ({ href, key: body.match(/t\('tools\.(\w+)\.title'\)/)?.[1], body })
)

test('Abschnitt «Weitere Audiotools» verlinkt sechs Werkzeuge inkl. Visualizer und Audio-Cutter', () => {
  assert.deepEqual(
    cards.map((c) => [c.key, c.href]),
    [
      ['modernPlayer', 'https://kodinitools.com/modernermusikplayer/'],
      ['playlistGen', 'https://kodinitools.com/playlist_generator/'],
      ['ultimatePlayer', 'https://kodinitools.com/ultimativermusikplayer/'],
      ['converter', 'https://kodinitools.com/audiokonverter/'],
      ['audioVisualizer', 'https://kodinitools.com/visualizer/'],
      ['audioCutter', 'https://kodinitools.com/audio-cutter/'],
    ]
  )
})

test('Jede Karte nutzt nur Texte, die es auf Deutsch und Englisch gibt', () => {
  for (const { key, body } of cards) {
    for (const field of ['title', 'desc', 'feature1', 'feature2']) {
      assert.ok(body.includes(`t('tools.${key}.${field}')`), `${key}.${field} im Template`)
    }
    // Der Block steht je einmal in den deutschen und den englischen Übersetzungen.
    const blocks = [...i18n.matchAll(new RegExp(`\\n {6}${key}: \\{([^}]*)\\}`, 'g'))]
    assert.equal(blocks.length, 2, `${key}: de + en`)
    for (const [, block] of blocks) {
      for (const field of ['title', 'desc', 'feature1', 'feature2']) {
        assert.match(block, new RegExp(`${field}:\\s*'[^']+'`), `${key}.${field}`)
      }
    }
  }
})
