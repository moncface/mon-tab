import { run } from './core/runner.js'

// --- Chrome Omnibox ---
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
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
    url: chrome.runtime.getURL('offscreen.html'),
    reasons: ['CLIPBOARD'],
    justification: 'Copy command result to clipboard',
  }).catch(() => {}) // already open = fine
  await chrome.runtime.sendMessage({ type: 'copy', text })
  setTimeout(() => chrome.offscreen.closeDocument().catch(() => {}), 300)
}

function escapeXml(s) {
  return String(s)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uD800-\uDFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
