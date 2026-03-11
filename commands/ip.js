export const meta = {
  name: 'ip',
  desc: 'IP address info',
  category: 'validation',
  usage: 'ip <address>',
  scope: 'universal',
}

function parseV4(str) {
  const parts = str.split('.')
  if (parts.length !== 4) return null
  const nums = parts.map(Number)
  if (nums.some(n => isNaN(n) || n < 0 || n > 255 || String(n) !== parts[nums.indexOf(n)])) {
    // re-check each part individually
    for (let i = 0; i < 4; i++) {
      if (isNaN(nums[i]) || nums[i] < 0 || nums[i] > 255 || String(nums[i]) !== parts[i]) return null
    }
  }
  return nums
}

function v4Info(nums) {
  const [a, b] = nums
  const info = []
  info.push(`Type: IPv4`)
  info.push(`Binary: ${nums.map(n => n.toString(2).padStart(8, '0')).join('.')}`)

  // Class
  if (a < 128) info.push('Class: A')
  else if (a < 192) info.push('Class: B')
  else if (a < 224) info.push('Class: C')
  else if (a < 240) info.push('Class: D (multicast)')
  else info.push('Class: E (reserved)')

  // Scope
  if (a === 10) info.push('Scope: Private (10.0.0.0/8)')
  else if (a === 172 && b >= 16 && b <= 31) info.push('Scope: Private (172.16.0.0/12)')
  else if (a === 192 && b === 168) info.push('Scope: Private (192.168.0.0/16)')
  else if (a === 127) info.push('Scope: Loopback (127.0.0.0/8)')
  else if (a === 169 && b === 254) info.push('Scope: Link-local (169.254.0.0/16)')
  else if (a === 0) info.push('Scope: Current network')
  else if (a >= 224 && a <= 239) info.push('Scope: Multicast')
  else if (a >= 240) info.push('Scope: Reserved')
  else info.push('Scope: Public')

  return info.join('\n')
}

function isV6(str) {
  // Simple check: contains at least 2 colons, valid hex chars
  if (str.split(':').length < 3) return false
  const expanded = str.replace(/::/, ':0000:'.repeat(8 - str.split(':').filter(Boolean).length + 1).slice(0, -1) || ':0000:')
  return /^[0-9a-fA-F:]+$/.test(str)
}

function v6Info(str) {
  const info = [`Type: IPv6`]
  const lower = str.toLowerCase()
  if (lower === '::1') info.push('Scope: Loopback')
  else if (lower === '::') info.push('Scope: Unspecified')
  else if (lower.startsWith('fe80:')) info.push('Scope: Link-local')
  else if (lower.startsWith('fc') || lower.startsWith('fd')) info.push('Scope: Unique local (private)')
  else if (lower.startsWith('ff')) info.push('Scope: Multicast')
  else if (lower.startsWith('2001:db8:')) info.push('Scope: Documentation')
  else if (lower.startsWith('::ffff:')) info.push('Scope: IPv4-mapped')
  else info.push('Scope: Global unicast')
  return info.join('\n')
}

export const command = (arg) => {
  if (!arg) return 'Usage: ip <address>  e.g. ip 192.168.1.1  or  ip ::1'
  const str = arg.trim()

  // CIDR notation
  const cidrMatch = str.match(/^(.+)\/(\d+)$/)
  const addr = cidrMatch ? cidrMatch[1] : str
  const prefix = cidrMatch ? parseInt(cidrMatch[2]) : null

  const v4 = parseV4(addr)
  if (v4) {
    let result = v4Info(v4)
    if (prefix !== null) {
      if (prefix < 0 || prefix > 32) return 'Invalid CIDR prefix (0-32)'
      const hosts = Math.pow(2, 32 - prefix) - 2
      result += `\nCIDR: /${prefix} (${hosts > 0 ? hosts : 1} usable host${hosts !== 1 ? 's' : ''})`
    }
    return result
  }

  if (isV6(addr)) {
    let result = v6Info(addr)
    if (prefix !== null) {
      if (prefix < 0 || prefix > 128) return 'Invalid CIDR prefix (0-128)'
      result += `\nCIDR: /${prefix}`
    }
    return result
  }

  return `Invalid IP address: "${str}"`
}
