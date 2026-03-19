import { run } from './core/runner.js'
import { escapeXml } from './chrome/escape-xml.js'

// --- Chrome Omnibox ---
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const cmd = text.trim().split(/\s+/)[0]
  // Skip side-effect commands during preview (only execute on Enter)
  if (cmd === 'rem') {
    const parts = text.trim().split(/\s+/).slice(1)
    let desc = 'rem <time> <message>'
    if (parts[0] === 'ls' || parts[0] === 'list') desc = 'List active reminders'
    else if (parts[0] === 'clear') desc = 'Clear all reminders'
    else if (parts.length >= 2) desc = `Reminder: ${parts[0]} — ${parts.slice(1).join(' ')}`
    chrome.omnibox.setDefaultSuggestion({ description: escapeXml(desc) })
    return
  }
  run(text).then(result => {
    chrome.omnibox.setDefaultSuggestion({ description: escapeXml(result) })
  })
})

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const result = await run(text)
  await copyToClipboard(result)
})

// --- Chrome-specific utilities ---
async function copyToClipboard(text) {
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('chrome/offscreen.html'),
    reasons: ['CLIPBOARD'],
    justification: 'Copy command result to clipboard',
  }).catch(() => {}) // already open = fine
  await chrome.runtime.sendMessage({ type: 'copy', text })
  setTimeout(() => chrome.offscreen.closeDocument().catch(() => {}), 300)
}

// --- Reminder notifications ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('rem:')) return
  const message = alarm.name.replace('rem:', '')
  chrome.notifications.create(alarm.name, {
    type: 'basic',
    title: 'Mon [tab] Reminder',
    message,
    iconUrl: 'icons/icon128.png',
  })
})

