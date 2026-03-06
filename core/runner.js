import { commands, noSubstituteSet } from '../commands/index.js'
import { substituteVars } from '../commands/var-store.js'

export async function run(input) {
  const trimmed = input.trim()
  if (!trimmed) return 'Type a command — try: ?'

  const spaceIdx = trimmed.indexOf(' ')
  const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const arg = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1)

  const fn = commands[cmd]
  if (!fn) return `Unknown: "${cmd}" — try: ?`

  const finalArg = noSubstituteSet.has(cmd) ? arg : await substituteVars(arg)
  return (await fn(finalArg)) || '(empty result)'
}
