import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isWorkspacePath, landingPath, pageHref, workspacePath } from '../src/utils/pageRoutes.js'

test('Pfade passen zum Vite-base /audioequalizer/', () => {
  const viteConfig = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf-8')
  assert.match(viteConfig, /base:\s*'\/audioequalizer\/'/)
  assert.equal(landingPath, '/audioequalizer/')
  assert.equal(workspacePath, '/audioequalizer/app')
})

test('isWorkspacePath erkennt nur die Werkzeugseite', () => {
  assert.equal(isWorkspacePath('/audioequalizer/app'), true)
  assert.equal(isWorkspacePath('/audioequalizer/app/'), true)
  for (const path of [
    '/audioequalizer/',
    '/audioequalizer',
    '/audioequalizer/app/x',
    '/audioequalizer/apps',
    '/app',
    '',
  ]) {
    assert.equal(isWorkspacePath(path), false, path)
  }
})

test('pageHref übernimmt die gewählte Sprache', () => {
  assert.equal(pageHref(workspacePath, 'de'), '/audioequalizer/app')
  assert.equal(pageHref(workspacePath, 'en'), '/audioequalizer/app?lang=en')
  assert.equal(pageHref(landingPath, 'de'), '/audioequalizer/')
  assert.equal(pageHref(landingPath, 'en'), '/audioequalizer/?lang=en')
  // Unbekannte Sprache fällt auf die deutsche URL ohne Parameter zurück.
  assert.equal(pageHref(landingPath, undefined), '/audioequalizer/')
})
