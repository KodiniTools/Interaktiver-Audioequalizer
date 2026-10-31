import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf-8')
const PAGE_URL = 'https://kodinitools.com/audioequalizer/'

const match = (re) => html.match(re)?.[1]

test('Canonical und og:url zeigen auf die eigene Tool-URL', () => {
  assert.equal(html.match(/rel="canonical"/g)?.length, 1)
  assert.equal(match(/<link rel="canonical" href="([^"]+)"/), PAGE_URL)
  assert.equal(match(/<meta property="og:url" content="([^"]+)"/), PAGE_URL)
})

test('Titel und Beschreibung sind deutsch wie lang="de" und halten die Länge ein', () => {
  assert.match(html, /<html lang="de">/)
  const title = match(/<title>([^<]+)<\/title>/) ?? ''
  const description = match(/<meta name="description" content="([^"]+)"/) ?? ''
  assert.match(title, /^Audio Equalizer online/)
  assert.ok(title.length <= 70, `title ${title.length}`)
  assert.ok(
    description.length >= 120 && description.length <= 160,
    `description ${description.length}`
  )
  assert.match(description, /Kostenloser/)
})
