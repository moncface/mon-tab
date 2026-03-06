export const meta = {
  name: 'snake',
  desc: 'snake_case text',
  category: 'string',
  usage: 'snake <text>',
  scope: 'universal',
  example: { input: 'helloWorld', output: 'hello_world' },
}

export const command = (t) => t.trim().replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase()
