export const meta = {
  name: 'lt',
  desc: 'LNDF token comparison',
  category: 'lndf',
  usage: 'lt',
  scope: 'cli',
}

// Inferred fields per stack value (what JSON would need to spell out)
const stackDefaults = {
  'chrome-ext': { language: 'javascript', framework: 'vanilla', build_tool: 'none', manifest_version: '3' },
  node:         { language: 'javascript', framework: 'none', build_tool: 'none' },
  react:        { language: 'javascript/typescript', framework: 'react', build_tool: 'webpack/vite' },
  next:         { language: 'javascript/typescript', framework: 'next', build_tool: 'next' },
  vue:          { language: 'javascript', framework: 'vue', build_tool: 'vite' },
  svelte:       { language: 'javascript', framework: 'svelte', build_tool: 'vite' },
  express:      { language: 'javascript', framework: 'express', build_tool: 'none' },
}

function approxTokens(text) {
  return Math.ceil(text.length / 4)
}

export function lndfToJson(lndfText) {
  const lines = lndfText.split('\n').filter(l => l !== '---' && l.trim())
  if (lines.length === 0) return '{}'

  const obj = {}
  const name = lines[0]
  obj.name = name

  let stackValue = ''
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(':')
    if (colonIdx === -1) continue
    const key = lines[i].slice(0, colonIdx)
    const val = lines[i].slice(colonIdx + 1)
    if (key === 'changed') {
      obj[key] = val.split(',')
    } else {
      obj[key] = val
    }
    if (key === 'stack') stackValue = val
  }

  // Add inferred fields
  const stacks = stackValue.split(',').filter(Boolean)
  for (const s of stacks) {
    const defaults = stackDefaults[s]
    if (defaults) {
      for (const [k, v] of Object.entries(defaults)) {
        if (!(k in obj)) obj[k] = v
      }
    }
  }

  return JSON.stringify(obj)
}

export const command = async () => {
  const fs = await import('node:fs')
  const path = await import('node:path')

  const lndfPath = path.join(process.cwd(), '.lndf', 'current.lndf')
  if (!fs.existsSync(lndfPath)) {
    return 'No .lndf/current.lndf found. Run `mon ld` first.'
  }

  const lndfText = fs.readFileSync(lndfPath, 'utf8').trim()
  const jsonText = lndfToJson(lndfText)

  const lndfTokens = approxTokens(lndfText)
  const jsonTokens = approxTokens(jsonText)
  const saved = jsonTokens - lndfTokens
  const pct = Math.round((saved / jsonTokens) * 100)

  return `.lndf:  ${String(lndfTokens).padStart(4)} tokens\nJSON:   ${String(jsonTokens).padStart(4)} tokens\nsaved:  ${String(saved).padStart(4)} tokens (${pct}%)`
}
