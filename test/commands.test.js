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

// --- Results ---
console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
