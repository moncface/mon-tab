export const meta = {
  name: '?',
  desc: 'List all commands',
  category: 'system',
  usage: '? [category]',
  scope: 'universal',
}

// commandList is injected after registry is built (avoids circular import)
let _commandList = []
export function setCommandList(list) { _commandList = list }

export const command = (arg) => {
  const list = arg
    ? _commandList.filter(c => c.category === arg)
    : _commandList

  if (!list.length) return arg ? `No commands in category "${arg}"` : '(no commands)'
  return list.map(c => `${c.name} — ${c.desc}`).join(' | ')
}
