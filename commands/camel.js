export const meta = {
  name: 'camel',
  desc: 'camelCase text',
  category: 'string',
  usage: 'camel <text>',
  scope: 'universal',
  example: { input: 'hello world', output: 'helloWorld' },
}

export const command = (t) => t.trim().split(/[-_\s]+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
