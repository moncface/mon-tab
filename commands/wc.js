export const meta = {
  name: 'wc',
  desc: 'Word & character count',
  category: 'string',
  usage: 'wc <text>',
  scope: 'universal',
}

export const command = (t) => {
  if (!t) return 'Usage: wc <text>'
  return `${t.trim().split(/\s+/).length} words, ${t.length} chars`
}
