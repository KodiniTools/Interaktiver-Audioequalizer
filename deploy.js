#!/usr/bin/env node
/**
 * Interaktiver Audioequalizer – Deploy-Skript (statisches Vue/Vite-Frontend)
 *
 * Ablauf (Befehl "deploy", auf dem Server):
 *   1. Quellcode nach $APP_DIR/src klonen bzw. aktualisieren (git)
 *   2. Abhängigkeiten installieren (npm ci) und bauen (vite build)
 *   3. Build prüfen (index.html, assets/, Base-Pfad /audioequalizer/)
 *   4. Aktuellen Webroot nach $APP_DIR/backups/<zeitstempel> sichern
 *   5. dist/ per rsync nach $WEB_ROOT deployen, Rechte setzen
 *   6. Health-Check über HTTP(S): Startseite + erstes JS-Asset
 *
 * Aufruf:
 *   sudo node /opt/audioequalizer/deploy.js                 # Branch "main" deployen
 *   sudo BRANCH=feature-x node /opt/audioequalizer/deploy.js
 *   sudo node /opt/audioequalizer/deploy.js rollback        # letztes Backup zurückspielen
 *   sudo node /opt/audioequalizer/deploy.js rollback 20261009-120000
 *   node deploy.js list-backups
 *   node deploy.js build                                    # nur lokal bauen + prüfen
 *   node deploy.js help
 *
 * Alle Pfade lassen sich per Umgebungsvariable überschreiben (siehe CONFIG).
 * Benötigt: Node.js >= 18 (fetch), git, rsync, npm. Keine npm-Abhängigkeiten.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ----------------------------------------------------------------------------
// Konfiguration
// ----------------------------------------------------------------------------
const env = process.env
const APP_DIR = env.APP_DIR || '/opt/audioequalizer'

const CONFIG = {
  repoUrl: env.REPO_URL || 'https://github.com/KodiniTools/Interaktiver-Audioequalizer.git',
  branch: env.BRANCH || 'main',
  appDir: APP_DIR, // Arbeitsverzeichnis (Quellen, Backups)
  srcDir: env.SRC_DIR || path.join(APP_DIR, 'src'), // Git-Checkout
  backupDir: env.BACKUP_DIR || path.join(APP_DIR, 'backups'),
  keepBackups: toPositiveInt(env.KEEP_BACKUPS, 5),
  webRoot: env.WEB_ROOT || '/var/www/kodinitools.com/audioequalizer',
  webUser: env.WEB_USER || 'www-data',
  webGroup: env.WEB_GROUP || 'www-data',
  basePath: env.BASE_PATH || '/audioequalizer/', // muss zu vite.config.js + nginx alias passen
  healthUrl: env.HEALTH_URL || 'https://kodinitools.com/audioequalizer/',
  skipHealthcheck: env.SKIP_HEALTHCHECK === '1',
  healthTimeoutMs: toPositiveInt(env.HEALTH_TIMEOUT_MS, 15000),
  minNodeMajor: 18,
}

const SELF = fileURLToPath(import.meta.url)
const BACKUP_NAME = /^\d{8}-\d{6}$/

// ----------------------------------------------------------------------------
// Hilfsfunktionen
// ----------------------------------------------------------------------------
const color = (code, text) => (process.stdout.isTTY ? `\x1b[1;${code}m${text}\x1b[0m` : text)
const log = (msg) => console.log(`${color(34, '[deploy]')} ${msg}`)
const ok = (msg) => console.log(`${color(32, '[  ok  ]')} ${msg}`)
const warn = (msg) => console.warn(`${color(33, '[ warn ]')} ${msg}`)

class DeployError extends Error {}
const fail = (msg) => {
  throw new DeployError(msg)
}

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

/**
 * Führt ein Programm ohne Shell aus (keine Quoting-/Injection-Probleme).
 * @returns {string} stdout bei capture, sonst ''
 */
function run(cmd, args, { cwd, capture = false, allowFail = false } = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32' && cmd === 'npm', // npm ist unter Windows eine .cmd
  })
  if (res.error) {
    if (allowFail) return ''
    fail(`${cmd} konnte nicht gestartet werden: ${res.error.message}`)
  }
  if (res.status !== 0 && !allowFail) {
    const detail = capture && res.stderr ? `\n${res.stderr.trim()}` : ''
    fail(`${cmd} ${args.join(' ')} endete mit Code ${res.status}${detail}`)
  }
  return capture ? (res.stdout || '').trim() : ''
}

