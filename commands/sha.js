export const meta = {
  name: 'sha',
  desc: 'SHA-256 hash',
  category: 'generators',
  usage: 'sha <text>',
  scope: 'universal',
}

export const command = async (t) => {
  if (!t) return 'Usage: sha <text>'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
