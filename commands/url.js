export const meta = {
  name: 'url',
  desc: 'URL parser',
  category: 'validation',
  usage: 'url <url>',
  scope: 'universal',
}

export const command = (arg) => {
  if (!arg) return 'Usage: url <url>  e.g. url https://example.com/path?q=1#hash'
  let u
  try {
    u = new URL(arg.trim())
  } catch {
    return `Invalid URL: "${arg.trim()}"`
  }
  const parts = []
  parts.push(`protocol: ${u.protocol}`)
  if (u.username) parts.push(`user: ${u.username}`)
  parts.push(`host: ${u.hostname}`)
  if (u.port) parts.push(`port: ${u.port}`)
  parts.push(`path: ${u.pathname}`)
  if (u.search) {
    const params = [...u.searchParams.entries()]
      .map(([k, v]) => `  ${k}=${v}`).join('\n')
    parts.push(`query:\n${params}`)
  }
  if (u.hash) parts.push(`hash: ${u.hash}`)
  return parts.join('\n')
}
