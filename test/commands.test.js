import { registry } from '../commands/index.js'
import { run } from '../core/runner.js'
import assert from 'node:assert'

let passed = 0
let failed = 0

// --- Test 1: meta.example based tests ---
for (const [name, { run: fn, meta }] of registry) {
  if (meta.name !== name) continue // skip aliases
  if (!meta.example) continue
  if (meta.scope === 'chrome') continue // skip Chrome-only commands
  try {
    const result = await fn(meta.example.input)
    assert.strictEqual(result, meta.example.output, `${name}: expected "${meta.example.output}", got "${result}"`)
    passed++
  } catch (e) {
    console.error(`FAIL: ${name} — ${e.message}`)
    failed++
  }
}

// --- Test 2: runner integration tests ---
const runnerTests = [
  // trimArg: double space should not affect result
  ['upper  hello', 'HELLO'],
  // basic commands
  ['upper hello world', 'HELLO WORLD'],
  ['lower HELLO', 'hello'],
  ['slug Hello World!', 'hello-world'],
  ['camel hello-world', 'helloWorld'],
  ['snake helloWorld', 'hello_world'],
  ['b64 hello', 'aGVsbG8='],
  ['b64d aGVsbG8=', 'hello'],
  ['calc 2+3', '2+3 = 5'],
  ['calc 1920/1080', '1920/1080 = 1.777777778'],
  ['ascii A', "'A' → 65"],
  ['http 404', '404 Not Found'],
  ['px 16', '1rem'],
  ['chmod 755', 'rwxr-xr-x  (owner:rwx group:r-x other:r-x)'],
  ['ratio 16 9 1920', '1080'],
  ['ratio 16 9 ? 1080', '1920'],
  // validation commands (v1.1.0)
  ['rx /\\d+/g abc123def456', '2 matches\n[0] "123" @3\n[1] "456" @9'],
  ['json {"a":1}', 'Valid JSON — object (1 key)\n{\n  "a": 1\n}'],
  ['url https://example.com/path?q=1', 'protocol: https:\nhost: example.com\npath: /path\nquery:\n  q=1'],
  ['email user@example.com', 'Valid\nLocal: user\nDomain: example.com\nTLD: .com'],
  ['ip 192.168.1.1', 'Type: IPv4\nBinary: 11000000.10101000.00000001.00000001\nClass: C\nScope: Private (192.168.0.0/16)'],
  ['sv 1.2.3 2.0.0', '1.2.3 < 2.0.0'],
  // unknown command
  ['xyznonexistent', 'Unknown: "xyznonexistent" — try: ?'],
  // empty input
  ['', 'Type a command — try: ?'],
]

for (const [input, expected] of runnerTests) {
  try {
    const result = await run(input)
    assert.strictEqual(result, expected, `run("${input}"): expected "${expected}", got "${result}"`)
    passed++
  } catch (e) {
    console.error(`FAIL: run("${input}") — ${e.message}`)
    failed++
  }
}

// --- Test 3: escapeXml edge cases ---
import { escapeXml } from '../chrome/escape-xml.js'

const escapeXmlTests = [
  ['<script>', '&lt;script&gt;'],
  ['A & B', 'A &amp; B'],
  ['hello\x00world', 'helloworld'],
  ['flag \uD83C\uDDEF\uD83C\uDDF5 test', 'flag  test'],
  ['', ''],
  ['a'.repeat(1000), 'a'.repeat(1000)],
  ['say "hello"', 'say &quot;hello&quot;'],
]

for (const [input, expected] of escapeXmlTests) {
  try {
    const result = escapeXml(input)
    assert.strictEqual(result, expected, `escapeXml(${JSON.stringify(input)}): expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`)
    passed++
  } catch (e) {
    console.error(`FAIL: escapeXml — ${e.message}`)
    failed++
  }
}

// --- Test 4: sql-helpers unit tests ---
import initSqlJs from 'sql.js'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDb, queryAll, queryOne, batchInsert } from '../cli/lib/sql-helpers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const wasmPath = join(dirname(require.resolve('sql.js')), 'sql-wasm.wasm')

