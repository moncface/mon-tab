import { join, parse } from 'node:path'
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { openDb, createDb, saveDb, queryAll, queryOne, batchInsert } from '../cli/lib/sql-helpers.js'

export const meta = {
  name: 'lv',
  desc: 'Show .lndf state / query hako index',
  category: 'lndf',
  usage: 'lv [--reindex | --tag <tag> | --after <date> | --stats]',
  scope: 'cli',
}

export const command = async (arg, deps = {}) => {
  // No args: existing behavior — show .lndf/current.lndf
  if (!arg) return showLndf()

  const { getSql } = deps
  const flags = parseFlags(arg)

  if (flags.reindex) return reindex(getSql)
  if (flags.tag) return searchByTag(getSql, flags.tag)
  if (flags.after) return searchByDate(getSql, flags.after)
  if (flags.stats) return showStats(getSql)

  // Unknown flag: fall back to showing .lndf
  return showLndf()
}

// --- Existing behavior ---

function showLndf() {
  let dir = process.cwd()
  while (true) {
    const lndfPath = join(dir, '.lndf', 'current.lndf')
    if (existsSync(lndfPath)) {
      return readFileSync(lndfPath, 'utf8').trim()
    }
    const parent = parse(dir).dir
    if (parent === dir) break
    dir = parent
  }
  return 'No .lndf found. Run: mon ld'
}

// --- Flag parsing ---

function parseFlags(arg) {
  const parts = arg.split(/\s+/)
  const flags = {}
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '--reindex') flags.reindex = true
    if (parts[i] === '--tag' && parts[i + 1]) flags.tag = parts[++i]
    if (parts[i] === '--after' && parts[i + 1]) flags.after = parts[++i]
    if (parts[i] === '--stats') flags.stats = true
  }
  return flags
}

// --- Index path ---

function getIndexPath() {
  return join(process.cwd(), '.mon', 'index.sqlite')
}

// --- Reindex: scan hako/ and build SQLite index ---

async function reindex(getSql) {
  if (!getSql) return 'SQLite not available. Run from CLI: mon lv --reindex'

  const hakoDir = join(process.cwd(), 'hako')
  if (!existsSync(hakoDir)) return 'No hako/ directory found'

  const entries = scanHakoDir(hakoDir)
  if (!entries.length) return 'No .md files found in hako/'

  const db = await createDb(getSql)

  db.run(`CREATE TABLE hako (
    id INTEGER PRIMARY KEY,
    filename TEXT NOT NULL,
    date TEXT,
    model TEXT,
    summary TEXT,
    source TEXT,
    type TEXT
  )`)
  db.run(`CREATE TABLE tags (
    hako_id INTEGER,
    tag TEXT NOT NULL,
    FOREIGN KEY (hako_id) REFERENCES hako(id)
  )`)
  db.run('CREATE INDEX idx_filename ON hako(filename)')
  db.run('CREATE INDEX idx_date ON hako(date)')
  db.run('CREATE INDEX idx_tag ON tags(tag)')

  const hakoRows = entries.map(e => [
    e.filename, e.date || null, e.model || null,
    e.summary || null, e.source || null, e.type || null,
  ])
  batchInsert(db,
    'INSERT INTO hako (filename, date, model, summary, source, type) VALUES (?, ?, ?, ?, ?, ?)',
    hakoRows
  )

  const tagRows = []
  entries.forEach((e, i) => {
    const id = i + 1
    ;(e.tags || []).forEach(tag => tagRows.push([id, tag]))
  })
  if (tagRows.length) {
    batchInsert(db, 'INSERT INTO tags (hako_id, tag) VALUES (?, ?)', tagRows)
  }

  const indexPath = getIndexPath()
  const monDir = join(process.cwd(), '.mon')
  if (!existsSync(monDir)) mkdirSync(monDir, { recursive: true })
  saveDb(db, indexPath)
  db.close()

  return `Index rebuilt: ${entries.length} files, ${tagRows.length} tags → ${indexPath}`
}

// --- Scan hako/ for .md files with frontmatter ---

function scanHakoDir(hakoDir) {
  const files = readdirSync(hakoDir).filter(f => f.endsWith('.md'))
  return files.map(f => {
    const content = readFileSync(join(hakoDir, f), 'utf8')
    const fm = parseFrontmatter(content)
    return { filename: f, ...fm }
  })
}

// --- Simple YAML frontmatter parser (no yaml dependency) ---

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const block = match[1]
  const result = {}

  for (const line of block.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (!m) continue
    const [, key, raw] = m
    const val = raw.trim()

    if (key === 'tags') {
      // Parse [tag1, tag2] or tag1, tag2
      const inner = val.replace(/^\[|\]$/g, '')
      result.tags = inner.split(',').map(t => t.trim()).filter(Boolean)
    } else {
      result[key] = val
    }
  }
  return result
}

// --- Tag search ---

async function searchByTag(getSql, tag) {
  if (!getSql) return 'SQLite not available'
  const db = await openDb(getSql, getIndexPath())
  if (!db) return 'No index found. Run: mon lv --reindex'
  try {
    const results = queryAll(db,
      `SELECT h.filename, h.date, h.summary
       FROM hako h JOIN tags t ON h.id = t.hako_id
       WHERE t.tag = ? COLLATE NOCASE
       ORDER BY h.date DESC`,
      [tag]
    )
    if (!results.length) return `No results for tag "${tag}"`
    return results.map(r =>
      `${r.date || '----'} ${r.filename}${r.summary ? ' — ' + r.summary : ''}`
    ).join('\n')
  } finally {
    db.close()
  }
}

// --- Date search ---

async function searchByDate(getSql, after) {
  if (!getSql) return 'SQLite not available'
  const db = await openDb(getSql, getIndexPath())
  if (!db) return 'No index found. Run: mon lv --reindex'
  try {
    const results = queryAll(db,
      `SELECT filename, date, summary FROM hako
       WHERE date >= ? ORDER BY date DESC`,
      [after]
    )
    if (!results.length) return `No results after ${after}`
    return results.map(r =>
      `${r.date || '----'} ${r.filename}${r.summary ? ' — ' + r.summary : ''}`
    ).join('\n')
  } finally {
    db.close()
  }
}

// --- Stats ---

async function showStats(getSql) {
  if (!getSql) return 'SQLite not available'
  const db = await openDb(getSql, getIndexPath())
  if (!db) return 'No index found. Run: mon lv --reindex'
  try {
    const total = queryOne(db, 'SELECT COUNT(*) as c FROM hako')
    const tags = queryAll(db,
      'SELECT tag, COUNT(*) as c FROM tags GROUP BY tag ORDER BY c DESC LIMIT 20'
    )
    let output = `Total: ${total.c} files\n`
    if (tags.length) {
      output += '\nTop tags:\n'
      tags.forEach(t => { output += `  ${t.tag}: ${t.c}\n` })
    }
    return output.trim()
  } finally {
    db.close()
  }
}
