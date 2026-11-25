import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/assets/main.css', import.meta.url), 'utf8')

const block = (start) => {
  const i = css.indexOf(start)
  return css.slice(i, css.indexOf('\n}\n', i))
}

for (const [name, start] of [
  ['dark', '/* ===== TOKENS: DARK'],
  ['light', '/* ===== TOKENS: LIGHT'],
]) {
  test(`Design-System v2 (${name}): dunkelgoldene Button-Tokens mit weißer Schrift`, () => {
    const b = block(start)
    assert.match(b, /--button-bg: #8f6320;/)
    assert.match(b, /--on-button: #ffffff;/)
    assert.match(b, /--button-bg-hover: #/)
  })
}

test('Design-System v2: Primärbuttons nutzen die Button-Tokens', () => {
  for (const sel of ['.btn-primary', '.control-btn.primary', '.cta-button', '.file-upload-label']) {
    const i = css.indexOf(`${sel} {`)
    assert.ok(i >= 0, sel)
    const rule = css.slice(i, css.indexOf('}', i))
    assert.match(rule, /var\(--button-(bg|grad)\)/, sel)
    assert.match(rule, /var\(--on-button\)/, sel)
  }
})

test('Design-System v2: kein blauer Akzent mehr im Hell-Theme', () => {
  assert.match(block('/* ===== TOKENS: LIGHT'), /--accent-primary: #8f6320;/)
})

for (const [name, start] of [
  ['dark', '/* ===== TOKENS: DARK'],
  ['light', '/* ===== TOKENS: LIGHT'],
]) {
  test(`Button-Verlauf (${name}): dreistufig dunkelgold wie Equalizer 19`, () => {
    const b = block(start)
    assert.match(
      b,
      /--button-grad: linear-gradient\(180deg, #9c6c26 0%, #7a5218 45%, #4a2f0a 100%\);/
    )
    assert.match(
      b,
      /--button-grad-hover: linear-gradient\(180deg, #8c5f1f 0%, #6a4614 45%, #402908 100%\);/
    )
  })
}

test('Button-Verlauf: Primärbuttons nutzen --button-grad', () => {
  for (const sel of ['.btn-primary', '.control-btn.primary', '.cta-button', '.file-upload-label']) {
    const i = css.indexOf(`${sel} {`)
    const rule = css.slice(i, css.indexOf('}', i))
    assert.match(rule, /background: var\(--button-grad\)/, sel)
  }
})

test('Button-Verlauf: auch die Stage-Styles füllen Buttons mit --button-grad', () => {
  const read = (name) => readFileSync(new URL(`../src/assets/${name}`, import.meta.url), 'utf8')
  const ruleOf = (source, selector) => {
    const i = source.indexOf(`${selector} {`)
    assert.ok(i >= 0, selector)
    return source.slice(i, source.indexOf('}', i))
  }
  const layout = read('kodini-layout-stage1.css')
  assert.match(ruleOf(layout, '.eq-landing-cta'), /background: var\(--button-grad\)/)
  assert.match(ruleOf(layout, '.eq-landing-cta:hover'), /background: var\(--button-grad-hover\)/)
  const controls = read('kodini-controls-stage3.css')
  assert.match(
    ruleOf(controls, '.kodini-equalizer .player-bar .control-btn.primary'),
    /background: var\(--button-grad\)/
  )
  const header = read('kodini-header-stage2.css')
  assert.match(
    ruleOf(header, '.global-nav .global-nav-lang-btn.active'),
    /background: var\(--button-grad\) !important/
  )
  assert.match(
    ruleOf(header, ".eq-local-theme[aria-pressed='true']"),
    /background: var\(--button-grad\)/
  )
})
