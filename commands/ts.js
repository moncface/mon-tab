export const meta = {
  name: 'ts',
  desc: 'Unix timestamp (seconds)',
  category: 'time',
  usage: 'ts',
  scope: 'universal',
}

export const command = () => String(Math.floor(Date.now() / 1000))