let SQL = null
async function getSql() {
  if (!SQL) SQL = await initSqlJs({ locateFile: () => wasmPath })
  return SQL
}

try {
  // createDb
  const db = await createDb(getSql)
  assert.ok(db, 'createDb returns a database')

  // Create table and insert
  db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)')
  batchInsert(db, 'INSERT INTO test (name, value) VALUES (?, ?)', [
    ['alpha', 10],
    ['beta', 20],
    ['gamma', 30],
  ])

  // queryAll
  const all = queryAll(db, 'SELECT name, value FROM test ORDER BY value')
  assert.strictEqual(all.length, 3, 'queryAll returns 3 rows')
  assert.strictEqual(all[0].name, 'alpha')
  assert.strictEqual(all[2].value, 30)

  // queryAll with params
  const filtered = queryAll(db, 'SELECT name FROM test WHERE value > ?', [15])
  assert.strictEqual(filtered.length, 2, 'queryAll with params filters correctly')

  // queryOne
  const one = queryOne(db, 'SELECT name FROM test WHERE value = ?', [20])
  assert.strictEqual(one.name, 'beta', 'queryOne returns single row')

  // queryOne no match
  const none = queryOne(db, 'SELECT name FROM test WHERE value = ?', [999])
  assert.strictEqual(none, null, 'queryOne returns null for no match')

  db.close()
  passed += 6
} catch (e) {
  console.error(`FAIL: sql-helpers — ${e.message}`)
  failed++
}

// --- Test 5: lt — lndfToJson unit tests ---
import { lndfToJson } from '../commands/lt.js'

const ltTests = [
  {
    name: 'basic lndf conversion',
    input: '---\nmon-tab\nbranch:main\nlast:feat: add lt command\nchanged:lt.js,index.js\nstack:chrome-ext\ntest:pass\nstatus:active development\n---',
    checks: (json) => {
      const obj = JSON.parse(json)
      assert.strictEqual(obj.name, 'mon-tab')
      assert.strictEqual(obj.branch, 'main')
      assert.deepStrictEqual(obj.changed, ['lt.js', 'index.js'])
      assert.strictEqual(obj.stack, 'chrome-ext')
      assert.strictEqual(obj.language, 'javascript')
      assert.strictEqual(obj.framework, 'vanilla')
      assert.strictEqual(obj.manifest_version, '3')
    },
  },
  {
    name: 'node stack infers defaults',
    input: '---\nmy-cli\nstack:node\n---',
    checks: (json) => {
      const obj = JSON.parse(json)
      assert.strictEqual(obj.name, 'my-cli')
      assert.strictEqual(obj.language, 'javascript')
      assert.strictEqual(obj.framework, 'none')
    },
  },
  {
    name: 'json is always larger than lndf',
    input: '---\nmon-tab\nbranch:main\nstack:chrome-ext\ntest:pass\nstatus:clean\n---',
    checks: (json) => {
      const lndfLen = '---\nmon-tab\nbranch:main\nstack:chrome-ext\ntest:pass\nstatus:clean\n---'.length
      assert.ok(json.length > lndfLen, `JSON (${json.length}) should be longer than lndf (${lndfLen})`)
    },
  },
]

for (const t of ltTests) {
  try {
    const json = lndfToJson(t.input)
    t.checks(json)
    passed++
  } catch (e) {
    console.error(`FAIL: lt/${t.name} — ${e.message}`)
    failed++
  }
}

// --- Test 6: lv backward compatibility ---
try {
  const { command: lvCommand } = await import('../commands/lv.js')
  // No args, no deps: should return .lndf or "No .lndf found" message
  const result = await lvCommand('', {})
  assert.ok(
    typeof result === 'string' && result.length > 0,
    'lv with empty arg returns a string'
  )
  passed++
} catch (e) {
  console.error(`FAIL: lv backward compat — ${e.message}`)
  failed++
}

// --- Results ---
console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
