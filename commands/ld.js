export const meta = {
  name: 'ld',
  desc: '.lndf distillation (generate project snapshot)',
  category: 'lndf',
  usage: 'ld',
  scope: 'cli',
}

export async function distill() {
  const fs = await import('node:fs')
  const path = await import('node:path')
  const cp = await import('node:child_process')

  function findRoot() {
    let dir = process.cwd()
    while (true) {
      if (fs.existsSync(path.join(dir, '.git')) ||
          fs.existsSync(path.join(dir, 'package.json'))) return dir
      const parent = path.parse(dir).dir
      if (parent === dir) return null
      dir = parent
    }
  }

  function git(cmd) {
    try {
      return cp.execSync(cmd, { cwd: root, encoding: 'utf8', timeout: 5000 }).trim()
    } catch { return '' }
  }

  function detectStack(pkg) {
    const parts = []
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    if (deps.react || deps['react-dom']) parts.push('react')
    if (deps.next) parts.push('next')
    if (deps.vue) parts.push('vue')
    if (deps.svelte) parts.push('svelte')
    if (deps.express) parts.push('express')
    if (deps.typescript || deps['ts-node']) parts.push('ts')
    const manifestPath = path.join(root, 'manifest.json')
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        if (m.manifest_version) parts.push('chrome-ext')
      } catch {}
    }
    if (parts.length === 0) parts.push('node')
    return parts.join(',')
  }

  function getTestResult(pkg) {
    if (!pkg || !pkg.scripts || !pkg.scripts.test) return null
    try {
      cp.execSync('npm test', { cwd: root, timeout: 30000, stdio: 'pipe' })
      return { test: 'pass' }
    } catch (e) {
      if (e.killed) return { test: 'timeout' }
      const stderr = e.stderr ? e.stderr.toString().trim() : ''
      const lastLines = stderr.split('\n').slice(-3).join(' ').trim()
      return { test: 'fail', error: lastLines || null }
    }
  }

  const root = findRoot()
  if (!root) return { content: null, error: 'Not in a project (no .git or package.json found)' }

  // Git info
  const branch = git('git rev-parse --abbrev-ref HEAD')
  const lastCommit = git('git log -1 --format=%s')

  // Changed files: staged + unstaged + untracked
  const diff = git('git diff --name-only HEAD')
  const untracked = git('git ls-files --others --exclude-standard')
  let changedList = [...new Set([
    ...diff.split('\n'),
    ...untracked.split('\n'),
  ])].filter(Boolean)

  // Fallback: last commit's files if nothing currently changed
  if (changedList.length === 0) {
    changedList = git('git diff --name-only HEAD~1..HEAD')
      .split('\n').filter(Boolean)
  }
  const changed = changedList.join(',')

  // WIP: branch name if not main/master/develop
  let wip = ''
  if (branch && !['main', 'master', 'develop'].includes(branch)) {
    wip = branch
  }

  // Project name + stack from package.json
  let projectName = path.basename(root)
  let stack = ''
  let pkg = null
  const pkgPath = path.join(root, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      if (pkg.name) projectName = pkg.name
      stack = detectStack(pkg)
    } catch {}
  }

  // Test result
  const testResult = getTestResult(pkg)

  // Status: test:fail/timeout overrides all
  const status = (testResult && (testResult.test === 'fail' || testResult.test === 'timeout'))
    ? 'debugging'
    : changedList.length > 0 ? 'active development' : 'clean'

  // Build .lndf content
  const lines = ['---', projectName]
  if (branch)    lines.push(`branch:${branch}`)
  if (lastCommit) lines.push(`last:${lastCommit}`)
  if (changed)   lines.push(`changed:${changed}`)
  if (wip)       lines.push(`wip:${wip}`)
  if (stack)     lines.push(`stack:${stack}`)
  if (testResult) {
    lines.push(`test:${testResult.test}`)
    if (testResult.error) lines.push(`error:${testResult.error}`)
  }
  lines.push(`status:${status}`)
  lines.push('---')
  const content = lines.join('\n')

  // Write .lndf/current.lndf + history snapshot
  const lndfDir = path.join(root, '.lndf')
  const historyDir = path.join(lndfDir, 'history')
  fs.mkdirSync(historyDir, { recursive: true })
  fs.writeFileSync(path.join(lndfDir, 'current.lndf'), content + '\n')

  const ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)
  fs.writeFileSync(path.join(historyDir, `${ts}.lndf`), content + '\n')

  return { content, error: null }
}

export const command = async () => {
  const { content, error } = await distill()
  return error || content
}
