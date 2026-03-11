export const meta = {
  name: 'lv',
  desc: 'Show .lndf distillation state',
  category: 'lndf',
  usage: 'lv',
  scope: 'cli',
}

export const command = async () => {
  const fs = await import('node:fs')
  const path = await import('node:path')

  let dir = process.cwd()
  while (true) {
    const lndfPath = path.join(dir, '.lndf', 'current.lndf')
    if (fs.existsSync(lndfPath)) {
      return fs.readFileSync(lndfPath, 'utf8').trim()
    }
    const parent = path.parse(dir).dir
    if (parent === dir) break
    dir = parent
  }
  return 'No .lndf found. Run: mon ld'
}
