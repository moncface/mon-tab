export const meta = {
  name: 'lower',
  desc: 'Lowercase text',
  category: 'string',
  usage: 'lower <text>',
  scope: 'universal',
}

export const command = (t) => t.toLowerCase()
