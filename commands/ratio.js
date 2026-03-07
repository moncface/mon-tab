export const meta = {
  name: 'ratio',
  desc: 'Aspect ratio calculator',
  category: 'math',
  usage: 'ratio <w> <h> <size> or ratio <w> <h> ? <size>',
  scope: 'universal',
}

export const command = (arg) => {
  if (!arg) return 'Usage: ratio 16 9 1920  or  ratio 16 9 ? 1080'
  const parts = arg.trim().split(/\s+/)
  if (parts.length === 3) {
    const [w, h, size] = parts.map(Number)
    if (isNaN(w) || isNaN(h) || isNaN(size)) return 'Usage: ratio 16 9 1920'
    const result = Math.round(size * h / w)
    return String(result)
  }
  if (parts.length === 4 && parts[2] === '?') {
    const w = Number(parts[0])
    const h = Number(parts[1])
    const size = Number(parts[3])
    if (isNaN(w) || isNaN(h) || isNaN(size)) return 'Usage: ratio 16 9 ? 1080'
    const result = Math.round(size * w / h)
    return String(result)
  }
  return 'Usage: ratio 16 9 1920  or  ratio 16 9 ? 1080'
}
