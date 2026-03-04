chrome.runtime.onMessage.addListener(({ type, text }) => {
  if (type !== 'copy') return
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
})
