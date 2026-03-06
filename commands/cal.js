export const meta = {
  name: 'cal',
  desc: 'Day of week for date',
  category: 'time',
  usage: 'cal [YYYY-MM-DD]',
  scope: 'universal',
}

export const command = (t) => {
  if (t && !/^\d{4}-\d{2}-\d{2}$/.test(t.trim())) return 'Invalid format  e.g. cal 2026-03-15'
  const d = t ? new Date(t.trim() + 'T12:00:00') : new Date()
  if (isNaN(d)) return 'Invalid date  e.g. cal 2026-03-15'
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
