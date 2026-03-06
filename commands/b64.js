export const meta = {
  name: 'b64',
  desc: 'Base64 encode',
  category: 'encoding',
  usage: 'b64 <text>',
  scope: 'universal',
  example: { input: 'hello', output: 'aGVsbG8=' },
}

export const command = (t) => btoa(String.fromCharCode(...new TextEncoder().encode(t)))
