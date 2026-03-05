// Set or read a session variable
import { getVar, setVar, isValidName } from './var-store.js'

export const command = async (arg) => {
  const parts = arg.trim().split(/\s+/)
  if (!parts[0]) return 'Usage: m <name> [value]'
  const name = parts[0]
  if (!isValidName(name)) return 'Name must be alphanumeric (a-z, 0-9, _)'
  if (parts.length === 1) {
    const val = await getVar(name)
    return val !== null ? `${name} = ${val}` : `"${name}" not set`
  }
  const value = parts.slice(1).join(' ')
  await setVar(name, value, false)
  return `${name} = ${value} (session)`
}
