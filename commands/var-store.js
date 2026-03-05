// Shared variable storage module
// Session vars: in-memory (lost on service worker restart)
// Persistent vars: chrome.storage.local

const sessionVars = {}

// Variable names: alphanumeric + underscore, 1-30 chars
const VALID_NAME = /^[a-zA-Z_]\w{0,29}$/
export function isValidName(name) { return VALID_NAME.test(name) }

async function getPersistent() {
  try {
    const { vars_persistent = {} } = await chrome.storage.local.get('vars_persistent')
    return vars_persistent
  } catch { return {} }
}

async function savePersistent(vars) {
  try { await chrome.storage.local.set({ vars_persistent: vars }) } catch {}
}

export async function getVar(name) {
  if (name in sessionVars) return sessionVars[name]
  const persistent = await getPersistent()
  return persistent[name] ?? null
}

export async function setVar(name, value, persistent = false) {
  if (persistent) {
    const vars = await getPersistent()
    vars[name] = value
    await savePersistent(vars)
  } else {
    sessionVars[name] = value
  }
}

export async function listVars() {
  const persistent = await getPersistent()
  return { session: { ...sessionVars }, persistent }
}

export async function clearVar(name) {
  delete sessionVars[name]
  const vars = await getPersistent()
  delete vars[name]
  await savePersistent(vars)
}

export async function clearAll(scope) {
  if (scope === 'p') {
    await savePersistent({})
  } else {
    Object.keys(sessionVars).forEach(k => delete sessionVars[k])
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
