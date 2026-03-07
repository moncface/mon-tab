export const meta = {
  name: 'rand',
  desc: 'Generate random number',
  category: 'generators',
  usage: 'rand [max] or rand <min> <max>',
  scope: 'universal',
}

export const command = (arg) => {
  if (!arg) return String(Math.random())
  const parts = arg.trim().split(/\s+/).map(Number)
  if (parts.some(isNaN)) return 'Usage: rand [max] or rand <min> <max>'
  if (parts.length === 1) {
    return String(Math.floor(Math.random() * (parts[0] + 1)))
  }
  if (parts.length === 2) {
    const [min, max] = parts
    return String(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return 'Usage: rand [max] or rand <min> <max>'
}
