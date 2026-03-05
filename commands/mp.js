// Set a persistent variable (survives Chrome restart)
import { setVar, isValidName } from './var-store.js'

export const command = async (arg) => {
  const parts = arg.trim().split(/\s+/)
  if (parts.length < 2 || !parts[0]) return 'Usage: mp <name> <value>'
  const name = parts[0]
  if (!isValidName(name)) return 'Name must be alphanumeric (a-z, 0-9, _)'
  const value = parts.slice(1).join(' ')
  await setVar(name, value, true)
  return `${name} = ${value} (persistent)`
}
