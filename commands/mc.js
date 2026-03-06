import { clearVar, clearAll } from './var-store.js'

export const meta = {
  name: 'mc',
  desc: 'Clear variables',
  category: 'variable',
  usage: 'mc [name|p]',
  scope: 'universal',
  noSubstitute: true,
}

export const command = async (arg) => {
  const name = arg.trim()
  if (!name) { await clearAll('session'); return 'Session variables cleared' }
  if (name === 'p') { await clearAll('p'); return 'Persistent variables cleared' }
  await clearVar(name)
  return `"${name}" cleared`
}
