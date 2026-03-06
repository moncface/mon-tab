/**
 * Mon [tab] command template
 * 1. Copy this file → commands/your-command.js
 * 2. Fill in meta + command
 * 3. Add to commands/index.js modules array
 * 4. Done!
 */
export const meta = {
  name: 'your-command',
  desc: 'What it does (shown in help)',
  category: 'other',           // generators | encoding | time | string | math | css | dict | geo | lookup | variable | system
  usage: 'your-command <arg>',
  example: { input: 'test', output: 'expected' },
  scope: 'universal',          // universal | chrome | cli
}

export const command = (arg) => {
  // Your logic here
  // Input:  arg (string, may be empty)
  // Output: result string
  return arg
}
