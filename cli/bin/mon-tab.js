#!/usr/bin/env node
import { run } from '../../core/runner.js'

const input = process.argv.slice(2).join(' ')

if (!input) {
  console.log('Mon [tab] CLI — developer tools in your terminal')
  console.log('Usage: mon <command> [args]')
  console.log('       mon ? — list all commands')
  console.log('       mon uuid — generate UUID')
  console.log('       mon b64 hello — Base64 encode')
  console.log('       mon calc 1920/1080 — evaluate expression')
  process.exit(0)
}

try {
  const result = await run(input)
  console.log(result)
} catch (e) {
  if (e instanceof ReferenceError && e.message.includes('chrome')) {
    console.error(`"${input.split(' ')[0]}" is a Chrome-only command`)
  } else {
    console.error(`Error: ${e.message}`)
  }
  process.exit(1)
}
