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
    assert.match(rule, /var\(--button-bg\)/, sel)
    assert.match(rule, /var\(--on-button\)/, sel)
  }
})

test('Design-System v2: kein blauer Akzent mehr im Hell-Theme', () => {
  assert.match(block('/* ===== TOKENS: LIGHT'), /--accent-primary: #8f6320;/)
})
