export const meta = {
  name: 'now',
  desc: 'ISO 8601 timestamp',
  category: 'time',
  usage: 'now',
  scope: 'universal',
}

export const command = () => new Date().toISOString()
