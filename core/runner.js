import { registry, noSubstituteSet } from '../commands/index.js'
import { substituteVars } from '../commands/var-store.js'

export async function run(input) {
  const trimmed = input.trim()
  if (!trimmed) return 'Type a command — try: ?'

  const spaceIdx = trimmed.indexOf(' ')
  const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const rawArg = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1)

  const entry = registry.get(cmd)
  if (!entry) return `Unknown: "${cmd}" — try: ?`

  const inChrome = typeof globalThis.chrome !== 'undefined' && !!globalThis.chrome.runtime
  if (inChrome && entry.meta.scope === 'cli') return `"${cmd}" is CLI-only — run: mon ${cmd}`

  const arg = entry.meta.trimArg !== false ? rawArg.trimStart() : rawArg
  const finalArg = noSubstituteSet.has(cmd) ? arg : await substituteVars(arg)
  return (await entry.run(finalArg)) || '(empty result)'
}
