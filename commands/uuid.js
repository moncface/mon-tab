export const meta = {
  name: 'uuid',
  desc: 'Generate UUID v4',
  category: 'generators',
  usage: 'uuid',
  scope: 'universal',
}

export const command = () => crypto.randomUUID()
