// Open options page in a small popup window
export const command = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  const left = Math.round((currentWindow.left || 0) + (currentWindow.width || 1200) - 520)
  const top = (currentWindow.top || 0) + 100
  await chrome.windows.create({
    url: chrome.runtime.getURL('options.html'),
    type: 'popup',
    width: 480,
    height: 600,
    top,
    left
  })
  return 'Opening settings...'
}
