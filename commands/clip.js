export const meta = {
  name: 'clip',
  desc: 'Read clipboard content',
  category: 'system',
  usage: 'clip',
  scope: 'cli',
}

export const command = async () => {
  const cp = await import('node:child_process')
  const platform = process.platform

  let result
  try {
    if (platform === 'win32') {
      result = cp.execSync('powershell -command "Get-Clipboard"', { encoding: 'utf-8' })
    } else if (platform === 'darwin') {
      result = cp.execSync('pbpaste', { encoding: 'utf-8' })
    } else {
      try {
        result = cp.execSync('xclip -selection clipboard -o', { encoding: 'utf-8' })
      } catch {
        result = cp.execSync('xsel --clipboard --output', { encoding: 'utf-8' })
      }
    }
  } catch {
    return 'Error: Could not read clipboard.'
  }

  if (!result || !result.trim()) return '(clipboard is empty)'
  return result
}
