// Shared variable storage module
// Chrome: session=in-memory, persistent=chrome.storage.local
// CLI:    session=tmpdir JSON, persistent=homedir JSON

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'

const isCLI = typeof globalThis.chrome === 'undefined' || !globalThis.chrome?.storage

// --- File-based storage for CLI ---
const SESSION_PATH = join(tmpdir(), 'mon-tab-session.json')
const PERSISTENT_DIR = join(homedir(), '.mon-tab')
const PERSISTENT_PATH = join(PERSISTENT_DIR, 'persistent.json')

function readJSON(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return {} }
}

function writeJSON(path, data) {
  if (path === PERSISTENT_PATH) mkdirSync(PERSISTENT_DIR, { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2))
}

// --- In-memory storage for Chrome extension ---
const sessionVars = {}

// Variable names: alphanumeric + underscore, 1-30 chars
const VALID_NAME = /^[a-zA-Z_]\w{0,29}$/
export function isValidName(name) { return VALID_NAME.test(name) }

async function getPersistent() {
  if (isCLI) return readJSON(PERSISTENT_PATH)
  try {
    const { vars_persistent = {} } = await chrome.storage.local.get('vars_persistent')
    return vars_persistent
  } catch { return {} }
}

async function savePersistent(vars) {
  if (isCLI) { writeJSON(PERSISTENT_PATH, vars); return }
  try { await chrome.storage.local.set({ vars_persistent: vars }) } catch {}
}

function getSession() {
  return isCLI ? readJSON(SESSION_PATH) : { ...sessionVars }
}

function setSession(name, value) {
  if (isCLI) {
    const vars = readJSON(SESSION_PATH)
    vars[name] = value
    writeJSON(SESSION_PATH, vars)
  } else {
    sessionVars[name] = value
  }
}

function deleteSession(name) {
  if (isCLI) {
    const vars = readJSON(SESSION_PATH)
    delete vars[name]
    writeJSON(SESSION_PATH, vars)
  } else {
    delete sessionVars[name]
  }
}

function clearSession() {
  if (isCLI) {
    writeJSON(SESSION_PATH, {})
  } else {
    Object.keys(sessionVars).forEach(k => delete sessionVars[k])
  }
}

export async function getVar(name) {
  const session = getSession()
  if (name in session) return session[name]
  const persistent = await getPersistent()
  return persistent[name] ?? null
}

export async function setVar(name, value, persistent = false) {
  if (persistent) {
    const vars = await getPersistent()
    vars[name] = value
    await savePersistent(vars)
  } else {
    setSession(name, value)
  }
}

export async function listVars() {
  const persistent = await getPersistent()
  return { session: getSession(), persistent }
}

export async function clearVar(name) {
  deleteSession(name)
  const vars = await getPersistent()
  delete vars[name]
  await savePersistent(vars)
}

export async function clearAll(scope) {
  if (scope === 'p') {
    await savePersistent({})
  } else {
    clearSession()
  }
}

// Replace m<name> with variable values in a string
// Uses word boundary (\b) to avoid partial matches (e.g. variable "i" won't match "mi" in "mime")
export async function substituteVars(str) {
  const { session, persistent } = await listVars()
  const merged = { ...persistent, ...session } // session overrides persistent
  if (!Object.keys(merged).length) return str
  // Sort by name length descending (mwidth before mw)
  const names = Object.keys(merged).sort((a, b) => b.length - a.length)
  let result = str
  for (const name of names) {
    const pattern = new RegExp('\\bm' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')
    result = result.replace(pattern, merged[name])
  }
  return result
}
