import { distill } from './ld.js'

export const meta = {
  name: 'lc',
  desc: '.lndf distillation + clipboard copy',
  category: 'lndf',
  usage: 'lc',
  scope: 'cli',
}

export const command = async () => {
  const { content, error } = await distill()
  if (error) return error

  try {
    const cp = await import('node:child_process')
    const platform = process.platform
    if (platform === 'win32') {
      cp.execSync('clip', { input: content, encoding: 'utf8' })
    } else if (platform === 'darwin') {
      cp.execSync('pbcopy', { input: content, encoding: 'utf8' })
    } else {
      try {
        cp.execSync('xclip -selection clipboard', { input: content, encoding: 'utf8' })
      } catch {
        cp.execSync('xsel --clipboard --input', { input: content, encoding: 'utf8' })
      }
    }
    return content + '\n\n(Copied to clipboard)'
  } catch {
    return content + '\n\n(Clipboard copy failed)'
  }
}
