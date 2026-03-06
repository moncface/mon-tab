const lengthSlider = document.getElementById('length')
const lengthValue = document.getElementById('length-value')
const passwordEl = document.getElementById('password')
const upperCheck = document.getElementById('uppercase')
const lowerCheck = document.getElementById('lowercase')
const numbersCheck = document.getElementById('numbers')
const symbolsCheck = document.getElementById('symbols')

function getConfig() {
  return {
    length: parseInt(lengthSlider.value),
    uppercase: upperCheck.checked,
    lowercase: lowerCheck.checked,
    numbers: numbersCheck.checked,
    symbols: symbolsCheck.checked
  }
}

function generate() {
  const config = getConfig()
  let chars = ''
  if (config.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (config.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (config.numbers) chars += '0123456789'
  if (config.symbols) chars += '!@#$%^&*'
  if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

  const len = Math.min(Math.max(config.length, 4), 128)
  passwordEl.textContent = Array.from(
    crypto.getRandomValues(new Uint8Array(len)),
    b => chars[b % chars.length]
  ).join('')
}

function saveConfig() {
  try { chrome.storage.local.set({ pwConfig: getConfig() }) } catch {}
}

function onConfigChange() {
  lengthValue.textContent = lengthSlider.value
  generate()
  saveConfig()
}

// Load saved config
chrome.storage.local.get('pwConfig', ({ pwConfig }) => {
  if (pwConfig) {
    lengthSlider.value = pwConfig.length || 16
    lengthValue.textContent = lengthSlider.value
    upperCheck.checked = pwConfig.uppercase !== false
    lowerCheck.checked = pwConfig.lowercase !== false
    numbersCheck.checked = pwConfig.numbers !== false
    symbolsCheck.checked = pwConfig.symbols !== false
  }
  generate()
})

// Events
lengthSlider.addEventListener('input', onConfigChange)
upperCheck.addEventListener('change', onConfigChange)
lowerCheck.addEventListener('change', onConfigChange)
numbersCheck.addEventListener('change', onConfigChange)
symbolsCheck.addEventListener('change', onConfigChange)

document.getElementById('regenerate').addEventListener('click', generate)

document.getElementById('copy').addEventListener('click', async () => {
  const btn = document.getElementById('copy')
  try {
    await navigator.clipboard.writeText(passwordEl.textContent)
    btn.classList.add('copied')
    setTimeout(() => window.close(), 800)
  } catch {}
})
