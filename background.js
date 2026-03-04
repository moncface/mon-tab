// All commands receive a single string argument (everything after the command word).
// Async commands are supported — run() awaits all results.
const commands = {

  // --- Generators ---
  uuid:  ()  => crypto.randomUUID(),
  pw:    (n) => {
    // Secure random password. Length 4–128, default 16.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const len = Math.min(Math.max(parseInt(n) || 16, 4), 128)
    return Array.from(crypto.getRandomValues(new Uint8Array(len)), b => chars[b % chars.length]).join('')
  },
  sha: async (t) => {
    // SHA-256 hex digest via Web Crypto API
    if (!t) return 'Usage: sha <text>'
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  },
  lorem: (n) => {
    // Returns n sentences of Lorem ipsum placeholder text (max 5)
    const s = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    ]
    return s.slice(0, Math.min(Math.max(parseInt(n) || 1, 1), 5)).join(' ')
  },

  // --- Encoding ---
  b64:   (t) => btoa(unescape(encodeURIComponent(t))),
  b64d:  (t) => { try { return decodeURIComponent(escape(atob(t))) } catch { return '(invalid base64)' } },
  jwt:   (t) => {
    // Decodes the payload section of a JWT (no signature verification)
    try {
      const p = t.split('.')[1]
      if (!p) return '(invalid JWT)'
      return JSON.stringify(JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))))
    } catch { return '(invalid JWT)' }
  },

  // --- Time ---
  ts:    ()  => String(Math.floor(Date.now() / 1000)),
  now:   ()  => new Date().toISOString(),
  cal: (t) => {
    // Day of week for a given date, or today if no argument.
    // T12:00:00 avoids UTC midnight off-by-one in local timezones.
    const d = t ? new Date(t + 'T12:00:00') : new Date()
    if (isNaN(d)) return 'Invalid date  e.g. cal 2026-03-15'
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  },
  age: (t) => {
    // Age in years from a birthdate (YYYY-MM-DD)
    if (!t) return 'Usage: age <YYYY-MM-DD>'
    const birth = new Date(t + 'T12:00:00')
    if (isNaN(birth)) return 'Invalid date  e.g. age 1990-05-01'
    const now = new Date()
    let a = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) a--
    return `${a} years old`
  },

  // --- String transforms ---
  upper: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  slug:  (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  camel: (t) => t.trim().split(/[-_\s]+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
  snake: (t) => t.trim().replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase(),
  wc: (t) => {
    if (!t) return 'Usage: wc <text>'
    return `${t.trim().split(/\s+/).length} words, ${t.length} chars`
  },

  // --- CSS / units ---
  px: (t) => {
    // Converts px → rem or rem → px assuming 16px base font size
    if (!t) return 'Usage: px <value>  e.g. px 24  or  px 1.5rem'
    if (t.endsWith('rem')) { const r = parseFloat(t); return isNaN(r) ? 'Invalid' : `${r * 16}px` }
    const n = parseFloat(t); return isNaN(n) ? 'Invalid' : `${+(n / 16).toFixed(4)}rem`
  },

  // --- Dictionary lookups (local, no network) ---
  ascii: (t) => {
    // Converts char → decimal code, or decimal → char. Multiple chars show a table.
    if (!t) return 'Usage: ascii <char or number>  e.g. ascii A  or  ascii 65'
    const n = parseInt(t)
    if (!isNaN(n) && String(n) === t.trim()) {
      if (n < 0 || n > 127) return 'Out of ASCII range (0–127)'
      return `${n} → '${String.fromCharCode(n)}'`
    }
    if (t.length === 1) return `'${t}' → ${t.charCodeAt(0)}`
    return t.split('').map(c => `${c}=${c.charCodeAt(0)}`).join('  ')
  },
  http: (code) => {
    const codes = {
      100:'Continue', 101:'Switching Protocols', 102:'Processing',
      200:'OK', 201:'Created', 202:'Accepted', 204:'No Content', 206:'Partial Content',
      301:'Moved Permanently', 302:'Found', 303:'See Other', 304:'Not Modified',
      307:'Temporary Redirect', 308:'Permanent Redirect',
      400:'Bad Request', 401:'Unauthorized', 403:'Forbidden', 404:'Not Found',
      405:'Method Not Allowed', 408:'Request Timeout', 409:'Conflict', 410:'Gone',
      413:'Payload Too Large', 415:'Unsupported Media Type', 422:'Unprocessable Entity',
      429:'Too Many Requests',
      500:'Internal Server Error', 501:'Not Implemented', 502:'Bad Gateway',
      503:'Service Unavailable', 504:'Gateway Timeout',
    }
    if (!code) return 'Usage: http <code>  e.g. http 404'
    const n = parseInt(code)
    return codes[n] ? `${n} ${codes[n]}` : `Unknown: ${code}`
  },
  port: (p) => {
    const ports = {
      20:'FTP data', 21:'FTP control', 22:'SSH', 23:'Telnet', 25:'SMTP',
      53:'DNS', 80:'HTTP', 110:'POP3', 143:'IMAP', 443:'HTTPS',
      465:'SMTPS', 587:'SMTP submission', 993:'IMAPS', 995:'POP3S',
      3000:'Node.js (dev)', 3306:'MySQL', 5000:'Flask (dev)', 5432:'PostgreSQL',
      5672:'AMQP / RabbitMQ', 6379:'Redis', 8000:'Django (dev)', 8080:'HTTP alt',
      8443:'HTTPS alt', 9200:'Elasticsearch', 27017:'MongoDB',
    }
    if (!p) return 'Usage: port <number>  e.g. port 443'
    const n = parseInt(p)
    return ports[n] ? `${n} — ${ports[n]}` : `Unknown: ${p}`
  },
  mime: (ext) => {
    const types = {
      html:'text/html', htm:'text/html', css:'text/css',
      js:'application/javascript', mjs:'application/javascript', ts:'application/typescript',
      json:'application/json', xml:'application/xml', txt:'text/plain',
      csv:'text/csv', md:'text/markdown', pdf:'application/pdf',
      png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif',
      webp:'image/webp', svg:'image/svg+xml', ico:'image/x-icon', avif:'image/avif',
      mp3:'audio/mpeg', wav:'audio/wav', ogg:'audio/ogg',
      mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime',
      woff:'font/woff', woff2:'font/woff2', ttf:'font/ttf',
      zip:'application/zip', gz:'application/gzip', tar:'application/x-tar',
      wasm:'application/wasm',
    }
    if (!ext) return 'Usage: mime <ext>  e.g. mime png'
    const key = ext.toLowerCase().replace(/^\./, '')
    return types[key] ? `${key} → ${types[key]}` : `Unknown: ${ext}`
  },
  chmod: (octal) => {
    // Converts octal permission string to symbolic notation (e.g. 755 → rwxr-xr-x)
    if (!octal) return 'Usage: chmod <octal>  e.g. chmod 755'
    if (!/^[0-7]{3,4}$/.test(octal)) return 'Expected 3–4 octal digits  e.g. chmod 755'
    const bits = octal.length === 4 ? octal.slice(1) : octal
    const map = ['---','--x','-w-','-wx','r--','r-x','rw-','rwx']
    const sym = bits.split('').map(d => map[parseInt(d)]).join('')
    return `${sym}  (owner:${map[parseInt(bits[0])]} group:${map[parseInt(bits[1])]} other:${map[parseInt(bits[2])]})`
  },

  // --- Lookup (API) ---
  zip: async (code) => {
    // Japanese postal code → address via zipcloud.ibsnet.co.jp (free, no key)
    if (!code) return 'Usage: zip <postal-code>  e.g. zip 150-0001'
    const normalized = code.replace(/-/g, '')
    if (!/^\d{7}$/.test(normalized)) return 'Expected 7 digits  e.g. zip 1500001'
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalized}`)
    const data = await res.json()
    if (!data.results) return `Not found: ${code}`
    const r = data.results[0]
    return `${r.address1}${r.address2}${r.address3}`
  },

  '?': () => 'uuid  pw [n]  sha  b64  b64d  jwt  ts  now  cal [date]  age <date>  upper  lower  slug  camel  snake  lorem [n]  wc  px <n>  ascii <c>  http <code>  port <n>  mime <ext>  chmod <octal>  zip <postal>',
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
