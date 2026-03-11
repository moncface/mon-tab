export const meta = {
  name: 'sv',
  desc: 'Semver parse / compare',
  category: 'validation',
  usage: 'sv <version> [version2]',
  aliases: ['semver'],
  scope: 'universal',
}

const RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?$/

function parse(str) {
  const m = str.match(RE)
  if (!m) return null
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] || '', build: m[5] || '' }
}

function comparePre(a, b) {
  if (!a && !b) return 0
  if (!a) return 1   // no pre > has pre (1.0.0 > 1.0.0-alpha)
  if (!b) return -1
  const pa = a.split('.'), pb = b.split('.')
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (i >= pa.length) return -1
    if (i >= pb.length) return 1
    const na = +pa[i], nb = +pb[i]
    const aNum = !isNaN(na), bNum = !isNaN(nb)
    if (aNum && bNum) { if (na !== nb) return na - nb }
    else if (aNum !== bNum) return aNum ? -1 : 1
    else { if (pa[i] < pb[i]) return -1; if (pa[i] > pb[i]) return 1 }
  }
  return 0
}

function compare(a, b) {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  if (a.patch !== b.patch) return a.patch - b.patch
  return comparePre(a.pre, b.pre)
}

function format(v) {
  const lines = [`${v.major}.${v.minor}.${v.patch}`]
  lines.push(`Major: ${v.major}  Minor: ${v.minor}  Patch: ${v.patch}`)
  if (v.pre) lines.push(`Pre-release: ${v.pre}`)
  if (v.build) lines.push(`Build: ${v.build}`)
  return lines.join('\n')
}

export const command = (arg) => {
  if (!arg) return 'Usage: semver <version> [version2]  e.g. semver 1.2.3  or  semver 1.2.3 2.0.0'
  const parts = arg.trim().split(/\s+/)

  const a = parse(parts[0])
  if (!a) return `Invalid semver: "${parts[0]}"`

  if (parts.length === 1) return format(a)

  const b = parse(parts[1])
  if (!b) return `Invalid semver: "${parts[1]}"`

  const cmp = compare(a, b)
  const sym = cmp < 0 ? '<' : cmp > 0 ? '>' : '='
  return `${parts[0]} ${sym} ${parts[1]}`
}
