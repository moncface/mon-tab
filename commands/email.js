export const meta = {
  name: 'email',
  desc: 'Email validator',
  category: 'validation',
  usage: 'email <address>',
  scope: 'universal',
}

export const command = (arg) => {
  if (!arg) return 'Usage: email <address>  e.g. email user@example.com'
  const addr = arg.trim()

  // RFC 5322 simplified — covers 99%+ of real addresses
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  const [local, ...domainParts] = addr.split('@')
  const domain = domainParts.join('@')

  if (!re.test(addr) || !local || !domain) {
    const reasons = []
    if (!local) reasons.push('missing local part')
    if (!domain) reasons.push('missing domain')
    if (!addr.includes('@')) reasons.push('missing @')
    else if (domainParts.length > 1) reasons.push('multiple @ signs')
    else if (local.length > 64) reasons.push('local part too long (max 64)')
    else if (domain.length > 253) reasons.push('domain too long (max 253)')
    else if (!domain.includes('.')) reasons.push('domain has no dot')
    else reasons.push('invalid format')
    return `Invalid: ${reasons.join(', ')}`
  }

  const tld = domain.split('.').pop().toLowerCase()
  return `Valid\nLocal: ${local}\nDomain: ${domain}\nTLD: .${tld}`
}
