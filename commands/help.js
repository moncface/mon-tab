export const meta = {
  name: '?',
  desc: 'List all commands',
  category: 'system',
  usage: '? [category]',
  scope: 'universal',
}

// commandList is injected after registry is built (avoids circular import)
let _commandList = []
export function setCommandList(list) { _commandList = list }

const categoryOrder = [
  ['generators', 'Generators'],
  ['encoding',   'Encoding'],
  ['time',       'Time'],
  ['string',     'String'],
  ['math',       'Math'],
  ['css',        'CSS'],
  ['dict',       'Dictionary'],
  ['geo',        'Geo'],
  ['lookup',     'Lookup'],
  ['variable',   'Variable'],
  ['lndf',       'Distillation'],
  ['system',     'System'],
]

export const command = (arg) => {
  const inChrome = typeof globalThis.chrome !== 'undefined' && !!globalThis.chrome.runtime
  const visible = inChrome ? _commandList.filter(c => c.scope !== 'cli') : _commandList

  if (arg) {
    const list = visible.filter(c => c.category === arg)
    if (!list.length) return `No commands in category "${arg}"`
    return list.map(c => `${c.name} — ${c.desc}`).join(' | ')
  }

  const lines = []
  const grouped = {}
  for (const c of visible) {
    const cat = c.category || 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(c)
  }

  for (const [key, label] of categoryOrder) {
    if (!grouped[key]) continue
    lines.push(`── ${label} ──`)
    for (const c of grouped[key]) {
      lines.push(`  ${c.name.padEnd(6)} ${c.desc}`)
    }
    delete grouped[key]
  }

  // Remaining uncategorized
  for (const [key, cmds] of Object.entries(grouped)) {
    lines.push(`── ${key} ──`)
    for (const c of cmds) {
      lines.push(`  ${c.name.padEnd(6)} ${c.desc}`)
    }
  }

  return lines.join('\n')
}
