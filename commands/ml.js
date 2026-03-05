// List all variables
import { listVars } from './var-store.js'

export const command = async () => {
  const { session, persistent } = await listVars()
  const lines = []
  for (const [k, v] of Object.entries(session)) lines.push(`${k}=${v}`)
  for (const [k, v] of Object.entries(persistent)) lines.push(`${k}=${v} (p)`)
  return lines.length ? lines.join(', ') : '(no variables)'
}
