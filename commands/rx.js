export const meta = {
  name: 'rx',
  desc: 'Regex tester',
  category: 'validation',
  usage: 'rx /<pattern>/[flags] <string>',
  scope: 'universal',
}

export const command = (arg) => {
  if (!arg) return 'Usage: rx /<pattern>/[flags] <string>  e.g. rx /\\d+/g abc123def456'

  // Parse /pattern/flags string
  const m = arg.match(/^\/(.+)\/([gimsuy]*)\s+(.+)$/s)
  if (!m) return 'Usage: rx /<pattern>/[flags] <string>'

  const [, pattern, flags, str] = m
  let re
  try {
    re = new RegExp(pattern, flags)
  } catch (e) {
    return `Invalid regex: ${e.message}`
  }

  if (flags.includes('g')) {
    const matches = [...str.matchAll(re)]
    if (!matches.length) return 'No match'
    const results = matches.map((m, i) => {
      const groups = m.groups ? ` ${JSON.stringify(m.groups)}` : ''
      return `[${i}] "${m[0]}" @${m.index}${groups}`
    })
    return `${matches.length} match${matches.length > 1 ? 'es' : ''}\n${results.join('\n')}`
  }

  const match = re.exec(str)
  if (!match) return 'No match'
  const groups = match.groups ? `\nGroups: ${JSON.stringify(match.groups)}` : ''
  const captures = match.length > 1
    ? '\n' + match.slice(1).map((c, i) => `  $${i + 1}: "${c ?? ''}"`).join('\n')
    : ''
  return `Match: "${match[0]}" @${match.index}${captures}${groups}`
}
