import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FAQ_ANCHOR_ID, OVERVIEW_ANCHOR_ID, PAGE_NAV_COPY } from '../src/config/pageNavigation.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8')

test('Jeder Link hat eine deutsche und eine englische Beschriftung', () => {
  assert.deepEqual(Object.keys(PAGE_NAV_COPY).sort(), ['de', 'en'])
  assert.deepEqual(Object.keys(PAGE_NAV_COPY.en).sort(), Object.keys(PAGE_NAV_COPY.de).sort())
  for (const lang of ['de', 'en']) {
    for (const key of ['overview', 'equalizer', 'faq', 'navigation', 'darkMode']) {
      const value = PAGE_NAV_COPY[lang][key]
      assert.ok(typeof value === 'string' && value.trim().length > 0, `${lang}.${key}`)
    }
  }
  assert.equal(PAGE_NAV_COPY.de.overview, 'Übersicht')
  assert.equal(PAGE_NAV_COPY.en.overview, 'Overview')
})

test('Navigation verlinkt Landingpage, Werkzeugseite und FAQ in der gewählten Sprache', () => {
  const nav = read('src/components/PageNavigation.vue')
  assert.match(
    nav,
    /const homeHref = computed\(\(\) => pageHref\(landingPath, i18n\.currentLang\)\)/
  )
  assert.match(nav, /:href="homeHref"\s+:aria-current="workspace \? undefined : 'page'"/)
  assert.match(nav, /:href="pageHref\(workspacePath, i18n\.currentLang\)"/)
  assert.match(nav, /:aria-current="workspace \? 'page' : undefined"/)
  assert.match(nav, /:href="`\$\{homeHref\}#\$\{FAQ_ANCHOR_ID\}`"/)
})

test('Anker-Ziele der Landingpage existieren im Markup', () => {
  const app = read('src/App.vue')
  const landing = read('src/components/LandingPage.vue')
  assert.match(landing, /<section\s+:id="OVERVIEW_ANCHOR_ID"/)
  assert.equal(OVERVIEW_ANCHOR_ID, 'uebersicht')
  assert.match(app, new RegExp(`<FAQSection id="${FAQ_ANCHOR_ID}"`))
  // FAQSection braucht genau ein Root-Element, damit die id per Fallthrough ankommt.
  const faqTemplate = read('src/components/FAQSection.vue').match(
    /<template>([\s\S]*)<\/template>\s*<script/
  )?.[1]
  assert.match(faqTemplate ?? '', /^\s*<section class="faq-section">[\s\S]*<\/section>\s*$/)
  assert.match(app, /<PageNavigation :workspace="workspace"\s*\/>\s*<main>/)
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
