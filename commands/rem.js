export const meta = {
  name: 'rem',
  desc: 'Set a reminder (Chrome notification)',
  category: 'system',
  usage: 'rem <time> <message>',
  example: { input: '30m review PR', output: 'Reminder set: 30 min — review PR' },
  scope: 'chrome',
  noSubstitute: true,
}

// Parse time string: 30s, 5m, 1h, 1h30m
function parseTime(str) {
  const s = str.toLowerCase()
  let total = 0
  const h = s.match(/(\d+)h/)
  const m = s.match(/(\d+)m/)
  const sec = s.match(/(\d+)s/)
  if (h) total += parseInt(h[1]) * 60
  if (m) total += parseInt(m[1])
  if (sec) total += parseInt(sec[1]) / 60
  // Plain number = minutes
  if (!h && !m && !sec && /^\d+$/.test(s)) total = parseInt(s)
  return total
}

function formatDelay(minutes) {
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export const command = async (arg) => {
  const parts = arg.trim().split(/\s+/)

  // rem ls — list active reminders
  if (parts[0] === 'ls' || parts[0] === 'list') {
    const alarms = await chrome.alarms.getAll()
    const reminders = alarms.filter(a => a.name.startsWith('rem:'))
    if (reminders.length === 0) return 'No active reminders'
    return reminders.map((a, i) => {
      const msg = a.name.replace('rem:', '')
      const remaining = Math.max(0, Math.round((a.scheduledTime - Date.now()) / 60000))
      return `${i + 1}. ${msg} (${remaining} min left)`
    }).join('\n')
  }

  // rem clear — clear all reminders
  if (parts[0] === 'clear') {
    const alarms = await chrome.alarms.getAll()
    const reminders = alarms.filter(a => a.name.startsWith('rem:'))
    for (const a of reminders) await chrome.alarms.clear(a.name)
    return `Cleared ${reminders.length} reminder(s)`
  }

  if (!parts[0]) return 'Usage: rem <time> <message>  (e.g. rem 30m review PR)'

  const minutes = parseTime(parts[0])
  if (minutes <= 0) return 'Invalid time. Use: 30s, 5m, 1h, 1h30m, or plain number (minutes)'

  const message = parts.slice(1).join(' ') || 'Reminder'
  const alarmName = `rem:${message}`

  await chrome.alarms.create(alarmName, { delayInMinutes: Math.max(minutes, 0.08) })

  return `Reminder set: ${formatDelay(minutes)} — ${message}`
}
