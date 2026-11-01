import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyLocaleHead, localeUrls, resolveInitialLocale } from '../src/utils/localeSeo.js'

const BASE = 'https://kodinitools.com/audioequalizer/'

test('resolveInitialLocale: ?lang vor Speicher, sonst Deutsch', () => {
  assert.equal(resolveInitialLocale('?lang=en', 'de'), 'en')
  assert.equal(resolveInitialLocale('?x=1&lang=de', 'en'), 'de')
  assert.equal(resolveInitialLocale('?lang=en', null), 'en')
  assert.equal(resolveInitialLocale('?lang=fr', 'en'), 'en')
  assert.equal(resolveInitialLocale('', null), 'de')
  assert.equal(resolveInitialLocale('', 'xx'), 'de')
})

test('localeUrls: Canonical je Sprache, hreflang de/en/x-default', () => {
  assert.equal(localeUrls(BASE, 'de').canonical, BASE)
  assert.equal(localeUrls(BASE, 'en').canonical, `${BASE}?lang=en`)
  assert.deepEqual(localeUrls(BASE, 'en').alternates, [
    { hreflang: 'de', href: BASE },
    { hreflang: 'en', href: `${BASE}?lang=en` },
    { hreflang: 'x-default', href: BASE },
  ])
})

// Minimaler Head: Elemente werden über ihren Selektor gefunden.
function fakeDocument() {
  const el = () => {
    const attrs = {}
    return { setAttribute: (k, v) => (attrs[k] = v), getAttribute: (k) => attrs[k] }
  }
  const nodes = {}
  const selectorOf = (node) =>
    node.getAttribute('hreflang')
      ? `link[rel="alternate"][hreflang="${node.getAttribute('hreflang')}"]`
      : node.getAttribute('rel')
        ? `link[rel="${node.getAttribute('rel')}"]`
        : `meta[name="${node.getAttribute('name')}"]`
  const pending = []
  const sync = () => pending.splice(0).forEach((n) => (nodes[selectorOf(n)] = n))
  return {
    title: '',
    nodes,
    documentElement: el(),
    createElement: () => el(),
    head: {
      querySelector: (sel) => (sync(), nodes[sel] ?? null),
      appendChild: (n) => pending.push(n),
    },
    sync,
  }
}

test('applyLocaleHead setzt lang, Titel, Canonical und hreflang ohne Dubletten', () => {
  const doc = fakeDocument()
  applyLocaleHead(BASE, 'en', { title: 'EN', description: 'EN desc' }, doc)
  applyLocaleHead(BASE, 'en', { title: 'EN', description: 'EN desc' }, doc)
  doc.sync()
  assert.equal(doc.documentElement.getAttribute('lang'), 'en')
  assert.equal(doc.title, 'EN')
  assert.equal(doc.nodes['link[rel="canonical"]'].getAttribute('href'), `${BASE}?lang=en`)
  assert.equal(Object.keys(doc.nodes).filter((k) => k.includes('hreflang')).length, 3)
})