function hasCmd(cmd) {
  const probe = process.platform === 'win32' ? 'where' : 'which'
  return spawnSync(probe, [cmd], { stdio: 'ignore' }).status === 0
}

function requireCmd(cmd, hint) {
  if (!hasCmd(cmd)) fail(`Benötigtes Programm fehlt: ${cmd}  (${hint})`)
}

function requireRoot() {
  if (typeof process.getuid === 'function' && process.getuid() !== 0) {
    fail(
      `Bitte als root ausführen (sudo node ${SELF} ...). Nötig für ${CONFIG.appDir} und ${CONFIG.webRoot}.`
    )
  }
}

function checkNode() {
  const major = Number(process.versions.node.split('.')[0])
  if (major < CONFIG.minNodeMajor) {
    fail(`Node.js ${process.versions.node} gefunden, benötigt wird >= ${CONFIG.minNodeMajor}.`)
  }
}

function checkPrereqs() {
  checkNode()
  requireCmd('git', 'apt install git')
  requireCmd('rsync', 'apt install rsync')
  requireCmd('npm', 'kommt mit Node.js')
  ok(
    `Voraussetzungen: git, rsync, node ${process.version}, npm ${run('npm', ['-v'], { capture: true })}`
  )
}

function listBackupNames() {
  if (!fs.existsSync(CONFIG.backupDir)) return []
  return fs
    .readdirSync(CONFIG.backupDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && BACKUP_NAME.test(d.name))
    .map((d) => d.name)
    .sort()
}

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

/** Quelle mit abschließendem "/" → rsync kopiert den Inhalt, nicht den Ordner. */
const dirArg = (dir) => (dir.endsWith('/') ? dir : `${dir}/`)

function setPermissions() {
  const { webRoot, webUser, webGroup } = CONFIG
  run('chown', ['-R', `${webUser}:${webGroup}`, webRoot])
  run('find', [webRoot, '-type', 'd', '-exec', 'chmod', '755', '{}', '+'])
  run('find', [webRoot, '-type', 'f', '-exec', 'chmod', '644', '{}', '+'])
}

// ----------------------------------------------------------------------------
// Schritt 1: Quellcode holen
// ----------------------------------------------------------------------------
function fetchSource() {
  const { srcDir, repoUrl, branch } = CONFIG
  // root-Checkouts in /opt gelten für git sonst als "unsafe"
  run('git', ['config', '--global', '--add', 'safe.directory', srcDir], { allowFail: true })

  if (fs.existsSync(path.join(srcDir, '.git'))) {
    log(`Aktualisiere Repository in ${srcDir} (Branch: ${branch})`)
    run('git', ['-C', srcDir, 'remote', 'set-url', 'origin', repoUrl])
    run('git', ['-C', srcDir, 'fetch', '--prune', 'origin', branch])
    // Reines Build-Verzeichnis: lokale Änderungen (z. B. durch npm ci) verwerfen
    run('git', ['-C', srcDir, 'reset', '-q', '--hard'])
    run('git', ['-C', srcDir, 'checkout', '-q', '-f', '-B', branch, `origin/${branch}`])
    run('git', ['-C', srcDir, 'reset', '-q', '--hard', `origin/${branch}`])
  } else {
    log(`Klone ${repoUrl} (Branch: ${branch}) nach ${srcDir}`)
    fs.rmSync(srcDir, { recursive: true, force: true })
    run('git', ['clone', '--branch', branch, '--single-branch', repoUrl, srcDir])
  }

  const commit = run('git', ['-C', srcDir, 'rev-parse', '--short', 'HEAD'], { capture: true })
  const subject = run('git', ['-C', srcDir, 'log', '-1', '--pretty=%s'], { capture: true })
  ok(`Stand: ${branch} @ ${commit} – ${subject}`)
  return { commit, subject }
}

