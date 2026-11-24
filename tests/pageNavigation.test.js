import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EQUALIZER_ANCHOR_ID } from '../src/config/landingCopy.js'
import {
  FAQ_ANCHOR_ID,
  OVERVIEW_ANCHOR_ID,
  PAGE_NAV_COPY,
  PAGE_NAV_LINKS,
} from '../src/config/pageNavigation.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')

test('Seitennavigation führt zu Übersicht, Equalizer und FAQ', () => {
  assert.deepEqual(
    PAGE_NAV_LINKS.map((l) => l.id),
    [OVERVIEW_ANCHOR_ID, EQUALIZER_ANCHOR_ID, FAQ_ANCHOR_ID]
  )
  assert.equal(new Set(PAGE_NAV_LINKS.map((l) => l.id)).size, PAGE_NAV_LINKS.length)
})

test('Jeder Link hat eine deutsche und eine englische Beschriftung', () => {
  assert.deepEqual(Object.keys(PAGE_NAV_COPY).sort(), ['de', 'en'])
  assert.deepEqual(Object.keys(PAGE_NAV_COPY.en).sort(), Object.keys(PAGE_NAV_COPY.de).sort())
  for (const lang of ['de', 'en']) {
    for (const key of [...PAGE_NAV_LINKS.map((l) => l.label), 'navigation', 'darkMode']) {
      const value = PAGE_NAV_COPY[lang][key]
      assert.ok(typeof value === 'string' && value.trim().length > 0, `${lang}.${key}`)
    }
  }
  assert.equal(PAGE_NAV_COPY.de.overview, 'Übersicht')
  assert.equal(PAGE_NAV_COPY.en.overview, 'Overview')
})

test('Alle Anker-Ziele existieren im Markup', () => {
  const app = read('src/App.vue')
  const landing = read('src/components/LandingPage.vue')
  assert.match(landing, /<section\s+:id="OVERVIEW_ANCHOR_ID"/)
  assert.match(app, new RegExp(`<section[^>]*\\bid="${EQUALIZER_ANCHOR_ID}"`))
  assert.match(app, new RegExp(`<FAQSection id="${FAQ_ANCHOR_ID}"`))
  // FAQSection braucht genau ein Root-Element, damit die id per Fallthrough ankommt.
  const faqTemplate = read('src/components/FAQSection.vue').match(
    /<template>([\s\S]*)<\/template>\s*<script/
  )?.[1]
  assert.match(faqTemplate ?? '', /^\s*<section class="faq-section">[\s\S]*<\/section>\s*$/)
  assert.match(app, /<PageNavigation\s*\/>\s*<main>/)
})

test('Nav-Farben für die SSI-Navigation hängen an body.audio-equalizer-page', () => {
  assert.match(read('index.html'), /<body class="audio-equalizer-page">/)
  const css = read('src/assets/kodini-header-stage2.css')
  assert.match(css, /body\.audio-equalizer-page\s*\{[^}]*--eq-nav-surface:/)
  assert.match(
    css,
    /html\[data-theme='light'\] body\.audio-equalizer-page\s*\{[^}]*--eq-nav-surface:/
  )
  // Lokaler Ersatzschalter verschwindet, sobald die SSI-Navigation ihren eigenen mitbringt.
  assert.match(
    css,
    /body\.audio-equalizer-page:has\(\.global-nav \.global-nav-theme-toggle\) \.eq-local-theme\s*\{\s*display:\s*none;/
  )
})
