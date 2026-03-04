const commands = {
  uuid:  ()  => crypto.randomUUID(),
  ts:    ()  => String(Math.floor(Date.now() / 1000)),
  now:   ()  => new Date().toISOString(),
  upper: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  slug:  (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  b64:   (t) => btoa(unescape(encodeURIComponent(t))),
  b64d:  (t) => { try { return decodeURIComponent(escape(atob(t))) } catch { return '(invalid base64)' } },
  pw:    (n) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const len = Math.min(Math.max(parseInt(n) || 16, 4), 128)
    return Array.from(crypto.getRandomValues(new Uint8Array(len)), b => chars[b % chars.length]).join('')
  },
  zip: async (code) => {
    if (!code) return 'Usage: zip <postal-code>  e.g. zip 150-0001'
    const normalized = code.replace(/-/g, '')
    if (!/^\d{7}$/.test(normalized)) return 'Expected 7 digits  e.g. zip 1500001'
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalized}`)
    const data = await res.json()
    if (!data.results) return `Not found: ${code}`
    const r = data.results[0]
    return `${r.address1}${r.address2}${r.address3}`
  },
  '?': () => 'uuid  pw [n]  b64 <text>  b64d <text>  ts  now  upper <text>  lower <text>  slug <text>  zip <postal-code>',
}

async function run(input) {
  if (!input.trim()) return 'Type a command — try: ?'
  const [cmd, ...rest] = input.trim().split(/\s+/)
  const fn = commands[cmd]
  if (!fn) return `Unknown: "${cmd}" — try: ?`
  return (await fn(rest.join(' '))) || '(empty result)'
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  run(text).then(result => {
    chrome.omnibox.setDefaultSuggestion({ description: escapeXml(result) })
  })
})

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const result = await run(text)
  await copyToClipboard(result)
})

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