// ----------------------------------------------------------------------------
// Schritt 2 + 3: Bauen und prüfen
// ----------------------------------------------------------------------------
function build(dir) {
  log('Installiere Abhängigkeiten (npm ci)')
  run('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: dir })

  log('Baue Produktions-Build (vite build)')
  fs.rmSync(path.join(dir, 'dist'), { recursive: true, force: true })
  run('npm', ['run', 'build', '--silent'], { cwd: dir })
  ok(`Build fertig: ${path.join(dir, 'dist')}`)
}

/** @returns {string[]} Asset-Pfade aus index.html (src/href unter dem Base-Pfad) */
function assetRefs(indexHtml) {
  const escaped = CONFIG.basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(?:src|href)="(${escaped}assets/[^"]+)"`, 'g')
  return [...indexHtml.matchAll(re)].map((m) => m[1])
}

function verifyBuild(dir) {
  const dist = path.join(dir, 'dist')
  const indexFile = path.join(dist, 'index.html')
  if (!fs.existsSync(indexFile)) fail('dist/index.html fehlt – Build fehlgeschlagen?')
  if (!fs.existsSync(path.join(dist, 'assets'))) fail('dist/assets fehlt – Build unvollständig?')

  const html = fs.readFileSync(indexFile, 'utf8')
  const refs = assetRefs(html)
  // Base-Pfad muss zum nginx-alias passen, sonst 404 auf alle Assets
  if (!refs.some((r) => r.endsWith('.js'))) {
    fail(
      `index.html referenziert kein JS unter ${CONFIG.basePath}assets/. vite.config.js 'base' prüfen.`
    )
  }
  for (const ref of refs) {
    const file = path.join(dist, ref.slice(CONFIG.basePath.length))
    if (!fs.existsSync(file)) fail(`index.html verweist auf ${ref}, Datei fehlt in dist/.`)
  }
  // SSI-Includes (Nav, Footer, Cookie-Banner) müssen den Build überleben
  if (!html.includes('<!--#include virtual="/partials/nav.html"')) {
    warn('SSI-Include für /partials/nav.html fehlt in dist/index.html.')
  }
  ok(`Build geprüft: index.html + ${refs.length} Assets, Base-Pfad ${CONFIG.basePath}`)
}

// ----------------------------------------------------------------------------
// Schritt 4: Backup
// ----------------------------------------------------------------------------
function backupCurrent() {
  const { webRoot, backupDir, keepBackups } = CONFIG
  if (!fs.existsSync(webRoot) || fs.readdirSync(webRoot).length === 0) {
    warn('Webroot ist leer, kein Backup nötig.')
    return
  }
  const target = path.join(backupDir, timestamp())
  fs.mkdirSync(target, { recursive: true })
  run('rsync', ['-a', dirArg(webRoot), dirArg(target)])
  ok(`Backup: ${target}`)

  const names = listBackupNames()
  const old = names.slice(0, Math.max(0, names.length - keepBackups))
  for (const name of old) fs.rmSync(path.join(backupDir, name), { recursive: true, force: true })
  if (old.length) log(`${old.length} alte(s) Backup(s) entfernt (behalte ${keepBackups}).`)
}

// ----------------------------------------------------------------------------
// Schritt 5: Deploy
// ----------------------------------------------------------------------------
function deployFiles({ commit, subject }) {
  const { srcDir, webRoot, appDir, branch, webUser, webGroup } = CONFIG
  log(`Deploye nach ${webRoot}`)
  run('rsync', ['-a', '--delete', dirArg(path.join(srcDir, 'dist')), dirArg(webRoot)])
  setPermissions()

  fs.writeFileSync(
    path.join(appDir, 'last-deploy.txt'),
    `branch=${branch}\ncommit=${commit}\nsubject=${subject}\ndeployed_at=${new Date().toISOString()}\n`
  )
  ok(`Dateien deployed, Besitzer ${webUser}:${webGroup}`)
}

// ----------------------------------------------------------------------------
// Schritt 6: Health-Check
// ----------------------------------------------------------------------------
async function httpStatus(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CONFIG.healthTimeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    return res.status
  } catch (err) {
    warn(`${url}: ${err.name === 'AbortError' ? 'Timeout' : err.message}`)
    return 0
  } finally {
    clearTimeout(timer)
  }
}

