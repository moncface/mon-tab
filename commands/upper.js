export const meta = {
  name: 'upper',
  desc: 'Uppercase text',
  category: 'string',
  usage: 'upper <text>',
  scope: 'universal',
}

export const command = (t) => t.toUpperCase()
