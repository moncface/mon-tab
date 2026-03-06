export const meta = {
  name: 'pw',
  desc: 'Generate secure password',
  category: 'generators',
  usage: 'pw [length] [charset]',
  scope: 'universal',
}

export const command = async (arg) => {
  const parts = arg.trim().split(/\s+/)

  // pw set → open popup
  if (parts[0] === 'set') {
    const win = await chrome.windows.getCurrent()
    const left = Math.round((win.left || 0) + (win.width || 1200) - 520)
    const top = (win.top || 0) + 100
    await chrome.windows.create({
      url: chrome.runtime.getURL('chrome/pw-generator.html'),
      type: 'popup',
      width: 480,
      height: 400,
      top, left
    })
    return 'Opening password settings...'
  }

  // Load saved config
  let config = { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }
  try {
    const { pwConfig } = await chrome.storage.local.get('pwConfig')
    if (pwConfig) config = { ...config, ...pwConfig }
  } catch {}

  // Parse args: pw [length] [charset]
  const len = parseInt(parts[0]) || config.length
  const charset = parts[1]?.toLowerCase()

  if (charset === 'n') {
    config = { ...config, uppercase: false, lowercase: false, numbers: true, symbols: false }
  } else if (charset === 'a') {
    config = { ...config, uppercase: true, lowercase: true, numbers: false, symbols: false }
  } else if (charset === 'an') {
    config = { ...config, uppercase: true, lowercase: true, numbers: true, symbols: false }
  }

  return generate(config, len)
}

function generate(config, len) {
  let chars = ''
  if (config.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (config.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (config.numbers) chars += '0123456789'
  if (config.symbols) chars += '!@#$%^&*'
  if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

  const finalLen = Math.min(Math.max(len, 4), 128)
  return Array.from(crypto.getRandomValues(new Uint8Array(finalLen)), b => chars[b % chars.length]).join('')
}
