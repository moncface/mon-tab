// Display version from manifest
const manifest = chrome.runtime.getManifest()
document.getElementById('version').textContent = `v${manifest.version}`

// Load saved setting
chrome.storage.local.get('varStorage', ({ varStorage }) => {
  const value = varStorage || 'session'
  document.querySelector(`input[name="varStorage"][value="${value}"]`).checked = true
})

// Save on change
document.querySelectorAll('input[name="varStorage"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    chrome.storage.local.set({ varStorage: e.target.value })
    setTimeout(() => window.close(), 800)
  })
})