async function healthcheck() {
  if (CONFIG.skipHealthcheck) {
    warn('Health-Check übersprungen (SKIP_HEALTHCHECK=1).')
    return
  }
  const rollbackHint = `Rollback: sudo node ${SELF} rollback`
  log(`Health-Check: ${CONFIG.healthUrl}`)
  const code = await httpStatus(CONFIG.healthUrl)
  if (code !== 200) fail(`Startseite liefert HTTP ${code} (erwartet 200). ${rollbackHint}`)

  // erstes JS-Asset laden – erkennt falschen Base-Pfad / nginx alias
  const indexFile = path.join(CONFIG.webRoot, 'index.html')
  const asset = fs.existsSync(indexFile)
    ? assetRefs(fs.readFileSync(indexFile, 'utf8')).find((r) => r.endsWith('.js'))
    : undefined
  if (asset) {
    const assetUrl = new URL(asset, CONFIG.healthUrl).href
    const assetCode = await httpStatus(assetUrl)
    if (assetCode !== 200) {
      fail(
        `Asset ${asset} liefert HTTP ${assetCode}. nginx alias / Base-Pfad prüfen. ${rollbackHint}`
      )
    }
  }
  ok('Health-Check bestanden (HTTP 200).')
}

// ----------------------------------------------------------------------------
// Rollback / Backup-Liste
// ----------------------------------------------------------------------------
function listBackups() {
  const names = listBackupNames()
  log(`Backups in ${CONFIG.backupDir}:`)
  console.log(names.length ? names.map((n) => `  ${n}`).join('\n') : '  (keine)')
}

async function rollback(name) {
  const names = listBackupNames()
  if (!names.length) fail(`Kein Backup in ${CONFIG.backupDir} vorhanden.`)
  // Nur bekannte Backup-Namen akzeptieren (kein Pfad aus der Eingabe)
  const chosen = name ? names.find((n) => n === name) : names[names.length - 1]
  if (!chosen) fail(`Backup ${name} nicht gefunden. Verfügbar: ${names.join(' ')}`)

  const source = path.join(CONFIG.backupDir, chosen)
  log(`Rollback von ${source} nach ${CONFIG.webRoot}`)
  fs.mkdirSync(CONFIG.webRoot, { recursive: true })
  run('rsync', ['-a', '--delete', dirArg(source), dirArg(CONFIG.webRoot)])
  setPermissions()
  ok('Rollback abgeschlossen.')
  await healthcheck()
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
function printHelp() {
  const text = fs.readFileSync(SELF, 'utf8')
  const header = text.slice(text.indexOf('/**') + 3, text.indexOf('*/'))
  console.log(header.replace(/^ \* ?/gm, '').trim())
}

async function main() {
  const [cmd = 'deploy', arg] = process.argv.slice(2)
  let deployStarted = false

  try {
    switch (cmd) {
      case 'deploy': {
        requireRoot()
        checkPrereqs()
        fs.mkdirSync(CONFIG.appDir, { recursive: true })
        fs.mkdirSync(CONFIG.backupDir, { recursive: true })
        fs.mkdirSync(CONFIG.webRoot, { recursive: true })
        const info = fetchSource()
        build(CONFIG.srcDir)
        verifyBuild(CONFIG.srcDir)
        backupCurrent()
        deployStarted = true
        deployFiles(info)
        await healthcheck()
        ok(`Deploy abgeschlossen: ${CONFIG.branch} @ ${info.commit} → ${CONFIG.healthUrl}`)
        break
      }
      case 'build': {
        checkNode()
        requireCmd('npm', 'kommt mit Node.js')
        const dir = path.dirname(SELF)
        build(dir)
        verifyBuild(dir)
        break
      }
      case 'rollback':
        requireRoot()
        requireCmd('rsync', 'apt install rsync')
        await rollback(arg)
        break
      case 'list-backups':
        listBackups()
        break
      case 'help':
      case '-h':
      case '--help':
        printHelp()
        break
      default:
        fail(`Unbekannter Befehl: ${cmd} (deploy | build | rollback [name] | list-backups | help)`)
    }
  } catch (err) {
    const msg = err instanceof DeployError ? err.message : (err?.stack ?? String(err))
    console.error(`${color(31, '[ fail ]')} ${msg}`)
    if (cmd === 'deploy') {
      console.error(
        deployStarted
          ? `Webroot wurde bereits verändert. Rollback: sudo node ${SELF} rollback`
          : 'Webroot wurde NICHT verändert.'
      )
    }
    process.exitCode = 1
  }
}

main()
