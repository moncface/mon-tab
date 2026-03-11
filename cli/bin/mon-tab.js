#!/usr/bin/env node
import { run } from '../../core/runner.js'

let input

if (process.argv.length > 2) {
  // Args exist — use them, never touch stdin
  input = process.argv.slice(2).join(' ')
} else if (!process.stdin.isTTY) {
  // No args + stdin is piped — read stdin
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
  // No args + TTY — show usage
  console.log('Mon [tab] CLI — developer tools in your terminal')
  console.log('Usage: mon <command> [args]')
  console.log('       mon ? — list all commands')
  console.log('       mon uuid — generate UUID')
  console.log('       mon b64 hello — Base64 encode')
  console.log('       mon calc 1920/1080 — evaluate expression')
  console.log('       echo "hello" | mon b64 — pipe stdin')
  process.exit(0)
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
