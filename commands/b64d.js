export const meta = {
  name: 'b64d',
  desc: 'Base64 decode',
  category: 'encoding',
  usage: 'b64d <text>',
  scope: 'universal',
  example: { input: 'aGVsbG8=', output: 'hello' },
}

export const command = (t) => {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0)))
  } catch {
    return '(invalid base64)'
  }
}
