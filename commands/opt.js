export const meta = {
  name: 'opt',
  desc: 'Open settings',
  category: 'system',
  usage: 'opt',
  scope: 'chrome',
}

export const command = async () => {
  await chrome.action.setPopup({ popup: 'chrome/options.html' })
  await chrome.action.openPopup()
  chrome.action.setPopup({ popup: '' })
  return 'Opening settings...'
}
