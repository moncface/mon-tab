#!/usr/bin/env node
import { run } from '../../core/runner.js'
import { registry } from '../../commands/index.js'
import { initFileStorage } from '../../commands/var-store.js'
import { setEvaluator } from '../../commands/calc.js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'

// Inject Node.js file I/O into var-store (shared module has zero node:* imports)
const persistentDir = join(homedir(), '.mon-tab')
initFileStorage({
  readFileSync, writeFileSync, mkdirSync,
  sessionPath: join(tmpdir(), 'mon-tab-session.json'),
  persistentDir,
  persistentPath: join(persistentDir, 'persistent.json'),
})

// Inject math.js evaluator into calc (Chrome uses built-in parser)
try {
  const { evaluate } = await import('mathjs')
  setEvaluator(evaluate)
} catch {}

// Register real CLI-only commands (stubs in index.js for Chrome safety)
const [ldMod, lvMod, lcMod] = await Promise.all([
  import('../../commands/ld.js'),
  import('../../commands/lv.js'),
  import('../../commands/lc.js'),
])
for (const [name, mod] of [['ld', ldMod], ['lv', lvMod], ['lc', lcMod]]) {
  registry.set(name, { run: mod.command, meta: { name, ...mod.meta } })
}

const flag = process.argv[2]

if (flag === '--version' || flag === '-v') {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
  console.log(pkg.version)
  process.exit(0)
}

function usage() {
  console.log('Mon [tab] CLI — developer tools in your terminal')
  console.log('Usage: mon <command> [args]')
  console.log('       mon ? — list all commands')
  console.log('       mon uuid — generate UUID')
  console.log('       mon b64 hello — Base64 encode')
  console.log('       mon calc 1920/1080 — evaluate expression')
  console.log('       echo "b64 hello" | mon — pipe stdin')
  process.exit(0)
}

if (flag === '--help' || flag === '-h') usage()

let input

if (process.argv.length > 2) {
  input = process.argv.slice(2).join(' ')
} else if (!process.stdin.isTTY) {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  input = Buffer.concat(chunks).toString().trim()
  if (!input) {
    console.error('No input')
    process.exit(1)
  }
} else {
  usage()
}

try {
  const result = await run(input)
  if (result.startsWith('Unknown:')) {
    console.error(result)
    process.exit(1)
  }
  console.log(result)
} catch (e) {
  if (e instanceof ReferenceError && e.message.includes('chrome')) {
    console.error(`"${input.split(' ')[0]}" is a Chrome-only command`)
  } else {
    console.error(`Error: ${e.message}`)
  }
  process.exit(1)
}
