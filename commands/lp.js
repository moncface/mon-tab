export const meta = {
  name: 'lp',
  desc: 'Manage cross-project source collections',
  category: 'lndf',
  usage: 'lp <create|add|view|dump|list> [name] [path]',
  scope: 'cli',
  noSubstitute: true,
}

// Parse source paths from project file content (lines starting with "- ")
function parseSourcePaths(content) {
  return content.split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
}

// Read first meaningful lines from a source file for preview
function preview(fs, filePath, maxLines = 3) {
  try {
    const text = fs.readFileSync(filePath, 'utf8').trim()
    const lines = text.split('\n').slice(0, maxLines)
    return lines.join(' ').slice(0, 120)
  } catch {
    return '(file not found)'
  }
}

export const command = async (arg) => {
  const fs = await import('node:fs')
  const path = await import('node:path')
  const os = await import('node:os')

  const monDir = path.join(os.homedir(), '.mon')
  const projectsDir = path.join(monDir, 'projects')
  const sourceDir = path.join(monDir, 'source')

  // Auto-create directories
  fs.mkdirSync(projectsDir, { recursive: true })
  fs.mkdirSync(sourceDir, { recursive: true })

  const parts = arg.trim().split(/\s+/)
  const sub = parts[0]
  const name = parts[1]

  if (!sub) return 'Usage: lp <create|add|view|dump|list> [name] [path]'

  // --- lp create <name> ---
  if (sub === 'create') {
    if (!name) return 'Usage: lp create <name>'
    const filePath = path.join(projectsDir, `${name}.md`)
    if (fs.existsSync(filePath)) return `Already exists: ${name}`
    const today = new Date().toISOString().slice(0, 10)
    const content = `---\nname: ${name}\ncreated: ${today}\nstatus: draft\n---\n`
    fs.writeFileSync(filePath, content)
    return `Created: ${name}`
  }

  // --- lp add <name> <path> ---
  if (sub === 'add') {
    const rawPath = parts.slice(2).join(' ')
    if (!name || !rawPath) return 'Usage: lp add <name> <path>'
    const projPath = path.join(projectsDir, `${name}.md`)
    if (!fs.existsSync(projPath)) return `Project not found: ${name}`
    const absPath = path.resolve(rawPath)
    if (!fs.existsSync(absPath)) return `File not found: ${absPath}`

    // Check for duplicates
    const content = fs.readFileSync(projPath, 'utf8')
    const existing = parseSourcePaths(content)
    if (existing.includes(absPath)) return `Already added: ${absPath}`

    fs.appendFileSync(projPath, `\n- ${absPath}`)
    return `Added to ${name}: ${absPath}`
  }

  // --- lp view <name> ---
  if (sub === 'view') {
    if (!name) return 'Usage: lp view <name>'
    const projPath = path.join(projectsDir, `${name}.md`)
    if (!fs.existsSync(projPath)) return `Project not found: ${name}`
    const content = fs.readFileSync(projPath, 'utf8')
    const paths = parseSourcePaths(content)

    // Extract status from frontmatter
    const statusMatch = content.match(/^status:\s*(.+)$/m)
    const status = statusMatch ? statusMatch[1] : 'unknown'

    if (!paths.length) return `${name} (${status}, 0 source)`

    const lines = [`${name} (${status}, ${paths.length} source)\n`]
    paths.forEach((p, i) => {
      const basename = path.basename(p)
      lines.push(`  ${i + 1}. ${basename}`)
      lines.push(`     ${preview(fs, p)}`)
    })
    return lines.join('\n')
  }

  // --- lp dump <name> ---
  if (sub === 'dump') {
    if (!name) return 'Usage: lp dump <name>'
    const projPath = path.join(projectsDir, `${name}.md`)
    if (!fs.existsSync(projPath)) return `Project not found: ${name}`
    const content = fs.readFileSync(projPath, 'utf8')
    const paths = parseSourcePaths(content)

    if (!paths.length) return `${name}: no source`

    const sections = [`=== ${name} (${paths.length} source) ===\n`]
    paths.forEach((p, i) => {
      const basename = path.basename(p)
      sections.push(`--- source ${i + 1}: ${basename} ---`)
      try {
        sections.push(fs.readFileSync(p, 'utf8').trim())
      } catch {
        sections.push('(file not found)')
      }
      sections.push('')
    })
    return sections.join('\n').trim()
  }

  // --- lp list ---
  if (sub === 'list') {
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
    if (!files.length) return 'No projects. Create one: lp create <name>'

    const lines = [`Projects (~/.mon/projects/):\n`]
    files.forEach((f, i) => {
      const projName = f.replace(/\.md$/, '')
      const content = fs.readFileSync(path.join(projectsDir, f), 'utf8')
      const paths = parseSourcePaths(content)
      const statusMatch = content.match(/^status:\s*(.+)$/m)
      const status = statusMatch ? statusMatch[1] : 'unknown'
      lines.push(`  ${i + 1}. ${projName}  (${status}, ${paths.length} source)`)
    })
    return lines.join('\n')
  }

  return 'Usage: lp <create|add|view|dump|list> [name] [path]'
}
