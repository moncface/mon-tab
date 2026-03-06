import { listVars } from './var-store.js'

export const meta = {
  name: 'ml',
  desc: 'List all variables',
  category: 'variable',
  usage: 'ml',
  scope: 'universal',
}

export const command = async () => {
  const { session, persistent } = await listVars()
  const lines = []
  for (const [k, v] of Object.entries(session)) lines.push(`${k}=${v}`)
  for (const [k, v] of Object.entries(persistent)) lines.push(`${k}=${v} (p)`)
  return lines.length ? lines.join(', ') : '(no variables)'
}
