export const meta = {
  name: 'json',
  desc: 'JSON validate / format',
  category: 'validation',
  usage: 'json <string>',
  scope: 'universal',
  trimArg: false,
}

export const command = (arg) => {
  if (!arg || !arg.trim()) return 'Usage: json <string>  e.g. json {"a":1,"b":[2,3]}'
  const str = arg.trim()
  try {
    const parsed = JSON.parse(str)
    const pretty = JSON.stringify(parsed, null, 2)
    const type = Array.isArray(parsed) ? 'array' : typeof parsed
    const keys = type === 'object' ? Object.keys(parsed).length : null
    const len = type === 'array' ? parsed.length : null
    const info = type === 'object' ? `object (${keys} key${keys !== 1 ? 's' : ''})` :
                 type === 'array' ? `array (${len} item${len !== 1 ? 's' : ''})` : type
    return `Valid JSON — ${info}\n${pretty}`
  } catch (e) {
    const pos = e.message.match(/position (\d+)/)
    const hint = pos ? ` (at position ${pos[1]})` : ''
    return `Invalid JSON${hint}: ${e.message}`
  }
}
