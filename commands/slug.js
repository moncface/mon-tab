export const meta = {
  name: 'slug',
  desc: 'URL slug',
  category: 'string',
  usage: 'slug <text>',
  scope: 'universal',
  example: { input: 'Hello World', output: 'hello-world' },
}

export const command = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
